import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import AdminLayout from '../../components/admin/AdminLayout';
import { Bar } from 'react-chartjs-2';
import { Card } from '../../components/Card';
import {
  Users as UsersIcon,
  Home,
  Zap,
  ArrowUpRight,
  Check,
  Calendar,
  BarChart4,
  ExternalLink
} from 'lucide-react';

// Chart.js registration code
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardStats {
  totalCustomers: number;
  activeInstallations: number;
  completedInstallations: number;
  totalCapacity: number;
  scheduledConsultations: number;
  averageSystemSize: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    activeInstallations: 0,
    completedInstallations: 0,
    totalCapacity: 0,
    scheduledConsultations: 0,
    averageSystemSize: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any>(null);

  // Helper function to set default empty chart data
  const setDefaultChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const endDate = new Date();
    const labels = [];
    
    // Get labels for last 6 months
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (endDate.getMonth() - i + 12) % 12;
      labels.push(months[monthIndex]);
    }
    
    setChartData({
      labels,
      datasets: [
        {
          label: 'Monthly Installed Capacity (kW)',
          data: [0, 0, 0, 0, 0, 0], // Empty data for all 6 months
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    });
  };

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        let totalCustomers = 0;
        let activeInstallations = 0;
        let completedInstallations = 0;
        let scheduledConsultations = 0;
        let totalCapacity = 0;
        let averageSystemSize = 0;
        
        // Get total customers count
        try {
          const { count, error } = await supabase
            .from('user_profiles')
            .select('*', { count: 'exact', head: true });
            
          if (!error) {
            totalCustomers = count || 0;
          }
        } catch (err) {
          console.warn('Error fetching user profiles:', err);
          // Continue with other queries
        }
        
        // Get active installations count
        try {
          const { count, error } = await supabase
            .from('installations')
            .select('*', { count: 'exact', head: true })
            .in('status', ['scheduled', 'in_progress']);
            
          if (!error) {
            activeInstallations = count || 0;
          }
        } catch (err) {
          console.warn('Error fetching active installations:', err);
          // Continue with other queries
        }
        
        // Get completed installations count
        try {
          const { count, error } = await supabase
            .from('installations')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'completed');
          
          if (!error) {
            completedInstallations = count || 0;
          }
        } catch (err) {
          console.warn('Error fetching completed installations:', err);
          // Continue with other queries
        }

        // Get scheduled consultations count
        try {
          const { count, error } = await supabase
            .from('consultations')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'scheduled');
          
          if (!error) {
            scheduledConsultations = count || 0;
          }
        } catch (err) {
          console.warn('Error fetching consultations:', err);
          // Continue with other queries
        }
        
        // Get systems data for capacity calculations
        try {
          const { data, error } = await supabase
            .from('rooftop_systems')
            .select('capacity_kw');
            
          if (!error && data && data.length > 0) {
            totalCapacity = data.reduce((sum, sys) => sum + (Number(sys.capacity_kw) || 0), 0);
            averageSystemSize = totalCapacity / data.length;
          }
        } catch (err) {
          console.warn('Error fetching rooftop systems:', err);
          // Continue with other queries
        }
        
        setStats({
          totalCustomers,
          activeInstallations,
          completedInstallations,
          totalCapacity,
          scheduledConsultations,
          averageSystemSize
        });
        
        // Generate monthly installation data for chart
        try {
          await generateChartData();
        } catch (err) {
          console.warn('Error generating chart data:', err);
          // Still update the dashboard with the stats we have
        }
        
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data' + (err?.message ? `: ${err.message}` : ''));
      } finally {
        setLoading(false);
      }
    }
    
    async function generateChartData() {
      try {
        // Get installations for the past 6 months
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 5); // Last 6 months including current
        
        const { data, error } = await supabase
          .from('installations')
          .select('capacity_kw, created_at')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
          .order('created_at', { ascending: true });
          
        if (error) {
          console.warn('Error fetching installation data for chart:', error);
          setDefaultChartData();
          return;
        }
        
        if (!data || data.length === 0) {
          // No installation data available, set default empty chart
          setDefaultChartData();
          return;
        }
        
        // Group by month and sum capacity
        const monthlyData: {[key: string]: number} = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Initialize past 6 months with 0
        for (let i = 0; i < 6; i++) {
          const monthIndex = (endDate.getMonth() - i + 12) % 12;
          const yearMonthKey = `${months[monthIndex]}`;
          monthlyData[yearMonthKey] = 0;
        }
        
        // Populate with actual data
        data?.forEach(installation => {
          const date = new Date(installation.created_at);
          const monthName = months[date.getMonth()];
          monthlyData[monthName] = (monthlyData[monthName] || 0) + Number(installation.capacity_kw);
        });
        
        // Reverse to chronological order
        const labels = Object.keys(monthlyData).reverse();
        const values = labels.map(label => monthlyData[label]);
        
        setChartData({
          labels,
          datasets: [
            {
              label: 'Monthly Installed Capacity (kW)',
              data: values,
              backgroundColor: '#CCFF00',
              borderRadius: 4
            }
          ]
        });
        
      } catch (err) {
        console.error('Error generating chart data:', err);
      }
    }
    
    fetchDashboardData();
  }, []);

  return (
    <AdminLayout title="Rooftop Solar Admin">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-dark-100 border border-red-500/50 rounded-xl p-6 text-light mb-8">
          <Check className="h-6 w-6 text-red-500 mb-2" />
          <h3 className="text-xl font-bold mb-1">Error</h3>
          <p>{error}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total Customers Card */}
            <Card className="p-6 bg-dark-100 border border-white/10 rounded-xl">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg text-light/60 font-medium mb-3">Total Customers</h2>
                  <p className="text-4xl font-bold text-light">{stats.totalCustomers.toLocaleString()}</p>
                  
                  <div className="mt-3 flex items-center">
                    <div className="text-xs font-medium rounded-full px-2 py-1 bg-blue-400/10 text-blue-400 flex items-center">
                      <span>Rooftop Solar System Owners</span>
                    </div>
                  </div>
                </div>
                <div className="bg-primary/10 p-3 rounded-xl">
                  <UsersIcon className="h-8 w-8 text-primary" />
                </div>
              </div>
            </Card>
            
            {/* Active Installations Card */}
            <Card className="p-6 bg-dark-100 border border-white/10 rounded-xl">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg text-light/60 font-medium mb-3">Active Installations</h2>
                  <p className="text-4xl font-bold text-light">{stats.activeInstallations.toLocaleString()}</p>
                  
                  <div className="mt-3 flex items-center">
                    <Home className="h-3.5 w-3.5 text-blue-400 mr-1" />
                    <span className="text-xs font-medium text-blue-400">
                      In progress & scheduled
                    </span>
                  </div>
                </div>
                <div className="bg-blue-500/10 p-3 rounded-xl">
                  <Home className="h-8 w-8 text-blue-500" />
                </div>
              </div>
            </Card>
            
            {/* Total Capacity Card */}
            <Card className="p-6 bg-dark-100 border border-white/10 rounded-xl">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg text-light/60 font-medium mb-3">Total Capacity</h2>
                  <p className="text-4xl font-bold text-light">{stats.totalCapacity.toLocaleString()} kW</p>
                  
                  <div className="mt-3 flex items-center">
                    <Zap className="h-3.5 w-3.5 text-primary mr-1" />
                    <span className="text-xs font-medium text-primary">
                      {stats.averageSystemSize.toFixed(2)} kW avg system size
                    </span>
                  </div>
                </div>
                <div className="bg-primary/10 p-3 rounded-xl">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
              </div>
            </Card>

            {/* Completed Installations Card */}
            <Card className="p-6 bg-dark-100 border border-white/10 rounded-xl md:col-span-1 lg:col-span-1">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg text-light/60 font-medium mb-3">Completed Installations</h2>
                  <p className="text-4xl font-bold text-light">{stats.completedInstallations}</p>
                  
                  <div className="mt-3">
                    <span className="text-xs font-medium rounded-full px-2 py-1 bg-green-400/10 text-green-400">
                      All systems operational
                    </span>
                  </div>
                </div>
                <div className="bg-green-400/10 p-3 rounded-xl">
                  <Check className="h-8 w-8 text-green-400" />
                </div>
              </div>
            </Card>

            {/* Scheduled Consultations Card */}
            <Card className="p-6 bg-dark-100 border border-white/10 rounded-xl">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg text-light/60 font-medium mb-3">Scheduled Consultations</h2>
                  <p className="text-4xl font-bold text-light">{stats.scheduledConsultations}</p>
                  
                  <div className="mt-3 flex items-center">
                    <Calendar className="h-3.5 w-3.5 text-amber-400 mr-1" />
                    <span className="text-xs font-medium text-amber-400">
                      Upcoming site assessments
                    </span>
                  </div>
                </div>
                <div className="bg-amber-400/10 p-3 rounded-xl">
                  <Calendar className="h-8 w-8 text-amber-400" />
                </div>
              </div>
            </Card>
          </div>

          {/* Chart */}
          <Card className="p-6 bg-dark-100 border border-white/10 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-light">Monthly Installation Capacity</h2>
              <BarChart4 className="h-5 w-5 text-light/60" />
            </div>
            <div className="h-64">
              {chartData && (
                <Bar 
                  data={chartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                          color: 'rgba(255, 255, 255, 0.6)'
                        }
                      },
                      x: {
                        grid: {
                          display: false
                        },
                        ticks: {
                          color: 'rgba(255, 255, 255, 0.6)'
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }}
                />
              )}
            </div>
          </Card>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 bg-dark-100 border border-white/10 rounded-xl">
              <h3 className="text-lg font-bold text-light mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link to="/admin/rooftop-installations" className="flex items-center justify-between p-3 bg-dark-200 hover:bg-dark-300 rounded-lg transition-colors">
                  <span className="text-light">Manage Installations</span>
                  <ArrowUpRight className="h-4 w-4 text-primary" />
                </Link>
                <Link to="/admin/product-skus" className="flex items-center justify-between p-3 bg-dark-200 hover:bg-dark-300 rounded-lg transition-colors">
                  <span className="text-light">Product SKUs</span>
                  <ArrowUpRight className="h-4 w-4 text-primary" />
                </Link>
              </div>
            </Card>
            
            <Card className="p-6 bg-dark-100 border border-white/10 rounded-xl">
              <h3 className="text-lg font-bold text-light mb-4">Recent Updates</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-dark-200 rounded-lg">
                  <Check className="h-5 w-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-light font-medium">System Migration Complete</p>
                    <p className="text-sm text-light/60">Successfully migrated to rooftop-only focus</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-dark-200 rounded-lg">
                  <Zap className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-light font-medium">New Product SKU Management</p>
                    <p className="text-sm text-light/60">Added ability to manage product SKUs for installations</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
