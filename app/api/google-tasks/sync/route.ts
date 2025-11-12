import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

interface GoogleTask {
  id?: string;
  title: string;
  notes?: string;
  due?: string;
  completed?: string;
  status: 'needsAction' | 'completed';
  updated?: string;
  deleted?: boolean;
}

// In your sync logic, add this check:
function shouldUpdateGoogle(appTask: any, googleTask: GoogleTask): boolean {
  // If app was modified more recently, update Google
  const appModified = appTask && appTask.updatedAt ? new Date(appTask.updatedAt).getTime() : 0;
  const googleModified = googleTask && googleTask.updated ? new Date(googleTask.updated).getTime() : 0;
  
  return appModified > googleModified;
}

function shouldUpdateApp(appTask: any, googleTask: GoogleTask): boolean {
  // If Google was modified more recently, update app
  const appModified = appTask && appTask.updatedAt ? new Date(appTask.updatedAt).getTime() : 0;
  const googleModified = googleTask && googleTask.updated ? new Date(googleTask.updated).getTime() : 0;
  
  return googleModified > appModified;
}

export async function POST(request: NextRequest) {
  console.log('POST /api/google-tasks/sync called');
  
  try {
    const { accessToken } = await request.json();
    
    if (!accessToken) {
      console.log('No access token provided');
      return NextResponse.json({ error: 'No access token' }, { status: 401 });
    }

    console.log('Starting Google Tasks sync...');

    try {
      // Fetch tasks from both sources
      const [googleTasks, appTasks] = await Promise.all([
        fetchGoogleTasks(accessToken),
        fetchAppTasks()
      ]);

      console.log(`Found ${googleTasks.length} Google tasks, ${appTasks.length} app tasks`);

      // Perform comprehensive 2-way sync
      const syncResults = await performComprehensiveSync(googleTasks, appTasks, accessToken);

      console.log('Sync completed:', syncResults);

      return NextResponse.json(syncResults);
    } catch (error) {
      // Re-throw token errors specifically
      if (error instanceof Error && error.message === 'TOKEN_EXPIRED') {
        return NextResponse.json({ error: 'Token expired' }, { status: 401 });
      }
      throw error;
    }
    
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ 
      error: 'Sync failed: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

async function fetchGoogleTasks(accessToken: string): Promise<GoogleTask[]> {
  try {
    console.log('Fetching Google Tasks...');
    
    const response = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks?showCompleted=true&showHidden=true&showDeleted=true', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Tasks API error:', response.status, errorText);
      
      // Throw specific error for token issues
      if (response.status === 401) {
        throw new Error('TOKEN_EXPIRED');
      }
      
      throw new Error(`Google API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Google Tasks fetched successfully');
    return data.items || [];
  } catch (error) {
    console.error('Error fetching Google tasks:', error);
    throw error;
  }
}

async function fetchAppTasks() {
  try {
    console.log('Fetching app tasks...');
    const db = getDb();
    const tasks = db.prepare('SELECT * FROM tasks').all();
    console.log('App tasks fetched successfully');
    return tasks;
  } catch (error) {
    console.error('Error fetching app tasks:', error);
    throw error;
  }
}

async function performComprehensiveSync(googleTasks: GoogleTask[], appTasks: any[], accessToken: string) {
  const results = {
    created: 0,
    updated: 0,
    deleted: 0,
    conflicts: 0
  };

  // Step 1: Sync from Google Tasks to App (including deletions)
  await syncGoogleToApp(googleTasks, appTasks, results);
  
  // Step 2: Sync from App to Google Tasks (including deletions)  
  await syncAppToGoogle(googleTasks, appTasks, accessToken, results);

  return results;
}

async function syncGoogleToApp(googleTasks: GoogleTask[], appTasks: any[], results: any) {
  console.log('Syncing Google Tasks → App');
  
  // Map for quick lookup
  const appTasksByGoogleId = new Map();
  appTasks.forEach((task: any) => {
    if (task.googleTaskId) {
      appTasksByGoogleId.set(task.googleTaskId, task);
    }
  });

  // Process each Google task
  for (const gTask of googleTasks) {
    try {
      // Skip deleted tasks in Google (they'll be handled separately)
      if (gTask.deleted) {
        continue;
      }

      const existingAppTask = appTasksByGoogleId.get(gTask.id);
      
      if (!existingAppTask) {
        // Create new task in app from Google Task
        await createTaskFromGoogle(gTask);
        results.created++;
        console.log(`✅ Created app task from Google: "${gTask.title}"`);
      } else {
        // Update existing task if Google task is newer
        const googleUpdated = gTask.updated ? new Date(gTask.updated).getTime() : 0;
        const appUpdated = existingAppTask.updatedAt ? new Date(existingAppTask.updatedAt).getTime() : 0;
        
        if (shouldUpdateApp(existingAppTask, gTask)) {
          await updateTaskFromGoogle(existingAppTask.id, gTask);
          results.updated++;
          console.log(`🔄 Updated app task from Google: "${gTask.title}"`);
        } else if (googleUpdated === appUpdated && hasDifferentData(existingAppTask, gTask)) {
          results.conflicts++;
          console.log(`⚡ Conflict detected for: "${gTask.title}"`);
        }
      }
    } catch (error) {
      console.error(`❌ Error syncing Google task "${gTask.title}":`, error);
    }
  }

  // Handle deletions from Google
  await handleGoogleDeletions(googleTasks, appTasks, results);
}

async function syncAppToGoogle(googleTasks: GoogleTask[], appTasks: any[], accessToken: string, results: any) {
  console.log('Syncing App → Google Tasks');
  
  const googleTasksMap = new Map();
  googleTasks.forEach((task: GoogleTask) => {
    if (task.id && !task.deleted) {
      googleTasksMap.set(task.id, task);
    }
  });

  for (const appTask of appTasks) {
    try {
      if (!appTask.googleTaskId) {
        // Create new task in Google from App task
        await createGoogleTaskFromApp(appTask, accessToken);
        results.created++;
        console.log(`✅ Created Google task from app: "${appTask.name}"`);
      } else {
        const googleTask = googleTasksMap.get(appTask.googleTaskId);
        
        if (!googleTask) {
          // Google task was deleted, delete from app too
          await deleteTaskFromApp(appTask.id);
          results.deleted++;
          console.log(`🗑️ Deleted app task (was deleted in Google): "${appTask.name}"`);
        } else {
          // FIX: Always update Google task if app data is different, regardless of timestamp
          if (shouldUpdateGoogle(appTask, googleTask)) {
            await updateGoogleTaskFromApp(googleTask.id!, appTask, accessToken);
            results.updated++;
            console.log(`🔄 Updated Google task from app: "${appTask.name}"`);
          }
        }
      }
    } catch (error) {
      console.error(`❌ Error syncing app task "${appTask.name}":`, error);
    }
  }

  await handleAppDeletions(googleTasks, appTasks, accessToken, results);
}

async function handleGoogleDeletions(googleTasks: GoogleTask[], appTasks: any[], results: any) {
  console.log('Checking for deletions in Google...');
  
  const googleTaskIds = new Set(googleTasks.filter(t => !t.deleted).map(t => t.id));
  
  for (const appTask of appTasks) {
    if (appTask.googleTaskId && !googleTaskIds.has(appTask.googleTaskId)) {
      // This task exists in app with a Google ID, but doesn't exist in Google → delete from app
      await deleteTaskFromApp(appTask.id);
      results.deleted++;
      console.log(`🗑️ Deleted app task (not found in Google): "${appTask.name}"`);
    }
  }
}

async function handleAppDeletions(googleTasks: GoogleTask[], appTasks: any[], accessToken: string, results: any) {
  console.log('Checking for deletions in App...');
  
  const appTaskGoogleIds = new Set(appTasks.map((t: any) => t.googleTaskId).filter(Boolean));
  
  for (const gTask of googleTasks) {
    if (gTask.id && !gTask.deleted && !appTaskGoogleIds.has(gTask.id)) {
      // This task exists in Google but doesn't exist in app with that Google ID → delete from Google
      await deleteGoogleTask(gTask.id, accessToken);
      results.deleted++;
      console.log(`🗑️ Deleted Google task (not found in App): "${gTask.title}"`);
    }
  }
}

function hasDifferentData(appTask: any, googleTask: GoogleTask): boolean {
  const nameDiff = appTask.name !== googleTask.title;
  
  // Fix this line - your app uses 1/0 for isComplete, Google uses 'completed'/'needsAction'
  const statusDiff = Boolean(appTask.isComplete) !== (googleTask.status === 'completed');
  
  return nameDiff || statusDiff;
}

async function createTaskFromGoogle(gTask: GoogleTask) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO tasks (name, estimatedPomodoros, completedPomodoros, isComplete, priority, googleTaskId, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    gTask.title,
    extractPomodorosFromNotes(gTask.notes)?.estimated || 1,
    extractPomodorosFromNotes(gTask.notes)?.completed || 0,
    gTask.status === 'completed' ? 1 : 0,
    extractPriorityFromNotes(gTask.notes) || 'medium',
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
    gTask.status === 'completed' ? 1 : 0, // This converts Google status to your app's format
    gTask.notes,
    taskId
  );
}

async function createGoogleTaskFromApp(appTask: any, accessToken: string) {
  const googleTask = {
    title: appTask.name,
    status: appTask.isComplete ? 'completed' : 'needsAction',
    notes: generateTaskNotes(appTask)
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

async function updateGoogleTaskFromApp(googleTaskId: string, appTask: any, accessToken: string) {
  const googleTask = {
    title: appTask.name,
    status: appTask.isComplete ? 'completed' : 'needsAction',
    notes: generateTaskNotes(appTask)
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

async function deleteTaskFromApp(taskId: number) {
  const db = getDb();
  db.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);
}

async function deleteGoogleTask(googleTaskId: string, accessToken: string) {
  const response = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/@default/tasks/${googleTaskId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok && response.status !== 404) {
    const errorText = await response.text();
    throw new Error(`Failed to delete Google task: ${response.status} ${errorText}`);
  }
}

// Helper functions
function generateTaskNotes(appTask: any): string {
  const parts = [];
  parts.push(`Pomodoros: ${appTask.completedPomodoros}/${appTask.estimatedPomodoros}`);
  parts.push(`Priority: ${appTask.priority}`);
  if (appTask.notes) {
    parts.push(`Notes: ${appTask.notes}`);
  }
  return parts.join(' | ');
}

function extractPomodorosFromNotes(notes?: string): { estimated: number; completed: number } {
  if (!notes) return { estimated: 1, completed: 0 };
  
  const pomodoroMatch = notes.match(/Pomodoros:\s*(\d+)\/(\d+)/);
  if (pomodoroMatch) {
    return {
      completed: parseInt(pomodoroMatch[1]) || 0,
      estimated: parseInt(pomodoroMatch[2]) || 1
    };
  }
  
  return { estimated: 1, completed: 0 };
}

function extractPriorityFromNotes(notes?: string): string {
  if (!notes) return 'medium';
  
  const priorityMatch = notes.match(/Priority:\s*(\w+)/);
  if (priorityMatch) {
    const priority = priorityMatch[1].toLowerCase();
    if (['low', 'medium', 'high'].includes(priority)) {
      return priority;
    }
  }
  
  return 'medium';
}