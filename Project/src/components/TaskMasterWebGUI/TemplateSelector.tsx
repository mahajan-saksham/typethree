/**
 * Template Selector Component
 * 
 * This component allows users to select a task template when creating a new task.
 */

import React, { useState, useEffect } from 'react';
import { useTaskWorkflow } from '../../hooks/useTaskWorkflow';
import { TaskCategory, TaskTemplate } from '../../services/TaskWorkflowService';

interface TemplateSelectorProps {
  onSelectTemplate: (template: TaskTemplate) => void;
  onCancel: () => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ 
  onSelectTemplate, 
  onCancel 
}) => {
  const { categories, templates, isLoading, error } = useTaskWorkflow();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredTemplates, setFilteredTemplates] = useState<TaskTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Update filtered templates when category or search term changes
  useEffect(() => {
    let filtered = templates;
    
    // Filter by category if selected
    if (selectedCategory) {
      filtered = filtered.filter(template => template.category_id === selectedCategory);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(term) || 
        template.description?.toLowerCase().includes(term) ||
        template.category?.name.toLowerCase().includes(term)
      );
    }
    
    setFilteredTemplates(filtered);
  }, [templates, selectedCategory, searchTerm]);

  return (
    <div className="bg-dark-100 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-dark-200 border-b border-dark-400 flex justify-between items-center">
        <h2 className="text-xl font-bold">Select a Template</h2>
        <button 
          onClick={onCancel}
          className="p-2 rounded-full hover:bg-dark-300 transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {/* Search and filters */}
      <div className="p-4 bg-dark-200 border-b border-dark-400">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search templates..."
              className="w-full p-2 rounded-md bg-dark-300 border border-dark-500 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-60">
            <select
              className="w-full p-2 rounded-md bg-dark-300 border border-dark-500 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-2"></div>
          <p className="text-light/60">Loading templates...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 bg-error/20 text-error text-center">
          <p>{error}</p>
        </div>
      )}

      {/* Template grid */}
      {!isLoading && !error && (
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-light/60">
              <p>No templates found. Try changing your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map(template => (
                <div 
                  key={template.id}
                  className="bg-dark-200 border border-dark-400 rounded-lg p-4 hover:border-primary cursor-pointer transition-colors"
                  onClick={() => onSelectTemplate(template)}
                >
                  <div className="flex items-center mb-2">
                    {template.category?.color && (
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: template.category.color }}
                      />
                    )}
                    <span className="text-xs text-light/60">
                      {template.category?.name || 'Uncategorized'}
                    </span>
                    {template.is_default && (
                      <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold mb-1">{template.name}</h3>
                  {template.description && (
                    <p className="text-sm text-light/80 mb-2">{template.description}</p>
                  )}
                  <div className="text-xs text-light/40 truncate">
                    {template.template_data.estimated_hours && (
                      <span className="mr-2">
                        Est: {template.template_data.estimated_hours}h
                      </span>
                    )}
                    {template.template_data.priority && (
                      <span className={`px-1.5 py-0.5 rounded ${template.template_data.priority === 'high' ? 'bg-error/20 text-error' : template.template_data.priority === 'medium' ? 'bg-warning/20 text-warning' : 'bg-info/20 text-info'}`}>
                        {template.template_data.priority}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="p-4 bg-dark-200 border-t border-dark-400 flex justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-md bg-dark-300 text-light/80 hover:bg-dark-400 transition-colors mr-2"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default TemplateSelector;
