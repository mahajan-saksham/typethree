import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import AdminLayout from '../../components/admin/AdminLayout';
import { motion } from 'framer-motion';
import { Edit, Trash2, Plus, Search, X, Package } from 'lucide-react';
import { Card } from '../../components/Card';

interface ProductSKU {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  capacity_kw?: number;
  description: string;
  specifications: Record<string, any>;
  inventory_count: number;
  created_at: string;
  generation?: string;
  area_required?: number;
  monthly_savings?: number;
  subsidy_amount?: number;
  original_price?: number;
  panel_type?: string;
  installation_time?: string;
  image_url?: string;
  features?: string[] | Record<string, any>;
}

const categories = [
  // Solar Systems
  { id: 'on-grid', name: 'On-Grid Solar Systems' },
  { id: 'off-grid', name: 'Off-Grid Solar Systems' },
  { id: 'hybrid', name: 'Hybrid Solar Systems' },
  // Other Solar Products
  { id: 'fencing', name: 'Solar Fencing Systems' },
  { id: 'lighting', name: 'Solar Street Lights' },
  { id: 'water_heating', name: 'Solar Water Heaters' },
  { id: 'water_pumping', name: 'Solar Water Pumps' },
  { id: 'rock_lighting', name: 'Solar Rock Lights' }
];

const panelTypes = [
  { id: 'monocrystalline', name: 'Monocrystalline' },
  { id: 'polycrystalline', name: 'Polycrystalline' },
  { id: 'evacuated_tube', name: 'Evacuated Tube' } // Added for water heaters
];

