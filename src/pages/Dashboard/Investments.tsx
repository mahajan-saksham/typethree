import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ChevronRight, AlertTriangle, Check, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface Investment {
  id: string;
  project: string;
  amount: number;
  irr: number;
  wattage: number;
  status: 'live' | 'generating' | 'pending';
  created_at: string;
}

const Investments: React.FC = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);

  // Fetch investments data from Supabase
  useEffect(() => {
    const fetchInvestments = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('investments')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        if (data) {
          setInvestments(data as Investment[]);
        } else {
          // If no real data, use mock data for demonstration
          setInvestments([
            {
              id: '1',
              project: 'Indore Solar Farm - Phase 1',
              amount: 25000,
              irr: 14.5,
              wattage: 1.8,
              status: 'live',
              created_at: '2025-01-15'
            },
            {
              id: '2',
              project: 'Ujjain Rooftop Collective',
              amount: 10000,
              irr: 12.7,
              wattage: 0.8,
              status: 'generating',
              created_at: '2025-02-22'
            },
            {
              id: '3',
              project: 'Bhopal Agrivoltaic Project',
              amount: 15000,
              irr: 13.2,
              wattage: 1.2,
              status: 'pending',
              created_at: '2025-03-10'
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching investments:', error);
      } finally {
        // Simulate a small delay to show loading state
        setTimeout(() => {
          setIsLoading(false);
        }, 800);
      }
    };

    fetchInvestments();
  }, []);

  // Status indicators
  const renderStatus = (status: Investment['status']) => {
    switch (status) {
      case 'live':
        return (
          <span className="flex items-center text-green-400 text-sm">
            <Check className="h-4 w-4 mr-1" />
            Live
          </span>
        );
      case 'generating':
        return (
          <span className="flex items-center text-amber-400 text-sm">
            <AlertTriangle className="h-4 w-4 mr-1" />
            Generating
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center text-blue-400 text-sm">
            <TrendingUp className="h-4 w-4 mr-1" />
            Pending
          </span>
        );
      default:
        return null;
    }
  };

  // Show performance details modal
  const showPerformanceDetails = (investment: Investment) => {
    setSelectedInvestment(investment);
  };

  return (
    <div className="min-h-screen">
      <section className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-light">My Investments</h1>
            <p className="text-light/60 mt-1">Track and manage your solar portfolio</p>
          </div>
          <button className="mt-4 md:mt-0 bg-primary hover:bg-primary/90 text-dark font-medium rounded-lg px-4 py-2 flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add New Investment
          </button>
        </div>
      </section>

      {/* Investments Table */}
      <section className="mb-8">
        <div className="bg-dark-100 border border-white/10 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 flex justify-center items-center">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : investments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="bg-dark-200 p-6 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-light mb-2">No investments yet</h3>
              <p className="text-light/60 mb-6 max-w-md mx-auto">
                Ready to make your first investment in clean energy? Start with as little as ₹25,000.
              </p>
              <button className="bg-primary hover:bg-primary/90 text-dark font-medium rounded-lg px-6 py-3">
                Invest Now
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-dark-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-light/60 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light/60 uppercase tracking-wider">Invested</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light/60 uppercase tracking-wider">IRR</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light/60 uppercase tracking-wider">Wattage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light/60 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-light/60 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {investments.map((investment) => (
                    <motion.tr 
                      key={investment.id}
                      className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                      onClick={() => showPerformanceDetails(investment)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-light">{investment.project}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-light">₹{investment.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-light">{investment.irr}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-light">{investment.wattage} kW</td>
                      <td className="px-6 py-4 whitespace-nowrap">{renderStatus(investment.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button className="text-primary hover:text-primary/80">
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Performance Summary */}
      <section className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-dark-100 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-light mb-4">Portfolio Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-light/60">Total Invested</span>
              <span className="text-light font-medium">₹{investments.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-light/60">Average IRR</span>
              <span className="text-light font-medium">
                {investments.length > 0 ? (investments.reduce((sum, inv) => sum + inv.irr, 0) / investments.length).toFixed(1) : '0'}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-light/60">Total Wattage</span>
              <span className="text-light font-medium">
                {investments.reduce((sum, inv) => sum + inv.wattage, 0).toFixed(1)} kW
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-light/60">Active Projects</span>
              <span className="text-light font-medium">
                {investments.filter(inv => inv.status === 'live' || inv.status === 'generating').length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-dark-100 border border-white/10 rounded-xl p-6 col-span-1 lg:col-span-2">
          <h3 className="text-lg font-bold text-light mb-4">Investment Opportunities</h3>
          <div className="border border-primary/20 rounded-lg p-4 bg-primary/5">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-primary">New: Dewas Industrial Solar Park</h4>
              <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded">14.8% IRR</span>
            </div>
            <p className="text-light/70 text-sm mb-3">
              Our newest project offers premium returns with 15-year power purchase agreements with Fortune 500 companies.
            </p>
            <div className="flex justify-between items-center text-sm">
              <span className="text-light/60">Min. Investment: ₹25,000</span>
              <button className="text-primary font-medium flex items-center">
                <span>View Details</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Details Modal */}
      {selectedInvestment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div 
            className="bg-dark-100 border border-white/10 rounded-xl p-6 max-w-md w-full mx-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-light">{selectedInvestment.project}</h3>
              <button 
                onClick={() => setSelectedInvestment(null)}
                className="text-light/60 hover:text-light"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-light/60">Investment Date</span>
                <span className="text-light">{new Date(selectedInvestment.created_at).toLocaleDateString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-light/60">Amount</span>
                <span className="text-light">₹{selectedInvestment.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-light/60">IRR</span>
                <span className="text-light">{selectedInvestment.irr}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-light/60">Wattage</span>
                <span className="text-light">{selectedInvestment.wattage} kW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-light/60">Status</span>
                <span>{renderStatus(selectedInvestment.status)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-light/60">Monthly Earnings</span>
                <span className="text-green-400">₹{Math.round(selectedInvestment.amount * selectedInvestment.irr / 100 / 12).toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex space-x-3">
              <button className="bg-primary hover:bg-primary/90 text-dark font-medium rounded-lg px-4 py-2 flex-1">
                View Details
              </button>
              <button className="bg-white/10 hover:bg-white/20 text-light font-medium rounded-lg px-4 py-2 flex-1">
                Manage
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Investments;
