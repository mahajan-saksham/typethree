import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import AdminLayout from '../../components/admin/AdminLayout';
import { motion } from 'framer-motion';
import { 
  Edit, 
  Trash2, 
  Plus, 
  ArrowLeft, 
  Save, 
  X, 
  Star, 
  Zap,
  Battery,
  Tag,
  IndianRupee,
  Ruler,
  Clock,
  Calculator,
  FileText
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductVariant } from '../../types/productTypes';
import { PRICE_PER_KW } from '../../types/productTypes';
import { upsertProductVariant, setDefaultVariant, deleteVariant } from '../../utils/productUtils';
import { uploadImage, removeImage } from '../../utils/imageUtils';

interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  category: string;
  panel_type: string;
  image_url?: string;
}

interface VariantFormData {
  id?: string;
  product_id: string;
  variant_name?: string;
  variant_sku?: string;
  capacity_kw: number;
  price: number;
  subsidy_percentage: number;
  area_required: number;
  monthly_savings: number;
  installation_days: string;
  is_default: boolean;
  image_url?: string;
  description?: string;
  specifications?: Record<string, any>;
  features?: string[];
  payback_period?: string;
  generation?: string;
  panel_type?: string;
}

const ProductVariants: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<VariantFormData>({
    product_id: productId || '',
    variant_name: '',
    variant_sku: '',
    capacity_kw: 1,
    price: PRICE_PER_KW, // Default price based on capacity
    subsidy_percentage: 35,
    area_required: 100,
    monthly_savings: 1250,
    installation_days: '4-5',
    is_default: false,
    image_url: '',
    description: '',
    specifications: {},
    features: [],
    payback_period: '',
    generation: '',
    panel_type: ''
  });
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    if (productId) {
      fetchProduct();
      fetchVariants();
    }
  }, [productId]);
  
  // Update product_id when product changes
  useEffect(() => {
    if (product?.id) {
      setFormData(prev => ({...prev, product_id: product.id}));
    }
  }, [product]);
  
  // Auto-calculate price, area, and savings based on capacity
  useEffect(() => {
    if (!isEditing) { // Only auto-calculate for new variants
      setFormData(prev => ({
        ...prev,
        price: PRICE_PER_KW * prev.capacity_kw,
        area_required: 100 * prev.capacity_kw,
        monthly_savings: 1250 * prev.capacity_kw
      }));
    }
  }, [formData.capacity_kw, isEditing]);
  
  async function fetchProduct() {
    try {
      console.log('Fetching product with ID:', productId);
      
      // Try first with 'product_skus' table since that's where our data is
      let { data, error } = await supabase
        .from('product_skus')
        .select('*')
        .eq('id', productId)
        .single();
      
      // If no product found in product_skus table, try the new products table
      if (error || !data) {
        console.log('Product not found in product_skus, trying products table');
        const { data: newData, error: newError } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();
          
        if (newError) {
          console.error('Error fetching from products table:', newError);
          setError('Product not found');
          return;
        }
        
        data = newData;
      }
      
      console.log('Product found:', data);
      setProduct(data);
    } catch (err: any) {
      console.error('Error fetching product:', err);
      setError(err.message || 'Error fetching product');
    }
  }
  
  async function fetchVariants() {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .order('capacity_kw', { ascending: true });
      
      if (error) {
        // If we can't fetch variants (table may not exist yet), show empty state
        console.warn('Error fetching variants, using empty array:', error);
        setVariants([]);
      } else {
        setVariants(data || []);
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Error fetching variants:', err);
      setError(err.message || 'Error fetching variants');
      setVariants([]);
    } finally {
      setLoading(false);
    }
  }
  
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const target = e.target;
    const name = target.name;
    const value = target.value;
    
    // Handle checkboxes (only for HTMLInputElement)
    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
      setFormData({ ...formData, [name]: target.checked });
      return;
    }
    
    // Handle number inputs (only for HTMLInputElement)
    if (target instanceof HTMLInputElement && target.type === 'number') {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
      return;
    }
    
    // Handle all other inputs, selects, and textareas
    setFormData({ ...formData, [name]: value });
  }
  
  function resetForm() {
    setFormData({
      product_id: productId || '',
      variant_name: '',
      variant_sku: '',
      capacity_kw: 1,
      price: PRICE_PER_KW,
      subsidy_percentage: 35,
      area_required: 100,
      monthly_savings: 1250,
      installation_days: '4-5',
      is_default: false,
      image_url: '',
      description: '',
      specifications: {},
      features: [],
      payback_period: '',
      generation: '',
      panel_type: ''
    });
    setIsEditing(false);
    setSelectedImage(null);
    setImagePreview(null);
  }
  
  function handleEditVariant(variant: ProductVariant) {
    console.log('Editing variant with data:', variant);
    
    // Ensure all required properties exist with fallbacks
    const editData: VariantFormData = {
      id: variant.id,
      product_id: variant.product_id,
      variant_name: variant.variant_name || '',
      variant_sku: variant.variant_sku || '',
      capacity_kw: parseFloat(variant.capacity_kw?.toString() || '1'),
      price: parseFloat(variant.price?.toString() || PRICE_PER_KW.toString()),
      subsidy_percentage: parseFloat(variant.subsidy_percentage?.toString() || '35'),
      area_required: parseFloat(variant.area_required?.toString() || '100'),
      monthly_savings: parseFloat(variant.monthly_savings?.toString() || '1250'),
      installation_days: variant.installation_days || '4-5',
      is_default: variant.is_default || false,
      image_url: variant.image_url || '',
      description: variant.description || '',
      specifications: variant.specifications || {},
      features: Array.isArray(variant.features) ? variant.features : [],
      payback_period: variant.payback_period || '',
      generation: variant.generation || '',
      panel_type: variant.panel_type || ''
    };
    
    console.log('Setting form data to:', editData);
    
    // Set the form data with appropriate defaults
    setFormData(editData);
    
    // Set the image preview if there's an existing image
    if (variant.image_url) {
      console.log('Setting image preview to:', variant.image_url);
      setImagePreview(variant.image_url);
    } else {
      setImagePreview(null);
    }
    
    setIsEditing(true);
    setShowAddModal(true);
    
    // Force a re-render after a short delay to ensure values are populated
    setTimeout(() => {
      console.log('Current form data after timeout:', formData);
    }, 100);
  }
  
  // Handle image selection
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedImage(file);
      
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  }
  
  // Remove selected image
  function handleRemoveImage() {
    setSelectedImage(null);
    
    // If we're in edit mode and there's an existing image_url, we'll handle actual deletion during save
    if (!isEditing || !formData.image_url) {
      setImagePreview(null);
    }
    
    // Mark for deletion by setting to empty string (will be processed during save)
    setFormData(prev => ({ ...prev, image_url: '' }));
  }
  
  async function handleSaveVariant() {
    try {
      console.log('Saving variant with data:', formData);
      setIsSaving(true);
      
      // Basic validation
      if (formData.capacity_kw <= 0) {
        alert('Capacity must be greater than 0');
        setIsSaving(false);
        return;
      }
      
      // Create a copy of formData to modify
      const updatedFormData = { ...formData };
      
      // Handle image upload if there's a new image
      if (selectedImage) {
        console.log('Uploading new image...');
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `variant-images/${fileName}`;
        
        setUploadProgress(true);
        
        // If we're editing and there's an existing image, try to remove it
        if (isEditing && formData.image_url && formData.image_url.includes('supabase')) {
          try {
            console.log('Removing old image before uploading new one');
            await removeImage(formData.image_url);
          } catch (err) {
            console.error('Error removing old image:', err);
          }
        }
        
        // Upload the new image
        const { error: uploadError, data } = await supabase.storage
          .from('productphotos')
          .upload(filePath, selectedImage);
        
        if (uploadError) {
          console.error('Image upload error:', uploadError);
          throw new Error(`Error uploading image: ${uploadError.message}`);
        }
        
        // Get the public URL
        const { data: urlData } = supabase.storage.from('productphotos').getPublicUrl(filePath);
        updatedFormData.image_url = urlData.publicUrl;
        console.log('Image uploaded successfully, URL:', updatedFormData.image_url);
        setUploadProgress(false);
      }
      
      console.log('Final variant data to save:', updatedFormData);
      
      // Save the variant with updated data
      const result = await upsertProductVariant(updatedFormData);
      
      if (result) {
        // If this is marked as default, update UI immediately
        if (updatedFormData.is_default) {
          setVariants(prev => 
            prev.map(v => ({ ...v, is_default: v.id === result.id }))
          );
        }
        
        // If this is a new variant, add it to the list
        if (!isEditing) {
          setVariants(prev => [...prev, result]);
        } else {
          // Update the existing variant in the list
          setVariants(prev => 
            prev.map(v => v.id === result.id ? result : v)
          );
        }
        
        // Close the modal and reset the form
        setShowAddModal(false);
        resetForm();
      } else {
        alert('Error saving variant');
      }
    } catch (err: any) {
      console.error('Error saving variant:', err);
      alert(`Error saving variant: ${err.message}`);
    } finally {
      setIsSaving(false);
      setUploadProgress(false);
    }
  }
  
  async function handleSetDefault(variantId: string) {
    try {
      const success = await setDefaultVariant(productId || '', variantId);
      
      if (success) {
        // Update the local state to reflect the change
        setVariants(prev => 
          prev.map(v => ({ ...v, is_default: v.id === variantId }))
        );
      } else {
        alert('Error setting default variant');
      }
    } catch (err: any) {
      console.error('Error setting default variant:', err);
      alert(`Error setting default variant: ${err.message}`);
    }
  }
  
  async function handleDeleteVariant(variantId: string) {
    if (!confirm('Are you sure you want to delete this variant? This action cannot be undone.')) {
      return;
    }
    
    try {
      const success = await deleteVariant(variantId);
      
      if (success) {
        // Remove the variant from the local state
        setVariants(prev => prev.filter(v => v.id !== variantId));
      } else {
        alert('Error deleting variant. This might be the only variant for this product.');
      }
    } catch (err: any) {
      console.error('Error deleting variant:', err);
      alert(`Error deleting variant: ${err.message}`);
    }
  }
  
  // Calculate price after subsidy for display
  function calculatePriceAfterSubsidy(price: number, subsidyPercentage: number): number {
    return price * (1 - subsidyPercentage / 100);
  }
  
  // Calculate ROI for each variant
  function calculateROI(price: number, subsidyPercentage: number, monthlySavings: number): number {
    const netPrice = price * (1 - subsidyPercentage / 100);
    const yearlyReturn = monthlySavings * 12;
    // Return years needed for payback, rounded to 1 decimal
    return Math.round((netPrice / yearlyReturn) * 10) / 10;
  }
  
  return (
    <AdminLayout title="Product Variants">
      <div className="container mx-auto py-6 px-4">
        {/* Back navigation */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/admin/products')}
            className="inline-flex items-center text-light/70 hover:text-light transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </button>
        </div>
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {product ? `Manage Variants: ${product.name}` : 'Product Variants'}
            </h1>
            <p className="text-light/60">
              {product?.description || 'Create and manage product variants with different capacities'}
            </p>
            {product && (
              <div className="mt-2 flex items-center">
                <Tag className="w-4 h-4 text-primary mr-2" />
                <span className="text-light/70">{product.sku}</span>
              </div>
            )}
          </div>
          
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="mt-4 sm:mt-0 inline-flex items-center bg-primary hover:bg-primary-dark text-dark py-2 px-4 rounded transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Variant
          </button>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded mb-6">
            {error}
          </div>
        )}
        
        {/* Variants table */}
        <div className="bg-dark-800 border border-light/5 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-light/60">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary border-r-2 mx-auto mb-4"></div>
              Loading variants...
            </div>
          ) : variants.length === 0 ? (
            <div className="p-8 text-center text-light/60">
              <div className="bg-dark-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-primary/60" />
              </div>
              <h3 className="text-xl font-medium text-light mb-2">No Variants Found</h3>
              <p className="text-light/60 max-w-md mx-auto mb-6">
                This product doesn't have any variants yet. Create different capacity options for this product.
              </p>
              <button
                onClick={() => {
                  resetForm();
                  setShowAddModal(true);
                }}
                className="inline-flex items-center bg-primary hover:bg-primary-dark text-dark py-2 px-4 rounded transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Variant
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-dark-700">
                <tr>
                  <th className="text-left py-3 px-4 text-light/70 font-medium border-b border-light/5">Capacity</th>
                  <th className="text-left py-3 px-4 text-light/70 font-medium border-b border-light/5">Price</th>
                  <th className="text-left py-3 px-4 text-light/70 font-medium border-b border-light/5">After Subsidy</th>
                  <th className="text-left py-3 px-4 text-light/70 font-medium border-b border-light/5">ROI (Years)</th>
                  <th className="text-left py-3 px-4 text-light/70 font-medium border-b border-light/5">Status</th>
                  <th className="text-right py-3 px-4 text-light/70 font-medium border-b border-light/5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((variant, index) => (
                  <motion.tr 
                    key={variant.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className={`border-b border-light/5 ${variant.is_default ? 'bg-primary/5' : 'hover:bg-dark-700'}`}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        {variant.image_url ? (
                          <img src={variant.image_url} alt={variant.variant_name || `${variant.capacity_kw} kW`} className="w-10 h-10 rounded-md object-cover mr-3" />
                        ) : (
                          <Battery className="w-5 h-5 mr-3 text-primary/80" />
                        )}
                        <div>
                          <span className="font-medium text-white">{variant.variant_name || `${variant.capacity_kw} kW`}</span>
                          {variant.variant_sku && <div className="text-xs text-light/50">{variant.variant_sku}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <IndianRupee className="w-4 h-4 mr-2 text-light/50" />
                        <span className="text-light">{variant.price.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <IndianRupee className="w-4 h-4 mr-2 text-light/50" />
                        <span className="text-light">
                          {calculatePriceAfterSubsidy(variant.price, variant.subsidy_percentage).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <Calculator className="w-4 h-4 mr-2 text-light/50" />
                        <span className="text-light">
                          {calculateROI(variant.price, variant.subsidy_percentage, variant.monthly_savings)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {variant.is_default ? (
                        <span className="inline-flex items-center bg-primary/20 text-primary px-2.5 py-1 rounded-full text-xs">
                          <Star className="w-3 h-3 mr-1" fill="currentColor" />
                          Default
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSetDefault(variant.id)}
                          className="inline-flex items-center text-light/40 hover:text-primary px-2.5 py-1 rounded-full text-xs border border-light/10 hover:border-primary/30 transition-colors"
                        >
                          <Star className="w-3 h-3 mr-1" />
                          Set Default
                        </button>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEditVariant(variant)}
                          className="p-1.5 rounded-full bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {!variant.is_default && (
                          <button
                            onClick={() => handleDeleteVariant(variant.id)}
                            className="p-1.5 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {/* Add/Edit Variant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-900 rounded-lg w-full max-w-2xl overflow-hidden border border-light/10 shadow-xl my-8"
          >
            <div className="flex items-center justify-between p-4 border-b border-light/20 bg-dark-800 sticky top-0 z-10">
              <h2 className="text-xl font-semibold text-white">
                {isEditing ? 'Edit Variant' : 'Add New Variant'}
              </h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full hover:bg-dark-600 bg-dark-700 text-light/80 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 bg-dark-800/95 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Capacity */}
                <div>
                  <label className="block text-light/70 mb-2">Capacity (kW)</label>
                  <div className="relative">
                    <Zap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light/40 w-5 h-5" />
                    <input
                      type="number"
                      name="capacity_kw"
                      value={formData.capacity_kw}
                      onChange={handleInputChange}
                      className="bg-dark-700 border border-light/10 rounded w-full py-2 pl-10 pr-3 text-white focus:outline-none focus:border-primary/50"
                      min="0.1"
                      step="0.1"
                    />
                  </div>
                </div>
                
                {/* Variant Name */}
                <div>
                  <label className="block text-light/70 mb-2">Variant Name (Optional)</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light/40 w-5 h-5" />
                    <input
                      type="text"
                      name="variant_name"
                      value={formData.variant_name || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., Standard, Premium, etc."
                      className="bg-dark-700 border border-light/10 rounded w-full py-2 pl-10 pr-3 text-white focus:outline-none focus:border-primary/50"
                    />
                  </div>
                  <p className="text-xs text-light/50 mt-1">A friendly name for this variant (if different from capacity)</p>
                </div>
                
                {/* Variant SKU */}
                <div>
                  <label className="block text-light/70 mb-2">Variant SKU (Optional)</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light/40 w-5 h-5" />
                    <input
                      type="text"
                      name="variant_sku"
                      value={formData.variant_sku || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., SOLAR-5KW"
                      className="bg-dark-700 border border-light/10 rounded w-full py-2 pl-10 pr-3 text-white focus:outline-none focus:border-primary/50"
                    />
                  </div>
                  <p className="text-xs text-light/50 mt-1">A unique identifier for this specific variant</p>
                </div>
                
                {/* Price */}
                <div>
                  <label className="block text-light/70 mb-2">Price (₹)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light/40 w-5 h-5" />
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="bg-dark-700 border border-light/10 rounded w-full py-2 pl-10 pr-3 text-white focus:outline-none focus:border-primary/50"
                      min="0"
                    />
                  </div>
                </div>
                
                {/* Subsidy Percentage */}
                <div>
                  <label className="block text-light/70 mb-2">Subsidy Percentage (%)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light/40">%</span>
                    <input
                      type="number"
                      name="subsidy_percentage"
                      value={formData.subsidy_percentage}
                      onChange={handleInputChange}
                      className="bg-dark-700 border border-light/10 rounded w-full py-2 pl-10 pr-3 text-white focus:outline-none focus:border-primary/50"
                      min="0"
                      max="100"
                    />
                  </div>
                  <p className="text-light/40 text-xs mt-1">Net price: ₹{calculatePriceAfterSubsidy(formData.price, formData.subsidy_percentage).toLocaleString()}</p>
                </div>
                
                {/* Area Required */}
                <div>
                  <label className="block text-light/70 mb-2">Area Required (sq.ft)</label>
                  <div className="relative">
                    <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light/40 w-5 h-5" />
                    <input
                      type="number"
                      name="area_required"
                      value={formData.area_required}
                      onChange={handleInputChange}
                      className="bg-dark-700 border border-light/10 rounded w-full py-2 pl-10 pr-3 text-white focus:outline-none focus:border-primary/50"
                      min="0"
                    />
                  </div>
                </div>
                
                {/* Monthly Savings */}
                <div>
                  <label className="block text-light/70 mb-2">Monthly Savings (₹)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light/40 w-5 h-5" />
                    <input
                      type="number"
                      name="monthly_savings"
                      value={formData.monthly_savings}
                      onChange={handleInputChange}
                      className="bg-dark-700 border border-light/10 rounded w-full py-2 pl-10 pr-3 text-white focus:outline-none focus:border-primary/50"
                      min="0"
                    />
                  </div>
                  <p className="text-light/40 text-xs mt-1">ROI: {calculateROI(formData.price, formData.subsidy_percentage, formData.monthly_savings)} years</p>
                </div>
                
                {/* Installation Days */}
                <div>
                  <label className="block text-light/70 mb-2">Installation Time (days)</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light/40 w-5 h-5" />
                    <input
                      type="text"
                      name="installation_days"
                      value={formData.installation_days}
                      onChange={handleInputChange}
                      className="bg-dark-700 border border-light/10 rounded w-full py-2 pl-10 pr-3 text-white focus:outline-none focus:border-primary/50"
                      placeholder="e.g. 4-5"
                    />
                  </div>
                </div>
                
                {/* Generation */}
                <div>
                  <label className="block text-light/70 mb-2">Generation</label>
                  <div className="relative">
                    <Zap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light/40 w-5 h-5" />
                    <select
                      name="generation"
                      value={formData.generation || ''}
                      onChange={handleInputChange}
                      className="bg-dark-700 border border-light/10 rounded w-full py-2 pl-10 pr-3 text-white focus:outline-none focus:border-primary/50"
                    >
                      <option value="">Select Generation</option>
                      <option value="1st Gen">1st Gen</option>
                      <option value="2nd Gen">2nd Gen</option>
                      <option value="3rd Gen">3rd Gen</option>
                      <option value="4th Gen">4th Gen</option>
                    </select>
                  </div>
                </div>
                
                {/* Panel Type */}
                <div>
                  <label className="block text-light/70 mb-2">Panel Type</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light/40 w-5 h-5" />
                    <select
                      name="panel_type"
                      value={formData.panel_type || ''}
                      onChange={handleInputChange}
                      className="bg-dark-700 border border-light/10 rounded w-full py-2 pl-10 pr-3 text-white focus:outline-none focus:border-primary/50"
                    >
                      <option value="">Select Panel Type</option>
                      <option value="monocrystalline">Monocrystalline</option>
                      <option value="polycrystalline">Polycrystalline</option>
                      <option value="thin-film">Thin Film</option>
                      <option value="evacuated_tube">Evacuated Tube</option>
                    </select>
                  </div>
                </div>
                
                {/* Image Upload */}
                <div className="col-span-1 sm:col-span-2 mb-4">
                  <label className="block text-light/70 mb-2">Variant Image</label>
                  
                  {/* Image preview */}
                  {imagePreview ? (
                    <div className="mb-4">
                      <div className="relative inline-block">
                        <img 
                          src={imagePreview} 
                          alt="Variant preview" 
                          className="w-40 h-40 object-cover rounded-lg border border-light/10" 
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 flex items-center justify-center w-40 h-40 bg-dark-700 border border-light/10 rounded-lg">
                      <div className="text-center">
                        <div className="mb-2 mx-auto w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Plus className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-sm text-light/50">No image</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Upload button */}
                  <div>
                    <label className="inline-flex items-center px-4 py-2 bg-primary/20 text-primary hover:bg-primary/30 transition-colors rounded cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <Plus className="w-4 h-4 mr-2" />
                      {imagePreview ? 'Change Image' : 'Upload Image'}
                    </label>
                    <p className="text-xs text-light/50 mt-1">
                      Recommended size: 800x800px, JPG, PNG or WebP format
                    </p>
                  </div>
                </div>
                
                {/* Description */}
                <div className="col-span-1 sm:col-span-2 mb-4">
                  <label className="block text-light/70 mb-2">Variant Description (Optional)</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 text-light/40 w-5 h-5" />
                    <textarea
                      name="description"
                      value={formData.description || ''}
                      onChange={handleInputChange}
                      rows={5}
                      className="bg-dark-700 border border-light/10 rounded w-full py-3 pl-10 pr-3 text-white focus:outline-none focus:border-primary/50 resize-y"
                      placeholder="Describe the specific features of this variant..."
                    ></textarea>
                  </div>
                  <p className="text-xs text-light/50 mt-1">Detailed description of this variant's features and benefits</p>
                </div>
                
                {/* Is Default */}
                <div className="col-span-1 sm:col-span-2 mb-2">
                  <label className="inline-flex items-center space-x-2 text-light/70">
                    <input
                      type="checkbox"
                      name="is_default"
                      checked={formData.is_default}
                      onChange={handleInputChange}
                      className="form-checkbox text-primary h-5 w-5 rounded border-light/30 bg-dark-700 focus:ring-0"
                    />
                    <span>Set as default variant</span>
                  </label>
                  <p className="text-xs text-light/50 mt-1">
                    The default variant will be shown first to customers
                  </p>
                </div>
              </div>
              
              {/* Buttons */}
              <div className="flex justify-end mt-8 pt-5 border-t border-light/10 sticky bottom-0 bg-dark-800/95 pb-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="mr-3 px-5 py-2.5 text-light font-medium hover:text-white bg-dark-700 hover:bg-dark-600 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button" 
                  onClick={handleSaveVariant}
                  disabled={isSaving || uploadProgress}
                  className="bg-primary hover:bg-primary-dark text-dark font-medium px-6 py-2.5 rounded-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  {isSaving || uploadProgress ? (
                    <>
                      <div className="h-4 w-4 border-2 border-dark border-t-transparent rounded-full animate-spin"></div>
                      <span>{uploadProgress ? 'Uploading Image...' : 'Saving...'}</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Variant</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ProductVariants;
