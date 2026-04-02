#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod bridge;

fn main() {
    tauri::Builder::default()
        .manage(bridge::DockpackBridgeState::default())
        .invoke_handler(tauri::generate_handler![
            bridge::parse_source,
            bridge::inspect_runtime,
            bridge::pull_image,
            bridge::build_image_from_git,
            bridge::inspect_image,
            bridge::stream_logs,
        ])
        .run(tauri::generate_context!())
        .expect("error while running DockPack Builder");
}
