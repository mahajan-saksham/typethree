/**
 * useTaskWorkflow Hook
 * 
 * This hook provides access to task categories and templates
 * for the Type 3 Solar platform development workflow.
 */

import { useState, useEffect, useCallback } from 'react';
import { useSupabaseAuth } from './useSupabaseAuth';
import { 
  TaskWorkflowService, 
  TaskCategory, 
  TaskTemplate 
} from '../services/TaskWorkflowService';
import { PersistentTask } from '../services/TaskPersistenceService';

export function useTaskWorkflow() {
  const { user } = useSupabaseAuth();
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [defaultTemplates, setDefaultTemplates] = useState<TaskTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load categories and templates
  const loadWorkflowData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load categories
      const { data: categoriesData, error: categoriesError } = await TaskWorkflowService.getCategories();
      if (categoriesError) throw new Error(categoriesError);
      
      // Load all templates
      const { data: templatesData, error: templatesError } = await TaskWorkflowService.getTemplates();
      if (templatesError) throw new Error(templatesError);
      
      // Load default templates
      const { data: defaultTemplatesData, error: defaultTemplatesError } = await TaskWorkflowService.getDefaultTemplates();
      if (defaultTemplatesError) throw new Error(defaultTemplatesError);

      setCategories(categoriesData || []);
      setTemplates(templatesData || []);
      setDefaultTemplates(defaultTemplatesData || []);
    } catch (err: any) {
      console.error('Error loading workflow data:', err);
      setError(err.message || 'Failed to load workflow data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load workflow data on mount
  useEffect(() => {
    loadWorkflowData();
  }, [loadWorkflowData]);

  // Create a new category
  const createCategory = useCallback(async (category: TaskCategory) => {
    if (!user) {
      return { data: null, error: 'User not authenticated' };
    }

    try {
      setError(null);
      const result = await TaskWorkflowService.createCategory(category, user);
      
      if (result.data) {
        // Update categories list
        setCategories(prev => [...prev, result.data]);
      }
      
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to create category');
      return { data: null, error: err.message };
    }
  }, [user]);

  // Create a new template
  const createTemplate = useCallback(async (template: TaskTemplate) => {
    if (!user) {
      return { data: null, error: 'User not authenticated' };
    }

    try {
      setError(null);
      const result = await TaskWorkflowService.createTemplate(template, user);
      
      if (result.data) {
        // Update templates list
        setTemplates(prev => [...prev, result.data]);
        
        // Update default templates list if this is a default template
        if (result.data.is_default) {
          setDefaultTemplates(prev => [...prev, result.data]);
        }
      }
      
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to create template');
      return { data: null, error: err.message };
    }
  }, [user]);

  // Update an existing category
  const updateCategory = useCallback(async (id: string, category: Partial<TaskCategory>) => {
    if (!user) {
      return { data: null, error: 'User not authenticated' };
    }

    try {
      setError(null);
      const result = await TaskWorkflowService.updateCategory(id, category, user);
      
      if (result.data) {
        // Update categories list
        setCategories(prev => 
          prev.map(cat => cat.id === id ? result.data : cat)
        );
        
        // Also update the category in templates
        setTemplates(prev => 
          prev.map(template => {
            if (template.category?.id === id) {
              return {
                ...template,
                category: result.data
              };
            }
            return template;
          })
        );
      }
      
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to update category');
      return { data: null, error: err.message };
    }
  }, [user]);

  // Update an existing template
  const updateTemplate = useCallback(async (id: string, template: Partial<TaskTemplate>) => {
    if (!user) {
      return { data: null, error: 'User not authenticated' };
    }

    try {
      setError(null);
      const result = await TaskWorkflowService.updateTemplate(id, template, user);
      
      if (result.data) {
        // Update templates list
        setTemplates(prev => 
          prev.map(tpl => tpl.id === id ? result.data : tpl)
        );
        
        // Update default templates list if needed
        if (template.is_default !== undefined) {
          if (template.is_default) {
            // Add to or update in default templates
            setDefaultTemplates(prev => {
              const exists = prev.some(tpl => tpl.id === id);
              if (exists) {
                return prev.map(tpl => tpl.id === id ? result.data : tpl);
              } else {
                return [...prev, result.data];
              }
            });
          } else {
            // Remove from default templates
            setDefaultTemplates(prev => 
              prev.filter(tpl => tpl.id !== id)
            );
          }
        }
      }
      
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to update template');
      return { data: null, error: err.message };
    }
  }, [user]);

  // Delete a category
  const deleteCategory = useCallback(async (id: string) => {
    try {
      setError(null);
      const result = await TaskWorkflowService.deleteCategory(id);
      
      if (result.success) {
        // Remove from categories list
        setCategories(prev => prev.filter(cat => cat.id !== id));
        
        // Remove templates with this category
        const templatesWithCategory = templates.filter(tpl => tpl.category_id === id);
        setTemplates(prev => prev.filter(tpl => tpl.category_id !== id));
        
        // Remove from default templates if needed
        const defaultTemplateIds = templatesWithCategory
          .filter(tpl => tpl.is_default)
          .map(tpl => tpl.id);
        
        if (defaultTemplateIds.length > 0) {
          setDefaultTemplates(prev => 
            prev.filter(tpl => !defaultTemplateIds.includes(tpl.id as string))
          );
        }
      }
      
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to delete category');
      return { success: false, error: err.message };
    }
  }, [templates]);

  // Delete a template
  const deleteTemplate = useCallback(async (id: string) => {
    try {
      setError(null);
      const result = await TaskWorkflowService.deleteTemplate(id);
      
      if (result.success) {
        // Remove from templates list
        setTemplates(prev => prev.filter(tpl => tpl.id !== id));
        
        // Remove from default templates if needed
        setDefaultTemplates(prev => prev.filter(tpl => tpl.id !== id));
      }
      
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to delete template');
      return { success: false, error: err.message };
    }
  }, []);

  // Get templates for a specific category
  const getTemplatesByCategory = useCallback((categoryId: string) => {
    return templates.filter(template => template.category_id === categoryId);
  }, [templates]);

  // Get the default template for a category
  const getDefaultTemplateForCategory = useCallback((categoryId: string) => {
    return defaultTemplates.find(template => template.category_id === categoryId);
  }, [defaultTemplates]);

  // Create a task from a template
  const createTaskFromTemplate = useCallback((templateId: string): Partial<PersistentTask> | null => {
    const template = templates.find(tpl => tpl.id === templateId);
    
    if (!template) {
      console.error(`Template with ID ${templateId} not found`);
      return null;
    }
    
    try {
      return TaskWorkflowService.createTaskFromTemplate(template);
    } catch (err: any) {
      console.error('Error creating task from template:', err);
      setError(err.message || 'Failed to create task from template');
      return null;
    }
  }, [templates]);

  return {
    categories,
    templates,
    defaultTemplates,
    isLoading,
    error,
    loadWorkflowData,
    createCategory,
    createTemplate,
    updateCategory,
    updateTemplate,
    deleteCategory,
    deleteTemplate,
    getTemplatesByCategory,
    getDefaultTemplateForCategory,
    createTaskFromTemplate
  };
}
