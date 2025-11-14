import { useState, useEffect } from 'react';
import { PrayTime } from 'praytime';
import { PrayerTimes, NextPrayer } from '@/types';

export const usePrayerTimes = () => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes>({
    Fajr: '06:00',
    Dhuhr: '12:00',
    Asr: '15:00',
    Maghrib: '18:00',
    Isha: '20:00'
  });
  const [nextPrayer, setNextPrayer] = useState<NextPrayer>({ 
    name: 'Fajr', 
    time: '06:00',
    isTomorrow: false 
  });

  const getNextPrayerTime = (prayerTimes: PrayerTimes): NextPrayer | null => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const prayerOrder = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

    for (const prayerName of prayerOrder) {
      const timeString = prayerTimes[prayerName as keyof PrayerTimes];
      
      if (!timeString || !timeString.match(/^\d{2}:\d{2}$/)) {
        continue;
      }
      
      const [hours, minutes] = timeString.split(':').map(Number);
      const prayerMinutes = hours * 60 + minutes;

      if (prayerMinutes > currentMinutes) {
        return { 
          name: prayerName, 
          time: timeString,
          isTomorrow: false
        };
      }
    }

    // If no prayer is left today, return Fajr for tomorrow
    if (prayerTimes.Fajr) {
      return { 
        name: 'Fajr', 
        time: prayerTimes.Fajr,
        isTomorrow: true
      };
    }

    return null;
  };

  useEffect(() => {
    // Initialize prayer times
    const praytime = new PrayTime();
    const times = praytime.method('France').location([50.531036, 2.639260]).timezone('Europe/Paris').format('24h').getTimes();
    
    const mockPrayerTimes: PrayerTimes = {
      Fajr: times.fajr,
      Dhuhr: times.dhuhr,
      Asr: times.asr,
      Maghrib: times.maghrib,
      Isha: times.isha,
    };
    
    setPrayerTimes(mockPrayerTimes);
    setNextPrayer(getNextPrayerTime(mockPrayerTimes) || { 
      name: 'Fajr', 
      time: '06:00',
      isTomorrow: false 
    });
  }, []);

  return {
    prayerTimes,
    nextPrayer,
    getNextPrayerTime
  };
};