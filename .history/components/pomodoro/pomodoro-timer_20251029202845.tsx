// components/pomodoro/pomodoro-timer.tsx
'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/types';
import { usePomodoro } from '@/hooks/use-pomodoro';

interface PomodoroTimerProps {
  currentTask?: Task;
  onSessionComplete: (taskId: string) => void;
}

export function PomodoroTimer({ currentTask, onSessionComplete }: PomodoroTimerProps) {
  const {
    timeLeft,
    isRunning,
    sessionType,
    progress,
    startTimer,
    pauseTimer,
    resetTimer,
    skipSession,
  } = usePomodoro({
    focusDuration: 25 * 60, // 25 minutes
    breakDuration: 5 * 60, // 5 minutes
    onSessionComplete: () => {
      if (currentTask) {
        onSessionComplete(currentTask.id);
      }
    },
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center rounded-xl bg-white/80 shadow-2xl ring-1 ring-gray-900/5 backdrop-blur-lg p-6">
      <div className="relative flex h-64 w-64 items-center justify-center p-4">
        {/* Circular Progress */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
          <circle
            className="stroke-current text-gray-200"
            cx="50"
            cy="50"
            fill="none"
            r="45"
            strokeWidth="4"
          />
          <circle
            className="stroke-current text-primary -rotate-90 origin-center transform"
            cx="50"
            cy="50"
            fill="none"
            r="45"
            strokeDasharray="283"
            strokeDashoffset={283 - (progress * 283)}
            strokeLinecap="round"
            strokeWidth="4"
          />
        </svg>
        
        <div className="z-10 flex flex-col items-center justify-center text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            {sessionType === 'focus' ? 'Focus' : 'Break'}
          </p>
          <h1 className="text-6xl font-bold text-gray-800">{formatTime(timeLeft)}</h1>
          <p className="mt-1 text-base text-gray-600">
            {currentTask?.title || 'No task selected'}
          </p>
        </div>
      </div>

      <div className="flex w-full items-center justify-center gap-4 px-8 py-6">
        <button
          onClick={resetTimer}
          className="flex h-12 w-12 items-center justify-center rounded-full text-gray-600 hover:bg-gray-200"
        >
          <span className="material-symbols-outlined text-3xl">restart_alt</span>
        </button>
        
        <button
          onClick={isRunning ? pauseTimer : startTimer}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-105"
        >
          <span className="material-symbols-outlined text-4xl">
            {isRunning ? 'pause' : 'play_arrow'}
          </span>
        </button>
        
        <button
          onClick={skipSession}
          className="flex h-12 w-12 items-center justify-center rounded-full text-gray-600 hover:bg-gray-200"
        >
          <span className="material-symbols-outlined text-3xl">skip_next</span>
        </button>
      </div>
    </div>
  );
}