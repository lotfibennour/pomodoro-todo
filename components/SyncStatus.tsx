import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Icon } from './Icons';
import { SyncStats } from '@/types';

interface SyncStatusProps {
  accessToken: string | null;
  isSyncing: boolean;
  lastSync: Date | null;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  syncStats: SyncStats | null;
  onManualSync: () => void;
  onDisconnect: () => void;
  onConnectGoogle: () => void;
  canSync: boolean;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({
  accessToken,
  isSyncing,
  lastSync,
  syncStatus,
  syncStats,
  onManualSync,
  onDisconnect,
  onConnectGoogle,
  canSync
}) => {
  const getSyncButtonText = () => {
    if (isSyncing) return 'Syncing...';
    if (!canSync) return 'Wait...';
    return 'Sync Now';
  };

  const getSyncIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <Icon name="restart_alt" className="w-4 h-4 animate-spin" />;
      case 'success':
        return <Icon name="check" className="w-4 h-4 text-green-500" />;
      case 'error':
        return <Icon name="close" className="w-4 h-4 text-red-500" />;
      default:
        return <Icon name="restart_alt" className="w-4 h-4" />;
    }
  };

  const getLastSyncText = () => {
    if (!lastSync) return 'Never synced';
    
    const now = new Date();
    const diffMs = now.getTime() - lastSync.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return lastSync.toLocaleDateString();
  };

  if (!accessToken) {
    return (
      <Button 
        onClick={onConnectGoogle}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Icon name="waypoint" className="w-4 h-4" />
        Connect Google Tasks
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Sync Button with Status */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              onClick={onManualSync}
              disabled={isSyncing || !canSync}
              variant="outline"
              className="flex items-center gap-2"
            >
              {getSyncIcon()}
              {getSyncButtonText()}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {!canSync ? 'Wait 30 seconds between syncs' : 
               isSyncing ? 'Syncing in progress...' : 'Sync with Google Tasks'}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {/* Connection Status */}
      <Badge variant="secondary" className="flex items-center gap-1">
        <Icon name="check" className="w-3 h-3" />
        Connected
      </Badge>
      
      {/* Last Sync Time */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-sm text-muted-foreground cursor-help">
              Last: {getLastSyncText()}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Last sync: {lastSync?.toLocaleString() || 'Never'}</p>
            {syncStats && (
              <div className="mt-1 text-xs">
                <div>✅ Created: {syncStats.created}</div>
                <div>🔄 Updated: {syncStats.updated}</div>
                <div>🗑️ Deleted: {syncStats.deleted}</div>
                {syncStats.conflicts > 0 && (
                  <div>⚡ Conflicts: {syncStats.conflicts}</div>
                )}
              </div>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {/* Disconnect Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              onClick={onDisconnect}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
            >
              <Icon name="close" className="w-3 h-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Disconnect Google Tasks</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};