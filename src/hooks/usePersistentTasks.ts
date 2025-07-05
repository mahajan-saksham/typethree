// src/hooks/usePersistentTasks.ts
import { useState, useEffect, useCallback } from 'react';
import { useSupabaseAuth } from './useSupabaseAuth'; // You would need to create this hook
import { 
  TaskPersistenceService,
  PersistentTask,
  TaskStatus,
  TaskPriority
} from '../services/TaskPersistenceService';

/**
 * Hook for working with persistent tasks
 */
export function usePersistentTasks(options: {
  status?: TaskStatus | TaskStatus[];
  category?: string;
  priority?: TaskPriority;
  owner_id?: string;
} = {}) {
  const [tasks, setTasks] = useState<PersistentTask[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSupabaseAuth();

  /**
   * Load tasks with the given filters
   */
  const loadTasks = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await TaskPersistenceService.getTasks(options);
      
      if (error) {
        throw new Error(error);
      }
      
      setTasks(data || []);
    } catch (err: any) {
      console.error('Error loading tasks:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [user, options]);

  /**
   * Create a new task
   */
  const createTask = useCallback(async (task: PersistentTask) => {
    if (!user) {
      setError('You must be logged in to create tasks');
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await TaskPersistenceService.createTask(task, user);
      
      if (error) {
        throw new Error(error);
      }
      
      // Reload tasks to include the new one
      await loadTasks();
      
      return data;
    } catch (err: any) {
      console.error('Error creating task:', err);
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, loadTasks]);

  /**
   * Update an existing task
   */
  const updateTask = useCallback(async (id: string, updates: Partial<PersistentTask>) => {
    if (!user) {
      setError('You must be logged in to update tasks');
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await TaskPersistenceService.updateTask(id, updates, user);
      
      if (error) {
        throw new Error(error);
      }
      
      // Update the task in the local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === id ? { ...task, ...updates } : task
        )
      );
      
      return data;
    } catch (err: any) {
      console.error(`Error updating task ${id}:`, err);
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Delete a task
   */
  const deleteTask = useCallback(async (id: string) => {
    if (!user) {
      setError('You must be logged in to delete tasks');
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { success, error } = await TaskPersistenceService.deleteTask(id);
      
      if (error) {
        throw new Error(error);
      }
      
      // Remove the task from local state
      if (success) {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
      }
      
      return success;
    } catch (err: any) {
      console.error(`Error deleting task ${id}:`, err);
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Update task status
   */
  const updateTaskStatus = useCallback(async (id: string, status: TaskStatus) => {
    return updateTask(id, { status });
  }, [updateTask]);

  /**
   * Sync tasks from Task Master
   */
  const syncTasksFromTaskMaster = useCallback(async (tasks: any[]) => {
    if (!user) {
      setError('You must be logged in to sync tasks');
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { results, error } = await TaskPersistenceService.syncTasksFromTaskMaster(tasks, user);
      
      if (error) {
        throw new Error(error);
      }
      
      // Reload tasks after sync
      await loadTasks();
      
      return results;
    } catch (err: any) {
      console.error('Error syncing tasks:', err);
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, loadTasks]);

  // Load tasks on component mount and when dependencies change
  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user, loadTasks]);

  return {
    tasks,
    isLoading,
    error,
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    syncTasksFromTaskMaster
  };
}
