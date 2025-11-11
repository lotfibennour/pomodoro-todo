import { NextRequest, NextResponse } from 'next/server';
import { getDb, Task } from '@/lib/db';

interface GoogleTask {
  id?: string;
  title: string;
  notes?: string;
  due?: string;
  completed?: string;
  status: 'needsAction' | 'completed';
  updated?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { accessToken } = await request.json();
    
    if (!accessToken) {
      return NextResponse.json({ error: 'No access token' }, { status: 401 });
    }

    console.log('Starting Google Tasks sync...');

    // Fetch tasks from both sources
    const [googleTasks, appTasks] = await Promise.all([
      fetchGoogleTasks(accessToken),
      fetchAppTasks()
    ]);

    console.log(`Found ${googleTasks.length} Google tasks, ${appTasks.length} app tasks`);

    // Perform 2-way sync
    const syncResults = await performSync(googleTasks, appTasks, accessToken);

    console.log('Sync completed:', syncResults);

    return NextResponse.json(syncResults);
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: 'Sync failed: ' + (error as Error).message }, { status: 500 });
  }
}

async function fetchGoogleTasks(accessToken: string): Promise<GoogleTask[]> {
  try {
    const response = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks?showCompleted=true&showHidden=true', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching Google tasks:', error);
    throw error;
  }
}

async function fetchAppTasks(): Promise<Task[]> {
  try {
    const db = getDb();
    const tasks = db.prepare('SELECT * FROM tasks').all() as Task[];
    return tasks;
  } catch (error) {
    console.error('Error fetching app tasks:', error);
    throw error;
  }
}

async function performSync(googleTasks: GoogleTask[], appTasks: Task[], accessToken: string) {
  const results = {
    created: 0,
    updated: 0,
    deleted: 0,
    conflicts: 0
  };

  // Sync from Google Tasks to App
  for (const gTask of googleTasks) {
    try {
      const existingAppTask = appTasks.find(t => t.googleTaskId === gTask.id);
      
      if (!existingAppTask) {
        // Create new task in app from Google Task
        await createTaskFromGoogle(gTask);
        results.created++;
        console.log(`Created app task from Google: ${gTask.title}`);
      } else {
        // Update existing task if Google task is newer
        const googleUpdated = gTask.updated ? new Date(gTask.updated).getTime() : 0;
        const appUpdated = existingAppTask.updatedAt ? new Date(existingAppTask.updatedAt).getTime() : 0;
        
        if (googleUpdated > appUpdated) {
          await updateTaskFromGoogle(existingAppTask.id, gTask);
          results.updated++;
          console.log(`Updated app task from Google: ${gTask.title}`);
        } else if (googleUpdated === appUpdated && hasDifferentData(existingAppTask, gTask)) {
          results.conflicts++;
          console.log(`Conflict detected for: ${gTask.title}`);
        }
      }
    } catch (error) {
      console.error(`Error syncing Google task ${gTask.title}:`, error);
    }
  }

  // Sync from App to Google Tasks
  for (const appTask of appTasks) {
    try {
      if (!appTask.googleTaskId) {
        // Create new task in Google from App task
        await createGoogleTaskFromApp(appTask, accessToken);
        results.created++;
        console.log(`Created Google task from app: ${appTask.name}`);
      } else {
        const googleTask = googleTasks.find(t => t.id === appTask.googleTaskId);
        if (!googleTask) {
          // Google task was deleted, remove reference
          await removeGoogleTaskId(appTask.id);
          results.deleted++;
          console.log(`Removed Google task reference for: ${appTask.name}`);
        } else {
          // Check for conflicts and update if needed
          const appUpdated = appTask.updatedAt ? new Date(appTask.updatedAt).getTime() : 0;
          const googleUpdated = googleTask.updated ? new Date(googleTask.updated).getTime() : 0;
          
          if (appUpdated > googleUpdated) {
            await updateGoogleTaskFromApp(googleTask.id!, appTask, accessToken);
            results.updated++;
            console.log(`Updated Google task from app: ${appTask.name}`);
          } else if (appUpdated === googleUpdated && hasDifferentData(appTask, googleTask)) {
            results.conflicts++;
            console.log(`Conflict detected for: ${appTask.name}`);
          }
        }
      }
    } catch (error) {
      console.error(`Error syncing app task ${appTask.name}:`, error);
    }
  }

  return results;
}

function hasDifferentData(appTask: Task, googleTask: GoogleTask): boolean {
  return (
    appTask.name !== googleTask.title ||
    (appTask.isComplete ? 1 : 0) !== (googleTask.status === 'completed' ? 1 : 0)
  );
}

async function createTaskFromGoogle(gTask: GoogleTask) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO tasks (name, estimatedPomodoros, completedPomodoros, isComplete, priority, googleTaskId, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    gTask.title,
    1, // default estimated pomodoros
    0, // default completed pomodoros
    gTask.status === 'completed' ? 1 : 0,
    'medium',
    gTask.id,
    gTask.notes
  );
}

async function updateTaskFromGoogle(taskId: number, gTask: GoogleTask) {
  const db = getDb();
  const stmt = db.prepare(`
    UPDATE tasks 
    SET name = ?, isComplete = ?, notes = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  stmt.run(
    gTask.title,
    gTask.status === 'completed' ? 1 : 0,
    gTask.notes,
    taskId
  );
}

async function createGoogleTaskFromApp(appTask: Task, accessToken: string) {
  const googleTask = {
    title: appTask.name,
    status: appTask.isComplete ? 'completed' : 'needsAction',
    notes: `Pomodoros: ${appTask.completedPomodoros}/${appTask.estimatedPomodoros} | Priority: ${appTask.priority}`
  };

  const response = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(googleTask),
  });

  if (response.ok) {
    const createdTask = await response.json();
    // Update app task with Google Task ID
    const db = getDb();
    db.prepare('UPDATE tasks SET googleTaskId = ? WHERE id = ?')
      .run(createdTask.id, appTask.id);
  } else {
    const errorText = await response.text();
    throw new Error(`Failed to create Google task: ${response.status} ${errorText}`);
  }
}

async function updateGoogleTaskFromApp(googleTaskId: string, appTask: Task, accessToken: string) {
  const googleTask = {
    title: appTask.name,
    status: appTask.isComplete ? 'completed' : 'needsAction',
    notes: `Pomodoros: ${appTask.completedPomodoros}/${appTask.estimatedPomodoros} | Priority: ${appTask.priority}`
  };

  const response = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/@default/tasks/${googleTaskId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(googleTask),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update Google task: ${response.status} ${errorText}`);
  }
}

async function removeGoogleTaskId(taskId: number) {
  const db = getDb();
  db.prepare('UPDATE tasks SET googleTaskId = NULL WHERE id = ?')
    .run(taskId);
}