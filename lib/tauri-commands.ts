import { invoke } from '@tauri-apps/api/core';

export interface Task {
  updated_at: any;
  created_at: any;
  id: number;
  name: string;
  estimated_pomodoros: number;
  completed_pomodoros: number;
  is_complete: boolean;
  priority: string;
  notes?: string;
}

export const tauriCommands = {
  getTasks: (): Promise<Task[]> => invoke('get_tasks'),
  
  createTask: (name: string, estimatedPomodoros: number, priority: string): Promise<Task> => 
    invoke('create_task', { name, estimatedPomodoros, priority }),
  
  updateTask: (
    id: number, 
    name: string, 
    estimatedPomodoros: number, 
    completedPomodoros: number, 
    isComplete: boolean, 
    priority: string
  ): Promise<void> => 
    invoke('update_task', { id, name, estimatedPomodoros, completedPomodoros, isComplete, priority }),
  
  deleteTask: (id: number): Promise<void> => invoke('delete_task', { id }),
};