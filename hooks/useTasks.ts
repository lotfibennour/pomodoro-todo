import { useState, useEffect } from 'react';
import { Task } from '@/types';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/tasks');
      
      if (response.ok) {
        const tasksData = await response.json();
        setTasks(tasksData);
        
        if (!initialLoadComplete) {
          setInitialLoadComplete(true);
        }
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    tasks,
    setTasks,
    isLoading,
    initialLoadComplete,
    fetchTasks
  };
};