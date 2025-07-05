import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import AdminLayout from '../../components/admin/AdminLayout';
import ViewInvestorsModal from '../../components/admin/ViewInvestorsModal';
import { formatCurrency } from '../../utils/formatters';

// Define Project type
interface Project {
  id: string;
  title: string;
  location: string;
  capacity: number;
  short_description: string;
  detailed_description: string;
  thumbnail_url: string;
  total_investment: number;
  min_token_investment: number;
  roi_percentage: number;
  irr_percentage: number;
  wattage_credits: number;
  funding_deadline: string;
  start_date: string;
  end_date: string;
  status: 'open' | 'closed' | 'paused' | 'completed';
  created_at: string;
  current_investment?: number; // Optional, calculated from investments
}

// Define filter state
interface FilterState {
  search: string;
  status: string;
  dateRange: {
    start: string | null;
    end: string | null;
  };
  location: string;
}

const ProjectsManagement: React.FC = () => {
  // State for projects data
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isInvestorsModalOpen, setIsInvestorsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // State for filters
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    dateRange: {
      start: null,
      end: null
    },
    location: ''
  });
  
  // State for table sorting
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Project | '';
    direction: 'ascending' | 'descending';
  }>({
    key: 'created_at',
    direction: 'descending'
  });
  
  // Fetch projects data
  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (projectsError) throw projectsError;
      
      // For each project, fetch current investment amount
      const projectsWithInvestments = await Promise.all((projectsData as Project[]).map(async (project) => {
        const { data: investments, error: investmentsError } = await supabase
          .from('investments')
          .select('amount_invested')
          .eq('project_id', project.id);
        
        if (investmentsError) {
          console.error('Error fetching investments for project:', investmentsError);
          return { ...project, current_investment: 0 };
        }
        
        const totalInvested = investments?.reduce((sum, inv) => sum + (inv.amount_invested || 0), 0) || 0;
        return { ...project, current_investment: totalInvested };
      }));
      
      setProjects(projectsWithInvestments || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects. Please try again.');
      // Load demo data as fallback
      setProjects(getDemoProjects());
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProjects();
  }, []);
  
  // Handle project actions
  const handleAddProject = () => {
    setSelectedProject(null);
    setIsAddModalOpen(true);
  };
  
  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setIsEditModalOpen(true);
  };
  
  const handleDeleteProject = (project: Project) => {
    setSelectedProject(project);
    setIsDeleteModalOpen(true);
  };
  
  const handleViewInvestors = (project: Project) => {
    setSelectedProject(project);
    setIsInvestorsModalOpen(true);
  };
  
  const handleToggleStatus = async (project: Project) => {
    // Determine new status based on current status
    let newStatus: 'open' | 'paused';
    if (project.status === 'open') {
      newStatus = 'paused';
    } else {
      newStatus = 'open';
    }
    
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', project.id);
        
      if (error) throw error;
      
      // Log the action in audit_logs
      await supabase.from('audit_logs').insert({
        admin_user_id: (await supabase.auth.getUser()).data.user?.id,
        action_type: 'update',
        entity: 'Project',
        entity_id: project.id,
        description: `Project status changed from ${project.status} to ${newStatus}`,
        timestamp: new Date().toISOString()
      });
      
      // Update local data
      setProjects(prev => 
        prev.map(p => p.id === project.id ? { ...p, status: newStatus } : p)
      );
      
    } catch (err) {
      console.error('Error updating project status:', err);
      // Show error toast or message
    }
  };
  
  // Filter projects based on search/filter criteria
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      // Filter by search term (title, location, description)
      const matchesSearch = filters.search === '' || 
        project.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.location.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.short_description.toLowerCase().includes(filters.search.toLowerCase());
      
      // Filter by status
      const matchesStatus = filters.status === '' || project.status === filters.status;
      
      // Filter by location
      const matchesLocation = filters.location === '' || 
        project.location.toLowerCase().includes(filters.location.toLowerCase());
      
      // Filter by date range
      const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
      const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;
      const projectDate = new Date(project.created_at);
      
      const isInDateRange = (
        !startDate || projectDate >= startDate) && 
        (!endDate || projectDate <= endDate
      );
      
      return matchesSearch && matchesStatus && matchesLocation && isInDateRange;
    });
  }, [projects, filters]);
  
  // Sorted projects
  const sortedProjects = useMemo(() => {
    if (sortConfig.key === '') return filteredProjects;
    
    return [...filteredProjects].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredProjects, sortConfig]);
  
  // Demo projects for fallback
  const getDemoProjects = (): Project[] => [
    {
      id: '1',
      title: 'Rooftop Solar Array - Delhi NCR',
      location: 'Delhi',
      capacity: 500,
      short_description: 'Commercial rooftop solar project',
      detailed_description: 'A 500kW commercial rooftop solar project in Delhi NCR.',
      thumbnail_url: '/images/projects/delhi-solar.jpg',
      total_investment: 25000000,
      min_token_investment: 50000,
      roi_percentage: 14.5,
      irr_percentage: 12.8,
      wattage_credits: 1000,
      funding_deadline: '2025-10-30',
      start_date: '2025-11-15',
      end_date: '2050-11-14',
      status: 'open',
      created_at: '2025-03-15T08:30:00Z',
      current_investment: 15750000
    },
    {
      id: '2',
      title: 'Solar Farm - Karnataka',
      location: 'Bangalore Rural',
      capacity: 2000,
      short_description: 'Utility-scale solar farm',
      detailed_description: 'A 2MW utility-scale solar farm in rural Karnataka.',
      thumbnail_url: '/images/projects/karnataka-solar.jpg',
      total_investment: 85000000,
      min_token_investment: 100000,
      roi_percentage: 13.2,
      irr_percentage: 11.5,
      wattage_credits: 4000,
      funding_deadline: '2025-11-30',
      start_date: '2025-12-15',
      end_date: '2050-12-14',
      status: 'open',
      created_at: '2025-03-20T10:15:00Z',
      current_investment: 42500000
    },
    {
      id: '3',
      title: 'Industrial Solar Project - Gujarat',
      location: 'Ahmedabad',
      capacity: 1200,
      short_description: 'Industrial rooftop installation',
      detailed_description: 'A 1.2MW industrial rooftop solar installation in Ahmedabad, Gujarat.',
      thumbnail_url: '/images/projects/gujarat-solar.jpg',
      total_investment: 54000000,
      min_token_investment: 75000,
      roi_percentage: 15.0,
      irr_percentage: 13.2,
      wattage_credits: 2400,
      funding_deadline: '2025-09-30',
      start_date: '2025-10-15',
      end_date: '2050-10-14',
      status: 'completed',
      created_at: '2025-02-10T09:45:00Z',
      current_investment: 54000000
    }
  ];

  return (
    <AdminLayout title="Projects Management">
      <div className="space-y-6">
        {/* Header with add button */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-light">Projects Management</h1>
          <button
            onClick={handleAddProject}
            className="flex items-center px-4 py-2 bg-primary text-dark rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add New Project
          </button>
        </div>
        
        {/* Filters */}
        <Card variant="glass" padding="md" className="backdrop-blur-xl">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light/50 h-5 w-5" />
              <input
                type="text"
                placeholder="Search projects..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full pl-10 pr-4 py-2 bg-dark-200 border border-dark-300 rounded-lg text-light focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            
            {/* Status filter */}
            <div className="w-full md:w-48">
              <div className="relative">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full pl-4 pr-10 py-2 bg-dark-200 border border-dark-300 rounded-lg text-light focus:outline-none focus:ring-1 focus:ring-primary appearance-none"
                >
                  <option value="">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                  <option value="closed">Closed</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-light/50 h-5 w-5 pointer-events-none" />
              </div>
            </div>
            
            {/* Location filter */}
            <div className="w-full md:w-48">
              <div className="relative">
                <select
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                  className="w-full pl-4 pr-10 py-2 bg-dark-200 border border-dark-300 rounded-lg text-light focus:outline-none focus:ring-1 focus:ring-primary appearance-none"
                >
                  <option value="">All Locations</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Ahmedabad">Ahmedabad</option>
                  <option value="Chennai">Chennai</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-light/50 h-5 w-5 pointer-events-none" />
              </div>
            </div>
            
            {/* Reset filters */}
            <button
              onClick={() => setFilters({
                search: '',
                status: '',
                dateRange: { start: null, end: null },
                location: ''
              })}
              className="px-4 py-2 bg-dark-300 text-light/70 rounded-lg hover:bg-dark-200 hover:text-light transition-colors"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </Card>
        
        {/* Projects Table */}
        <Card variant="glass" padding="md" className="backdrop-blur-xl">
          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              <p className="mt-4 text-light/60">Loading projects...</p>
            </div>
          ) : error ? (
            <div className="py-20 text-center">
              <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <p className="text-light/60">{error}</p>
              <button
                onClick={fetchProjects}
                className="mt-4 px-4 py-2 bg-dark-300 text-light rounded-lg hover:bg-dark-200 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : sortedProjects.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-xl font-semibold text-light mb-2">No projects found</p>
              <p className="text-light/60 mb-6">Try adjusting your filters or add a new project.</p>
              <button
                onClick={handleAddProject}
                className="px-6 py-3 bg-primary text-dark rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="inline-block mr-2 h-5 w-5" />
                Add New Project
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-light">
                <thead className="bg-dark-200 text-light/70 text-sm uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Project Name</th>
                    <th className="px-4 py-3 text-left">Location</th>
                    <th className="px-4 py-3 text-right">Investment Target</th>
                    <th className="px-4 py-3 text-right">Current Funding</th>
                    <th className="px-4 py-3 text-center">ROI</th>
                    <th className="px-4 py-3 text-center">IRR</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-left">Start Date</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-200">
                  {sortedProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-dark-200/50 transition-colors">
                      <td className="px-4 py-4 text-light font-medium">{project.title}</td>
                      <td className="px-4 py-4 text-light/70">{project.location}</td>
                      <td className="px-4 py-4 text-light/70 text-right">
                        {formatCurrency(project.total_investment)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div>
                          <div className="text-light/70">
                            {formatCurrency(project.current_investment || 0)}
                          </div>
                          <div className="w-full bg-dark-300 rounded-full h-1.5 mt-1">
                            <div 
                              className="bg-primary h-1.5 rounded-full" 
                              style={{
                                width: `${Math.min(
                                  ((project.current_investment || 0) / project.total_investment) * 100, 
                                  100
                                )}%`
                              }}
                            ></div>
                          </div>
                          <div className="text-xs text-light/50 mt-1">
                            {Math.round(((project.current_investment || 0) / project.total_investment) * 100)}%
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-light/70 text-center">{project.roi_percentage}%</td>
                      <td className="px-4 py-4 text-light/70 text-center">{project.irr_percentage}%</td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${project.status === 'open' ? 'bg-green-200 text-green-800' : ''}
                          ${project.status === 'paused' ? 'bg-yellow-200 text-yellow-800' : ''}
                          ${project.status === 'closed' ? 'bg-red-200 text-red-800' : ''}
                          ${project.status === 'completed' ? 'bg-blue-200 text-blue-800' : ''}
                        `}>
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-light/70">
                        {new Date(project.start_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-center space-x-1">
                          <button 
                            onClick={() => handleEditProject(project)}
                            className="p-1.5 text-light/70 hover:text-primary rounded-lg hover:bg-dark-300 transition-colors"
                            title="Edit Project"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleViewInvestors(project)}
                            className="p-1.5 text-light/70 hover:text-primary rounded-lg hover:bg-dark-300 transition-colors"
                            title="View Investors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleToggleStatus(project)}
                            className={`p-1.5 rounded-lg hover:bg-dark-300 transition-colors
                              ${project.status === 'open' ? 'text-green-500 hover:text-red-500' : 'text-red-500 hover:text-green-500'}
                            `}
                            title={project.status === 'open' ? 'Pause Project' : 'Activate Project'}
                          >
                            {project.status === 'open' ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                          </button>
                          <button 
                            onClick={() => handleDeleteProject(project)}
                            className="p-1.5 text-light/70 hover:text-red-500 rounded-lg hover:bg-dark-300 transition-colors"
                            title="Delete Project"
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
        </Card>
      </div>
      
      {/* Modals for Add/Edit/Delete */}
      {isAddModalOpen && (
        <AddEditProjectForm 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
          onSuccess={() => {
            setIsAddModalOpen(false);
            fetchProjects();
          }}
        />
      )}
      
      {isEditModalOpen && selectedProject && (
        <AddEditProjectForm 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          onSuccess={() => {
            setIsEditModalOpen(false);
            fetchProjects();
          }}
          project={selectedProject}
        />
      )}
      
      {isDeleteModalOpen && selectedProject && (
        <DeleteProjectModal 
          isOpen={isDeleteModalOpen} 
          onClose={() => setIsDeleteModalOpen(false)} 
          onDelete={async () => {
            try {
              // Instead of soft delete with is_deleted, mark the project as closed
              const { error } = await supabase
                .from('projects')
                .update({ status: 'closed' })
                .eq('id', selectedProject.id);
                
              if (error) throw error;
              
              // Log the action in audit_logs
              await supabase.from('audit_logs').insert({
                admin_user_id: (await supabase.auth.getUser()).data.user?.id,
                action_type: 'delete',
                entity: 'Project',
                entity_id: selectedProject.id,
                description: `Project "${selectedProject.title}" was marked as closed`,
                timestamp: new Date().toISOString()
              });
              
              setIsDeleteModalOpen(false);
              fetchProjects(); // Refresh data
            } catch (err) {
              console.error('Error deleting project:', err);
              // Show error message
            }
          }}
          projectName={selectedProject.title}
        />
      )}
      
      {isInvestorsModalOpen && selectedProject && (
        <ViewInvestorsModal 
          isOpen={isInvestorsModalOpen} 
          onClose={() => setIsInvestorsModalOpen(false)} 
          projectId={selectedProject.id}
          projectName={selectedProject.title}
        />
      )}
    </AdminLayout>
  );
};

export default ProjectsManagement;