const ProductSKUs: React.FC = () => {
  const [products, setProducts] = useState<ProductSKU[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductSKU | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  const [newProduct, setNewProduct] = useState<Omit<ProductSKU, 'id' | 'created_at'>>({ 
    name: '', 
    sku: '', 
    category: 'on-grid',
    price: 0,
    capacity_kw: 0,
    description: '',
    specifications: {},
    inventory_count: 0,
    generation: '',
    area_required: 0,
    monthly_savings: 0,
    subsidy_amount: 0,
    original_price: 0,
    panel_type: 'monocrystalline',
    installation_time: '',
    image_url: '',
    features: []
  });

  // Field for handling JSON input
  const [specsInput, setSpecsInput] = useState('{}');
  const [featuresInput, setFeaturesInput] = useState('[]');

  useEffect(() => {
    try {
      setNewProduct((prev) => ({ ...prev, specifications: JSON.parse(specsInput) }));
    } catch (err) {
      console.error('Invalid JSON format for specifications');
    }
  }, [specsInput]);

  useEffect(() => {
    try {
      // Parse features and ensure it's always an array
      const parsedFeatures = JSON.parse(featuresInput);
      // If it's not an array, convert it to an array or use empty array
      const featuresArray = Array.isArray(parsedFeatures) ? parsedFeatures : 
                            (typeof parsedFeatures === 'object' && parsedFeatures !== null) ? 
                            Object.values(parsedFeatures) : [];
      setNewProduct((prev) => ({ ...prev, features: featuresArray }));
    } catch (err) {
      console.error('Invalid JSON format for features');
    }
  }, [featuresInput]);

  useEffect(() => {
    fetchProducts();
  }, []);
  
  // Function to refresh Supabase schema cache
  async function refreshSchemaCache() {
    try {
      console.log('Attempting to refresh schema cache...');
      // This is a workaround for schema cache issues
      // We make a small query to force Supabase to refresh its schema cache
      await supabase
        .from('product_skus')
        .select('id')
        .limit(1);
      console.log('Schema cache refresh attempt completed');
    } catch (err) {
      console.error('Error refreshing schema cache:', err);
    }
  }
  
  async function fetchProducts() {
    try {
      setLoading(true);
      
      // Try to refresh the schema cache first
      await refreshSchemaCache();
      
      // Query the products
      const { data, error } = await supabase
        .from('product_skus')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setProducts(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Error fetching products');
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (product: ProductSKU) => {
    // Ensure features is always an array before setting to state
    let featuresArray = [];
    if (product.features) {
      if (Array.isArray(product.features)) {
        featuresArray = product.features;
      } else if (typeof product.features === 'object' && product.features !== null) {
        featuresArray = Object.values(product.features);
      }
    }
    
    // Clone the product and ensure features is an array
    const productWithArrayFeatures = {
      ...product,
      features: featuresArray
    };
    
    setEditProduct(productWithArrayFeatures);
    setSpecsInput(JSON.stringify(product.specifications || {}, null, 2));
    setFeaturesInput(JSON.stringify(featuresArray, null, 2));
    setShowAddModal(true);
  };

  // Start editing a product
  const startEditProduct = (product: ProductSKU) => {
    handleEdit(product);
  };

  // Function to handle numeric input changes safely
  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>, field: string, setter: Function) => {
    // If empty string, use 0 as default
    const rawValue = e.target.value;
    let value: number | string = rawValue; // Start with raw input
    
    if (rawValue === '') {
      // Allow empty field in UI but use 0 internally
      value = 0;
    } else {
      const parsed = parseFloat(rawValue);
      // Only update if it's a valid number
      if (!isNaN(parsed)) {
        value = parsed;
      } else {
        // If not a valid number, don't update
        return;
      }
    }
    
    // Special logic for subsidy and original price - update related fields
    if (field === 'subsidy_amount' || field === 'original_price') {
      const product = setter === setEditProduct ? editProduct : newProduct;
      // Ensure product exists before updating
      if (product) {
        if (field === 'subsidy_amount' && product.original_price) {
          // If subsidy is updated and we have original price, update final price
          const finalPrice = Math.max(0, product.original_price - (value as number));
          // Only update if the calculated price differs from current price
          if (calculatedPrice !== editProduct.price) {
            setter((prev: any) => ({ ...prev, [field]: value, price: finalPrice }));
            return;
          }
        } else if (field === 'original_price' && product.subsidy_amount) {
          // If original price is updated and we have subsidy, update final price
          const finalPrice = Math.max(0, (value as number) - product.subsidy_amount);
          setter((prev: any) => ({ ...prev, [field]: value, price: finalPrice }));
          return;
        }
      }
    }
    
    setter((prev: any) => ({ ...prev, [field]: value }));
  };
  
  // Reset form when modal closes
  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditProduct(null);
    setSpecsInput('{}');
    setFeaturesInput('[]');
    setNewProduct({ 
      name: '', 
      sku: '', 
      category: 'on-grid',
      price: 0,
      capacity_kw: 0,
      description: '',
      specifications: {},
      inventory_count: 0,
      generation: '',
      area_required: 0,
      monthly_savings: 0,
      subsidy_amount: 0,
      original_price: 0,
      panel_type: 'monocrystalline',
      installation_time: '',
      image_url: '',
      features: []
    });
  };

  async function handleAddProduct() {
    try {
      // Validate form
      const validationErrors = validateForm(newProduct);
      if (validationErrors.length > 0) {
        alert(`Please fix the following errors:\n${validationErrors.join('\n')}`);
        return;
      }
      
      // Validate JSON format
      let specifications;
      let features;
      
      try {
        specifications = JSON.parse(specsInput);
      } catch (err) {
        alert('Invalid JSON format for specifications. Please check your input.');
        return;
      }
      
      try {
        features = JSON.parse(featuresInput);
      } catch (err) {
        alert('Invalid JSON format for features. Please check your input.');
        return;
      }
      
      setAddLoading(true);
      
      const productToAdd = {
        ...newProduct,
        specifications,
        features
      };
      
      const { data, error } = await supabase
        .from('product_skus')
        .insert([productToAdd])
        .select();
      
      if (error) throw error;
      
      // Add the new product to the list
      if (data) {
        setProducts([data[0], ...products]);
      }
      
      // Reset form
      handleCloseModal();
      alert('Product added successfully!');
    } catch (err: any) {
      alert(`Error adding product: ${err.message}`);
    } finally {
      setAddLoading(false);
    }
  }

  async function handleUpdateProduct() {
    if (!editProduct) return;
    
    try {
      // Apply the price calculation if both subsidy and original price are present
      if (editProduct.subsidy_amount && editProduct.original_price) {
        const calculatedPrice = Math.max(0, editProduct.original_price - editProduct.subsidy_amount);
        // Only update if the calculated price differs from current price
        if (calculatedPrice !== editProduct.price) {
          setEditProduct({...editProduct, price: calculatedPrice});
        }
      }
      
      // Validate form
      const validationErrors = validateForm(editProduct);
      if (validationErrors.length > 0) {
        alert(`Please fix the following errors:\n${validationErrors.join('\n')}`);
        return;
      }
      
      // Validate JSON format
      let specifications;
      let features;
      
      try {
        specifications = JSON.parse(specsInput);
      } catch (err) {
        alert('Invalid JSON format for specifications. Please check your input.');
        return;
      }
      
      try {
        features = JSON.parse(featuresInput);
      } catch (err) {
        alert('Invalid JSON format for features. Please check your input.');
        return;
      }
      
      setAddLoading(true);
      
      const productToUpdate = {
        ...editProduct,
        specifications,
        features
      };
      
      const { error } = await supabase
        .from('product_skus')
        .update(productToUpdate)
        .eq('id', editProduct.id);
      
      if (error) throw error;
      
      // Update the product in the list
      setProducts(products.map(p => p.id === editProduct.id ? productToUpdate : p));
      
      // Reset form
      handleCloseModal();
      alert('Product updated successfully!');
    } catch (err: any) {
      alert(`Error updating product: ${err.message}`);
    } finally {
      setAddLoading(false);
    }
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('product_skus')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Remove the product from the list
      setProducts(products.filter(p => p.id !== id));
      alert('Product deleted successfully!');
    } catch (err: any) {
      alert(`Error deleting product: ${err.message}`);
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = (
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Validate form before submission
  const validateForm = (product: Omit<ProductSKU, 'id' | 'created_at'>) => {
    const errors = [];
    
    if (!product.name.trim()) errors.push('Product name is required');
    if (!product.sku.trim()) errors.push('SKU is required');
    if (!product.description.trim()) errors.push('Description is required');
    if (product.price <= 0) errors.push('Price must be greater than 0');
    
    return errors;
  };

  return (
    <AdminLayout title="Product SKU Management">
      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-light">Product SKUs</h1>
            <p className="text-light/60">Manage all product SKUs for rooftop solar installations</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-light/40" />
              <input
                type="text"
                placeholder="Search products..."
                className="bg-dark-200 text-light border border-dark-300 rounded-lg pl-10 pr-4 py-2 w-64 focus:outline-none focus:ring-1 focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-light/40 hover:text-light/70" />
                </button>
              )}
            </div>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-primary hover:bg-primary/90 text-dark font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add SKU</span>
            </button>
          </div>
        </div>
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${categoryFilter === 'all' ? 'bg-primary text-dark' : 'bg-dark-200 text-light/70 hover:bg-dark-300'}`}
          >
            All Categories
          </button>
          
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setCategoryFilter(category.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${categoryFilter === category.id ? 'bg-primary text-dark' : 'bg-dark-200 text-light/70 hover:bg-dark-300'}`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Loading, Error, or Data */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <Card className="p-6 bg-dark-100 border border-red-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <X className="h-6 w-6 text-red-500 mt-0.5" />
              <div>
                <h3 className="text-lg font-bold text-light">Error</h3>
                <p className="text-light/70 mt-1">{error}</p>
              </div>
            </div>
          </Card>
        ) : filteredProducts.length === 0 ? (
          <Card className="p-8 bg-dark-100 border border-white/10 rounded-xl">
            <div className="text-center">
              <Package className="h-12 w-12 text-light/20 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-light mb-2">
                {searchTerm || categoryFilter !== 'all' ? 'No matching products found' : 'No products added yet'}
              </h3>
              <p className="text-light/60 mb-6">
                {searchTerm || categoryFilter !== 'all' ? 
                  'Try adjusting your search or filters to find what you\'re looking for.' : 
                  'Start adding product SKUs to build your inventory.'}
              </p>
              {(!searchTerm && categoryFilter === 'all') && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-primary hover:bg-primary/90 text-dark font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors mx-auto"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add First Product</span>
                </button>
              )}
            </div>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-dark-300">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-light/60 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-light/60 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-light/60 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-light/60 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-light/60 uppercase tracking-wider">Capacity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-light/60 uppercase tracking-wider">Generation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-light/60 uppercase tracking-wider">Area</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-light/60 uppercase tracking-wider">Panel Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-light/60 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-dark-100 divide-y divide-dark-300">
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {product.image_url ? (
                          <img 
                            src={product.image_url}
                            alt={product.name}
                            className="h-10 w-10 rounded-md mr-3 object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-dark-300 mr-3 flex items-center justify-center">
                            <Package className="h-5 w-5 text-light/50" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-light">{product.name}</div>
                          <div className="text-xs text-light/60 mt-1 line-clamp-1">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-light">{product.sku}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-light">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary/30 text-primary">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-light">
                      <div className="flex flex-col">
                        <span className="font-medium">₹{product.price.toLocaleString()}</span>
                        {product.original_price && product.original_price > product.price && (
                          <span className="text-xs text-light/60 line-through">₹{product.original_price.toLocaleString()}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-light">
                      {product.capacity_kw ? `${product.capacity_kw} kW` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-light">
                      {product.generation || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-light">
                      {product.area_required ? `${product.area_required} m²` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-light">
                      {product.panel_type || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2 justify-end">
                        <button
                          onClick={() => startEditProduct(product)}
                          className="text-primary hover:text-primary/80 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Add/Edit Product Modal */}
      {(showAddModal || editProduct) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-100 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-light">
                {editProduct ? 'Edit Product SKU' : 'Add New Product SKU'}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="text-light/60 hover:text-light"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-light/80 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Premium Solar Panel"
                    className="w-full bg-dark-200 border border-dark-300 rounded-lg px-4 py-2 text-light"
                    value={editProduct ? editProduct.name : newProduct.name}
                    onChange={(e) => editProduct ? 
                      setEditProduct({...editProduct, name: e.target.value}) : 
                      setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-light/80 mb-1">SKU Code</label>
                  <input
                    type="text"
                    required
                    placeholder="SP-MONO-400W"
                    className="w-full bg-dark-200 border border-dark-300 rounded-lg px-4 py-2 text-light"
                    value={editProduct ? editProduct.sku : newProduct.sku}
                    onChange={(e) => editProduct ? 
                      setEditProduct({...editProduct, sku: e.target.value}) : 
                      setNewProduct({...newProduct, sku: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-light/80 mb-1">Category</label>
                  <select
                    className="w-full bg-dark-200 border border-dark-300 rounded-lg px-4 py-2 text-light"
                    value={editProduct ? editProduct.category : newProduct.category}
                    onChange={(e) => editProduct ? 
                      setEditProduct({...editProduct, category: e.target.value}) : 
                      setNewProduct({...newProduct, category: e.target.value})}
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-light/80 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="15000"
                    className="w-full bg-dark-200 border border-dark-300 rounded-lg px-4 py-2 text-light"
                    value={editProduct ? editProduct.price : newProduct.price}
                    onChange={(e) => handleNumericChange(e, 'price', editProduct ? setEditProduct : setNewProduct)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-light/80 mb-1">Capacity (kW)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.4"
                    className="w-full bg-dark-200 border border-dark-300 rounded-lg px-4 py-2 text-light"
                    value={editProduct ? editProduct.capacity_kw || '' : newProduct.capacity_kw || ''}
                    onChange={(e) => handleNumericChange(e, 'capacity_kw', editProduct ? setEditProduct : setNewProduct)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-light/80 mb-1">Inventory Count</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    placeholder="25"
                    className="w-full bg-dark-200 border border-dark-300 rounded-lg px-4 py-2 text-light"
                    value={editProduct ? editProduct.inventory_count : newProduct.inventory_count}
                    onChange={(e) => handleNumericChange(e, 'inventory_count', editProduct ? setEditProduct : setNewProduct)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-light/80 mb-1">Generation</label>
                  <input
                    type="text"
                    placeholder="1st Generation"
                    className="w-full bg-dark-200 border border-dark-300 rounded-lg px-4 py-2 text-light"
                    value={editProduct ? editProduct.generation || '' : newProduct.generation || ''}
                    onChange={(e) => editProduct ? 
                      setEditProduct({...editProduct, generation: e.target.value}) : 
                      setNewProduct({...newProduct, generation: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-light/80 mb-1">Area Required (m²)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="10.5"
                    className="w-full bg-dark-200 border border-dark-300 rounded-lg px-4 py-2 text-light"
                    value={editProduct ? editProduct.area_required || '' : newProduct.area_required || ''}
                    onChange={(e) => handleNumericChange(e, 'area_required', editProduct ? setEditProduct : setNewProduct)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-light/80 mb-1">Monthly Savings (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="1200"
                    className="w-full bg-dark-200 border border-dark-300 rounded-lg px-4 py-2 text-light"
                    value={editProduct ? editProduct.monthly_savings || '' : newProduct.monthly_savings || ''}
                    onChange={(e) => handleNumericChange(e, 'monthly_savings', editProduct ? setEditProduct : setNewProduct)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-light/80 mb-1">Subsidy Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="5000"
                    className="w-full bg-dark-200 border border-dark-300 rounded-lg px-4 py-2 text-light"
                    value={editProduct ? editProduct.subsidy_amount || '' : newProduct.subsidy_amount || ''}
                    onChange={(e) => handleNumericChange(e, 'subsidy_amount', editProduct ? setEditProduct : setNewProduct)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-light/80 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="20000"
                    className="w-full bg-dark-200 border border-dark-300 rounded-lg px-4 py-2 text-light"
                    value={editProduct ? editProduct.original_price || '' : newProduct.original_price || ''}
                    onChange={(e) => handleNumericChange(e, 'original_price', editProduct ? setEditProduct : setNewProduct)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-light/80 mb-1">Panel Type</label>
                  <select
                    className="w-full bg-dark-200 border border-dark-300 rounded-lg px-4 py-2 text-light"
                    value={editProduct ? editProduct.panel_type || '' : newProduct.panel_type || ''}
                    onChange={(e) => editProduct ? 
                      setEditProduct({...editProduct, panel_type: e.target.value}) : 
                      setNewProduct({...newProduct, panel_type: e.target.value})}
                  >
                    {panelTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-light/80 mb-1">Installation Time</label>
                  <input
                    type="text"
                    placeholder="2-3 days"
                    className="w-full bg-dark-200 border border-dark-300 rounded-lg px-4 py-2 text-light"
                    value={editProduct ? editProduct.installation_time || '' : newProduct.installation_time || ''}
                    onChange={(e) => editProduct ? 
                      setEditProduct({...editProduct, installation_time: e.target.value}) : 
                      setNewProduct({...newProduct, installation_time: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-light/80 mb-1">Image URL</label>
                  <input
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    className="w-full bg-dark-200 border border-dark-300 rounded-lg px-4 py-2 text-light"
                    value={editProduct ? editProduct.image_url || '' : newProduct.image_url || ''}
                    onChange={(e) => editProduct ? 
                      setEditProduct({...editProduct, image_url: e.target.value}) : 
                      setNewProduct({...newProduct, image_url: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-light/80 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="High-efficiency monocrystalline solar panel with industry-leading 22% efficiency..."
                  className="w-full bg-dark-200 border border-dark-300 rounded-lg px-4 py-2 text-light"
                  value={editProduct ? editProduct.description : newProduct.description}
                  onChange={(e) => editProduct ? 
                    setEditProduct({...editProduct, description: e.target.value}) : 
                    setNewProduct({...newProduct, description: e.target.value})}
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-light/80 mb-1">
                  Specifications (JSON format)
                </label>
                <textarea
                  rows={6}
                  placeholder='{"power": "400W", "type": "Monocrystalline", "efficiency": "22%", "dimensions": "1700 x 1000 x 35mm", "weight": "19.5kg"}'
                  className="w-full bg-dark-200 border border-dark-300 rounded-lg px-4 py-2 text-light font-mono text-sm"
                  value={specsInput}
                  onChange={(e) => setSpecsInput(e.target.value)}
                />
                <p className="text-xs text-light/60 mt-1">
                  Enter the specifications as a JSON object. These are specific to each product type.
                </p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-light/80 mb-1">Features</label>
                <textarea
                  rows={6}
                  placeholder='["High efficiency", "Durable", "Waterproof"]'
                  className="w-full bg-dark-200 border border-dark-300 rounded-lg px-4 py-2 text-light font-mono text-sm"
                  value={featuresInput}
                  onChange={(e) => setFeaturesInput(e.target.value)}
                />
                <p className="text-xs text-light/60 mt-1">
                  Enter the features as a JSON array. These are specific to each product type.
                </p>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-white/10 rounded-lg text-light hover:bg-dark-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button" 
                  onClick={editProduct ? handleUpdateProduct : handleAddProduct}
                  disabled={addLoading}
                  className="bg-primary hover:bg-primary/90 text-dark font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-dark border-t-transparent rounded-full animate-spin"></div>
                      <span>{editProduct ? 'Updating...' : 'Adding...'}</span>
                    </>
                  ) : (
                    <span>{editProduct ? 'Update' : 'Save'} Product</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ProductSKUs;
