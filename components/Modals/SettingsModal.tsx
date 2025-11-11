import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Icon } from '../Icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl">Settings</DialogTitle>
          <DialogDescription>
            Configure your location, prayer times, and notification preferences.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="location" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="calculation">Calculation</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="location" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Set Your Location</h3>
              <p className="text-sm text-muted-foreground">
                Provide your location for accurate prayer time calculations.
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="e.g. New York" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" placeholder="e.g. United States" />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="auto-detect" />
              <Label htmlFor="auto-detect">Auto-detect location</Label>
            </div>
          </TabsContent>
          
          <TabsContent value="calculation" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Calculation & Time Zone</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="calculation-method">Calculation Method</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
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
                <Label htmlFor="timezone">Time Zone</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
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
              <h3 className="text-lg font-semibold">Notification Preferences</h3>
              <p className="text-sm text-muted-foreground">
                Configure how you want to be notified about prayer times.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="prayer-notifications">Prayer Time Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when it's time for prayer
                  </p>
                </div>
                <Switch id="prayer-notifications" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="timer-notifications">Timer Completion Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when a pomodoro session completes
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
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};