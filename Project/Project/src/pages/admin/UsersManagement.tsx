import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import AdminLayout from '../../components/admin/AdminLayout';
import { Search, Filter, Download, AlertTriangle, Eye, Edit, X, CheckCircle, XCircle, User, UserCheck, UserX } from 'lucide-react';
import { Card } from '../../components/Card';

const roleColors: Record<string, string> = {
  admin: 'bg-red-600 text-white',
  sales: 'bg-blue-600 text-white',
  ops: 'bg-green-600 text-white',
  viewer: 'bg-gray-500 text-white',
};

interface UserProfile {
  id: string;
  created_at: string;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  kyc_status?: 'pending' | 'verified' | 'rejected';
  referral_code?: string;
}

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedKycStatus, setSelectedKycStatus] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  
  // Fetch all users
  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setUsers(data || []);
        setFilteredUsers(data || []);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    }
    
    fetchUsers();
  }, []);
  
  // Apply filters and search
  useEffect(() => {
    let result = [...users];
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(user => 
        user.email?.toLowerCase().includes(query) ||
        user.full_name?.toLowerCase().includes(query) ||
        (user.phone && user.phone.includes(query)) ||
        (user.referral_code && user.referral_code.toLowerCase().includes(query))
      );
    }
    
    // Apply role filter
    if (selectedRole !== 'all') {
      result = result.filter(user => user.role === selectedRole);
    }
    
    // Apply KYC status filter
    if (selectedKycStatus !== 'all') {
      result = result.filter(user => user.kyc_status === selectedKycStatus);
    }
    
    setFilteredUsers(result);
  }, [users, searchQuery, selectedRole, selectedKycStatus]);
  
  // Handle user view
  const handleViewUser = (user: UserProfile) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };
  
  // Export users to CSV
  const exportToCSV = () => {
    const headers = ['Full Name', 'Email', 'Phone', 'Role', 'KYC Status', 'Referral Code', 'Joined Date'];
    const csvData = filteredUsers.map(user => [
      user.full_name,
      user.email,
      user.phone || 'N/A',
      user.role,
      user.kyc_status || 'N/A',
      user.referral_code || 'N/A',
      new Date(user.created_at).toLocaleDateString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `type3_users_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout title="Users Management">
      <div className="space-y-6">
        {/* Search and Filters */}
        <Card className="bg-dark-100 border border-dark-300 rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light/50 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by name, email, phone..."
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
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="sales">Sales</option>
                  <option value="ops">Operations</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-light/50" />
                <select
                  className="bg-dark-200 text-light border border-dark-200 rounded-lg px-3 py-2 focus:border-primary focus:outline-none"
                  value={selectedKycStatus}
                  onChange={(e) => setSelectedKycStatus(e.target.value)}
                >
                  <option value="all">All KYC</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
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
        
        {/* Users Table */}
        <Card className="bg-dark-100 border border-dark-300 rounded-xl p-6">
          <div className="flex justify-between mb-4">
            <h2 className="text-lg font-bold text-light">
              {filteredUsers.length} User{filteredUsers.length !== 1 ? 's' : ''}
            </h2>
            
            <div className="text-sm text-light/60">
              {selectedRole !== 'all' && <span className="bg-dark-200 px-2 py-1 rounded mr-2">{selectedRole}</span>}
              {selectedKycStatus !== 'all' && <span className="bg-dark-200 px-2 py-1 rounded">{selectedKycStatus}</span>}
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
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-light/60">
              <User className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No users match your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-dark-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light/50 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light/50 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light/50 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light/50 uppercase tracking-wider">KYC Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light/50 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-light/50 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-dark-200/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-dark-200 rounded-full flex items-center justify-center">
                            <span className="text-light/70">{user.full_name?.charAt(0)?.toUpperCase() || 'U'}</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-light">{user.full_name}</div>
                            <div className="text-sm text-light/60">{user.referral_code || 'No referral code'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-light">{user.email}</div>
                        <div className="text-sm text-light/60">{user.phone || 'No phone'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${roleColors[user.role] || 'bg-dark-200 text-light/80'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.kyc_status === 'verified' ? (
                          <div className="flex items-center text-green-400">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span>Verified</span>
                          </div>
                        ) : user.kyc_status === 'rejected' ? (
                          <div className="flex items-center text-red-400">
                            <XCircle className="h-4 w-4 mr-1" />
                            <span>Rejected</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-yellow-400">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            <span>Pending</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-light/80">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="p-1.5 rounded-lg bg-dark-300 hover:bg-dark-400 text-primary transition-colors"
                          >
                            <Eye className="h-4 w-4" />
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
        
        {/* User Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <Card className="bg-dark-100 border border-dark-300 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-light">User Profile</h2>
                <button 
                  onClick={() => setShowUserModal(false)}
                  className="text-light/60 hover:text-light"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-light/60 text-sm mb-1">Full Name</h3>
                  <p className="text-light font-medium">{selectedUser.full_name || 'N/A'}</p>
                </div>
                
                <div>
                  <h3 className="text-light/60 text-sm mb-1">Email</h3>
                  <p className="text-light font-medium">{selectedUser.email}</p>
                </div>
                
                <div>
                  <h3 className="text-light/60 text-sm mb-1">Phone</h3>
                  <p className="text-light font-medium">{selectedUser.phone || 'Not provided'}</p>
                </div>
                
                <div>
                  <h3 className="text-light/60 text-sm mb-1">Joined</h3>
                  <p className="text-light font-medium">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                </div>
                
                <div>
                  <h3 className="text-light/60 text-sm mb-1">Role</h3>
                  <p className="text-light font-medium">{selectedUser.role}</p>
                </div>
                
                <div>
                  <h3 className="text-light/60 text-sm mb-1">KYC Status</h3>
                  {selectedUser.kyc_status === 'verified' ? (
                    <div className="flex items-center text-green-400">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span>Verified</span>
                    </div>
                  ) : selectedUser.kyc_status === 'rejected' ? (
                    <div className="flex items-center text-red-400">
                      <XCircle className="h-4 w-4 mr-1" />
                      <span>Rejected</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-yellow-400">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      <span>Pending</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default UsersManagement;
