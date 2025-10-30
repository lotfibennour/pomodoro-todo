// hooks/use-pomodoro.ts
import { useState, useEffect, useCallback } from 'react';

interface UsePomodoroProps {
  focusDuration: number;
  breakDuration: number;
  onSessionComplete: () => void;
}

export function usePomodoro({ 
  focusDuration, 
  breakDuration, 
  onSessionComplete 
}: UsePomodoroProps) {
  const [timeLeft, setTimeLeft] = useState(focusDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<'focus' | 'break'>('focus');

  const progress = (focusDuration - timeLeft) / focusDuration;

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      onSessionComplete();
      const nextSessionType = sessionType === 'focus' ? 'break' : 'focus';
      const nextDuration = nextSessionType === 'focus' ? focusDuration : breakDuration;
      
      setSessionType(nextSessionType);
      setTimeLeft(nextDuration);
      setIsRunning(false);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, sessionType, focusDuration, breakDuration, onSessionComplete]);

  const startTimer = useCallback(() => setIsRunning(true), []);
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
  }, [sessionType, focusDuration, breakDuration]);

  return {
    timeLeft,
    isRunning,
    sessionType,
    progress,
    startTimer,
    pauseTimer,
    resetTimer,
    skipSession,
  };
}