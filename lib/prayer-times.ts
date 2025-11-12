
// lib/prayer-times.ts
import { PrayerTime, UserSettings } from '@/types';
export class PrayerTimesService {
  private static async fetchPrayerTimes(lat: number, lng: number, method: number = 2) {
    const response = await fetch(
      `http://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=${method}`
    );
    const data = await response.json();
    return data.data.timings;
  }

  private static timeStringToDate(timeStr: string): Date {
    // parse "HH:mm" (or "H:mm") and create a Date for today with that time
    const [hourPart, minutePart] = timeStr.split(':');
    const hour = parseInt(hourPart, 10);
    const minute = parseInt((minutePart || '0').replace(/\D.*$/, ''), 10);
    const d = new Date();
    d.setHours(isNaN(hour) ? 0 : hour, isNaN(minute) ? 0 : minute, 0, 0);
    return d;
  }

  static async getPrayerTimes(settings: UserSettings): Promise<PrayerTime[]> {
    // Implementation to get prayer times based on location
    // You can use browser geolocation or manual location
    const timings = await this.fetchPrayerTimes(settings.location.autoDetect ? 51.5074 : 0, settings.location.autoDetect ? -0.1278 : 0);
    
    return [
      {
        name: 'Fajr', time: timings.Fajr,
        timestamp: this.timeStringToDate(timings.Fajr)
      },
      {
        name: 'Dhuhr', time: timings.Dhuhr,
        timestamp: this.timeStringToDate(timings.Dhuhr)
      },
      {
        name: 'Asr', time: timings.Asr,
        timestamp: this.timeStringToDate(timings.Asr)
      },
      {
        name: 'Maghrib', time: timings.Maghrib,
        timestamp: this.timeStringToDate(timings.Maghrib)
      },
      {
        name: 'Isha', time: timings.Isha,
        timestamp: this.timeStringToDate(timings.Isha)
      },
    ];
  }
}