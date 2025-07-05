import React, { useState, useEffect } from 'react';
import { X, Upload, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface AddEditProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  project?: any; // The project to edit, if not provided, we're adding a new project
}

const AddEditProjectForm: React.FC<AddEditProjectFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  project
}) => {
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    capacity: 0,
    short_description: '',
    description: '',
    thumbnail_url: '',
    total_investment: 0,
    min_token_investment: 0,
    roi_percentage: 0,
    irr_percentage: 0,
    wattage_credits: 0,
    funding_deadline: '',
    start_date: '',
    end_date: '',
    status: 'open'
  });

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  
  // Set form data if project is provided (editing mode)
  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        location: project.location || '',
        capacity: project.capacity || 0,
        short_description: project.short_description || '',
        description: project.description || '',
        thumbnail_url: project.thumbnail_url || '',
        total_investment: project.total_investment || 0,
        min_token_investment: project.min_token_investment || 0,
        roi_percentage: project.roi_percentage || 0,
        irr_percentage: project.irr_percentage || 0,
        wattage_credits: project.wattage_credits || 0,
        funding_deadline: project.funding_deadline ? project.funding_deadline.split('T')[0] : '',
        start_date: project.start_date ? project.start_date.split('T')[0] : '',
        end_date: project.end_date ? project.end_date.split('T')[0] : '',
        status: project.status || 'open'
      });
    }
  }, [project]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Convert numeric values
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear validation errors when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setThumbnail(e.target.files[0]);
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Basic validation
    if (!formData.title.trim()) newErrors.title = 'Project title is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (formData.capacity <= 0) newErrors.capacity = 'Capacity must be greater than 0';
    if (!formData.short_description.trim()) newErrors.short_description = 'Short description is required';
    
    // Financial validation
    if (formData.total_investment <= 0) newErrors.total_investment = 'Total investment amount must be greater than 0';
    if (formData.min_token_investment <= 0) newErrors.min_token_investment = 'Minimum token investment must be greater than 0';
    if (formData.min_token_investment > formData.total_investment) {
      newErrors.min_token_investment = 'Minimum token investment cannot exceed total investment';
    }
    if (formData.roi_percentage <= 0) newErrors.roi_percentage = 'ROI percentage must be greater than 0';
    if (formData.irr_percentage <= 0) newErrors.irr_percentage = 'IRR percentage must be greater than 0';
    
    // Date validation
    if (!formData.funding_deadline) newErrors.funding_deadline = 'Funding deadline is required';
    if (!formData.start_date) newErrors.start_date = 'Start date is required';
    if (!formData.end_date) newErrors.end_date = 'End date is required';
    
    // Compare dates
    const fundingDeadline = new Date(formData.funding_deadline);
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    
    if (fundingDeadline > startDate) {
      newErrors.funding_deadline = 'Funding deadline must be before start date';
    }
    
    if (startDate >= endDate) {
      newErrors.end_date = 'End date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const uploadThumbnail = async (): Promise<string> => {
    if (!thumbnail) return formData.thumbnail_url || '';
    
    try {
      const fileExt = thumbnail.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `projects/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, thumbnail);
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      throw error;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Upload thumbnail if provided
      let thumbnailUrl = formData.thumbnail_url;
      if (thumbnail) {
        thumbnailUrl = await uploadThumbnail();
      }
      
      const projectData = {
        ...formData,
        thumbnail_url: thumbnailUrl,
        is_deleted: false,
        updated_at: new Date().toISOString()
      };
      
      let result;
      let actionType: 'create' | 'update';
      
      if (project) {
        // Update existing project
        const { data, error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', project.id)
          .select();
        
        if (error) throw error;
        result = data;
        actionType = 'update';
      } else {
        // Create new project
        const { data, error } = await supabase
          .from('projects')
          .insert({
            ...projectData,
            created_at: new Date().toISOString()
          })
          .select();
        
        if (error) throw error;
        result = data;
        actionType = 'create';
      }
      
      // Log the action in audit_logs
      await supabase.from('audit_logs').insert({
        admin_user_id: (await supabase.auth.getUser()).data.user?.id,
        action_type: actionType,
        entity: 'Project',
        entity_id: result[0].id,
        description: `Project "${formData.title}" was ${actionType === 'create' ? 'created' : 'updated'}`,
        timestamp: new Date().toISOString()
      });
      
      onSuccess();
    } catch (error: any) {
      console.error('Error submitting project:', error);
      setSubmitError(error.message || 'Failed to save project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div 
        className="bg-dark-100 rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-dark-200 p-6">
          <h3 className="text-xl font-bold text-light">
            {project ? 'Edit Project' : 'Add New Project'}
          </h3>
          <button 
            onClick={onClose}
            className="text-light/70 hover:text-light"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit}>
            {/* Basic Details Section */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-light mb-4 pb-2 border-b border-dark-200">
                Basic Details
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-light/70 mb-1" htmlFor="title">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 bg-dark-200 border ${errors.title ? 'border-red-500' : 'border-dark-300'} rounded-lg text-light focus:outline-none focus:ring-1 focus:ring-primary`}
                    placeholder="E.g., Commercial Rooftop - Delhi NCR"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-light/70 mb-1" htmlFor="location">
                    Location *
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 bg-dark-200 border ${errors.location ? 'border-red-500' : 'border-dark-300'} rounded-lg text-light focus:outline-none focus:ring-1 focus:ring-primary`}
                    placeholder="E.g., Delhi, Mumbai, Bangalore"
                  />
                  {errors.location && (
                    <p className="text-red-500 text-sm mt-1">{errors.location}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-light/70 mb-1" htmlFor="capacity">
                    Capacity (kW) *
                  </label>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    className={`w-full px-4 py-2 bg-dark-200 border ${errors.capacity ? 'border-red-500' : 'border-dark-300'} rounded-lg text-light focus:outline-none focus:ring-1 focus:ring-primary`}
                    placeholder="E.g., 500"
                  />
                  {errors.capacity && (
                    <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-light/70 mb-1" htmlFor="status">
                    Status *
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-dark-200 border border-dark-300 rounded-lg text-light focus:outline-none focus:ring-1 focus:ring-primary appearance-none"
                  >
                    <option value="open">Open</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-light/70 mb-1" htmlFor="short_description">
                  Short Description *
                </label>
                <textarea
                  id="short_description"
                  name="short_description"
                  value={formData.short_description}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 bg-dark-200 border ${errors.short_description ? 'border-red-500' : 'border-dark-300'} rounded-lg text-light focus:outline-none focus:ring-1 focus:ring-primary`}
                  placeholder="Brief summary of the project"
                  rows={2}
                />
                {errors.short_description && (
                  <p className="text-red-500 text-sm mt-1">{errors.short_description}</p>
                )}
              </div>

              <div>
                <label className="block text-light/70 mb-1" htmlFor="description">
                  Full Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 bg-dark-200 border ${errors.description ? 'border-red-500' : 'border-dark-300'} rounded-lg text-light focus:outline-none focus:ring-1 focus:ring-primary`}
                  placeholder="Detailed information about the project"
                  rows={5}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>
              
              <div className="mt-4">
                <label className="block text-light/70 mb-1">
                  Project Thumbnail
                </label>
                <div className="flex items-center space-x-4">
                  {(formData.thumbnail_url || thumbnail) && (
                    <div className="w-24 h-24 bg-dark-300 rounded-lg overflow-hidden">
                      <img 
                        src={thumbnail ? URL.createObjectURL(thumbnail) : formData.thumbnail_url} 
                        alt="Thumbnail Preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <label className="flex items-center px-4 py-2 bg-dark-300 text-light rounded-lg cursor-pointer hover:bg-dark-200 transition-colors">
                    <Upload className="mr-2 h-5 w-5" />
                    {formData.thumbnail_url || thumbnail ? 'Change Image' : 'Upload Image'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleThumbnailChange}
                    />
                  </label>
                </div>
              </div>
            </div>
            
            {/* Financial Metrics Section */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-light mb-4 pb-2 border-b border-dark-200">
                Financial Metrics
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-light/70 mb-1" htmlFor="total_investment">
                    Total Investment Required (₹) *
                  </label>
                  <input
                    type="number"
                    id="total_investment"
                    name="total_investment"
                    value={formData.total_investment}
                    onChange={handleChange}
                    min="0"
                    className={`w-full px-4 py-2 bg-dark-200 border ${errors.total_investment ? 'border-red-500' : 'border-dark-300'} rounded-lg text-light focus:outline-none focus:ring-1 focus:ring-primary`}
                    placeholder="E.g., 5000000"
                  />
                  {errors.total_investment && (
                    <p className="text-red-500 text-sm mt-1">{errors.total_investment}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-light/70 mb-1" htmlFor="min_token_investment">
                    Minimum Token Investment (₹) *
                  </label>
                  <input
                    type="number"
                    id="min_token_investment"
                    name="min_token_investment"
                    value={formData.min_token_investment}
                    onChange={handleChange}
                    min="0"
                    className={`w-full px-4 py-2 bg-dark-200 border ${errors.min_token_investment ? 'border-red-500' : 'border-dark-300'} rounded-lg text-light focus:outline-none focus:ring-1 focus:ring-primary`}
                    placeholder="E.g., 50000"
                  />
                  {errors.min_token_investment && (
                    <p className="text-red-500 text-sm mt-1">{errors.min_token_investment}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-light/70 mb-1" htmlFor="roi_percentage">
                    Estimated ROI (%) *
                  </label>
                  <input
                    type="number"
                    id="roi_percentage"
                    name="roi_percentage"
                    value={formData.roi_percentage}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    className={`w-full px-4 py-2 bg-dark-200 border ${errors.roi_percentage ? 'border-red-500' : 'border-dark-300'} rounded-lg text-light focus:outline-none focus:ring-1 focus:ring-primary`}
                    placeholder="E.g., 14.5"
                  />
                  {errors.roi_percentage && (
                    <p className="text-red-500 text-sm mt-1">{errors.roi_percentage}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-light/70 mb-1" htmlFor="irr_percentage">
                    Estimated IRR (%) *
                  </label>
                  <input
                    type="number"
                    id="irr_percentage"
                    name="irr_percentage"
                    value={formData.irr_percentage}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    className={`w-full px-4 py-2 bg-dark-200 border ${errors.irr_percentage ? 'border-red-500' : 'border-dark-300'} rounded-lg text-light focus:outline-none focus:ring-1 focus:ring-primary`}
                    placeholder="E.g., 12.5"
                  />
                  {errors.irr_percentage && (
                    <p className="text-red-500 text-sm mt-1">{errors.irr_percentage}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-light/70 mb-1" htmlFor="wattage_credits">
                    Wattage Credits Available
                  </label>
                  <input
                    type="number"
                    id="wattage_credits"
                    name="wattage_credits"
                    value={formData.wattage_credits}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 bg-dark-200 border border-dark-300 rounded-lg text-light focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="E.g., 1000"
                  />
                </div>
              </div>
            </div>
            
            {/* Project Timeline Section */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-light mb-4 pb-2 border-b border-dark-200">
                Project Timeline
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-light/70 mb-1" htmlFor="funding_deadline">
                    Funding Deadline *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light/50 h-5 w-5" />
                    <input
                      type="date"
                      id="funding_deadline"
                      name="funding_deadline"
                      value={formData.funding_deadline}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2 bg-dark-200 border ${errors.funding_deadline ? 'border-red-500' : 'border-dark-300'} rounded-lg text-light focus:outline-none focus:ring-1 focus:ring-primary`}
                    />
                  </div>
                  {errors.funding_deadline && (
                    <p className="text-red-500 text-sm mt-1">{errors.funding_deadline}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-light/70 mb-1" htmlFor="start_date">
                    Project Start Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light/50 h-5 w-5" />
                    <input
                      type="date"
                      id="start_date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2 bg-dark-200 border ${errors.start_date ? 'border-red-500' : 'border-dark-300'} rounded-lg text-light focus:outline-none focus:ring-1 focus:ring-primary`}
                    />
                  </div>
                  {errors.start_date && (
                    <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-light/70 mb-1" htmlFor="end_date">
                    Project End Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light/50 h-5 w-5" />
                    <input
                      type="date"
                      id="end_date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2 bg-dark-200 border ${errors.end_date ? 'border-red-500' : 'border-dark-300'} rounded-lg text-light focus:outline-none focus:ring-1 focus:ring-primary`}
                    />
                  </div>
                  {errors.end_date && (
                    <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Form Error Message */}
            {submitError && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
                {submitError}
              </div>
            )}
          </form>
        </div>
        
        {/* Footer */}
        <div className="border-t border-dark-200 p-6 flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-dark-300 text-light rounded-lg hover:bg-dark-200 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center px-6 py-2 bg-primary text-dark font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 border-t-2 border-b-2 border-dark rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>{project ? 'Update Project' : 'Create Project'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEditProjectForm;
