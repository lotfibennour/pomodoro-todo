import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Icon } from '../Icons';
import { NextPrayer } from '@/types';

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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="mosque" className="text-primary" />
            {nextPrayer.name} Time
          </DialogTitle>
          <DialogDescription>
            It's time to pray. Timer was {wasTimerRunningBeforePrayer ? 'paused' : 'already stopped'}.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Dismiss
          </Button>
          <Button 
            onClick={onResumeAfterPrayer}
            className="w-full sm:w-auto"
          >
            Resume Timer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};