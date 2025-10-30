// app/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { UserSettings } from '@/types';

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>({
    location: {
      city: '',
      country: '',
      autoDetect: true,
    },
    calculationMethod: 'Islamic Society of North America (ISNA)',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    notifications: {
      fajr: true,
      dhuhr: true,
      asr: true,
      maghrib: false,
      isha: false,
      sound: 'Adhan (Full)',
    },
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('userSettings', JSON.stringify(settings));
    // You might want to show a success message here
  };

  const handleNotificationToggle = (prayer: keyof UserSettings['notifications']) => {
    if (prayer === 'sound') return;
    
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [prayer]: !prev.notifications[prayer],
      },
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Configure your app preferences</p>
        </div>
        <button
          onClick={handleSave}
          className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary/90"
        >
          Save Changes
        </button>
      </div>

      {/* Location Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Location Settings</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">my_location</span>
              <span>Auto-detect location</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.location.autoDetect}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  location: { ...prev.location, autoDetect: e.target.checked }
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {!settings.location.autoDetect && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={settings.location.city}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    location: { ...prev.location, city: e.target.value }
                  }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                  placeholder="Enter your city"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={settings.location.country}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    location: { ...prev.location, country: e.target.value }
                  }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                  placeholder="Enter your country"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Prayer Calculation */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Prayer Calculation</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Calculation Method
            </label>
            <select
              value={settings.calculationMethod}
              onChange={(e) => setSettings(prev => ({ ...prev, calculationMethod: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
            >
              <option>Islamic Society of North America (ISNA)</option>
              <option>Muslim World League (MWL)</option>
              <option>Egyptian General Authority of Survey</option>
              <option>Umm al-Qura University, Makkah</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Zone
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Prayer Notifications</h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const).map((prayer) => (
              <div key={prayer} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={prayer}
                  checked={settings.notifications[prayer]}
                  onChange={() => handleNotificationToggle(prayer)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor={prayer} className="text-sm font-medium text-gray-700 capitalize">
                  {prayer}
                </label>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notification Sound
            </label>
            <select
              value={settings.notifications.sound}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                notifications: { ...prev.notifications, sound: e.target.value }
              }))}
              className="w-full max-w-sm rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
            >
              <option>Adhan (Full)</option>
              <option>Adhan (Short)</option>
              <option>Gentle Beep</option>
              <option>Vibration Only</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}