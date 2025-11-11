import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '../Icons';
import { Task, TimerMode, NextPrayer } from '@/types';
import { useTranslations } from 'next-intl';

interface TimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  timerMode: TimerMode;
  timeLeft: number;
  isTimerRunning: boolean;
  selectedTask: Task | null;
  nextPrayer: NextPrayer;
  formatTime: (seconds: number) => string;
  getTotalTime: () => number;
  onTimerControl: (action: 'toggle' | 'reset' | 'skip') => void;
}

export const TimerModal: React.FC<TimerModalProps> = ({
  isOpen,
  onClose,
  timerMode,
  timeLeft,
  isTimerRunning,
  selectedTask,
  nextPrayer,
  formatTime,
  getTotalTime,
  onTimerControl
}) => {
  const t = useTranslations('timer');
  const tPrayer = useTranslations('prayer');

  const totalTime = getTotalTime();
  const progress = ((totalTime - timeLeft) / totalTime) * 283;

  const getModeText = () => {
    switch (timerMode) {
      case 'focus': return t('focus');
      case 'shortBreak': return t('shortBreak');
      case 'longBreak': return t('longBreak');
      default: return t('focus');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-center">{t('pomodoroTimer')}</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-6">
          <div className="relative flex h-64 w-64 items-center justify-center">
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
              <circle className="stroke-muted" cx="50" cy="50" fill="none" r="45" strokeWidth="4"></circle>
              <circle 
                className="stroke-primary -rotate-90 origin-center transform transition-all duration-300" 
                cx="50" cy="50" fill="none" r="45" 
                strokeDasharray="283" 
                strokeDashoffset={283 - progress} 
                strokeLinecap="round" 
                strokeWidth="4"
              ></circle> 
            </svg>
            <div className="z-10 flex flex-col items-center justify-center text-center">
              <p className="text-sm font-medium uppercase tracking-widest text-primary capitalize">
                {getModeText()}
              </p>
              <h1 className="text-6xl font-bold" style={{fontVariantNumeric: 'tabular-nums'}}>
                {formatTime(timeLeft)}
              </h1>
              <p className="mt-1 text-base text-muted-foreground truncate max-w-full px-2">
                {selectedTask?.name || 'No task selected'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => onTimerControl('reset')}
            >
              <Icon name="restart_alt" className="w-5 h-5" />
            </Button>
            <Button 
              size="lg"
              className="h-16 w-16 rounded-full"
              onClick={() => onTimerControl('toggle')}
            >
              {isTimerRunning ? 
                <Icon name="pause" className="w-6 h-6" /> : 
                <Icon name="play" className="w-6 h-6" />
              }
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => onTimerControl('skip')}
            >
              <Icon name="skip_next" className="w-5 h-5" />
            </Button>
          </div>
          
          <Card className="w-full">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon name="mosque" />
              </div>
              <p className="flex-1 truncate text-sm">
                {tPrayer('nextPrayer', { name: nextPrayer.name, time: nextPrayer.time })}
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};