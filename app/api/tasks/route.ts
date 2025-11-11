import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  console.log('GET /api/tasks called');
  
  try {
    const db = getDb();
    console.log('Database connected');
    
    // Simple test query first
    try {
      const test = db.prepare('SELECT 1 as test').get();
      console.log('Basic query test:', test);
    } catch (testError) {
      console.error('Basic query failed:', testError);
      throw testError;
    }
    
    // Now try the actual query
    const tasks = db.prepare('SELECT * FROM tasks ORDER BY createdAt DESC').all();
    console.log(`Found ${tasks.length} tasks`);
    
    return NextResponse.json(tasks);
    
  } catch (error) {
    console.error('Error in GET /api/tasks:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch tasks',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : undefined : undefined
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log('POST /api/tasks called');
  
  try {
    const body = await request.json();
    console.log('Request body:', body);
    
    const { 
      name, 
      estimatedPomodoros = 1, 
      completedPomodoros = 0, 
      isComplete = false, 
      priority = 'medium',
      googleTaskId,
      notes
    } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Task name is required' }, { status: 400 });
    }

    const db = getDb();
    console.log('Database connected for INSERT');

    // First, let's test a simple insert
    try {
      const testStmt = db.prepare('INSERT INTO tasks (name) VALUES (?)');
      const testResult = testStmt.run('test task');
      console.log('Test insert successful, ID:', testResult.lastInsertRowid);
      
      // Clean up test record
      db.prepare('DELETE FROM tasks WHERE id = ?').run(testResult.lastInsertRowid);
    } catch (testError) {
      console.error('Test insert failed:', testError);
      throw testError;
    }

    // Now do the actual insert
    const stmt = db.prepare(`
      INSERT INTO tasks (name, estimatedPomodoros, completedPomodoros, isComplete, priority, googleTaskId, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    console.log('Executing insert with values:', {
      name: name.trim(),
      estimatedPomodoros,
      completedPomodoros,
      isComplete: isComplete ? 1 : 0,
      priority,
      googleTaskId: googleTaskId || null,
      notes: notes || null
    });

    const result = stmt.run(
      name.trim(), 
      estimatedPomodoros, 
      completedPomodoros, 
      isComplete ? 1 : 0, 
      priority,
      googleTaskId || null,
      notes || null
    );
    
    console.log('Insert successful, ID:', result.lastInsertRowid);
    
    // Fetch the created task
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
    console.log('Created task:', task);
    
    return NextResponse.json(task, { status: 201 });
    
  } catch (error) {
    console.error('Error in POST /api/tasks:', error);
    return NextResponse.json({ 
      error: 'Failed to create task',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : undefined : undefined
    }, { status: 500 });
  }
}