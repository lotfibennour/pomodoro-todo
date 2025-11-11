import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from './Icons';
import { PrayerTimes, NextPrayer } from '@/types';

interface SidebarProps {
  prayerTimes: PrayerTimes;
  nextPrayer: NextPrayer;
  onSettingsOpen: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ prayerTimes, nextPrayer, onSettingsOpen }) => {
  return (
    <Card className="flex h-screen min-h-[700px] w-64 flex-col justify-between rounded-none border-r">
      <div className="flex flex-col gap-8 p-4">
        <div className="flex items-center gap-3 p-2">
          <div className="text-primary flex items-center justify-center rounded-lg bg-primary/20 p-2">
            <Icon name="hourglass_top" className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold">PrayerFlow</h1>
        </div>
        
        <div className="flex flex-col gap-2">
          <Button variant="secondary" className="justify-start">
            <Icon name="check_circle" />
            <span className="ml-2">Home</span>
          </Button>
          <Button variant="ghost" className="justify-start" onClick={onSettingsOpen}>
            <Icon name="settings" />
            <span className="ml-2">Settings</span>
          </Button>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Prayer Times</CardTitle>
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
                  name={
                    prayer === 'Fajr' ? 'sunrise' :
                    prayer === 'Dhuhr' ? 'sun' :
                    prayer === 'Asr' ? 'sun' :
                    prayer === 'Maghrib' ? 'sunset' : 'moon'
                  } 
                  className="text-xl" 
                />
                <p className="flex-1 text-sm font-medium">{prayer}</p>
                <span className={`text-xs ${nextPrayer.name === prayer ? 'font-semibold' : 'text-muted-foreground'}`}>
                  {time}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </Card>
  );
};