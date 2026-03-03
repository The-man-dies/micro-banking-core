use std::fs;
use std::path::PathBuf;

fn bun_sidecar_name_for_target(target: &str) -> Option<String> {
    let arch = target.split('-').next()?;
    let sidecar_arch = match arch {
        "x86_64" => "x86_64",
        "aarch64" => "aarch64",
        _ => return None,
    };

    if target.ends_with("pc-windows-msvc") {
        return Some(format!("bun-{sidecar_arch}-pc-windows-msvc.exe"));
    }
    if target.ends_with("unknown-linux-gnu") {
        return Some(format!("bun-{sidecar_arch}-unknown-linux-gnu"));
    }
    if target.ends_with("apple-darwin") {
        return Some(format!("bun-{sidecar_arch}-apple-darwin"));
    }

    None
}

fn ensure_tauri_placeholders() {
    let resources_server = PathBuf::from("resources").join("server");
    let _ = fs::create_dir_all(&resources_server);

    let target = std::env::var("TARGET").unwrap_or_default();
    let Some(sidecar_name) = bun_sidecar_name_for_target(&target) else {
        return;
    };

    let binaries_dir = PathBuf::from("binaries");
    let _ = fs::create_dir_all(&binaries_dir);
    let sidecar_path = binaries_dir.join(sidecar_name);

    if !sidecar_path.exists() {
        let _ = fs::write(&sidecar_path, []);
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            if let Ok(metadata) = fs::metadata(&sidecar_path) {
                let mut perms = metadata.permissions();
                perms.set_mode(0o755);
                let _ = fs::set_permissions(&sidecar_path, perms);
            }
        }
    }
}

fn main() {
    ensure_tauri_placeholders();
    tauri_build::build()
}
