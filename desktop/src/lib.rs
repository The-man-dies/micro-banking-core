use std::io::{Read, Write};
use std::net::TcpStream;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Mutex;
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};

use tauri::Manager;
use tauri_plugin_shell::process::CommandEvent;
use tauri_plugin_shell::ShellExt;

struct BackendState {
    child: Mutex<Option<tauri_plugin_shell::process::CommandChild>>,
    db_path: String,
    log_dir: String,
    shutdown_token: String,
    tauri_env_path: Option<String>,
    prisma_schema_path: Option<String>,
    prisma_migrations_path: Option<String>,
    prisma_wasm_path: Option<String>,
    port: u16,
    shutting_down: AtomicBool,
    health_timeout_secs: u64,
    restart_backoff_max_secs: u64,
    restart_max: u64,
    shutdown_grace_secs: u64,
}

impl BackendState {
    fn new(
        db_path: String,
        log_dir: String,
        shutdown_token: String,
        tauri_env_path: Option<String>,
        prisma_schema_path: Option<String>,
        prisma_migrations_path: Option<String>,
        prisma_wasm_path: Option<String>,
        port: u16,
        health_timeout_secs: u64,
        restart_backoff_max_secs: u64,
        restart_max: u64,
        shutdown_grace_secs: u64,
    ) -> Self {
        Self {
            child: Mutex::new(None),
            db_path,
            log_dir,
            shutdown_token,
            tauri_env_path,
            prisma_schema_path,
            prisma_migrations_path,
            prisma_wasm_path,
            port,
            shutting_down: AtomicBool::new(false),
            health_timeout_secs,
            restart_backoff_max_secs,
            restart_max,
            shutdown_grace_secs,
        }
    }
}

fn generate_shutdown_token() -> String {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_else(|_| Duration::from_secs(0))
        .as_nanos();
    format!("{}_{}", std::process::id(), now)
}

fn spawn_backend(
    app: &tauri::AppHandle,
    state: &BackendState,
) -> Option<tauri::async_runtime::Receiver<tauri_plugin_shell::process::CommandEvent>> {
    let sidecar_command = app
        .shell()
        .sidecar("server")
        .ok()?
        .env("DATABASE_FILE", &state.db_path)
        .env("LOG_DIR", &state.log_dir)
        .env("SHUTDOWN_TOKEN", &state.shutdown_token)
        .env("PORT", &state.port.to_string());

    let sidecar_command = if let Some(env_path) = &state.tauri_env_path {
        sidecar_command.env("TAURI_ENV_PATH", env_path)
    } else {
        sidecar_command
    };

    let sidecar_command = if let Some(schema_path) = &state.prisma_schema_path {
        sidecar_command.env("PRISMA_SCHEMA_PATH", schema_path)
    } else {
        sidecar_command
    };

    let sidecar_command = if let Some(migrations_path) = &state.prisma_migrations_path {
        sidecar_command.env("PRISMA_MIGRATIONS_PATH", migrations_path)
    } else {
        sidecar_command
    };

    let sidecar_command = if let Some(wasm_path) = &state.prisma_wasm_path {
        sidecar_command.env("PRISMA_QUERY_ENGINE_WASM_PATH", wasm_path)
    } else {
        sidecar_command
    };

    let (rx, child) = sidecar_command.spawn().ok()?;
    if let Ok(mut guard) = state.child.lock() {
        *guard = Some(child);
    }
    Some(rx)
}

fn try_graceful_shutdown(token: &str, port: u16) {
    if let Ok(mut stream) = TcpStream::connect(("127.0.0.1", port)) {
        let request = format!(
            "POST /internal/shutdown HTTP/1.1\r\nHost: 127.0.0.1\r\nx-shutdown-token: {}\r\nContent-Length: 0\r\nConnection: close\r\n\r\n",
            token
        );
        if let Err(err) = stream.write_all(request.as_bytes()) {
            log::warn!("Failed to send shutdown request: {}", err);
        }
    }
}

fn check_health(port: u16) -> bool {
    if let Ok(mut stream) = TcpStream::connect(("127.0.0.1", port)) {
        let request = "GET /internal/health HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n";
        if stream.write_all(request.as_bytes()).is_err() {
            return false;
        }
        let mut response = String::new();
        if stream.read_to_string(&mut response).is_err() {
            return false;
        }
        return response.starts_with("HTTP/1.1 200");
    }
    false
}

async fn wait_for_health(port: u16, timeout_secs: u64) -> bool {
    let start = Instant::now();
    loop {
        if check_health(port) {
            return true;
        }
        if start.elapsed().as_secs() >= timeout_secs {
            return false;
        }
        tokio::time::sleep(Duration::from_millis(300)).await;
    }
}

fn read_env_u64(key: &str, default_value: u64) -> u64 {
    std::env::var(key)
        .ok()
        .and_then(|value| value.parse::<u64>().ok())
        .unwrap_or(default_value)
}

