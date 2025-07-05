// src/services/TaskPersistenceService.ts
import { supabase } from '../lib/supabaseClient';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import { User } from '@supabase/supabase-js';

/**
 * Task interface representing a persistent task
 */
export interface PersistentTask {
  id?: string;
  external_id: string;
  title: string;
  description?: string;
  details?: string;
  test_strategy?: string;
  status: TaskStatus;
  priority: TaskPriority;
  owner_id?: string;
  category?: string;
  estimated_hours?: number;
  actual_hours?: number;
  due_date?: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  dependencies?: string[];
}

/**
 * Subtask interface representing a persistent subtask
 */
export interface PersistentSubtask {
  id?: string;
  parent_task_id: string;
  external_id: string;
  title: string;
  description?: string;
  details?: string;
  status: TaskStatus;
  owner_id?: string;
  order_index?: number;
  estimated_hours?: number;
  actual_hours?: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  dependencies?: string[];
}

/**
 * Task status type
 */
export type TaskStatus = 
  | 'pending' 
  | 'in-progress' 
  | 'review' 
  | 'done' 
  | 'deferred' 
  | 'cancelled';

/**
 * Task priority type
 */
export type TaskPriority = 'high' | 'medium' | 'low';

/**
 * Task Persistence Service
 * Handles CRUD operations for tasks and subtasks
 */
export class TaskPersistenceService {
  /**
   * Get all tasks with optional filtering
   */
  static async getTasks(options: {
    status?: TaskStatus | TaskStatus[];
    category?: string;
    priority?: TaskPriority;
    owner_id?: string;
  } = {}) {
    try {
      let query = supabase
        .from('persistent_tasks')
        .select(`
          *,
          persistent_subtasks (*)
        `);
      
      // Apply filters
      if (options.status) {
        if (Array.isArray(options.status)) {
          query = query.in('status', options.status);
        } else {
          query = query.eq('status', options.status);
        }
      }
      
      if (options.category) {
        query = query.eq('category', options.category);
      }
      
      if (options.priority) {
        query = query.eq('priority', options.priority);
      }
      
      if (options.owner_id) {
        query = query.eq('owner_id', options.owner_id);
      }
      
      const { data, error } = await query.order('created_at');
      
      if (error) {
        throw new Error(`Error fetching tasks: ${error.message}`);
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Error in getTasks:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Get a single task by ID with its subtasks and dependencies
   */
  static async getTaskById(id: string) {
    try {
      // Get the task
      const { data: task, error: taskError } = await supabase
        .from('persistent_tasks')
        .select(`
          *,
          persistent_subtasks (*)
        `)
        .eq('id', id)
        .single();
      
      if (taskError) {
        throw new Error(`Error fetching task: ${taskError.message}`);
      }
      
      // Get task dependencies
      const { data: dependencies, error: depError } = await supabase
        .from('persistent_task_dependencies')
        .select(`
          depends_on_id,
          depends_on:persistent_tasks!depends_on_id (id, title, status)
        `)
        .eq('task_id', id);
      
      if (depError) {
        throw new Error(`Error fetching dependencies: ${depError.message}`);
      }
      
      // Add dependencies to the task
      const taskWithDeps = {
        ...task,
        dependencies: dependencies.map(dep => ({
          id: dep.depends_on_id,
          title: dep.depends_on.title,
          status: dep.depends_on.status
        }))
      };
      
      return { data: taskWithDeps, error: null };
    } catch (error: any) {
      console.error(`Error in getTaskById for ${id}:`, error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Create a new task
   */
  static async createTask(task: PersistentTask, user: User) {
    try {
      // Add current user as creator
      const taskData = {
        ...task,
        created_by: user.id,
        updated_by: user.id
      };
      
      // Remove dependencies from the insert data (handled separately)
      const { dependencies, ...insertData } = taskData;
      
      // Insert the task
      const { data, error } = await supabase
        .from('persistent_tasks')
        .insert(insertData)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Error creating task: ${error.message}`);
      }
      
      // Add dependencies if provided
      if (dependencies?.length) {
        await this.updateTaskDependencies(data.id, dependencies, user);
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Error in createTask:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Update an existing task
   */
  static async updateTask(id: string, updates: Partial<PersistentTask>, user: User) {
    try {
      // Add updated_by and updated_at
      const updateData = {
        ...updates,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      };
      
      // Remove dependencies from the update data (handled separately)
      const { dependencies, ...cleanUpdateData } = updateData;
      
      // Update the task
      const { data, error } = await supabase
        .from('persistent_tasks')
        .update(cleanUpdateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Error updating task: ${error.message}`);
      }
      
      // Update dependencies if provided
      if (dependencies !== undefined) {
        await this.updateTaskDependencies(id, dependencies, user);
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error(`Error in updateTask for ${id}:`, error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Delete a task
   */
  static async deleteTask(id: string) {
    try {
      // Delete the task (cascade will handle subtasks and dependencies)
      const { error } = await supabase
        .from('persistent_tasks')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw new Error(`Error deleting task: ${error.message}`);
      }
      
      return { success: true, error: null };
    } catch (error: any) {
      console.error(`Error in deleteTask for ${id}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update task dependencies
   */
  static async updateTaskDependencies(taskId: string, dependencies: string[], user: User) {
    try {
      // First, remove all current dependencies
      const { error: deleteError } = await supabase
        .from('persistent_task_dependencies')
        .delete()
        .eq('task_id', taskId);
      
      if (deleteError) {
        throw new Error(`Error removing dependencies: ${deleteError.message}`);
      }
      
      // If there are no new dependencies, we're done
      if (!dependencies.length) {
        return { success: true, error: null };
      }
      
      // Add new dependencies
      const dependencyRecords = dependencies.map(dependsOnId => ({
        task_id: taskId,
        depends_on_id: dependsOnId
      }));
      
      const { error } = await supabase
        .from('persistent_task_dependencies')
        .insert(dependencyRecords);
      
      if (error) {
        throw new Error(`Error adding dependencies: ${error.message}`);
      }
      
      return { success: true, error: null };
    } catch (error: any) {
      console.error(`Error in updateTaskDependencies for ${taskId}:`, error);
      return { success: false, error: error.message };
    }
  }
