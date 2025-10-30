// types/index.ts
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  estimatedPomodoros: number;
  completedPomodoros: number;
  priority: 'low' | 'medium' | 'high';
  category: string;
  createdAt: Date;
}

export interface PrayerTime {
  name: string;
  time: string;
  timestamp: Date;
}

export interface PomodoroSession {
  taskId?: string;
  duration: number; // in minutes
  type: 'focus' | 'break';
  completed: boolean;
  startTime?: Date;
  endTime?: Date;
}

export interface UserSettings {
  location: {
    city: string;
    country: string;
    autoDetect: boolean;
  };
  calculationMethod: string;
  timezone: string;
  notifications: {
    fajr: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
    sound: string;
  };
}