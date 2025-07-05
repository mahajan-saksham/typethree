import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import AdminLayout from '../../components/admin/AdminLayout';
import { motion } from 'framer-motion';
import { Edit, Trash2, Plus, X, Check } from 'lucide-react';
import { Card } from '../../components/Card';

interface Category {
  id: string;
  name: string;
  icon_name: string;
  created_at?: string;
}

const ProductCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '', icon_name: 'sun' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Available icons for selection
  const availableIcons = [
    'sun', 'zap', 'wrench', 'home', 'battery', 'droplet', 
    'leaf', 'settings', 'thermometer', 'wind', 'power'
  ];

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error.message);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('product_categories')
        .insert([
          { 
            name: newCategory.name.trim(), 
            icon_name: newCategory.icon_name
          }
        ])
        .select();

      if (error) throw error;
      
      setCategories([...categories, data[0]]);
      setNewCategory({ name: '', icon_name: 'sun' });
      setShowAddModal(false);
      setSuccess('Category added successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error('Error adding category:', error.message);
      setError('Failed to add category');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      const { error } = await supabase
        .from('product_categories')
        .update({ 
          name: editingCategory.name.trim(), 
          icon_name: editingCategory.icon_name 
        })
        .eq('id', editingCategory.id);

      if (error) throw error;
      
      setCategories(categories.map(cat => 
        cat.id === editingCategory.id ? editingCategory : cat
      ));
      setEditingCategory(null);
      setSuccess('Category updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error('Error updating category:', error.message);
      setError('Failed to update category');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? Products using this category will need to be reassigned.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('product_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setCategories(categories.filter(cat => cat.id !== id));
      setSuccess('Category deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error('Error deleting category:', error.message);
      setError('Failed to delete category');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setNewCategory({ name: '', icon_name: 'sun' });
    setError(null);
  };

  return (
    <AdminLayout title="Product Categories">
      <div className="container mx-auto py-6 px-4">
        {/* Header with Add button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-light">Manage Product Categories</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary hover:bg-primary/90 text-dark font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Category</span>
          </button>
        </div>

        {/* Error and Success messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-500 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        {/* Categories list */}
        <Card className="overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-light/60 mb-4">
                No categories found. Add your first category to get started.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-primary hover:bg-primary/90 text-dark font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors mx-auto"
              >
                <Plus className="h-4 w-4" />
                <span>Add First Category</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-dark-300">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light/60 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light/60 uppercase tracking-wider">Icon</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light/60 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-dark-100 divide-y divide-dark-300">
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingCategory?.id === category.id ? (
                          <input
                            type="text"
                            value={editingCategory.name}
                            onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                            className="bg-dark-200 border border-dark-300 rounded px-3 py-2 text-light w-full"
                            autoFocus
                          />
                        ) : (
                          <div className="text-sm font-medium text-light">{category.name}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingCategory?.id === category.id ? (
                          <div className="flex flex-wrap gap-2 max-w-xs">
                            {availableIcons.map(icon => (
                              <button
                                key={icon}
                                onClick={() => setEditingCategory({...editingCategory, icon_name: icon})}
                                className={`w-8 h-8 flex items-center justify-center rounded-full ${editingCategory.icon_name === icon ? 'bg-primary text-dark' : 'bg-dark-200 text-light/70 hover:bg-dark-300'}`}
                              >
                                <span className="text-sm">{icon.charAt(0).toUpperCase()}</span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                              <span className="text-sm">{category.icon_name.charAt(0).toUpperCase()}</span>
                            </div>
                            <span className="ml-2 text-sm text-light/60">{category.icon_name}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-3">
                          {editingCategory?.id === category.id ? (
                            <>
                              <button
                                onClick={handleUpdateCategory}
                                className="text-green-500 hover:text-green-400 transition-colors"
                                title="Save"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setEditingCategory(null)}
                                className="text-light/60 hover:text-light/80 transition-colors"
                                title="Cancel"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => setEditingCategory(category)}
                                className="text-primary hover:text-primary/80 transition-colors"
                                title="Edit Category"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(category.id)}
                                className="text-red-500 hover:text-red-400 transition-colors"
                                title="Delete Category"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Add Category Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-dark-100 rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-light">Add New Category</h2>
                <button 
                  onClick={handleCloseModal}
                  className="text-light/60 hover:text-light"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-light/80 mb-1">Category Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Residential Solar"
                    className="w-full bg-dark-200 border border-dark-300 rounded-lg px-4 py-2 text-light"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-light/80 mb-1">Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {availableIcons.map(icon => (
                      <button
                        key={icon}
                        onClick={() => setNewCategory({...newCategory, icon_name: icon})}
                        className={`w-10 h-10 flex items-center justify-center rounded-full ${newCategory.icon_name === icon ? 'bg-primary text-dark' : 'bg-dark-200 text-light/70 hover:bg-dark-300'}`}
                      >
                        <span className="text-sm">{icon.charAt(0).toUpperCase()}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleCloseModal}
                    className="bg-dark-200 hover:bg-dark-300 text-light px-4 py-2 rounded-lg mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCategory}
                    className="bg-primary hover:bg-primary/90 text-dark px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Category
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ProductCategories;
