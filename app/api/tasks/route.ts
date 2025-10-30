import { NextRequest, NextResponse } from 'next/server';
import { getDb, Task } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const tasks = db.prepare('SELECT * FROM tasks ORDER BY createdAt DESC').all() as Task[];
    
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, estimatedPomodoros = 1, completedPomodoros = 0, isComplete = false, priority = 'medium' } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Task name is required' }, { status: 400 });
    }

    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO tasks (name, estimatedPomodoros, completedPomodoros, isComplete, priority)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(name.trim(), estimatedPomodoros, completedPomodoros, isComplete ? 1 : 0, priority);
    
    // Fetch the created task
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid) as Task;
    
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}