async fn backoff_or_stop(
    restarts: &mut u64,
    backoff: &mut u64,
    max_restarts: u64,
    max_backoff: u64,
) -> bool {
    *restarts += 1;
    if *restarts > max_restarts {
        log::error!("Backend restart limit reached. Stopping watchdog.");
        return false;
    }
    tokio::time::sleep(Duration::from_secs(*backoff)).await;
    *backoff = std::cmp::min(*backoff * 2, max_backoff);
    true
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let data_dir = app
                .path()
                .app_local_data_dir()
                .expect("Failed to get app data dir");
            std::fs::create_dir_all(&data_dir).expect("Failed to create app data directory");
            let db_path = data_dir.join("micro_banking.db");
            let db_path_str = db_path.to_string_lossy().to_string();
            let log_dir = data_dir.join("logs");
            let log_dir_str = log_dir.to_string_lossy().to_string();
            let shutdown_token = generate_shutdown_token();
            let tauri_env_path = app
                .path()
                .resource_dir()
                .ok()
                .map(|dir| dir.join(".env").to_string_lossy().to_string());
            let resource_dir = app.path().resource_dir().ok();
            let prisma_schema_path = resource_dir
                .as_ref()
                .map(|dir| dir.join("schema.prisma").to_string_lossy().to_string());
            let prisma_migrations_path = resource_dir
                .as_ref()
                .map(|dir| dir.join("migrations").to_string_lossy().to_string());
            let prisma_wasm_path = resource_dir.as_ref().map(|dir| {
                dir.join("query_compiler_fast_bg.wasm")
                    .to_string_lossy()
                    .to_string()
            });
            let port = 3000;
            let health_timeout_secs = read_env_u64("BACKEND_HEALTH_TIMEOUT_SECS", 10);
            let restart_backoff_max_secs = read_env_u64("BACKEND_RESTART_BACKOFF_MAX_SECS", 30);
            let restart_max = read_env_u64("BACKEND_RESTART_MAX", 5);
            let shutdown_grace_secs = read_env_u64("BACKEND_SHUTDOWN_GRACE_SECS", 2);

            log::info!("Database path: {}", db_path_str);

            let state = BackendState::new(
                db_path_str,
                log_dir_str,
                shutdown_token,
                tauri_env_path,
                prisma_schema_path,
                prisma_migrations_path,
                prisma_wasm_path,
                port,
                health_timeout_secs,
                restart_backoff_max_secs,
                restart_max,
                shutdown_grace_secs,
            );
            app.manage(state);

            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                let mut backoff = 1u64;
                let mut restarts = 0u64;
                loop {
                    let state = app_handle.state::<BackendState>();
                    if state.shutting_down.load(Ordering::SeqCst) {
                        break;
                    }

                    let Some(mut rx) = spawn_backend(&app_handle, &state) else {
                    tokio::time::sleep(Duration::from_secs(2)).await;
                        continue;
                    };

                    if !wait_for_health(state.port, state.health_timeout_secs).await {
                        log::error!("Backend failed health check. Restarting...");
                        if let Ok(mut guard) = state.child.lock() {
                            if let Some(child) = guard.take() {
                                let _ = child.kill();
                            }
                        }
                        if !backoff_or_stop(
                            &mut restarts,
                            &mut backoff,
                            state.restart_max,
                            state.restart_backoff_max_secs,
                        )
                        .await
                        {
                            break;
                        }
                        continue;
                    }

                    backoff = 1;
                    restarts = 0;

                    while let Some(event) = rx.recv().await {
                        if let CommandEvent::Stdout(line) = event {
                            log::info!("Backend stdout: {}", String::from_utf8_lossy(&line));
                        } else if let CommandEvent::Stderr(line) = event {
                            log::error!("Backend stderr: {}", String::from_utf8_lossy(&line));
                        }
                    }

                    if let Ok(mut guard) = state.child.lock() {
                        *guard = None;
                    }

                    if state.shutting_down.load(Ordering::SeqCst) {
                        break;
                    }

                    log::warn!("Backend stopped. Restarting in {}s...", backoff);
                    if !backoff_or_stop(
                        &mut restarts,
                        &mut backoff,
                        state.restart_max,
                        state.restart_backoff_max_secs,
                    )
                    .await
                    {
                        break;
                    }
                }
            });

            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event {
                let app_handle = window.app_handle().clone();
                tauri::async_runtime::spawn(async move {
                    {
                        let state = app_handle.state::<BackendState>();
                        state.shutting_down.store(true, Ordering::SeqCst);
                        try_graceful_shutdown(&state.shutdown_token, state.port);
                        tokio::time::sleep(Duration::from_secs(
                            state.shutdown_grace_secs,
                        ))
                        .await;
                    }

                    if let Ok(mut guard) =
                        app_handle.state::<BackendState>().child.lock()
                    {
                        if let Some(child) = guard.take() {
                            let _ = child.kill();
                        }
                    };
                });
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
