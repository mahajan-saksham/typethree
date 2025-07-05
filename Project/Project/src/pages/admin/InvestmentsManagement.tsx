import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import AdminLayout from '../../components/admin/AdminLayout';
import { Card } from '../../components/Card';
import {
  Search,
  Filter,
  Edit,
  Eye,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  IndianRupee,
  Zap,
  ChevronDown,
  X,
  TrendingUp,
  BarChart
} from 'lucide-react';

interface Investment {
  id: string;
  created_at: string;
  user_id: string;
  project_id: string;
  amount: number;
  status: 'pending' | 'active' | 'closed';
  irr: number;
  user_profile?: {
    full_name: string;
    email: string;
  };
  project?: {
    name: string;
    location: string;
    type: string;
  };
}

interface Project {
  id: string;
  name: string;
  type: string;
  location: string;
  status: string;
}

const InvestmentsManagement: React.FC = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [filteredInvestments, setFilteredInvestments] = useState<Investment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  
  // Fetch investments with user and project data
  useEffect(() => {
    async function fetchInvestments() {
      try {
        setLoading(true);
        
        // Fetch projects first for filters
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*');
          
        if (projectsError) throw projectsError;
        setProjects(projectsData || []);
        
        // Fetch investments with user profiles and project data
        const { data, error } = await supabase
          .from('investments')
          .select(`
            *,
            user_profile:user_id(full_name, email),
            project:project_id(name, location, type)
          `)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setInvestments(data || []);
        setFilteredInvestments(data || []);
      } catch (err) {
        console.error('Error fetching investments:', err);
        setError('Failed to load investments');
      } finally {
        setLoading(false);
      }
    }
    
    fetchInvestments();
  }, []);
  
  // Apply filters and search
  useEffect(() => {
    let result = [...investments];
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(investment => 
        investment.user_profile?.full_name?.toLowerCase().includes(query) ||
        investment.user_profile?.email?.toLowerCase().includes(query) ||
        investment.project?.name?.toLowerCase().includes(query) ||
        investment.id.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (selectedStatus !== 'all') {
      result = result.filter(investment => investment.status === selectedStatus);
    }
    
    // Apply project filter
    if (selectedProject !== 'all') {
      result = result.filter(investment => investment.project_id === selectedProject);
    }
    
    setFilteredInvestments(result);
  }, [investments, searchQuery, selectedStatus, selectedProject]);
  
  // Handle investment view
  const handleViewInvestment = (investment: Investment) => {
    setSelectedInvestment(investment);
    setShowInvestmentModal(true);
  };
  
  // Export investments to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'User', 'Email', 'Project', 'Amount', 'Status', 'IRR'];
    const csvData = filteredInvestments.map(inv => [
      new Date(inv.created_at).toLocaleDateString(),
      inv.user_profile?.full_name || 'Unknown',
      inv.user_profile?.email || 'Unknown',
      inv.project?.name || 'Unknown',
      inv.amount,
      inv.status,
      `${inv.irr}%`
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `type3_investments_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Update investment status
  const updateInvestmentStatus = async (investmentId: string, newStatus: 'pending' | 'active' | 'closed') => {
    try {
      const { error } = await supabase
        .from('investments')
        .update({ status: newStatus })
        .eq('id', investmentId);
        
      if (error) throw error;
      
      // Update local state
      setInvestments(investments.map(inv => 
        inv.id === investmentId ? { ...inv, status: newStatus } : inv
      ));
      
      if (selectedInvestment && selectedInvestment.id === investmentId) {
        setSelectedInvestment({ ...selectedInvestment, status: newStatus });
      }
      
      alert(`Investment status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating investment status:', err);
      alert('Failed to update investment status');
    }
  };
  
  // Update investment IRR
  const updateInvestmentIRR = async (investmentId: string, newIRR: number) => {
    try {
      const { error } = await supabase
        .from('investments')
        .update({ irr: newIRR })
        .eq('id', investmentId);
        
      if (error) throw error;
      
      // Update local state
      setInvestments(investments.map(inv => 
        inv.id === investmentId ? { ...inv, irr: newIRR } : inv
      ));
      
      if (selectedInvestment && selectedInvestment.id === investmentId) {
        setSelectedInvestment({ ...selectedInvestment, irr: newIRR });
      }
      
      alert(`Investment IRR updated to ${newIRR}%`);
    } catch (err) {
      console.error('Error updating investment IRR:', err);
      alert('Failed to update investment IRR');
    }
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-400/20 text-green-400';
      case 'pending':
        return 'bg-yellow-400/20 text-yellow-400';
      case 'closed':
        return 'bg-red-400/20 text-red-400';
      default:
        return 'bg-dark-200 text-light/80';
    }
  };

  return (
    <AdminLayout title="Investments Management">
      {/* Search and Filters */}
      <Card variant="glass" padding="md" className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light/50 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by user, project..."
              className="bg-dark-200 w-full pl-10 pr-4 py-2 rounded-lg text-light border border-dark-200 focus:border-primary focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-light/50" />
              <select
                className="bg-dark-200 text-light border border-dark-200 rounded-lg px-3 py-2 focus:border-primary focus:outline-none"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-light/50" />
              <select
                className="bg-dark-200 text-light border border-dark-200 rounded-lg px-3 py-2 focus:border-primary focus:outline-none"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
              >
                <option value="all">All Projects</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            
            <button 
              onClick={exportToCSV}
              className="bg-dark-200 hover:bg-dark-100 text-light px-4 py-2 rounded-lg flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </Card>
      
      {/* Investments Table */}
      <Card variant="glass" padding="md">
        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-bold text-light">
            {filteredInvestments.length} Investment{filteredInvestments.length !== 1 ? 's' : ''}
          </h2>
          
          <div className="text-sm text-light/60">
            {selectedStatus !== 'all' && <span className="bg-dark-200 px-2 py-1 rounded mr-2">{selectedStatus}</span>}
            {selectedProject !== 'all' && 
              <span className="bg-dark-200 px-2 py-1 rounded">
                {projects.find(p => p.id === selectedProject)?.name || 'Selected Project'}
              </span>
            }
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 text-red-400 p-4 rounded-lg">
            <AlertTriangle className="h-5 w-5 inline mr-2" />
            {error}
          </div>
        ) : filteredInvestments.length === 0 ? (
          <div className="text-center py-12 text-light/60">
            <IndianRupee className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No investments match your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-dark-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-light/50 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-light/50 uppercase tracking-wider">Investor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-light/50 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-light/50 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-light/50 uppercase tracking-wider">IRR</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-light/50 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-light/50 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-200">
                {filteredInvestments.map((investment) => (
                  <tr key={investment.id} className="hover:bg-dark-200/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-light/80">
                      {new Date(investment.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-0">
                          <div className="text-sm font-medium text-light">{investment.user_profile?.full_name || 'Unknown'}</div>
                          <div className="text-sm text-light/60">{investment.user_profile?.email || 'No email'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-light">{investment.project?.name || 'Unknown'}</div>
                      <div className="text-sm text-light/60">{investment.project?.location || 'No location'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-light">
                      ₹{investment.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-green-400">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span>{investment.irr}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(investment.status)}`}>
                        {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewInvestment(investment)}
                        className="text-primary hover:text-primary/80 mr-4"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleViewInvestment(investment)}
                        className="text-light/70 hover:text-light"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      
      {/* Investment Modal */}
      {showInvestmentModal && selectedInvestment && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-100 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-light">Investment Details</h2>
              <button 
                onClick={() => setShowInvestmentModal(false)}
                className="text-light/60 hover:text-light"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-light/60 text-sm mb-1">Investment ID</h3>
                <p className="text-light font-medium">{selectedInvestment.id}</p>
              </div>
              
              <div>
                <h3 className="text-light/60 text-sm mb-1">Date</h3>
                <p className="text-light font-medium">{new Date(selectedInvestment.created_at).toLocaleString()}</p>
              </div>
              
              <div>
                <h3 className="text-light/60 text-sm mb-1">Investor</h3>
                <p className="text-light font-medium">{selectedInvestment.user_profile?.full_name || 'Unknown'}</p>
                <p className="text-light/60 text-sm">{selectedInvestment.user_profile?.email || 'No email'}</p>
              </div>
              
              <div>
                <h3 className="text-light/60 text-sm mb-1">Project</h3>
                <p className="text-light font-medium">{selectedInvestment.project?.name || 'Unknown'}</p>
                <p className="text-light/60 text-sm">{selectedInvestment.project?.location || 'No location'}</p>
              </div>
              
              <div>
                <h3 className="text-light/60 text-sm mb-1">Amount</h3>
                <p className="text-light font-medium text-xl">₹{selectedInvestment.amount.toLocaleString()}</p>
              </div>
              
              <div>
                <h3 className="text-light/60 text-sm mb-1">Status</h3>
                <span className={`px-3 py-1 text-sm rounded-full ${getStatusBadge(selectedInvestment.status)}`}>
                  {selectedInvestment.status.charAt(0).toUpperCase() + selectedInvestment.status.slice(1)}
                </span>
              </div>
            </div>
            
            <div className="border-t border-dark-200 pt-6 mb-6">
              <h3 className="text-lg font-medium text-light mb-4">Investment Performance</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-light/60 text-sm mb-1">Current IRR</h4>
                  <div className="flex items-center">
                    <input 
                      type="number" 
                      className="bg-dark-200 text-light border border-dark-200 rounded-lg px-3 py-2 w-20 focus:border-primary focus:outline-none mr-2"
                      value={selectedInvestment.irr}
                      onChange={(e) => setSelectedInvestment({
                        ...selectedInvestment,
                        irr: parseFloat(e.target.value) || 0
                      })}
                    />
                    <span className="text-light mr-4">%</span>
                    
                    <button 
                      onClick={() => updateInvestmentIRR(selectedInvestment.id, selectedInvestment.irr)}
                      className="bg-primary hover:bg-primary/90 text-black px-3 py-1 rounded-lg text-sm"
                    >
                      Update IRR
                    </button>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-light/60 text-sm mb-1">Earnings To Date</h4>
                  <p className="text-light font-medium text-xl">₹{Math.round(selectedInvestment.amount * (selectedInvestment.irr / 100) * 0.5).toLocaleString()}</p>
                  <p className="text-light/60 text-xs">(Estimated based on 6 months)</p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-dark-200 pt-6 space-y-4">
              <h3 className="text-lg font-medium text-light mb-4">Actions</h3>
              
              <div className="flex justify-between">
                <div className="space-x-3">
                  <button 
                    onClick={() => updateInvestmentStatus(selectedInvestment.id, 'active')}
                    className={`px-4 py-2 rounded-lg ${selectedInvestment.status === 'active' ? 'bg-green-400/20 border border-green-400 text-green-400' : 'bg-dark-200 text-light hover:bg-dark-100'}`}
                  >
                    Active
                  </button>
                  
                  <button 
                    onClick={() => updateInvestmentStatus(selectedInvestment.id, 'pending')}
                    className={`px-4 py-2 rounded-lg ${selectedInvestment.status === 'pending' ? 'bg-yellow-400/20 border border-yellow-400 text-yellow-400' : 'bg-dark-200 text-light hover:bg-dark-100'}`}
                  >
                    Pending
                  </button>
                  
                  <button 
                    onClick={() => updateInvestmentStatus(selectedInvestment.id, 'closed')}
                    className={`px-4 py-2 rounded-lg ${selectedInvestment.status === 'closed' ? 'bg-red-400/20 border border-red-400 text-red-400' : 'bg-dark-200 text-light hover:bg-dark-100'}`}
                  >
                    Closed
                  </button>
                </div>
                
                <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-black rounded-lg flex items-center">
                  <Zap className="h-4 w-4 mr-2" />
                  Trigger Payout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default InvestmentsManagement;
