import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

export interface Task {
  id: number;
  name: string;
  estimatedPomodoros: number;
  completedPomodoros: number;
  isComplete: number;
  priority: 'low' | 'medium' | 'high';
  googleTaskId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    try {
      // Ensure the directory exists
      const dbDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      
      const dbPath = path.join(dbDir, 'tasks.db');
      console.log('Initializing database at:', dbPath);
      
      db = new Database(dbPath);
      initializeDatabase(db);
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }
  return db;
}

function initializeDatabase(db: Database.Database) {
  // Enable foreign keys and other pragmas
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  
  // Create tasks table with proper schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      estimatedPomodoros INTEGER DEFAULT 1,
      completedPomodoros INTEGER DEFAULT 0,
      isComplete INTEGER DEFAULT 0 CHECK (isComplete IN (0, 1)),
      priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
      googleTaskId TEXT,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Database initialized successfully');
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}