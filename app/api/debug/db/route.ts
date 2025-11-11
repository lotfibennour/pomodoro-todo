import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    console.log('Testing database connection...');
    
    const db = getDb();
    console.log('Database instance created');
    
    // Test basic query
    const version = db.prepare('SELECT sqlite_version() as version').get() as { version: string };
    console.log('SQLite version:', version);
    
    // Check tables
    const tables = db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table'
    `).all();
    console.log('Tables:', tables);
    
    // Check tasks table structure
    let tasksTableInfo = [];
    if (tables.some((table: any) => table.name === 'tasks')) {
      tasksTableInfo = db.prepare('PRAGMA table_info(tasks)').all();
      console.log('Tasks table structure:', tasksTableInfo);
    }
    
    return NextResponse.json({
      status: 'success',
      sqliteVersion: version.version,
      tables: tables,
      tasksTableStructure: tasksTableInfo
    });
    
  } catch (error) {
    console.error('Database debug error:', error);
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}