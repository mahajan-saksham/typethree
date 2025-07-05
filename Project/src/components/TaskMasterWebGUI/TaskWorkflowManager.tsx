/**
 * Task Workflow Manager Component
 * 
 * This component allows administrators to manage task categories and templates
 * for the Type 3 Solar platform development workflow.
 */

import React, { useState } from 'react';
import { useTaskWorkflow } from '../../hooks/useTaskWorkflow';
import { TaskCategory, TaskTemplate } from '../../services/TaskWorkflowService';

const TaskWorkflowManager: React.FC = () => {
  const {
    categories,
    templates,
    isLoading,
    error,
    loadWorkflowData,
    createCategory,
    createTemplate,
    updateCategory,
    updateTemplate,
    deleteCategory,
    deleteTemplate
  } = useTaskWorkflow();

  const [activeTab, setActiveTab] = useState<'categories' | 'templates'>('categories');
  const [editingCategory, setEditingCategory] = useState<TaskCategory | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);
  
  // Form states
  const [categoryForm, setCategoryForm] = useState<TaskCategory>({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: 'folder'
  });
  
  const [templateForm, setTemplateForm] = useState<TaskTemplate>({
    name: '',
    description: '',
    category_id: '',
    is_default: false,
    template_data: {
      title: '',
      description: '',
      details: '',
      test_strategy: '',
      priority: 'medium',
      estimated_hours: 4
    }
  });

  // Handle category form submission
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCategory?.id) {
      await updateCategory(editingCategory.id, categoryForm);
    } else {
      await createCategory(categoryForm);
    }
    
    // Reset form
    setCategoryForm({
      name: '',
      description: '',
      color: '#3B82F6',
      icon: 'folder'
    });
    setEditingCategory(null);
    loadWorkflowData();
  };

  // Handle template form submission
  const handleTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTemplate?.id) {
      await updateTemplate(editingTemplate.id, templateForm);
    } else {
      await createTemplate(templateForm);
    }
    
    // Reset form
    setTemplateForm({
      name: '',
      description: '',
      category_id: '',
      is_default: false,
      template_data: {
        title: '',
        description: '',
        details: '',
        test_strategy: '',
        priority: 'medium',
        estimated_hours: 4
      }
    });
    setEditingTemplate(null);
    loadWorkflowData();
  };

  // Handle editing a category
  const handleEditCategory = (category: TaskCategory) => {
    setEditingCategory(category);
    setCategoryForm(category);
  };

  // Handle editing a template
  const handleEditTemplate = (template: TaskTemplate) => {
    setEditingTemplate(template);
    setTemplateForm(template);
  };

  // Handle deleting a category
  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category? This will also delete all templates in this category.')) {
      await deleteCategory(id);
      loadWorkflowData();
    }
  };

  // Handle deleting a template
  const handleDeleteTemplate = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      await deleteTemplate(id);
      loadWorkflowData();
    }
  };

  // If loading, show loading indicator
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-2"></div>
        <p>Loading workflow configuration...</p>
      </div>
    );
  }

  // If error, show error message
  if (error) {
    return (
      <div className="p-4 bg-error/20 text-error rounded-lg">
        <h3 className="font-bold mb-2">Error</h3>
        <p>{error}</p>
        <button
          onClick={loadWorkflowData}
          className="mt-4 px-4 py-2 bg-primary text-dark rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Task Workflow Configuration</h1>
      
      {/* Tabs */}
      <div className="flex border-b border-dark-400 mb-6">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'categories' ? 'border-b-2 border-primary text-primary' : 'text-light/60 hover:text-light'}`}
          onClick={() => setActiveTab('categories')}
        >
          Categories
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'templates' ? 'border-b-2 border-primary text-primary' : 'text-light/60 hover:text-light'}`}
          onClick={() => setActiveTab('templates')}
        >
          Templates
        </button>
      </div>
      
      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Categories List */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-4">Task Categories</h2>
            
            <div className="bg-dark-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-dark-400">
                <thead className="bg-dark-300">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light/60 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light/60 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light/60 uppercase tracking-wider">Color</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-light/60 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-dark-100 divide-y divide-dark-400">
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-light/60">
                        No categories found. Create your first category.
                      </td>
                    </tr>
                  ) : (
                    categories.map(category => (
                      <tr key={category.id} className="hover:bg-dark-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {category.color && (
                              <div
                                className="w-4 h-4 rounded-full mr-2"
                                style={{ backgroundColor: category.color }}
                              />
                            )}
                            <span className="font-medium">{category.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-light/80">{category.description}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">{category.color}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="text-primary hover:text-primary-light mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id as string)}
                            className="text-error hover:text-error-light"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Category Form */}
          <div>
            <h2 className="text-xl font-bold mb-4">
              {editingCategory ? 'Edit Category' : 'New Category'}
            </h2>
            
            <form onSubmit={handleCategorySubmit} className="bg-dark-200 rounded-lg p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-light/80 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full p-2 rounded-md bg-dark-300 border border-dark-500 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-light/80 mb-1">
                  Description
                </label>
                <textarea
                  value={categoryForm.description || ''}
                  onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full p-2 rounded-md bg-dark-300 border border-dark-500 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  rows={3}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-light/80 mb-1">
                  Color
                </label>
                <div className="flex items-center">
                  <input
                    type="color"
                    value={categoryForm.color || '#3B82F6'}
                    onChange={e => setCategoryForm({ ...categoryForm, color: e.target.value })}
                    className="w-10 h-10 rounded-md bg-dark-300 border border-dark-500 mr-2"
                  />
                  <input
                    type="text"
                    value={categoryForm.color || '#3B82F6'}
                    onChange={e => setCategoryForm({ ...categoryForm, color: e.target.value })}
                    className="flex-1 p-2 rounded-md bg-dark-300 border border-dark-500 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-light/80 mb-1">
                  Icon
                </label>
                <input
                  type="text"
                  value={categoryForm.icon || ''}
                  onChange={e => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                  className="w-full p-2 rounded-md bg-dark-300 border border-dark-500 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  placeholder="folder, code, etc."
                />
              </div>
              
              <div className="flex justify-end">
                {editingCategory && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategory(null);
                      setCategoryForm({
                        name: '',
                        description: '',
                        color: '#3B82F6',
                        icon: 'folder'
                      });
                    }}
                    className="px-4 py-2 rounded-md bg-dark-300 text-light/80 hover:bg-dark-400 transition-colors mr-2"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-primary text-dark hover:bg-primary-light transition-colors"
                >
                  {editingCategory ? 'Update' : 'Create'} Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Templates List */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-4">Task Templates</h2>
            
            <div className="bg-dark-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-dark-400">
                <thead className="bg-dark-300">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light/60 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light/60 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light/60 uppercase tracking-wider">Default</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-light/60 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-dark-100 divide-y divide-dark-400">
                  {templates.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-light/60">
                        No templates found. Create your first template.
                      </td>
                    </tr>
                  ) : (
                    templates.map(template => (
                      <tr key={template.id} className="hover:bg-dark-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-light/60">{template.description}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {template.category?.color && (
                              <div
                                className="w-3 h-3 rounded-full mr-1"
                                style={{ backgroundColor: template.category.color }}
                              />
                            )}
                            <span className="text-sm">
                              {template.category?.name || 'Uncategorized'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {template.is_default ? (
                            <span className="px-2 py-1 text-xs bg-primary/20 text-primary rounded">
                              Default
                            </span>
                          ) : (
                            <span className="text-light/40">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <button
                            onClick={() => handleEditTemplate(template)}
                            className="text-primary hover:text-primary-light mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(template.id as string)}
                            className="text-error hover:text-error-light"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Template Form - simplified for brevity */}
          <div>
            <h2 className="text-xl font-bold mb-4">
              {editingTemplate ? 'Edit Template' : 'New Template'}
            </h2>
            
            <form onSubmit={handleTemplateSubmit} className="bg-dark-200 rounded-lg p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-light/80 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={templateForm.name}
                  onChange={e => setTemplateForm({ ...templateForm, name: e.target.value })}
                  className="w-full p-2 rounded-md bg-dark-300 border border-dark-500 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-light/80 mb-1">
                  Description
                </label>
                <textarea
                  value={templateForm.description || ''}
                  onChange={e => setTemplateForm({ ...templateForm, description: e.target.value })}
                  className="w-full p-2 rounded-md bg-dark-300 border border-dark-500 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  rows={2}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-light/80 mb-1">
                  Category
                </label>
                <select
                  value={templateForm.category_id || ''}
                  onChange={e => setTemplateForm({ ...templateForm, category_id: e.target.value })}
                  className="w-full p-2 rounded-md bg-dark-300 border border-dark-500 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={templateForm.is_default || false}
                    onChange={e => setTemplateForm({ ...templateForm, is_default: e.target.checked })}
                    className="form-checkbox rounded bg-dark-300 border-dark-500 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm font-medium text-light/80">
                    Set as default template for this category
                  </span>
                </label>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-light/80 mb-1">
                  Template Data - Preview
                </label>
                <pre className="p-2 rounded-md bg-dark-300 border border-dark-500 text-xs overflow-auto max-h-40">
                  {JSON.stringify(templateForm.template_data, null, 2)}
                </pre>
                <span className="text-xs text-light/60 mt-1 block">
                  Use the template editor for full template data customization.
                </span>
              </div>
              
              <div className="flex justify-end">
                {editingTemplate && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTemplate(null);
                      setTemplateForm({
                        name: '',
                        description: '',
                        category_id: '',
                        is_default: false,
                        template_data: {
                          title: '',
                          description: '',
                          details: '',
                          test_strategy: '',
                          priority: 'medium',
                          estimated_hours: 4
                        }
                      });
                    }}
                    className="px-4 py-2 rounded-md bg-dark-300 text-light/80 hover:bg-dark-400 transition-colors mr-2"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-primary text-dark hover:bg-primary-light transition-colors"
                >
                  {editingTemplate ? 'Update' : 'Create'} Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskWorkflowManager;
