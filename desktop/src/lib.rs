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
    #[allow(clippy::too_many_arguments)]
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
    log::info!(
        "Starting backend sidecar (port={}, db_path={})",
        state.port,
        state.db_path
    );
    let sidecar_command = match app.shell().sidecar("server") {
        Ok(cmd) => cmd,
        Err(err) => {
            log::error!("Failed to resolve sidecar 'server': {}", err);
            return None;
        }
    }
    .env("DATABASE_FILE", &state.db_path)
    .env("DATABASE_URL", format!("file:{}", state.db_path))
    .env("LOG_DIR", &state.log_dir)
    .env("SHUTDOWN_TOKEN", &state.shutdown_token)
    .env("PORT", state.port.to_string());

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

    // Explicitly set the engine path for bundled builds
    let sidecar_command = if let Ok(resource_dir) = app.path().resource_dir() {
        let mut path = resource_dir.join("prisma-client");
        let mut found_engine = None;

        // Try to find any file that looks like a Prisma engine (binary or library)
        if let Ok(entries) = std::fs::read_dir(&path) {
            for entry in entries.flatten() {
                let name = entry.file_name().to_string_lossy().to_string();
                let lower_name = name.to_lowercase();

                // Match binary engines (query-engine-*) or library engines (libquery_engine-*)
                // and ignore unrelated files like schema or package.json
                if (lower_name.starts_with("query-engine-")
                    || lower_name.starts_with("query_engine-")
                    || lower_name.starts_with("libquery_engine-"))
                    && !lower_name.ends_with(".d.ts")
                    && !lower_name.ends_with(".js")
                {
                    found_engine = Some(path.join(name));
                    break;
                }
            }
        }

        if let Some(engine_path) = found_engine {
            let engine_path_str = engine_path.to_string_lossy().to_string();
            // Set BOTH variables to be absolutely sure Prisma finds it
            sidecar_command
                .env("PRISMA_QUERY_ENGINE_LIBRARY", &engine_path_str)
                .env("PRISMA_QUERY_ENGINE_BINARY", &engine_path_str)
        } else {
            sidecar_command
        }
    } else {
        sidecar_command
    };

    let (rx, child) = match sidecar_command.spawn() {
        Ok(value) => value,
        Err(err) => {
            log::error!("Failed to spawn sidecar 'server': {}", err);
            return None;
        }
    };
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
        let request =
            "GET /internal/health HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n";
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
            let resource_dir = app.path().resource_dir().ok();
            let tauri_env_path = resource_dir.as_ref().map(|dir| {
                dir.join("_up_")
                    .join("server")
                    .join(".env")
                    .to_string_lossy()
                    .to_string()
            });
            let prisma_schema_path = resource_dir
                .as_ref()
                .map(|dir| dir.join("schema.prisma").to_string_lossy().to_string());
            let prisma_migrations_path = resource_dir.as_ref().map(|dir| {
                dir.join("_up_")
                    .join("server")
                    .join("prisma")
                    .join("migrations")
                    .to_string_lossy()
                    .to_string()
            });
            let prisma_wasm_path = resource_dir.as_ref().map(|dir| {
                dir.join("query_compiler_fast_bg.wasm")
                    .to_string_lossy()
                    .to_string()
            });
            let port = read_env_u64("PORT", 3000) as u16;
            let health_timeout_secs = read_env_u64("BACKEND_HEALTH_TIMEOUT_SECS", 30);
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

                    let log_task = tauri::async_runtime::spawn(async move {
                        while let Some(event) = rx.recv().await {
                            if let CommandEvent::Stdout(line) = event {
                                log::info!("Backend stdout: {}", String::from_utf8_lossy(&line));
                            } else if let CommandEvent::Stderr(line) = event {
                                log::error!("Backend stderr: {}", String::from_utf8_lossy(&line));
                            }
                        }
                    });

                    if !wait_for_health(state.port, state.health_timeout_secs).await {
                        log::error!("Backend failed health check. Restarting...");
                        if let Ok(mut guard) = state.child.lock() {
                            if let Some(child) = guard.take() {
                                let _ = child.kill();
                            }
                        }
                        let _ = log_task.await;
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

                    let _ = log_task.await;

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

            app.handle().plugin(
                tauri_plugin_log::Builder::default()
                    .level(log::LevelFilter::Info)
                    .build(),
            )?;
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
                        tokio::time::sleep(Duration::from_secs(state.shutdown_grace_secs)).await;
                    }

                    if let Ok(mut guard) = app_handle.state::<BackendState>().child.lock() {
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
