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
  CheckCircle,
  XCircle,
  Plus,
  Calendar,
  User,
  Zap,
  IndianRupee,
  RefreshCw
} from 'lucide-react';

interface WattageCredit {
  id: string;
  created_at: string;
  user_id: string;
  project_id: string;
  month: string; // Date in ISO format
  amount: number; // kWh amount
  value: number; // ₹ value
  redeemed: boolean;
  user_profile?: {
    full_name: string;
    email: string;
  };
  project?: {
    name: string;
    location: string;
  };
}

interface User {
  id: string;
  full_name: string;
  email: string;
}

interface Project {
  id: string;
  name: string;
  location: string;
}

const WattageCreditsAdmin: React.FC = () => {
  const [credits, setCredits] = useState<WattageCredit[]>([]);
  const [filteredCredits, setFilteredCredits] = useState<WattageCredit[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedCredit, setSelectedCredit] = useState<WattageCredit | null>(null);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showAddCreditModal, setShowAddCreditModal] = useState(false);
  const [newCredit, setNewCredit] = useState({
    user_id: '',
    project_id: '',
    month: new Date().toISOString().substring(0, 7), // Current month in YYYY-MM format
    amount: 0,
    value: 0,
    redeemed: false
  });

  // Fetch wattage credits with user and project data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch users for filters
        const { data: userData, error: userError } = await supabase
          .from('user_profiles')
          .select('id:user_id, full_name, email');
          
        if (userError) throw userError;
        setUsers(userData || []);
        
        // Fetch projects for filters
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('id, name, location');
          
        if (projectsError) throw projectsError;
        setProjects(projectsData || []);
        
        // Fetch wattage credits with user profiles and project data
        const { data, error } = await supabase
          .from('wattage_credits')
          .select(`
            *,
            user_profile:user_id(full_name, email),
            project:project_id(name, location)
          `)
          .order('month', { ascending: false });
          
        if (error) {
          if (error.code === '42P01') { // Relation does not exist error
            console.warn('Wattage credits table not found, showing mock data');
            const mockData = [
              {
                id: '1',
                created_at: new Date().toISOString(),
                user_id: '1',
                project_id: '1',
                month: '2025-03-01',
                amount: 150,
                value: 1200,
                redeemed: false,
                user_profile: { full_name: 'Demo User', email: 'demo@example.com' },
                project: { name: 'Solar Farm Alpha', location: 'Karnataka' }
              },
              {
                id: '2',
                created_at: new Date().toISOString(),
                user_id: '1',
                project_id: '1',
                month: '2025-02-01',
                amount: 140,
                value: 1120,
                redeemed: true,
                user_profile: { full_name: 'Demo User', email: 'demo@example.com' },
                project: { name: 'Solar Farm Alpha', location: 'Karnataka' }
              }
            ];
            setCredits(mockData);
            setFilteredCredits(mockData);
            return;
          } else {
            throw error;
          }
        }
        
        setCredits(data || []);
        setFilteredCredits(data || []);
      } catch (err: any) {
        console.error('Error fetching wattage credits:', err);
        setError('Failed to load wattage credits data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  // Apply filters and search
  useEffect(() => {
    let result = [...credits];
    
    // Filter by month
    if (selectedMonth !== 'all') {
      result = result.filter(credit => {
        return credit.month.startsWith(selectedMonth);
      });
    }
    
    // Filter by user
    if (selectedUser !== 'all') {
      result = result.filter(credit => credit.user_id === selectedUser);
    }
    
    // Filter by project
    if (selectedProject !== 'all') {
      result = result.filter(credit => credit.project_id === selectedProject);
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        credit =>
          credit.user_profile?.full_name.toLowerCase().includes(query) ||
          credit.user_profile?.email.toLowerCase().includes(query) ||
          credit.project?.name.toLowerCase().includes(query)
      );
    }
    
    setFilteredCredits(result);
  }, [credits, searchQuery, selectedMonth, selectedUser, selectedProject]);
  
  // Calculate available months from credits
  const availableMonths = React.useMemo(() => {
    const months = new Set<string>();
    credits.forEach(credit => {
      const monthPrefix = credit.month.substring(0, 7); // Get YYYY-MM
      months.add(monthPrefix);
    });
    return Array.from(months).sort().reverse(); // Most recent first
  }, [credits]);

  // Handle add new credit
  const handleAddCredit = async () => {
    try {
      if (!newCredit.user_id || !newCredit.project_id || newCredit.amount <= 0) {
        setError('Please fill all required fields');
        return;
      }

      const fullMonth = `${newCredit.month}-01`; // Convert YYYY-MM to YYYY-MM-DD
      
      const { data, error } = await supabase
        .from('wattage_credits')
        .insert([
          {
            user_id: newCredit.user_id,
            project_id: newCredit.project_id,
            month: fullMonth,
            amount: newCredit.amount,
            value: newCredit.value,
            redeemed: newCredit.redeemed
          }
        ])
        .select(`
          *,
          user_profile:user_id(full_name, email),
          project:project_id(name, location)
        `);

      if (error) throw error;

      setCredits([...(data || []), ...credits]);
      setShowAddCreditModal(false);
      setNewCredit({
        user_id: '',
        project_id: '',
        month: new Date().toISOString().substring(0, 7),
        amount: 0,
        value: 0,
        redeemed: false
      });
    } catch (err) {
      console.error('Error adding credit:', err);
      setError('Failed to add wattage credit');
    }
  };

  // Handle mark as redeemed/unredeemed
  const handleToggleRedeemed = async (credit: WattageCredit) => {
    try {
      const { error } = await supabase
        .from('wattage_credits')
        .update({ redeemed: !credit.redeemed })
        .eq('id', credit.id);

      if (error) throw error;

      // Update local state
      const updatedCredits = credits.map(c => 
        c.id === credit.id ? { ...c, redeemed: !credit.redeemed } : c
      );
      
      setCredits(updatedCredits);
    } catch (err) {
      console.error('Error updating credit status:', err);
      setError('Failed to update credit status');
    }
  };

  // Handle recalculate credits for a month
  const handleRecalculateMonth = async (month: string) => {
    // In a real implementation, this would be a backend function
    // that recalculates the wattage credits based on actual production data
    alert(`Recalculating credits for ${month} - In a production environment, this would trigger a backend process`);
  };

  // Format currency amount
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date for display
  const formatMonthDisplay = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'long' });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-light">Wattage Credits Management</h1>
          <button
            onClick={() => setShowAddCreditModal(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-dark px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={18} />
            Add New Credit
          </button>
        </div>

        <Card variant="dark" className="overflow-hidden">
          {/* Filters */}
          <div className="p-4 border-b border-dark-200 space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Search bar */}
              <div className="relative flex-1 min-w-[240px]">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light/60" />
                <input
                  type="text"
                  placeholder="Search by user or project..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-dark-200 border border-dark-200 rounded-lg pl-10 pr-4 py-2 text-light placeholder:text-light/60 focus:outline-none focus:border-primary"
                />
              </div>

              {/* Filter by month */}
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-light/60" />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-dark-200 border border-dark-200 rounded-lg px-3 py-2 text-light focus:outline-none focus:border-primary"
                >
                  <option value="all">All Months</option>
                  {availableMonths.map(month => (
                    <option key={month} value={month}>
                      {new Date(month + '-01').toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter by user */}
              <div className="flex items-center gap-2">
                <User size={18} className="text-light/60" />
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="bg-dark-200 border border-dark-200 rounded-lg px-3 py-2 text-light focus:outline-none focus:border-primary"
                >
                  <option value="all">All Users</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.full_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter by project */}
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-light/60" />
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="bg-dark-200 border border-dark-200 rounded-lg px-3 py-2 text-light focus:outline-none focus:border-primary"
                >
                  <option value="all">All Projects</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Data table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-error">{error}</div>
            ) : filteredCredits.length === 0 ? (
              <div className="p-8 text-center text-light/60">No wattage credits found</div>
            ) : (
              <table className="w-full text-light">
                <thead className="bg-dark-200 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Project</th>
                    <th className="px-4 py-3 font-medium">Month</th>
                    <th className="px-4 py-3 font-medium">
                      <div className="flex items-center gap-1">
                        <Zap size={16} className="text-primary" />
                        kWh
                      </div>
                    </th>
                    <th className="px-4 py-3 font-medium">
                      <div className="flex items-center gap-1">
                        <IndianRupee size={16} className="text-primary" />
                        Value
                      </div>
                    </th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-200">
                  {filteredCredits.map((credit) => (
                    <tr key={credit.id} className="hover:bg-dark-200/50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium">{credit.user_profile?.full_name || 'Unknown'}</div>
                          <div className="text-sm text-light/60">{credit.user_profile?.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{credit.project?.name || 'Unknown'}</td>
                      <td className="px-4 py-3">{formatMonthDisplay(credit.month)}</td>
                      <td className="px-4 py-3">{credit.amount.toFixed(2)}</td>
                      <td className="px-4 py-3 font-medium text-primary">{formatCurrency(credit.value)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                            credit.redeemed 
                              ? 'bg-success/10 text-success' 
                              : 'bg-warning/10 text-warning'
                          }`}
                        >
                          {credit.redeemed ? <CheckCircle size={12} /> : <XCircle size={12} />}
                          {credit.redeemed ? 'Redeemed' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleRedeemed(credit)}
                            className="p-1.5 text-light/60 hover:text-primary hover:bg-dark-200 rounded-lg transition-colors"
                            title={credit.redeemed ? 'Mark as Pending' : 'Mark as Redeemed'}
                          >
                            {credit.redeemed ? <XCircle size={18} /> : <CheckCircle size={18} />}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCredit(credit);
                              setShowCreditModal(true);
                            }}
                            className="p-1.5 text-light/60 hover:text-primary hover:bg-dark-200 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Summary footer */}
          <div className="p-4 border-t border-dark-200 flex flex-wrap items-center justify-between gap-4">
            <div className="text-light/60">
              Showing {filteredCredits.length} of {credits.length} credits
            </div>
            
            <div className="flex items-center gap-3">
              {selectedMonth !== 'all' && (
                <button
                  onClick={() => handleRecalculateMonth(selectedMonth)}
                  className="flex items-center gap-2 bg-dark-200 hover:bg-dark-300 text-light px-4 py-2 rounded-lg transition-colors"
                >
                  <RefreshCw size={16} />
                  Recalculate {selectedMonth !== 'all' ? new Date(selectedMonth + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'Selected'} Credits
                </button>
              )}
              
              <button
                onClick={() => {
                  // Implementation would depend on your export functionality
                  alert('Export functionality would be implemented here');
                }}
                className="flex items-center gap-2 bg-dark-200 hover:bg-dark-300 text-light px-4 py-2 rounded-lg transition-colors"
              >
                <Download size={16} />
                Export to CSV
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* Add Credit Modal */}
      {showAddCreditModal && (
        <div className="fixed inset-0 bg-dark/80 flex items-center justify-center z-50 p-4">
          <Card variant="dark" className="w-full max-w-md">
            <div className="flex items-center justify-between border-b border-dark-200 p-4">
              <h2 className="text-xl font-bold text-light">Add New Wattage Credit</h2>
              <button
                onClick={() => setShowAddCreditModal(false)}
                className="text-light/60 hover:text-light"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* User selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-light/80">User</label>
                <select
                  value={newCredit.user_id}
                  onChange={(e) => setNewCredit({...newCredit, user_id: e.target.value})}
                  className="w-full bg-dark-200 border border-dark-200 rounded-lg px-3 py-2 text-light focus:outline-none focus:border-primary"
                >
                  <option value="">Select User</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.full_name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Project selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-light/80">Project</label>
                <select
                  value={newCredit.project_id}
                  onChange={(e) => setNewCredit({...newCredit, project_id: e.target.value})}
                  className="w-full bg-dark-200 border border-dark-200 rounded-lg px-3 py-2 text-light focus:outline-none focus:border-primary"
                >
                  <option value="">Select Project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name} ({project.location})
                    </option>
                  ))}
                </select>
              </div>

              {/* Month selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-light/80">Month</label>
                <input
                  type="month"
                  value={newCredit.month}
                  onChange={(e) => setNewCredit({...newCredit, month: e.target.value})}
                  className="w-full bg-dark-200 border border-dark-200 rounded-lg px-3 py-2 text-light focus:outline-none focus:border-primary"
                />
              </div>

              {/* kWh amount */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-light/80">kWh Amount</label>
                <input
                  type="number"
                  value={newCredit.amount}
                  onChange={(e) => {
                    const amount = parseFloat(e.target.value);
                    // Auto-calculate value based on a rate (e.g., 8 ₹ per kWh)
                    const value = amount * 8; // This would be your tariff rate
                    setNewCredit({...newCredit, amount, value});
                  }}
                  min="0"
                  step="0.01"
                  className="w-full bg-dark-200 border border-dark-200 rounded-lg px-3 py-2 text-light focus:outline-none focus:border-primary"
                />
              </div>

              {/* ₹ Value */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-light/80">Value (₹)</label>
                <input
                  type="number"
                  value={newCredit.value}
                  onChange={(e) => setNewCredit({...newCredit, value: parseFloat(e.target.value)})}
                  min="0"
                  step="1"
                  className="w-full bg-dark-200 border border-dark-200 rounded-lg px-3 py-2 text-light focus:outline-none focus:border-primary"
                />
              </div>

              {/* Redeemed status */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="redeemed"
                  checked={newCredit.redeemed}
                  onChange={(e) => setNewCredit({...newCredit, redeemed: e.target.checked})}
                  className="h-4 w-4 rounded border-dark-200 text-primary focus:ring-primary"
                />
                <label htmlFor="redeemed" className="text-sm text-light/80">
                  Mark as already redeemed
                </label>
              </div>

              {error && <div className="text-sm text-error">{error}</div>}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowAddCreditModal(false)}
                  className="px-4 py-2 border border-dark-200 rounded-lg text-light hover:bg-dark-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCredit}
                  className="px-4 py-2 bg-primary text-dark font-medium rounded-lg hover:bg-primary-hover transition-colors"
                >
                  Add Credit
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* View Credit Details Modal */}
      {showCreditModal && selectedCredit && (
        <div className="fixed inset-0 bg-dark/80 flex items-center justify-center z-50 p-4">
          <Card variant="dark" className="w-full max-w-md">
            <div className="flex items-center justify-between border-b border-dark-200 p-4">
              <h2 className="text-xl font-bold text-light">Wattage Credit Details</h2>
              <button
                onClick={() => setShowCreditModal(false)}
                className="text-light/60 hover:text-light"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-light/60">User</div>
                  <div className="font-medium">{selectedCredit.user_profile?.full_name || 'Unknown'}</div>
                  <div className="text-sm text-light/60">{selectedCredit.user_profile?.email}</div>
                </div>
                
                <div>
                  <div className="text-sm text-light/60">Project</div>
                  <div className="font-medium">{selectedCredit.project?.name || 'Unknown'}</div>
                  <div className="text-sm text-light/60">{selectedCredit.project?.location}</div>
                </div>

                <div>
                  <div className="text-sm text-light/60">Month</div>
                  <div className="font-medium">{formatMonthDisplay(selectedCredit.month)}</div>
                </div>

                <div>
                  <div className="text-sm text-light/60">Created At</div>
                  <div className="font-medium">{new Date(selectedCredit.created_at).toLocaleDateString()}</div>
                </div>
                
                <div>
                  <div className="text-sm text-light/60">kWh Generated</div>
                  <div className="font-medium flex items-center gap-1">
                    <Zap size={16} className="text-primary" />
                    {selectedCredit.amount.toFixed(2)}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-light/60">Value</div>
                  <div className="font-medium text-primary">{formatCurrency(selectedCredit.value)}</div>
                </div>

                <div className="col-span-2">
                  <div className="text-sm text-light/60">Status</div>
                  <div className="font-medium">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                        selectedCredit.redeemed 
                          ? 'bg-success/10 text-success' 
                          : 'bg-warning/10 text-warning'
                      }`}
                    >
                      {selectedCredit.redeemed ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {selectedCredit.redeemed ? 'Redeemed' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-dark-200 pt-4 flex justify-end gap-3">
                <button
                  onClick={() => handleToggleRedeemed(selectedCredit)}
                  className="px-4 py-2 border border-dark-200 rounded-lg text-light hover:bg-dark-200 transition-colors flex items-center gap-2"
                >
                  {selectedCredit.redeemed ? <XCircle size={16} /> : <CheckCircle size={16} />}
                  {selectedCredit.redeemed ? 'Mark as Pending' : 'Mark as Redeemed'}
                </button>
                <button
                  onClick={() => setShowCreditModal(false)}
                  className="px-4 py-2 bg-primary text-dark font-medium rounded-lg hover:bg-primary-hover transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
};

export default WattageCreditsAdmin;
