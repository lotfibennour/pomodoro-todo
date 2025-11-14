#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{
    Builder, State, Manager,
    menu::{MenuBuilder, MenuItemBuilder, SubmenuBuilder},
};
use tauri_plugin_shell::ShellExt;
use rusqlite::{Connection, Result};
use std::sync::Mutex;
use std::net::TcpListener;
use serde::Serialize;

// Database setup
#[derive(Debug, Serialize)]
struct Task {
    id: i32,
    name: String,
    estimated_pomodoros: i32,
    completed_pomodoros: i32,
    is_complete: bool,
    priority: String,
    notes: Option<String>,
}

struct DbState(Mutex<Connection>);

// Find an available port
fn find_available_port() -> u16 {
    TcpListener::bind("127.0.0.1:0")
        .expect("Failed to bind to a port")
        .local_addr()
        .expect("Failed to get local address")
        .port()
}

fn main() {
    // Initialize database
    let conn = Connection::open("prayerflow.db").expect("Failed to open database");

    conn.execute(
        "CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            estimated_pomodoros INTEGER DEFAULT 1,
            completed_pomodoros INTEGER DEFAULT 0,
            is_complete BOOLEAN DEFAULT FALSE,
            priority TEXT DEFAULT 'medium',
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )
    .expect("Failed to create tasks table");

    let db_state = DbState(Mutex::new(conn));

    Builder::default()
        .setup(|app| {
            // Build menu items using Tauri v2 API
            let quit = MenuItemBuilder::with_id("quit", "Quit").build(app)?;
            let close = MenuItemBuilder::with_id("close", "Close").build(app)?;
            let hide = MenuItemBuilder::with_id("hide", "Hide").build(app)?;

            // Build submenu
            let file_menu = SubmenuBuilder::new(app, "File")
                .item(&quit)
                .item(&close)
                .build()?;

            // Build main menu
            let menu = MenuBuilder::new(app)
                .item(&file_menu)
                .item(&hide)
                .build()?;

            // Set menu for the app
            app.set_menu(menu)?;

            // Handle menu events
            app.on_menu_event(|app, event| {
                match event.id().as_ref() {
                    "quit" => std::process::exit(0),
                    "close" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.close();
                        }
                    }
                    "hide" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.hide();
                        }
                    }
                    _ => {}
                }
            });

            // Get the main window
            let window = app.get_webview_window("main").unwrap();
            
            #[cfg(debug_assertions)]
            {
                // In dev mode, just use the Next.js dev server
                println!("🔧 Development mode - using dev server at localhost:3000");
                window.eval("window.location.replace('http://localhost:3000')")?;
            }
            
            #[cfg(not(debug_assertions))]
            {
                println!("🚀 Production mode - starting bundled Node.js server");
                
                let port = find_available_port();
                println!("📡 Using port: {}", port);
                
                // Get resource paths
                let resource_dir = app.path().resource_dir()
                    .expect("Failed to get resource directory");
                
                // Determine the correct binary name based on target triple
                let target_triple = if cfg!(all(target_os = "windows", target_arch = "x86_64")) {
                    "x86_64-pc-windows-msvc"
                } else if cfg!(all(target_os = "macos", target_arch = "aarch64")) {
                    "aarch64-apple-darwin"
                } else if cfg!(all(target_os = "macos", target_arch = "x86_64")) {
                    "x86_64-apple-darwin"
                } else if cfg!(all(target_os = "linux", target_arch = "x86_64")) {
                    "x86_64-unknown-linux-gnu"
                } else {
                    "unknown"
                };
                
                let binary_name = if cfg!(target_os = "windows") {
                    format!("node-{}.exe", target_triple)
                } else {
                    format!("node-{}", target_triple)
                };
                
                let node_binary = resource_dir.join("binaries").join(&binary_name);
                
                let server_script = resource_dir
                    .join("resources")
                    .join("nextjs-app")
                    .join("server.js");
                
                println!("🔍 Node binary path: {:?}", node_binary);
                println!("🔍 Server script path: {:?}", server_script);
                
                // Verify files exist
                if !node_binary.exists() {
                    eprintln!("❌ ERROR: Node binary not found at {:?}", node_binary);
                    return Err("Node binary not found".into());
                }
                
                if !server_script.exists() {
                    eprintln!("❌ ERROR: Server script not found at {:?}", server_script);
                    return Err("Server script not found".into());
                }
                
                // Clone values before moving into async block
                let app_handle = app.handle().clone();
                let window_clone = window.clone();
                let server_script_str = server_script.to_str().unwrap().to_string();
                let port_str = port.to_string();
                
                tauri::async_runtime::spawn(async move {
                    println!("⚡ Spawning Node.js process...");
                    
                    // Get shell from app handle
                    let shell = app_handle.shell();
                    
                    // Use just "node" - Tauri will automatically append the target triple
                    let sidecar_command = shell
                        .sidecar("node")
                        .expect("Failed to create sidecar command")
                        .args([
                            &server_script_str,
                            &port_str
                        ]);
                    
                    match sidecar_command.spawn() {
                        Ok((mut rx, _child)) => {
                            println!("✅ Node.js server started successfully");
                            
                            // Monitor output
                            tauri::async_runtime::spawn(async move {
                                while let Some(event) = rx.recv().await {
                                    match event {
                                        tauri_plugin_shell::process::CommandEvent::Stdout(line) => {
                                            println!("📤 [Node.js]: {}", 
                                                String::from_utf8_lossy(&line));
                                        }
                                        tauri_plugin_shell::process::CommandEvent::Stderr(line) => {
                                            eprintln!("⚠️  [Node.js Error]: {}", 
                                                String::from_utf8_lossy(&line));
                                        }
                                        tauri_plugin_shell::process::CommandEvent::Terminated(status) => {
                                            eprintln!("🛑 Node.js process terminated: {:?}", status);
                                            break;
                                        }
                                        _ => {}
                                    }
                                }
                            });
                            
                            // Wait for server to be ready
                            println!("⏳ Waiting for server to start...");
                            std::thread::sleep(std::time::Duration::from_secs(3));
                            
                            // Navigate to the server
                            let url = format!("http://localhost:{}", port);
                            println!("🌐 Navigating to: {}", url);
                            
                            window_clone
                                .eval(&format!("window.location.replace('{}')", url))
                                .expect("Failed to navigate to server");
                        }
                        Err(e) => {
                            eprintln!("❌ Failed to spawn Node.js server: {}", e);
                        }
                    }
                });
            }

            Ok(())
        })
        .manage(db_state)
        .invoke_handler(tauri::generate_handler![
            get_tasks,
            create_task,
            update_task,
            delete_task
        ])
        .plugin(tauri_plugin_shell::init())
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");
}

