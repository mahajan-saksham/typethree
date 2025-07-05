/**
 * Task Workflow Service
 * 
 * This service manages task categories and templates for the Type 3 Solar platform.
 * It provides functionality to fetch, create, update, and use task templates.
 */

import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { PersistentTask } from './TaskPersistenceService';

/**
 * Task Category interface
 */
export interface TaskCategory {
  id?: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

/**
 * Task Template interface
 */
export interface TaskTemplate {
  id?: string;
  name: string;
  description?: string;
  category_id?: string;
  template_data: any;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  category?: TaskCategory; // Joined category data
}

/**
 * Task Workflow Service
 */
export class TaskWorkflowService {
  /**
   * Get all task categories
   */
  static async getCategories() {
    try {
      const { data, error } = await supabase
        .from('task_categories')
        .select('*')
        .order('name');
      
      if (error) {
        throw new Error(`Error fetching categories: ${error.message}`);
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Error in getCategories:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Get all task templates, optionally filtered by category
   */
  static async getTemplates(categoryId?: string) {
    try {
      let query = supabase
        .from('task_templates')
        .select(`
          *,
          category:task_categories(*)
        `)
        .order('name');
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw new Error(`Error fetching templates: ${error.message}`);
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Error in getTemplates:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Get default templates for each category
   */
  static async getDefaultTemplates() {
    try {
      const { data, error } = await supabase
        .from('task_templates')
        .select(`
          *,
          category:task_categories(*)
        `)
        .eq('is_default', true);
      
      if (error) {
        throw new Error(`Error fetching default templates: ${error.message}`);
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Error in getDefaultTemplates:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Get a template by ID
   */
  static async getTemplateById(id: string) {
    try {
      const { data, error } = await supabase
        .from('task_templates')
        .select(`
          *,
          category:task_categories(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        throw new Error(`Error fetching template: ${error.message}`);
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error(`Error in getTemplateById for ${id}:`, error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Create a new task category
   */
  static async createCategory(category: TaskCategory, user: User) {
    try {
      const categoryData = {
        ...category,
        created_by: user.id
      };
      
      const { data, error } = await supabase
        .from('task_categories')
        .insert(categoryData)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Error creating category: ${error.message}`);
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Error in createCategory:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Create a new task template
   */
  static async createTemplate(template: TaskTemplate, user: User) {
    try {
      const templateData = {
        ...template,
        created_by: user.id
      };
      
      const { data, error } = await supabase
        .from('task_templates')
        .insert(templateData)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Error creating template: ${error.message}`);
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Error in createTemplate:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Update a task category
   */
  static async updateCategory(id: string, category: Partial<TaskCategory>, user: User) {
    try {
      const categoryData = {
        ...category,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('task_categories')
        .update(categoryData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Error updating category: ${error.message}`);
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error(`Error in updateCategory for ${id}:`, error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Update a task template
   */
  static async updateTemplate(id: string, template: Partial<TaskTemplate>, user: User) {
    try {
      const templateData = {
        ...template,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('task_templates')
        .update(templateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Error updating template: ${error.message}`);
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error(`Error in updateTemplate for ${id}:`, error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Delete a task category
   * Note: This will also remove any templates associated with this category
   */
  static async deleteCategory(id: string) {
    try {
      const { error } = await supabase
        .from('task_categories')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw new Error(`Error deleting category: ${error.message}`);
      }
      
      return { success: true, error: null };
    } catch (error: any) {
      console.error(`Error in deleteCategory for ${id}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a task template
   */
  static async deleteTemplate(id: string) {
    try {
      const { error } = await supabase
        .from('task_templates')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw new Error(`Error deleting template: ${error.message}`);
      }
      
      return { success: true, error: null };
    } catch (error: any) {
      console.error(`Error in deleteTemplate for ${id}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a task from a template
   */
  static createTaskFromTemplate(template: TaskTemplate): Partial<PersistentTask> {
    if (!template.template_data) {
      throw new Error('Template data is required');
    }
    
    // Create a task from the template data
    const task: Partial<PersistentTask> = {
      ...template.template_data,
      category: template.category?.name || undefined
    };
    
    return task;
  }
}
