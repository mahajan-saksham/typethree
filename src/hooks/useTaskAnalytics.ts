// src/hooks/useTaskAnalytics.ts
import { useState, useEffect, useCallback } from 'react';
import { TaskAnalytics } from '../services/TaskPersistenceService';

/**
 * Hook for task analytics
 */
export function useTaskAnalytics() {
  const [completionMetrics, setCompletionMetrics] = useState(null);
  const [statusDistribution, setStatusDistribution] = useState(null);
  const [burndownData, setBurndownData] = useState(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load task completion metrics
   */
  const loadCompletionMetrics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await TaskAnalytics.getCompletionMetrics();
      
      if (error) {
        throw new Error(error);
      }
      
      setCompletionMetrics(data);
    } catch (err: any) {
      console.error('Error loading completion metrics:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Load task status distribution
   */
  const loadStatusDistribution = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await TaskAnalytics.getStatusDistribution();
      
      if (error) {
        throw new Error(error);
      }
      
      setStatusDistribution(data);
    } catch (err: any) {
      console.error('Error loading status distribution:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Load burndown chart data
   */
  const loadBurndownData = useCallback(async (startDate: string, endDate: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await TaskAnalytics.getBurndownData(startDate, endDate);
      
      if (error) {
        throw new Error(error);
      }
      
      setBurndownData(data);
    } catch (err: any) {
      console.error('Error loading burndown data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    completionMetrics,
    statusDistribution,
    burndownData,
    isLoading,
    error,
    loadCompletionMetrics,
    loadStatusDistribution,
    loadBurndownData
  };
}
