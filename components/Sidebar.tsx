import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from './Icons';
import { PrayerTimes, NextPrayer } from '@/types';
import { useTranslations } from 'next-intl';

interface SidebarProps {
  prayerTimes: PrayerTimes;
  nextPrayer: NextPrayer;
  onSettingsOpen: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ prayerTimes, nextPrayer, onSettingsOpen }) => {
  const t = useTranslations('common');
  const tPrayer = useTranslations('prayer');

  const getPrayerIcon = (prayer: string) => {
    switch (prayer) {
      case 'Fajr': return 'sunrise';
      case 'Dhuhr': return 'sun';
      case 'Asr': return 'sun';
      case 'Maghrib': return 'sunset';
      case 'Isha': return 'moon';
      default: return 'mosque';
    }
  };

  const getPrayerName = (prayer: string, isTomorrow: boolean = false) => {
    const prayerKey = prayer.toLowerCase();
    
    if (isTomorrow && prayer === 'Fajr') {
      // Try to get the "tomorrow" translation, fallback to regular + "(Demain)"
      try {
        return tPrayer('fajr (tomorrow)');
      } catch {
        return `${tPrayer('fajr')} (${t('tomorrow')})`;
      }
    }
    
    switch (prayer) {
      case 'Fajr': return tPrayer('fajr');
      case 'Dhuhr': return tPrayer('dhuhr');
      case 'Asr': return tPrayer('asr');
      case 'Maghrib': return tPrayer('maghrib');
      case 'Isha': return tPrayer('isha');
      default: return prayer;
    }
  };

  const isCurrentPrayer = (prayer: string) => {
    return nextPrayer.name === prayer && !nextPrayer.isTomorrow;
  };

  const isNextPrayerTomorrow = (prayer: string) => {
    return nextPrayer.name === prayer && nextPrayer.isTomorrow;
  };

  return (
    <Card className="flex h-screen min-h-[700px] w-64 flex-col justify-between rounded-none border-r">
      <div className="flex flex-col gap-8 p-4">
        <div className="flex items-center gap-3 p-2">
          <div className="text-primary flex items-center justify-center rounded-lg bg-primary/20 p-2">
            <Icon name="hourglass_top" className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold">{t('appName')}</h1>
        </div>
        
        {/* Navigation Links */}
        <div className="flex flex-col gap-2">
          <Button variant="secondary" className="justify-start">
            <Icon name="check_circle" />
            <span className="ml-2">{t('home')}</span>
          </Button>
          {/* <Button variant="ghost" className="justify-start" onClick={onSettingsOpen}>
            <Icon name="settings" />
            <span className="ml-2">{t('settings')}</span>
          </Button> */}
        </div>
        
        {/* Prayer Times */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{tPrayer('prayerTimes')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {Object.entries(prayerTimes).map(([prayer, time]) => (
              <div 
                key={prayer}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                  isCurrentPrayer(prayer)
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground'
                }`}
              >
                <Icon 
                  name={getPrayerIcon(prayer)} 
                  className="text-xl" 
                />
                <p className="flex-1 text-sm font-medium">{getPrayerName(prayer)}</p>
                <span className={`text-xs ${isCurrentPrayer(prayer) ? 'font-semibold' : 'text-muted-foreground'}`}>
                  {time}
                </span>
              </div>
            ))}
            
            {/* Show "Next Prayer: Fajr (Tomorrow)" if applicable */}
            {nextPrayer.isTomorrow && (
              <div className="mt-2 border-t pt-2">
                <div className="flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2 text-primary">
                  <Icon 
                    name={getPrayerIcon(nextPrayer.name)} 
                    className="text-xl" 
                  />
                  <p className="flex-1 text-sm font-medium">
                    {getPrayerName(nextPrayer.name, true)}
                  </p>
                  <span className="text-xs font-semibold">
                    {nextPrayer.time}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Profile Section */}

    </Card>
  );
};