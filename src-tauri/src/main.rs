// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::fs;
use std::thread;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
async fn open_file_binary(path: String) -> Result<Vec<u8>, String> {
    thread::spawn(move || match fs::read(path) {
        Ok(data) => Ok(data),
        Err(err) => Err(format!("couldn't open file: {:?}", err).to_string()),
    })
    .join()
    .unwrap()
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build())
        .invoke_handler(tauri::generate_handler![open_file_binary])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
