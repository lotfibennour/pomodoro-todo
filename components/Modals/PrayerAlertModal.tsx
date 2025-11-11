import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Icon } from '../Icons';
import { NextPrayer } from '@/types';
import { useTranslations } from 'next-intl';

interface PrayerAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  nextPrayer: NextPrayer;
  wasTimerRunningBeforePrayer: boolean;
  onResumeAfterPrayer: () => void;
}

export const PrayerAlertModal: React.FC<PrayerAlertModalProps> = ({
  isOpen,
  onClose,
  nextPrayer,
  wasTimerRunningBeforePrayer,
  onResumeAfterPrayer
}) => {
  const t = useTranslations('prayer');

  const getTimerStatusText = () => {
    return wasTimerRunningBeforePrayer ? t('timerPaused') : t('timerStopped');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="mosque" className="text-primary" />
            {t('prayerTime', { name: nextPrayer.name })}
          </DialogTitle>
          <DialogDescription>
            {t('timeToPray', { timerStatus: getTimerStatusText() })}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            {t('dismiss')}
          </Button>
          <Button 
            onClick={onResumeAfterPrayer}
            className="w-full sm:w-auto"
          >
            {t('resumeTimer')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};