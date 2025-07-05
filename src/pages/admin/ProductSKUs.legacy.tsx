import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabaseClient';
import AdminLayout from '../../components/admin/AdminLayout';
import { motion } from 'framer-motion';
import { Edit, Trash2, Plus, Search, X, Package, Star, Tag, Settings, PlusCircle, Check, Layers } from 'lucide-react';
import { Card } from '../../components/Card';

interface ProductSKU {
  id: string;
  name: string;
  sku: string;
  category: string;
  category_id?: string; // New field for foreign key to product_categories
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
  default_variant_id?: string; // New field for default variant
  is_variant?: boolean; // Flag to indicate if this is a variant
  parent_product_id?: string; // Reference to parent product if this is a variant
  variant_count?: number; // Number of variants this product has
  product_categories?: any; // Categories data from the join
  product_variants?: any[]; // Variants data from the join
}

// We'll fetch categories dynamically from the database
interface ProductCategory {
  id: string;
  name: string;
  icon_name?: string;
  created_at?: string;
}

// Default categories in case fetch fails
const defaultCategories = [
  // Solar Systems
  { id: 'solar', name: 'Solar Panels' },
  { id: 'off_grid', name: 'Off-Grid Systems' },
  { id: 'hybrid', name: 'Hybrid Systems' },
  // Other Solar Products
  { id: 'residential', name: 'Residential' },
  { id: 'commercial', name: 'Commercial' },
  { id: 'industrial', name: 'Industrial' },
  { id: 'lighting', name: 'Solar Lights' },
  { id: 'batteries', name: 'Batteries' },
  { id: 'inverters', name: 'Inverters' },
  { id: 'accessories', name: 'Accessories' }
];

const panelTypes = [
  { id: 'monocrystalline', name: 'Monocrystalline' },
  { id: 'polycrystalline', name: 'Polycrystalline' },
  { id: 'evacuated_tube', name: 'Evacuated Tube' } // Added for water heaters
];

