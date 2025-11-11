import React from 'react';
import {
  Bell, Check, CheckCircle, ChevronDown, Circle, Clock, Cog, Flag,
  ListTodo, Minus, Pause, Play, Plus, RefreshCw, Settings, SkipForward,
  Trash2, X, Hourglass, LayoutGrid, Timer, LogOut, HelpCircle, Sun,
  Moon, Sunrise, Sunset, Waypoints
} from 'lucide-react';
import { IconName } from '@/types';

interface IconProps {
  name: IconName;
  className?: string;
}

export const Icon = ({ name, className = "w-5 h-5" }: IconProps) => {
  const icons = {
    grid_view: <LayoutGrid className={className} />,
    check_circle: <CheckCircle className={className} />,
    timer: <Timer className={className} />,
    settings: <Settings className={className} />,
    help: <HelpCircle className={className} />,
    logout: <LogOut className={className} />,
    hourglass_top: <Hourglass className={className} />,
    mosque: <Timer className={className} />,
    close: <X className={className} />,
    restart_alt: <RefreshCw className={className} />,
    pause: <Pause className={className} />,
    play: <Play className={className} />,
    skip_next: <SkipForward className={className} />,
    list_alt: <ListTodo className={className} />,
    add_circle: <Plus className={className} />,
    delete: <Trash2 className={className} />,
    minus: <Minus className="w-4 h-4" />,
    plus: <Plus className="w-4 h-4" />,
    sun: <Sun className={className} />,
    moon: <Moon className={className} />,
    sunrise: <Sunrise className={className} />,
    sunset: <Sunset className={className} />,
    waypoint: <Waypoints className={className} />,
    bell: <Bell className={className} />,
    check: <Check className={className} />,
  };
  
  return icons[name] || <Circle className={className} />;
};