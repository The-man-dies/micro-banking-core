#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // Spawn the Node.js backend sidecar
            use tauri_plugin_shell::ShellExt;
            use tauri_plugin_shell::process::CommandEvent;
            use tauri::Manager;

            // Define where the database should be stored (standard AppData/local-share folder)
            let data_dir = app.path().app_local_data_dir().expect("Failed to get app data dir");
            std::fs::create_dir_all(&data_dir).expect("Failed to create app data directory");
            let db_path = data_dir.join("micro_banking.db");
            let db_path_str = db_path.to_string_lossy().to_string();

            log::info!("Database path: {}", db_path_str);
            
            let sidecar_command = app.shell().sidecar("app")
                .expect("Failed to create sidecar command")
                .env("DATABASE_FILE", &db_path_str);
                
            let (mut rx, mut _child) = sidecar_command
                .spawn()
                .expect("Failed to spawn backend sidecar");

            tauri::async_runtime::spawn(async move {
                while let Some(event) = rx.recv().await {
                    if let CommandEvent::Stdout(line) = event {
                        log::info!("Backend stdout: {}", String::from_utf8_lossy(&line));
                    } else if let CommandEvent::Stderr(line) = event {
                        log::error!("Backend stderr: {}", String::from_utf8_lossy(&line));
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
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
