import { useState, useEffect } from 'react';
import { Task } from '@/types';
import { tauriCommands } from '@/lib/tauri-commands';
import { isTauri } from "@tauri-apps/api/core";


export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const tasksData = await tauriCommands.getTasks();
      
      // Transform the data to match your existing Task type if needed
      const transformedTasks = tasksData.map(task => ({
        ...task,
        estimatedPomodoros: task.estimated_pomodoros,
        completedPomodoros: task.completed_pomodoros,
        isComplete: task.is_complete,
        priority: task.priority as "low" | "medium" | "high",
        // Add any other transformations if needed
      }));
      
      setTasks(transformedTasks);
      
      if (!initialLoadComplete) {
        setInitialLoadComplete(true);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isTauri()) {
      fetchTasks();
    }
  }, []);

  return {
    tasks,
    setTasks,
    isLoading,
    initialLoadComplete,
    fetchTasks
  };
};