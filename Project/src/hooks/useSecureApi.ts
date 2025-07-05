// src/hooks/useSecureApi.ts
import { useState, useEffect, useCallback } from 'react';

/**
 * Type for error responses from the API
 */
interface ApiError {
  message: string;
  status?: number;
}

/**
 * Custom hook for secure API calls
 * Uses server-side API routes instead of direct Supabase client calls
 */
export function useSecureApi<T = any>() {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * Fetch data from a secure API endpoint
   */
  const fetchData = useCallback(async (endpoint: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/${endpoint}`);
      
      // Check for HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      // Parse response JSON
      const result = await response.json();
      setData(result);
      return result;
    } catch (err: any) {
      console.error(`Error fetching from ${endpoint}:`, err);
      setError({ 
        message: err.message || 'An unexpected error occurred', 
        status: err.status || 500 
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Post data to a secure API endpoint
   */
  const postData = useCallback(async (endpoint: string, data: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      // Check for HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      // Parse response JSON
      const result = await response.json();
      return result;
    } catch (err: any) {
      console.error(`Error posting to ${endpoint}:`, err);
      setError({ 
        message: err.message || 'An unexpected error occurred', 
        status: err.status || 500 
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update data via a secure API endpoint (PUT)
   */
  const updateData = useCallback(async (endpoint: string, data: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      // Check for HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      // Parse response JSON
      const result = await response.json();
      return result;
    } catch (err: any) {
      console.error(`Error updating ${endpoint}:`, err);
      setError({ 
        message: err.message || 'An unexpected error occurred', 
        status: err.status || 500 
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Delete data via a secure API endpoint
   */
  const deleteData = useCallback(async (endpoint: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/${endpoint}`, {
        method: 'DELETE',
      });
      
      // Check for HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      // Parse response JSON
      const result = await response.json();
      return result;
    } catch (err: any) {
      console.error(`Error deleting ${endpoint}:`, err);
      setError({ 
        message: err.message || 'An unexpected error occurred', 
        status: err.status || 500 
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    data,
    error,
    isLoading,
    fetchData,
    postData,
    updateData,
    deleteData,
  };
}
