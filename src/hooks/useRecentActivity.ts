import { useState, useEffect, useRef, useCallback } from 'react';
import { useApi } from '@/services/api';

export interface Activity {
  type: string;
  timestamp?: string;
  time?: string;
  carpool_name?: string;
  destination?: string;
  recipient_email?: string;
  title?: string;
  [key: string]: any;
}

export function useRecentActivity(limit = 20) {
  const [activity, setActivity] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const api = useApi();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchActivity = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getRecentActivity(limit);
      setActivity(data || []);
    } catch (err) {
      setError((err as Error).message || 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [api, limit]);

  useEffect(() => {
    fetchActivity();
    intervalRef.current = setInterval(fetchActivity, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchActivity]);

  return { activity, isLoading, error, refresh: fetchActivity };
} 