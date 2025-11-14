// types/index.ts

// ------------------- Your existing app types -------------------

export interface Task {
  id: number;
  name: string;
  estimatedPomodoros: number;
  completedPomodoros: number;
  isComplete: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt?: string;
  updatedAt?: string;
  googleTaskId?: string;
  notes?: string;
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

export interface PrayerTimes {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export interface NextPrayer {
  name: string;
  time: string;
  isTomorrow?: boolean;

}

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export type IconName = 
  | 'grid_view' | 'check_circle' | 'timer' | 'settings' | 'help' | 'logout'
  | 'hourglass_top' | 'mosque' | 'close' | 'restart_alt' | 'pause' | 'play'
  | 'skip_next' | 'list_alt' | 'add_circle' | 'delete' | 'minus' | 'plus'
  | 'sun' | 'moon' | 'sunrise' | 'sunset' | 'waypoint' | 'bell' | 'check';

export interface SyncStats {
  created: number;
  updated: number;
  deleted: number;
  conflicts: number;
}