const ProductSKUs: React.FC = () => {
  const [products, setProducts] = useState<ProductSKU[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>(defaultCategories);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductSKU | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [variantFilter, setVariantFilter] = useState<string>('all'); // 'all', 'with-variants', 'without-variants'
  
  // Variant-related state
  const [variants, setVariants] = useState<ProductSKU[]>([]);
  const [isLoadingVariants, setIsLoadingVariants] = useState(false);
  const [activeTab, setActiveTab] = useState('product'); // 'product' or 'variants'
  
  // Active variant state for editing
  const [activeVariant, setActiveVariant] = useState<ProductSKU | null>(null);
  const [isEditingVariant, setIsEditingVariant] = useState(false);
  const [isAddingVariant, setIsAddingVariant] = useState(false);
  
  // Loading states for variant operations
  const [isVariantSaving, setIsVariantSaving] = useState(false);
  const [isVariantDeleting, setIsVariantDeleting] = useState(false);
  const [variantActionError, setVariantActionError] = useState<string | null>(null);
  
  // Function to reset all variant-related state
  const resetVariantStates = () => {
    setActiveVariant(null);
    setIsEditingVariant(false);
    setIsAddingVariant(false);
    setIsVariantSaving(false);
    setIsVariantDeleting(false);
    setVariantActionError(null);
    setActiveTab('product');
  };
  
  const [newProduct, setNewProduct] = useState<Omit<ProductSKU, 'id' | 'created_at'>>({ 
    name: '', 
    sku: '', 
    category: 'solar',
    category_id: 'solar',
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
    features: [],
    is_variant: false,
    parent_product_id: undefined,
    default_variant_id: undefined
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
    fetchCategories();
    fetchProducts();
  }, []);
  
  // Fetch categories from the database
  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setCategories(data);
      }
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      // Fall back to default categories if fetch fails
      setCategories(defaultCategories);
    }
  }
  
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
        .select(`
          *,
          product_categories(*),
          product_variants!product_variants_product_id_fkey(count)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the product data to include variant count
      const productsWithVariantCount = data?.map(product => {
        // Extract variant count from returned data
        const variantCount = product.product_variants?.[0]?.count || 0;
        
        return {
          ...product,
          variant_count: variantCount
        };
      }) || [];
      
      setProducts(productsWithVariantCount);
      setError(null);
      
      console.log('Products with variant count:', productsWithVariantCount);
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

  // Fetch variants for a product
  const fetchVariantsForProduct = async (productId: string) => {
    try {
      setIsLoadingVariants(true);
      const { data, error } = await supabase
        .from('product_skus')
        .select('*')
        .eq('parent_product_id', productId);
      
      if (error) throw error;
      
      setVariants(data || []);
    } catch (err: any) {
      console.error('Error fetching variants:', err.message);
      // We don't show an error alert for this to avoid disrupting the user experience
    } finally {
      setIsLoadingVariants(false);
    }
  };

  // Start editing a product
  const startEditProduct = (product: ProductSKU) => {
    setEditProduct(product);
    setActiveTab('product'); // Default to product info tab
    
    // Fetch variants for this product if it's not a variant itself
    if (!product.is_variant) {
      fetchVariantsForProduct(product.id);
    }
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
          if (editProduct && finalPrice !== editProduct.price) {
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
    // Reset variant-related state
    resetVariantStates();
    setNewProduct({ 
      name: '', 
      sku: '', 
      category: 'solar',
      category_id: 'solar',
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
      features: [],
      is_variant: false,
      parent_product_id: undefined,
      default_variant_id: undefined
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

  // Filtering logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((product) => categoryFilter === 'all' || product.category === categoryFilter)
      .filter((product) => {
        if (variantFilter === 'all') return true;
        if (variantFilter === 'with-variants') return (product.variant_count || 0) > 0;
        if (variantFilter === 'without-variants') return (product.variant_count || 0) === 0;
        return true;
      });
  }, [products, searchTerm, categoryFilter, variantFilter]);

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
        
        {/* Filter Controls */}
        <div className="flex flex-wrap gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-light/70 mb-1.5">Category</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${categoryFilter === 'all' ? 'bg-primary text-dark' : 'bg-dark-200 text-light/70 hover:bg-dark-300'}`}
              >
                All Categories
              </button>
              
              {categories.map((category: ProductCategory) => (
                <button
                  key={category.id}
                  onClick={() => setCategoryFilter(category.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${categoryFilter === category.id ? 'bg-primary text-dark' : 'bg-dark-200 text-light/70 hover:bg-dark-300'}`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Variant Filter */}
          <div>
            <label className="block text-sm font-medium text-light/70 mb-1.5">Variants</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setVariantFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${variantFilter === 'all' ? 'bg-primary text-dark' : 'bg-dark-200 text-light/70 hover:bg-dark-300'}`}
              >
                All Products
              </button>
              <button
                onClick={() => setVariantFilter('with-variants')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${variantFilter === 'with-variants' ? 'bg-primary text-dark' : 'bg-dark-200 text-light/70 hover:bg-dark-300'}`}
              >
                With Variants
              </button>
              <button
                onClick={() => setVariantFilter('without-variants')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${variantFilter === 'without-variants' ? 'bg-primary text-dark' : 'bg-dark-200 text-light/70 hover:bg-dark-300'}`}
              >
                No Variants
              </button>
            </div>
          </div>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-light/60 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-light/60 uppercase tracking-wider">Variants</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-light/60 uppercase tracking-wider">Variant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-light/60 uppercase tracking-wider">Default</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-light/60 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-dark-100 divide-y divide-dark-300">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className={(product.variant_count || 0) > 0 ? 'border-l-2 border-blue-500 bg-dark-100/70' : ''}>
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
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-light">{product.name}</span>
                            {(product.variant_count || 0) > 0 && (
                              <span className="ml-2 px-1.5 py-0.5 text-xs rounded bg-blue-500/20 text-blue-400">
                                {product.variant_count || 0} variant{(product.variant_count || 0) > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
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
                      {product.panel_type || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-light">
                      {(product.variant_count || 0) > 0 ? (
                        <div className="flex items-center">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-500/20 text-blue-400">
                            {product.variant_count}
                          </span>
                        </div>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-dark-300 text-light/70">
                          -
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-light">
                      {product.is_variant ? 
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-500/20 text-blue-400">
                          Variant
                        </span> : 
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-dark-300 text-light/70">
                          Main
                        </span>
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-light">
                      {product.default_variant_id ? 
                        (product.default_variant_id === product.id ? 
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-500/20 text-green-400">
                            Default
                          </span> : 
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-dark-300 text-light/70">
                            -
                          </span>
                        ) : 
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-dark-300 text-light/70">
                          -
                        </span>
                      }
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
            <div className="flex justify-between items-center mb-4">
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
            
            {/* Tabs - Only show for editing, not for new products */}
            {editProduct && (
              <div className="mb-6 border-b border-dark-300">
                <div className="flex space-x-6">
                  <button
                    className={`py-2 px-1 font-medium text-sm transition-colors relative ${
                      activeTab === 'product' 
                        ? 'text-primary' 
                        : 'text-light/60 hover:text-light/80'
                    }`}
                    onClick={() => setActiveTab('product')}
                  >
                    Product Info
                    {activeTab === 'product' && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></span>
                    )}
                  </button>
                  <button
                    className={`py-2 px-1 font-medium text-sm transition-colors relative ${
                      activeTab === 'variants' 
                        ? 'text-primary' 
                        : 'text-light/60 hover:text-light/80'
                    }`}
                    onClick={() => setActiveTab('variants')}
                  >
                    Variants
                    {(editProduct.variant_count || 0) > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-400">
                        {editProduct.variant_count || 0}
                      </span>
                    )}
                    {activeTab === 'variants' && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></span>
                    )}
                  </button>
                </div>
              </div>
            )}
                    {activeTab === 'product' && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></span>
                    )}
                  </button>
                  <button
                    className={`py-2 px-1 font-medium text-sm transition-colors relative ${
                      activeTab === 'variants' 
                        ? 'text-primary' 
                        : 'text-light/60 hover:text-light/80'
                    }`}
                    onClick={() => setActiveTab('variants')}
                  >
                    Variants
                    {(editProduct.variant_count || 0) > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-400">
                        {editProduct.variant_count || 0}
                      </span>
                    )}
                    {activeTab === 'variants' && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></span>
                    )}
                  </button>
                </div>
              </div>
            )}
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if (editProduct) {
                handleUpdateProduct();
              } else {
                handleAddProduct();
              }
            }}>
              {activeTab === 'variants' && editProduct ? (
                // Variants Tab Content - Phase 3 Implementation
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-light">Product Variants</h3>
                    <button
                      type="button"
                      className="px-3 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-lg hover:bg-primary/20 flex items-center gap-1.5"
                      onClick={() => setIsAddingVariant(true)}
                    >
                      <PlusCircle className="h-4 w-4" />
                      Add Variant
                    </button>
                  </div>

                  {isLoadingVariants ? (
                    <div className="py-8 flex justify-center">
                      <span className="loading loading-spinner loading-md text-primary"></span>
                    </div>
                  ) : variants.length > 0 ? (
                    <div className="bg-dark-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left">
                        <thead className="bg-dark-300">
                          <tr>
                            <th className="px-4 py-3 text-xs font-medium text-light/60">Name</th>
                            <th className="px-4 py-3 text-xs font-medium text-light/60">Capacity</th>
                            <th className="px-4 py-3 text-xs font-medium text-light/60">Price</th>
                            <th className="px-4 py-3 text-xs font-medium text-light/60">Default</th>
                            <th className="px-4 py-3 text-xs font-medium text-light/60">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-300">
                          {variants.map((variant) => (
                            <tr key={variant.id} className="hover:bg-dark-300/50">
                              <td className="px-4 py-3 text-sm text-light/80">{variant.name}</td>
                              <td className="px-4 py-3 text-sm text-light/80">{variant.capacity_kw} kW</td>
                              <td className="px-4 py-3 text-sm text-light/80">₹{variant.price.toLocaleString()}</td>
                              <td className="px-4 py-3 text-sm">
                                {editProduct.default_variant_id === variant.id ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                                    <Check className="h-3 w-3 mr-1" />
                                    Default
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    className="text-xs text-light/40 hover:text-light/70"
                                    onClick={() => {
                                      // Will be implemented in Phase 4
                                      console.log('Set as default:', variant.id);
                                    }}
                                  >
                                    Set as Default
                                  </button>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center space-x-3">
                                  <button
                                    type="button"
                                    className="text-blue-400 hover:text-blue-300"
                                    onClick={() => {
                                      // Will be implemented in Phase 4
                                      setActiveVariant(variant);
                                      setIsEditingVariant(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    className="text-red-400 hover:text-red-300"
                                    onClick={() => {
                                      // Will be implemented in Phase 4
                                      console.log('Delete variant:', variant.id);
                                    }}
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
                  ) : (
                    <div className="text-center py-8 bg-dark-200 rounded-lg">
                      <Layers className="h-12 w-12 mx-auto text-light/30 mb-3" />
                      <h3 className="text-light/50 font-medium mb-1">No Variants Found</h3>
                      <p className="text-light/30 text-sm mb-4">This product doesn't have any variants yet.</p>
                      <button
                        type="button"
                        className="px-4 py-2 bg-primary/10 text-primary text-sm font-medium rounded-lg hover:bg-primary/20 inline-flex items-center gap-1.5"
                        onClick={() => setIsAddingVariant(true)}
                      >
                        <PlusCircle className="h-4 w-4" />
                        Add First Variant
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // Product Info Tab
                <>
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
                
                <div className="flex flex-col">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-light mb-1">Category</label>
                    <select
                      className="w-full bg-dark-200 text-light border border-dark-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                      value={editProduct ? editProduct.category_id || editProduct.category : newProduct.category_id || newProduct.category}
                      onChange={(e) => {
                        if (editProduct) {
                          setEditProduct({
                            ...editProduct, 
                            category_id: e.target.value,
                            category: e.target.value // For backward compatibility
                          });
                        } else {
                          setNewProduct({
                            ...newProduct, 
                            category_id: e.target.value,
                            category: e.target.value // For backward compatibility
                          });
                        }
                      }}
                    >
                      {categories.map((category: ProductCategory) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
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
              
              {/* Variant fields */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-light mb-1">Product Type</label>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="text-primary focus:ring-primary bg-dark-200 border-dark-300"
                        checked={!editProduct ? !newProduct.is_variant : !editProduct.is_variant}
                        onChange={() => {
                          if (editProduct) {
                            setEditProduct({...editProduct, is_variant: false, parent_product_id: undefined});
                          } else {
                            setNewProduct({...newProduct, is_variant: false, parent_product_id: undefined});
                          }
                        }}
                      />
                      <span className="ml-2 text-light">Main Product</span>
                    </label>
                    
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="text-primary focus:ring-primary bg-dark-200 border-dark-300"
                        checked={!editProduct ? newProduct.is_variant : editProduct.is_variant}
                        onChange={() => {
                          if (editProduct) {
                            setEditProduct({...editProduct, is_variant: true});
                          } else {
                            setNewProduct({...newProduct, is_variant: true});
                          }
                        }}
                      />
                      <span className="ml-2 text-light">Variant</span>
                    </label>
                  </div>
                </div>
                
                {/* Parent product select (only shown for variants) */}
                {((!editProduct && newProduct.is_variant) || (editProduct && editProduct.is_variant)) && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-light mb-1">Parent Product</label>
                    <select
                      className="w-full bg-dark-200 text-light border border-dark-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                      value={editProduct ? editProduct.parent_product_id : newProduct.parent_product_id}
                      onChange={(e) => {
                        if (editProduct) {
                          setEditProduct({...editProduct, parent_product_id: e.target.value});
                        } else {
                          setNewProduct({...newProduct, parent_product_id: e.target.value});
                        }
                      }}
                    >
                      <option value="">-- Select Parent Product --</option>
                      {products.filter(p => !p.is_variant).map(product => (
                        <option key={product.id} value={product.id}>{product.name} ({product.sku})</option>
};

export default ProductSKUs;
