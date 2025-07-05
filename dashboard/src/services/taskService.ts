import { supabase } from './supabaseClient';
import { Task, TaskStatus, TasksData } from '@/types/task';

// For now, we'll use a hybrid approach - loading from a local JSON file
// but preparing for Supabase integration in the future

const TASKS_FILE_PATH = '/tasks/tasks.json';

export class TaskService {
  // Get all tasks
  static async getAllTasks(): Promise<TasksData> {
    try {
      // Try to fetch from API first
      const response = await fetch(TASKS_FILE_PATH);
      if (!response.ok) {
        throw new Error(`Error fetching tasks: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return { tasks: [], lastId: 0 };
    }
  }

  // Get a single task by ID
  static async getTaskById(id: number): Promise<Task | null> {
    const { tasks } = await this.getAllTasks();
    return tasks.find(task => task.id === id) || null;
  }

  // Get tasks by status
  static async getTasksByStatus(status: TaskStatus | 'all'): Promise<Task[]> {
    const { tasks } = await this.getAllTasks();
    if (status === 'all') {
      return tasks;
    }
    return tasks.filter(task => task.status === status);
  }

  // Get next tasks to work on (pending, sorted by priority and dependencies)
  static async getNextTasks(limit = 5): Promise<Task[]> {
    const { tasks } = await this.getAllTasks();
    return tasks
      .filter(task => task.status === 'pending')
      .sort((a, b) => {
        // High priority first
        if (a.priority === 'high' && b.priority !== 'high') return -1;
        if (a.priority !== 'high' && b.priority === 'high') return 1;
        
        // Then tasks with no dependencies
        if (a.dependencies.length === 0 && b.dependencies.length > 0) return -1;
        if (a.dependencies.length > 0 && b.dependencies.length === 0) return 1;
        
        // Finally by ID (lower ID first)
        return a.id - b.id;
      })
      .slice(0, limit);
  }

  // Get recently completed tasks
  static async getRecentlyCompletedTasks(limit = 5): Promise<Task[]> {
    const { tasks } = await this.getAllTasks();
    return tasks
      .filter(task => task.status === 'done')
      .sort((a, b) => b.id - a.id) // Higher ID (more recent) first
      .slice(0, limit);
  }

  // Calculate dashboard statistics
  static async getDashboardStats() {
    const { tasks } = await this.getAllTasks();
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'done').length;
    const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
    const pendingTasks = tasks.filter(task => task.status === 'pending').length;
    const completionPercentage = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const statusCounts = {
      pending: pendingTasks,
      inProgress: inProgressTasks,
      done: completedTasks,
      review: tasks.filter(task => task.status === 'review').length,
      deferred: tasks.filter(task => task.status === 'deferred').length,
      cancelled: tasks.filter(task => task.status === 'cancelled').length,
      total: totalTasks
    };
    
    // Group tasks by category (for now, using the first 15 as security, the rest as product)
    const categoryBreakdown = {
      security: tasks.filter(task => task.id <= 15).length,
      product: tasks.filter(task => task.id > 15 && task.id < 34).length,
      infrastructure: tasks.filter(task => task.id >= 34).length
    };
    
    const highPriorityTasks = tasks.filter(task => task.priority === 'high').length;
    
    const nextTasks = await this.getNextTasks(5);
    const recentlyCompletedTasks = await this.getRecentlyCompletedTasks(5);
    
    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      completionPercentage,
      statusCounts,
      categoryBreakdown,
      highPriorityTasks,
      nextTasks,
      recentlyCompletedTasks
    };
  }
}
