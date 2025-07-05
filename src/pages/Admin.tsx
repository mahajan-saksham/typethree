import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Card } from '../components/Card';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';

// Define types for our data
interface ROILog {
  id: string;
  created_at: string;
  calculator_type: 'rooftop' | 'investment';
  input_data: any;
  results: any;
}

interface UserProfile {
  id: string;
  created_at: string;
  email: string;
  full_name: string;
  phone: string;
  role: string;
}

function Admin() {
  const [activeTab, setActiveTab] = useState<'roi_logs' | 'users' | 'dashboard'>('dashboard');
  const [roiLogs, setRoiLogs] = useState<ROILog[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch data from Supabase
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      
      try {
        if (activeTab === 'roi_logs') {
          const { data, error } = await supabase
            .from('roi_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);
          
          if (error) throw error;
          setRoiLogs(data || []);
        } else if (activeTab === 'users') {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          setUsers(data || []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [activeTab]);

  return (
    <AdminLayout title="Admin Dashboard">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-light">Admin Dashboard</h1>
        </div>
        
        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-dark-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`${activeTab === 'dashboard' ? 
                  'border-primary text-primary' : 
                  'border-transparent text-light/60 hover:text-light/80 hover:border-light/20'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium transition-colors`}
              >
                Dashboard Overview
              </button>
              <button
                onClick={() => setActiveTab('roi_logs')}
                className={`${activeTab === 'roi_logs' ? 
                  'border-primary text-primary' : 
                  'border-transparent text-light/60 hover:text-light/80 hover:border-light/20'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium transition-colors`}
              >
                ROI Calculator Logs
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`${activeTab === 'users' ? 
                  'border-primary text-primary' : 
                  'border-transparent text-light/60 hover:text-light/80 hover:border-light/20'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium transition-colors`}
              >
                User Management
              </button>
            </nav>
          </div>
        </div>
        
        {/* Content */}
        <Card variant="glass" padding="lg" className="backdrop-blur-xl mb-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 p-4 text-center">{error}</div>
          ) : (
            <div>
              {activeTab === 'dashboard' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* Quick Access Cards */}
                  <Card variant="dark" className="p-6 hover:border-primary/20 transition-colors cursor-pointer" onClick={() => navigate('/admin/investments')}>
                    <h3 className="text-xl font-semibold text-light mb-2">Investments Management</h3>
                    <p className="text-light/60 mb-4">Manage user investments, IRR, and returns</p>
                    <div className="flex justify-end">
                      <button className="text-primary hover:underline text-sm font-medium">View Details →</button>
                    </div>
                  </Card>
                  
                  <Card variant="dark" className="p-6 hover:border-primary/20 transition-colors cursor-pointer" onClick={() => navigate('/admin/wattage-credits')}>
                    <h3 className="text-xl font-semibold text-light mb-2">Wattage Credits</h3>
                    <p className="text-light/60 mb-4">Manage energy production and payouts</p>
                    <div className="flex justify-end">
                      <button className="text-primary hover:underline text-sm font-medium">View Details →</button>
                    </div>
                  </Card>
                  
                  <Card variant="dark" className="p-6 hover:border-primary/20 transition-colors cursor-pointer">
                    <h3 className="text-xl font-semibold text-light mb-2">User Analytics</h3>
                    <p className="text-light/60 mb-4">View user growth and engagement metrics</p>
                    <div className="flex justify-end">
                      <button className="text-primary hover:underline text-sm font-medium">View Details →</button>
                    </div>
                  </Card>
                </div>
              )}
              
              {activeTab === 'roi_logs' && (
                <div>
                  <h2 className="text-2xl font-bold text-light mb-6">ROI Calculator Logs</h2>
                  
                  {roiLogs.length === 0 ? (
                    <p className="text-light/60 text-center py-10">No ROI calculator logs found</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-dark-200">
                        <thead>
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-light/50 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-light/50 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-light/50 uppercase tracking-wider">Inputs</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-light/50 uppercase tracking-wider">Results</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-200">
                          {roiLogs.map((log) => (
                            <tr key={log.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-light/80">
                                {new Date(log.created_at).toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-light/80">
                                {log.calculator_type === 'rooftop' ? 'Installation' : 'Investment'}
                              </td>
                              <td className="px-6 py-4 text-sm text-light/80">
                                <pre className="max-h-20 overflow-y-auto p-2 bg-dark-200 rounded">
                                  {JSON.stringify(log.input_data, null, 2)}
                                </pre>
                              </td>
                              <td className="px-6 py-4 text-sm text-light/80">
                                <pre className="max-h-20 overflow-y-auto p-2 bg-dark-200 rounded">
                                  {JSON.stringify(log.results?.slice(0, 3), null, 2)}
                                  {log.results?.length > 3 && '...'}
                                </pre>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'users' && (
                <div>
                  <h2 className="text-2xl font-bold text-light mb-6">User Profiles</h2>
                  
                  {users.length === 0 ? (
                    <p className="text-light/70 text-center py-10">No user profiles found.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-transparent">
                        <thead className="border-b border-light/10">
                          <tr>
                            <th className="py-3 text-left text-light/70">Name</th>
                            <th className="py-3 text-left text-light/70">Email</th>
                            <th className="py-3 text-left text-light/70">Role</th>
                            <th className="py-3 text-left text-light/70">Joined</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <tr key={user.id} className="border-b border-light/5 hover:bg-light/5">
                              <td className="py-3 text-light">{user.full_name}</td>
                              <td className="py-3 text-light">{user.email}</td>
                              <td className="py-3 text-light">{user.role}</td>
                              <td className="py-3 text-light/70">
                                {new Date(user.created_at).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </Card>
        
        {/* Info Card */}
        <Card variant="dark" padding="md" className="mb-8">
          <div className="text-light/60 text-sm">
            <p className="mb-2"><strong>Supabase Project URL:</strong> {import.meta.env.VITE_SUPABASE_URL}</p>
            <p>For more advanced database management, access the <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Supabase Dashboard</a>.</p>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}

export default Admin;