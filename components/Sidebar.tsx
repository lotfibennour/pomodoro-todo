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

  const getPrayerName = (prayer: string) => {
    switch (prayer) {
      case 'Fajr': return tPrayer('fajr');
      case 'Dhuhr': return tPrayer('dhuhr');
      case 'Asr': return tPrayer('asr');
      case 'Maghrib': return tPrayer('maghrib');
      case 'Isha': return tPrayer('isha');
      default: return prayer;
    }
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
          <Button variant="ghost" className="justify-start" onClick={onSettingsOpen}>
            <Icon name="settings" />
            <span className="ml-2">{t('settings')}</span>
          </Button>
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
                  nextPrayer.name === prayer 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground'
                }`}
              >
                <Icon 
                  name={getPrayerIcon(prayer)} 
                  className="text-xl" 
                />
                <p className="flex-1 text-sm font-medium">{getPrayerName(prayer)}</p>
                <span className={`text-xs ${nextPrayer.name === prayer ? 'font-semibold' : 'text-muted-foreground'}`}>
                  {time}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* User Profile Section */}
      <CardFooter className="flex flex-col gap-1 border-t p-4">
        <div className="flex items-center gap-3 p-3">
          <img className="size-10 rounded-full" src="https://placehold.co/100x100/E2E8F0/4A5568?text=A" alt="User avatar" />
          <div className="flex flex-col">
            <h1 className="text-base font-medium">Aisha Khan</h1>
            <p className="text-sm font-normal text-muted-foreground">aisha.k@email.com</p>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};