// --- Commands ---
#[tauri::command]
fn get_tasks(state: State<DbState>) -> Result<Vec<Task>, String> {
    let conn = state.0.lock().unwrap();
    let mut stmt = conn
        .prepare(
            "SELECT id, name, estimated_pomodoros, completed_pomodoros, is_complete, priority, notes
             FROM tasks ORDER BY created_at DESC",
        )
        .map_err(|e| e.to_string())?;

    let task_iter = stmt
        .query_map([], |row| {
            Ok(Task {
                id: row.get(0)?,
                name: row.get(1)?,
                estimated_pomodoros: row.get(2)?,
                completed_pomodoros: row.get(3)?,
                is_complete: row.get(4)?,
                priority: row.get(5)?,
                notes: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut tasks = Vec::new();
    for task in task_iter {
        tasks.push(task.map_err(|e| e.to_string())?);
    }
    Ok(tasks)
}

#[tauri::command]
fn create_task(
    state: State<DbState>,
    name: String,
    estimated_pomodoros: i32,
    priority: String,
) -> Result<Task, String> {
    let conn = state.0.lock().unwrap();
    conn.execute(
        "INSERT INTO tasks (name, estimated_pomodoros, priority) VALUES (?1, ?2, ?3)",
        (&name, &estimated_pomodoros, &priority),
    )
    .map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();

    Ok(Task {
        id: id as i32,
        name,
        estimated_pomodoros,
        completed_pomodoros: 0,
        is_complete: false,
        priority,
        notes: None,
    })
}

#[tauri::command]
fn update_task(
    state: State<DbState>,
    id: i32,
    name: String,
    estimated_pomodoros: i32,
    completed_pomodoros: i32,
    is_complete: bool,
    priority: String,
) -> Result<(), String> {
    let conn = state.0.lock().unwrap();
    conn.execute(
        "UPDATE tasks
         SET name = ?1, estimated_pomodoros = ?2, completed_pomodoros = ?3,
             is_complete = ?4, priority = ?5, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?6",
        (&name, &estimated_pomodoros, &completed_pomodoros, &is_complete, &priority, &id),
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn delete_task(state: State<DbState>, id: i32) -> Result<(), String> {
    let conn = state.0.lock().unwrap();
    conn.execute("DELETE FROM tasks WHERE id = ?1", (&id,))
        .map_err(|e| e.to_string())?;

    Ok(())
}