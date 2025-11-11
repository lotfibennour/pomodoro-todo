import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from './useDebounce';
import { SyncStats } from '@/types';


interface UseGoogleSyncReturn {
  accessToken: string | null;
  isSyncing: boolean;
  lastSync: Date | null;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  syncStats: SyncStats | null;
  handleManualSync: () => Promise<void>;
  handleDisconnect: () => void;
  setAccessToken: (token: string | null) => void;
  canSync: boolean;
}

export const useGoogleSync = (tasks: any[], initialLoadComplete: boolean): UseGoogleSyncReturn => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncStats, setSyncStats] = useState<SyncStats | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<number>(0);
  
  const syncInProgress = useRef(false);
  const debouncedTasks = useDebounce(tasks, 8000); // Reduced from 10s to 8s

  // Sync cooldown period (30 seconds)
  const SYNC_COOLDOWN = 30 * 1000;
  // Minimum time between auto-syncs (2 minutes)
  const AUTO_SYNC_INTERVAL = 2 * 60 * 1000;

  const canSync = useCallback((): boolean => {
    const now = Date.now();
    return (now - lastSyncTime) > SYNC_COOLDOWN && !syncInProgress.current;
  }, [lastSyncTime]);

  const isTokenExpired = useCallback((): boolean => {
    const tokenTimestamp = localStorage.getItem('google_token_timestamp');
    if (!tokenTimestamp) return true;
    
    const tokenTime = parseInt(tokenTimestamp);
    const currentTime = Date.now();
    const fiftyMinutes = 50 * 60 * 1000;
    
    return (currentTime - tokenTime) > fiftyMinutes;
  }, []);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const refreshToken = localStorage.getItem('google_refresh_token');
      if (!refreshToken) {
        console.log('No refresh token available');
        return null;
      }

      const response = await fetch('/api/google-tasks/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const tokens = await response.json();
        localStorage.setItem('google_access_token', tokens.access_token);
        localStorage.setItem('google_token_timestamp', Date.now().toString());
        if (tokens.refresh_token) {
          localStorage.setItem('google_refresh_token', tokens.refresh_token);
        }
        setAccessToken(tokens.access_token);
        return tokens.access_token;
      } else {
        console.error('Failed to refresh token');
        return null;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }, []);

  const performSync = useCallback(async (token: string): Promise<{ success: boolean; stats?: SyncStats; error?: string }> => {
    try {
      const response = await fetch('/api/google-tasks/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          accessToken: token,
          lastSync: lastSync?.toISOString() // Send last sync time for incremental sync
        }),
      });

      if (response.ok) {
        const results = await response.json();
        setSyncStats(results);
        return { success: true, stats: results };
      } else if (response.status === 401) {
        return { success: false, error: 'TOKEN_EXPIRED' };
      } else {
        return { success: false, error: 'SYNC_FAILED' };
      }
    } catch (error) {
      console.error('Sync request failed:', error);
      return { success: false, error: 'NETWORK_ERROR' };
    }
  }, [lastSync]);

  const handleManualSync = useCallback(async () => {
    // Prevent multiple simultaneous syncs
    if (syncInProgress.current || !canSync()) {
      console.log('Sync already in progress or in cooldown, skipping...');
      return;
    }

    let currentAccessToken = accessToken || localStorage.getItem('google_access_token');
    if (!currentAccessToken) {
      console.log('No access token available');
      return;
    }

    syncInProgress.current = true;
    setIsSyncing(true);
    setSyncStatus('syncing');
    
    try {
      // Check if token is expired
      if (isTokenExpired()) {
        console.log('Token expired, refreshing...');
        const newToken = await refreshAccessToken();
        if (newToken) {
          currentAccessToken = newToken;
        } else {
          throw new Error('Token refresh failed');
        }
      }

      const result = await performSync(currentAccessToken);
      
      if (result.success) {
        setLastSync(new Date());
        setSyncStatus('success');
        setLastSyncTime(Date.now());
        console.log('Sync completed successfully:', result.stats);
        
        // Auto-reset success status after 3 seconds
        setTimeout(() => setSyncStatus('idle'), 3000);
      } else {
        if (result.error === 'TOKEN_EXPIRED') {
          // Try one more time with token refresh
          const newToken = await refreshAccessToken();
          if (newToken) {
            const retryResult = await performSync(newToken);
            if (retryResult.success) {
              setLastSync(new Date());
              setSyncStatus('success');
              setLastSyncTime(Date.now());
              setTimeout(() => setSyncStatus('idle'), 3000);
              return;
            }
          }
        }
        
        throw new Error(result.error || 'Sync failed');
      }
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('error');
      
      // Auto-reset error status after 5 seconds
      setTimeout(() => setSyncStatus('idle'), 5000);
    } finally {
      setIsSyncing(false);
      syncInProgress.current = false;
    }
  }, [accessToken, canSync, isTokenExpired, refreshAccessToken, performSync]);

  const handleDisconnect = useCallback(() => {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_refresh_token');
    localStorage.removeItem('google_token_timestamp');
    setAccessToken(null);
    setLastSync(null);
    setSyncStatus('idle');
    setSyncStats(null);
    console.log('Disconnected from Google Tasks');
  }, []);

  // Initialize token on mount
  useEffect(() => {
    const token = localStorage.getItem('google_access_token');
    if (token) {
      setAccessToken(token);
    }
  }, []);

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get('google_auth');
    const tokenFromUrl = urlParams.get('access_token');
    const refreshTokenFromUrl = urlParams.get('refresh_token');

    if (tokenFromUrl && authStatus === 'success') {
      localStorage.setItem('google_access_token', tokenFromUrl);
      localStorage.setItem('google_token_timestamp', Date.now().toString());
      if (refreshTokenFromUrl) {
        localStorage.setItem('google_refresh_token', refreshTokenFromUrl);
      }
      setAccessToken(tokenFromUrl);
      setSyncStatus('success');
      
      // Remove URL parameters
      window.history.replaceState({}, '', window.location.pathname);
      
      console.log('OAuth successful');
    }
  }, []);

  // Auto-sync when tasks change (debounced)
  useEffect(() => {
    if (!initialLoadComplete || !accessToken || tasks.length === 0) {
      return;
    }
    
    // Only auto-sync if enough time has passed since last sync
    const now = Date.now();
    if ((now - lastSyncTime) < AUTO_SYNC_INTERVAL) {
      console.log('Skipping auto-sync - too soon since last sync');
      return;
    }

    if (canSync()) {
      console.log('Tasks changed, auto-syncing...');
      handleManualSync();
    }
  }, [debouncedTasks, accessToken, initialLoadComplete, canSync, handleManualSync, lastSyncTime]);

  // Periodic sync (every 10 minutes)
  useEffect(() => {
    if (!accessToken || !initialLoadComplete) return;

    const interval = setInterval(() => {
      if (canSync()) {
        console.log('Periodic sync with Google Tasks...');
        handleManualSync();
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [accessToken, initialLoadComplete, canSync, handleManualSync]);

  return {
    accessToken,
    isSyncing,
    lastSync,
    syncStatus,
    syncStats,
    handleManualSync,
    handleDisconnect,
    setAccessToken,
    canSync: canSync()
  };
};