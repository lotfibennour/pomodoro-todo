import { NextRequest, NextResponse } from 'next/server';
import { getDb, Task } from '@/lib/db';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = getDb();
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(parseInt(id)) as Task;
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    
    return NextResponse.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, estimatedPomodoros, completedPomodoros, isComplete, priority } = body;

    const db = getDb();
    
    // First check if task exists
    const existingTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(parseInt(id)) as Task;
    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const stmt = db.prepare(`
      UPDATE tasks 
      SET name = ?, estimatedPomodoros = ?, completedPomodoros = ?, isComplete = ?, priority = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      name?.trim() || existingTask.name,
      estimatedPomodoros ?? existingTask.estimatedPomodoros,
      completedPomodoros ?? existingTask.completedPomodoros,
      isComplete !== undefined ? (isComplete ? 1 : 0) : existingTask.isComplete,
      priority || existingTask.priority,
      parseInt(id)
    );

    // Fetch the updated task
    const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(parseInt(id)) as Task;
    
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = getDb();
    
    // First check if task exists
    const existingTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(parseInt(id)) as Task;
    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    stmt.run(parseInt(id));
    
    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}