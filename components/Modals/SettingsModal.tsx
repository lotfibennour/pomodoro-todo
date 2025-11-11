import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Icon } from '../Icons';
import { useTranslations } from 'next-intl';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const t = useTranslations('settings');
  const tCommon = useTranslations('common');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl">{t('title')}</DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="location" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="location">{t('location')}</TabsTrigger>
            <TabsTrigger value="calculation">{t('calculation')}</TabsTrigger>
            <TabsTrigger value="notifications">{t('notifications')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="location" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{t('setLocation')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('locationDescription')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">{t('city')}</Label>
                <Input id="city" placeholder={t('city')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">{t('country')}</Label>
                <Input id="country" placeholder={t('country')} />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="auto-detect" />
              <Label htmlFor="auto-detect">{t('autoDetect')}</Label>
            </div>
          </TabsContent>
          
          <TabsContent value="calculation" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{t('calculationMethod')} & {t('timezone')}</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="calculation-method">{t('calculationMethod')}</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder={t('calculationMethod')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="isna">Islamic Society of North America (ISNA)</SelectItem>
                    <SelectItem value="mwl">Muslim World League</SelectItem>
                    <SelectItem value="egypt">Egyptian General Authority of Survey</SelectItem>
                    <SelectItem value="makkah">Umm Al-Qura University, Makkah</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">{t('timezone')}</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder={t('timezone')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="et">(GMT-05:00) Eastern Time (US & Canada)</SelectItem>
                    <SelectItem value="ct">(GMT-06:00) Central Time (US & Canada)</SelectItem>
                    <SelectItem value="mt">(GMT-07:00) Mountain Time (US & Canada)</SelectItem>
                    <SelectItem value="pt">(GMT-08:00) Pacific Time (US & Canada)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{t('notificationPreferences')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('notificationPreferences')}
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="prayer-notifications">{t('prayerNotifications')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('prayerNotificationsDesc')}
                  </p>
                </div>
                <Switch id="prayer-notifications" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="timer-notifications">{t('timerNotifications')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('timerNotificationsDesc')}
                  </p>
                </div>
                <Switch id="timer-notifications" defaultChecked />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button onClick={onClose}>
            <Icon name="check" className="w-4 h-4 mr-2" />
            {tCommon('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};