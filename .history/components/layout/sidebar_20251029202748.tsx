// components/layout/sidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PrayerTime } from '@/types';
import { PrayerTimesService } from '@/lib/prayer-times';

export function Sidebar() {
  const pathname = usePathname();
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);

  useEffect(() => {
    // Load prayer times
    const loadPrayerTimes = async () => {
      // You would get settings from context or localStorage
      const times = await PrayerTimesService.getPrayerTimes(/* settings */);
      setPrayerTimes(times);
      setNextPrayer(times[0]); // Simple next prayer logic
    };
    
    loadPrayerTimes();
  }, []);

  const navItems = [
    { href: '/', icon: 'dashboard', label: 'Dashboard' },
    { href: '/tasks', icon: 'check_circle', label: 'Tasks' },
    { href: '/pomodoro', icon: 'timer', label: 'Pomodoro' },
    { href: '/settings', icon: 'settings', label: 'Settings' },
  ];

  return (
    <aside className="flex h-full w-64 flex-col justify-between border-r bg-white p-4">
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-3 px-2">
          <span className="material-symbols-outlined text-primary text-2xl">waves</span>
          <h2 className="text-lg font-bold">Focus & Faith</h2>
        </div>
        
        {/* Prayer Times */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <h1 className="text-base font-medium">Prayer Times</h1>
            <p className="text-sm text-gray-500">Today&apos;s Schedule</p>
          </div>
          <div className="flex flex-col gap-2">
            {prayerTimes.map((prayer, index) => (
              <div
                key={prayer.name}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                  index === 1 ? 'bg-primary/10 text-primary' : 'text-gray-700'
                }`}
              >
                <span className="material-symbols-outlined text-xl">
                  {['clear_day', 'light_mode', 'wb_twilight', 'wb_sunny', 'dark_mode'][index]}
                </span>
                <p className="flex-1 text-sm font-medium">{prayer.name}</p>
                <span className="text-xs">{prayer.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                pathname === item.href
                  ? 'bg-primary/20 text-primary'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              <p className="text-sm font-medium">{item.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}