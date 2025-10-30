// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Task, PrayerTime } from '@/types';
import { TaskList } from '@/components/tasks/task-list';
import { EnhancedPomodoroTimer } from '@/components/pomodoro/enhanced-pomodoro-timer';
import { PrayerNotification } from '@/components/prayer/prayer-notification';
import { PrayerTimesService } from '@/lib/prayer-times';
import { useEnhancedPomodoro } from '@/hooks/use-enhanced-pomodoro';

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [showPrayerNotification, setShowPrayerNotification] = useState(false);
  const [nextPrayer, setNextPrayer] = useState<PrayerTime>();
  const [currentTask, setCurrentTask] = useState<Task>();

  const {
    timeLeft,
    isRunning,
    sessionType,
    progress,
    startTimer,
    pauseTimer,
    resetTimer,
    skipSession,
  } = useEnhancedPomodoro({
    focusDuration: 25 * 60, // 25 minutes
    breakDuration: 5 * 60,  // 5 minutes
    prayerTimes,
    onSessionComplete: (taskId) => {
      if (taskId) {
        handlePomodoroComplete(taskId);
      }
    },
    onPrayerTimeAlert: (prayerTime) => {
      setNextPrayer(prayerTime);
      setShowPrayerNotification(true);
    },
  });

  useEffect(() => {
    // Load tasks from localStorage
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }

    // Load prayer times
    const loadPrayerTimes = async () => {
      try {
        const settings = JSON.parse(localStorage.getItem('userSettings') || '{}');
        const times = await PrayerTimesService.getPrayerTimes(settings);
        setPrayerTimes(times);
      } catch (error) {
        console.error('Failed to load prayer times:', error);
      }
    };

    loadPrayerTimes();
  }, []);

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

  const handleStartTaskPomodoro = (task: Task) => {
    setCurrentTask(task);
    startTimer(task);
  };

  const getNextPrayer = () => {
    const now = new Date();
    return prayerTimes.find((prayer) => {
      const [hours, minutes] = prayer.time.split(':');
      const prayerTime = new Date();
      prayerTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      return prayerTime > now;
    }) || prayerTimes[0];
  };

  return (
    <div className="min-h-screen bg-background-light">
      <div className="p-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div className="flex flex-col gap-1">
              <p className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
                Good {getTimeOfDay()}!
              </p>
              <p className="text-base font-normal text-gray-500">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Next: {getNextPrayer()?.name} at {getNextPrayer()?.time}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Tasks Section */}
            <div className="lg:col-span-2">
              <TaskList
                tasks={tasks}
                onTaskCreate={handleTaskCreate}
                onTaskUpdate={handleTaskUpdate}
                onTaskDelete={handleTaskDelete}
                onStartPomodoro={handleStartTaskPomodoro}
              />
            </div>
            
            {/* Pomodoro Section */}
            <div className="lg:col-span-1">
              <EnhancedPomodoroTimer
                timeLeft={timeLeft}
                isRunning={isRunning}
                sessionType={sessionType}
                progress={progress}
                currentTask={currentTask}
                onStart={startTimer}
                onPause={pauseTimer}
                onReset={resetTimer}
                onSkip={skipSession}
              />

              {/* Today's Schedule */}
              <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Today's Schedule</h2>
                <div className="space-y-3">
                  {prayerTimes.map((prayer, index) => (
                    <div key={prayer.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-gray-500">
                          {['clear_day', 'light_mode', 'wb_twilight', 'wb_sunny', 'dark_mode'][index]}
                        </span>
                        <span className="text-sm font-medium text-gray-700">{prayer.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">{prayer.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prayer Notification */}
      {showPrayerNotification && nextPrayer && (
        <PrayerNotification
          prayerTime={nextPrayer}
          onDismiss={() => setShowPrayerNotification(false)}
          onStartFocus={() => {
            setShowPrayerNotification(false);
            pauseTimer(); // Pause current session if running
          }}
        />
      )}
    </div>
  );
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 18) return 'Afternoon';
  return 'Evening';
}