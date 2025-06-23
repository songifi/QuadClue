import { useEffect, useRef, useState, useCallback } from 'react';
import { PlayerStats } from '@/types/user';
import { useSystemCalls } from '@/lib/dojo/useSystemCalls';

const CACHE_TTL = 15_000; // 15 seconds - adjust to taste

export function usePlayerStats(trigger: boolean) {
  const { getCurrentPlayerStats } = useSystemCalls();
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const lastFetchedRef = useRef<number>(0);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Fetching player stats from blockchain...');
      const fresh = await getCurrentPlayerStats();
      if (fresh) {
        setStats(fresh);
        lastFetchedRef.current = Date.now();
        console.log('✅ Player stats fetched:', fresh);
      } else {
        console.log('⚠️ No player stats returned');
      }
    } catch (error) {
      console.error('❌ Error fetching player stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentPlayerStats]);

  // Re-fetch when modal opens OR cache expired
  useEffect(() => {
    if (!trigger) return;

    const timeSinceLastFetch = Date.now() - lastFetchedRef.current;
    const shouldRefresh = timeSinceLastFetch > CACHE_TTL || !stats;

    console.log('🔄 usePlayerStats effect:', {
      trigger,
      timeSinceLastFetch,
      shouldRefresh,
      hasStats: !!stats
    });

    if (shouldRefresh) {
      fetchStats();
    }
  }, [trigger, fetchStats, stats]);

  return { stats, isLoading, refetch: fetchStats };
} 