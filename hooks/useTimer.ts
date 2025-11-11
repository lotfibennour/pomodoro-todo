import { useState, useEffect } from 'react';
import { TimerMode } from '@/types';

export const useTimer = () => {
  const [timerMode, setTimerMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getTotalTime = () => {
    switch (timerMode) {
      case 'focus': return 25 * 60;
      case 'shortBreak': return 5 * 60;
      case 'longBreak': return 15 * 60;
      default: return 25 * 60;
    }
  };

  const resetTimer = () => {
    setTimeLeft(getTotalTime());
    setIsTimerRunning(false);
  };

  return {
    timerMode,
    setTimerMode,
    timeLeft,
    setTimeLeft,
    isTimerRunning,
    setIsTimerRunning,
    formatTime,
    getTotalTime,
    resetTimer
  };
};