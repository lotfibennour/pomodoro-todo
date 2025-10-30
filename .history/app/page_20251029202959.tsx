// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Task, PrayerTime } from '@/types';
import { TaskList } from '@/components/tasks/task-list';
import { PomodoroTimer } from '@/components/pomodoro/pomodoro-timer';
import { PrayerNotification } from '@/components/prayer/prayer-notification';
import { PrayerTimesService } from '@/lib/prayer-times';

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTask, setCurrentTask] = useState<Task>();
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [showPrayerNotification, setShowPrayerNotification] = useState(false);
  const [nextPrayer, setNextPrayer] = useState<PrayerTime>();

  useEffect(() => {
    // Load tasks and prayer times
    const loadData = async () => {
      // Load tasks from localStorage
      const savedTasks = localStorage.getItem('tasks');
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }

      // Load prayer times
      const times = await PrayerTimesService.getPrayerTimes(/* settings */);
      setPrayerTimes(times);
      
      // Check for upcoming prayer times
      checkPrayerTimes(times);
    };

    loadData();
  }, []);

  const checkPrayerTimes = (times: PrayerTime[]) => {
    // Simple implementation to show notification 10 minutes before prayer
    const now = new Date();
    times.forEach((prayer) => {
      const [hours, minutes] = prayer.time.split(':');
      const prayerTime = new Date();
      prayerTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const diff = (prayerTime.getTime() - now.getTime()) / (1000 * 60);
      if (diff > 0 && diff <= 10) {
        setNextPrayer(prayer);
        setShowPrayerNotification(true);
      }
    });
  };

  const handleTaskCreate = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    const updatedTasks = tasks.map((task) =>
      task.id === updatedTask.id ? updatedTask : task
    );
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };

  const handleTaskDelete = (taskId: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };

  const handlePomodoroComplete = (taskId: string) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            completedPomodoros: task.completedPomodoros + 1,
            completed: task.completedPomodoros + 1 >= task.estimatedPomodoros,
          }
        : task
    );
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };

  return (
    <div className="p-8">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TaskList
              tasks={tasks}
              onTaskCreate={handleTaskCreate}
              onTaskUpdate={handleTaskUpdate}
              onTaskDelete={handleTaskDelete}
            />
          </div>
          
          <div className="lg:col-span-1">
            <PomodoroTimer
              currentTask={currentTask}
              onSessionComplete={handlePomodoroComplete}
            />
          </div>
        </div>
      </div>

      {showPrayerNotification && nextPrayer && (
        <PrayerNotification
          prayerTime={nextPrayer}
          onDismiss={() => setShowPrayerNotification(false)}
          onStartFocus={() => {
            setShowPrayerNotification(false);
            // Start focus session logic
          }}
        />
      )}
    </div>
  );
}