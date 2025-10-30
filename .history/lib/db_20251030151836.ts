import Database from 'better-sqlite3';

let db: Database.Database;

export function getDb() {
  if (!db) {
    db = new Database('tasks.db');
    initializeDb();
  }
  return db;
}

function initializeDb() {
  // Create tasks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      estimatedPomodoros INTEGER DEFAULT 1,
      completedPomodoros INTEGER DEFAULT 0,
      isComplete BOOLEAN DEFAULT FALSE,
      priority TEXT DEFAULT 'medium',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export interface Task {
  id: number;
  name: string;
  estimatedPomodoros: number;
  completedPomodoros: number;
  isComplete: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt?: string;
  updatedAt?: string;
}