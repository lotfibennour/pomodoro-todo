// hooks/use-enhanced-pomodoro.ts
import { useState, useEffect, useCallback } from 'react';
import { Task, PrayerTime } from '@/types';

interface UseEnhancedPomodoroProps {
  focusDuration: number;
  breakDuration: number;
  prayerTimes: PrayerTime[];
  onSessionComplete: (taskId?: string) => void;
  onPrayerTimeAlert?: (prayerTime: PrayerTime) => void;
}

export function useEnhancedPomodoro({
  focusDuration,
  breakDuration,
  prayerTimes,
  onSessionComplete,
  onPrayerTimeAlert,
}: UseEnhancedPomodoroProps) {
  const [timeLeft, setTimeLeft] = useState(focusDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<'focus' | 'break'>('focus');
  const [currentTask, setCurrentTask] = useState<Task>();
  const [alertedPrayers, setAlertedPrayers] = useState<Set<string>>(new Set());

  const progress = (focusDuration - timeLeft) / focusDuration;

  // Check for upcoming prayer times
  useEffect(() => {
    const checkPrayerTimes = () => {
      const now = new Date();
      prayerTimes.forEach((prayer) => {
        if (alertedPrayers.has(prayer.name)) return;

        const [hours, minutes] = prayer.time.split(':');
        const prayerTime = new Date();
        prayerTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        const diff = (prayerTime.getTime() - now.getTime()) / (1000 * 60); // difference in minutes
        
        // Alert 10 minutes before prayer
        if (diff > 0 && diff <= 10 && onPrayerTimeAlert) {
          onPrayerTimeAlert(prayer);
          setAlertedPrayers(prev => new Set(prev).add(prayer.name));
        }
      });
    };

    const interval = setInterval(checkPrayerTimes, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [prayerTimes, alertedPrayers, onPrayerTimeAlert]);

  // Main timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      onSessionComplete(String(currentTask?.id));
      const nextSessionType = sessionType === 'focus' ? 'break' : 'focus';
      const nextDuration = nextSessionType === 'focus' ? focusDuration : breakDuration;
      
      setSessionType(nextSessionType);
      setTimeLeft(nextDuration);
      setIsRunning(false);

      // Reset task after focus session completion
      if (sessionType === 'focus') {
        setCurrentTask(undefined);
      }
    }

    return () => clearInterval(interval);
  }, [
    isRunning,
    timeLeft,
    sessionType,
    focusDuration,
    breakDuration,
    onSessionComplete,
    currentTask,
  ]);

  const startTimer = useCallback((task?: Task) => {
    if (task) {
      setCurrentTask(task);
    }
    setIsRunning(true);
  }, []);

  const pauseTimer = useCallback(() => setIsRunning(false), []);
  
  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(sessionType === 'focus' ? focusDuration : breakDuration);
  }, [sessionType, focusDuration, breakDuration]);

  const skipSession = useCallback(() => {
    setIsRunning(false);
    const nextSessionType = sessionType === 'focus' ? 'break' : 'focus';
    const nextDuration = nextSessionType === 'focus' ? focusDuration : breakDuration;
    
    setSessionType(nextSessionType);
    setTimeLeft(nextDuration);
    
    if (sessionType === 'focus') {
      setCurrentTask(undefined);
    }
  }, [sessionType, focusDuration, breakDuration]);

  return {
    timeLeft,
    isRunning,
    sessionType,
    progress,
    currentTask,
    startTimer,
    pauseTimer,
    resetTimer,
    skipSession,
    setCurrentTask,
  };
}