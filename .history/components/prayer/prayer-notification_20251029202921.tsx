// components/prayer/prayer-notification.tsx
'use client';

import { useEffect, useState } from 'react';
import { PrayerTime } from '@/types';

interface PrayerNotificationProps {
  prayerTime: PrayerTime;
  onDismiss: () => void;
  onStartFocus: () => void;
}

export function PrayerNotification({ 
  prayerTime, 
  onDismiss, 
  onStartFocus 
}: PrayerNotificationProps) {
  const [progress, setProgress] = useState(100);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 300);
  };

  if (!visible) return null;

  return (
    <div className="absolute bottom-6 right-6 w-full max-w-sm animate-in slide-in-from-bottom-full">
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white/80 p-5 shadow-2xl shadow-slate-400/10 backdrop-blur-md">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
              <span className="material-symbols-outlined text-xl">mosque</span>
            </div>
            <div className="flex flex-col">
              <h3 className="text-base font-semibold text-slate-800">
                {prayerTime.name} Time
              </h3>
              <p className="text-sm text-slate-500">Starts in 10 minutes</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-200"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
        
        <div className="flex flex-col gap-3">
          <div className="h-1 w-full overflow-hidden rounded-full bg-slate-200">
            <div 
              className="h-full rounded-full bg-primary transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
          <button
            onClick={onStartFocus}
            className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-primary text-white text-sm font-medium leading-normal transition-opacity hover:opacity-90"
          >
            <span className="truncate">Start Focus Session</span>
          </button>
        </div>
      </div>
    </div>
  );
}