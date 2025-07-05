import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowUp, RefreshCw, Download, Info } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface WattageCredit {
  id: string;
  month: string;
  kwh: number;
  payout_rate: number;
  status: 'pending' | 'available' | 'redeemed' | 'reinvested';
}

const Credits: React.FC = () => {
  const [credits, setCredits] = useState<WattageCredit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  
  // Credit summary data
  const [summary, setSummary] = useState({
    currentBalance: 0,
    avgMonthlyGeneration: 0,
    payoutRate: 0,
    estimatedEarnings: 0
  });

  // Fetch wattage credits data
  useEffect(() => {
    const fetchCredits = async () => {
      setIsLoading(true);
      try {
        // In a real app, we would fetch from Supabase
        const { data, error } = await supabase
          .from('wattage_credits')
          .select('*')
          .order('month', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          setCredits(data as WattageCredit[]);
          
          // Calculate summary data
          const totalKwh = data.reduce((sum, credit) => {
            return credit.status !== 'redeemed' ? sum + credit.kwh : sum;
          }, 0);
          
          const avg = data.length > 0 
            ? data.reduce((sum, credit) => sum + credit.kwh, 0) / data.length 
            : 0;
            
          const rate = data.length > 0 ? data[0].payout_rate : 7.5;
          
          setSummary({
            currentBalance: totalKwh,
            avgMonthlyGeneration: avg,
            payoutRate: rate,
            estimatedEarnings: avg * rate
          });
          
        } else {
          // Mock data for demonstration
          const mockCredits: WattageCredit[] = [
            {
              id: '1',
              month: '2025-03',
              kwh: 320,
              payout_rate: 7.5,
              status: 'available'
            },
            {
              id: '2',
              month: '2025-02',
              kwh: 290,
              payout_rate: 7.5,
              status: 'redeemed'
            },
            {
              id: '3',
              month: '2025-01',
              kwh: 310,
              payout_rate: 7.25,
              status: 'reinvested'
            },
            {
              id: '4',
              month: '2024-12',
              kwh: 280,
              payout_rate: 7.25,
              status: 'redeemed'
            },
          ];
          
          setCredits(mockCredits);
          
          // Mock summary data
          const availableCredits = mockCredits.filter(c => c.status === 'available');
          const totalKwh = availableCredits.reduce((sum, credit) => sum + credit.kwh, 0);
          const avg = mockCredits.reduce((sum, credit) => sum + credit.kwh, 0) / mockCredits.length;
          const rate = 7.5; // Current payout rate
          
          setSummary({
            currentBalance: totalKwh,
            avgMonthlyGeneration: avg,
            payoutRate: rate,
            estimatedEarnings: avg * rate
          });
        }
      } catch (error) {
        console.error('Error fetching wattage credits:', error);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 800);
      }
    };

    fetchCredits();
  }, []);

  // Format month string to readable format
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  // Render status badge
  const renderStatus = (status: WattageCredit['status']) => {
    switch (status) {
      case 'available':
        return <span className="px-2 py-1 bg-green-400/20 text-green-400 text-xs rounded-full">Available</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-blue-400/20 text-blue-400 text-xs rounded-full">Pending</span>;
      case 'redeemed':
        return <span className="px-2 py-1 bg-amber-400/20 text-amber-400 text-xs rounded-full">Redeemed</span>;
      case 'reinvested':
        return <span className="px-2 py-1 bg-purple-400/20 text-purple-400 text-xs rounded-full">Reinvested</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <section className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-light">Wattage Credits</h1>
            <p className="text-light/60 mt-1">Track and manage your solar energy earnings</p>
          </div>
        </div>
      </section>

      {/* Watt Tracker */}
      <section className="mb-8">
        <div className="bg-dark-100 border border-white/10 rounded-xl p-6">
          <div className="flex items-center mb-6">
            <h2 className="text-xl font-bold text-light">Watt Tracker</h2>
            <div className="relative ml-2">
              <Info 
                className="h-4 w-4 text-light/40 cursor-help"
                onMouseEnter={() => setTooltipVisible(true)}
                onMouseLeave={() => setTooltipVisible(false)}
              />
              {tooltipVisible && (
                <div className="absolute z-10 w-64 p-3 bg-dark-200 border border-white/10 rounded-lg text-xs text-light/80 -translate-x-1/2 left-1/2 bottom-full mb-2">
                  Wattage credits represent the electricity generated by your rooftop solar system. These can be redeemed for cash or applied to future bills.
                </div>
              )}
            </div>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-white/5 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-dark-200 rounded-lg p-5 border border-white/5">
                <div className="text-light/60 text-sm mb-2">Current Wattage Balance</div>
                <div className="flex items-end">
                  <div className="text-2xl font-bold text-light">{Math.round(summary.currentBalance).toLocaleString()}</div>
                  <div className="text-light/60 ml-1 pb-0.5">kWh</div>
                </div>
                <div className="text-green-400 text-xs flex items-center mt-1">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  <span>10.3% vs last month</span>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-dark-200 rounded-lg p-5 border border-white/5">
                <div className="text-light/60 text-sm mb-2">Avg. Monthly Generation</div>
                <div className="flex items-end">
                  <div className="text-2xl font-bold text-light">{Math.round(summary.avgMonthlyGeneration).toLocaleString()}</div>
                  <div className="text-light/60 ml-1 pb-0.5">kWh</div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-dark-200 rounded-lg p-5 border border-white/5">
                <div className="text-light/60 text-sm mb-2">Payout Rate</div>
                <div className="flex items-end">
                  <div className="text-2xl font-bold text-light">₹{summary.payoutRate.toFixed(2)}</div>
                  <div className="text-light/60 ml-1 pb-0.5">/kWh</div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="bg-dark-200 rounded-lg p-5 border border-white/5">
                <div className="text-light/60 text-sm mb-2">Est. Earnings Next Month</div>
                <div className="flex items-end">
                  <div className="text-2xl font-bold text-light">₹{Math.round(summary.estimatedEarnings).toLocaleString()}</div>
                </div>
              </motion.div>
            </div>
          )}
          
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button className="bg-primary hover:bg-primary/90 text-dark font-medium rounded-lg px-6 py-3 flex items-center justify-center">
              <Download className="h-5 w-5 mr-2" />
              Redeem Credits
            </button>
            <button className="bg-dark-200 hover:bg-dark-300 text-light font-medium rounded-lg px-6 py-3 flex items-center justify-center">
              <RefreshCw className="h-5 w-5 mr-2" />
              Reinvest
            </button>
          </div>
        </div>
      </section>

      {/* Wattage History */}
      <section className="mb-8">
        <div className="bg-dark-100 border border-white/10 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-light">Wattage History</h2>
          </div>
          
          {isLoading ? (
            <div className="p-8 flex justify-center items-center">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : credits.length === 0 ? (
            <div className="p-12 text-center">
              <div className="bg-dark-200 p-6 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-light mb-2">No wattage credits yet</h3>
              <p className="text-light/60 mb-6 max-w-md mx-auto">
                Your rooftop solar system will start generating wattage credits soon. Check back next month!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-dark-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-light/60 uppercase tracking-wider">Month</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light/60 uppercase tracking-wider">Wattage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light/60 uppercase tracking-wider">Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light/60 uppercase tracking-wider">Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light/60 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {credits.map((credit) => (
                    <motion.tr 
                      key={credit.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-light">{formatMonth(credit.month)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-light">{credit.kwh.toLocaleString()} kWh</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-light">₹{credit.payout_rate.toFixed(2)}/kWh</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">₹{Math.round(credit.kwh * credit.payout_rate).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{renderStatus(credit.status)}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Information Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-dark-100 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-light mb-4">How Credits Work</h3>
          <p className="text-light/70 mb-4">
            Wattage credits represent the electricity generated by your rooftop solar system. Here's how it works:
          </p>
          <ul className="space-y-2 text-light/70">
            <li className="flex items-start">
              <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
              <span>Your solar panels generate electricity measured in kilowatt-hours (kWh)</span>
            </li>
            <li className="flex items-start">
              <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
              <span>Each kWh is worth a specific rate (currently ₹{summary.payoutRate.toFixed(2)}/kWh)</span>
            </li>
            <li className="flex items-start">
              <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
              <span>You can redeem credits for cash or apply them to future bills</span>
            </li>
          </ul>
        </div>

        <div className="bg-dark-100 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-light mb-4">Maximize Your Savings</h3>
          <div className="p-4 border border-primary/20 rounded-lg bg-primary/5 mb-4">
            <h4 className="font-medium text-primary mb-2">Credit Rollover Bonus</h4>
            <p className="text-light/70 text-sm">
              Roll over your wattage credits to earn a 2% bonus on your next electricity bill. More savings for your home!
            </p>
          </div>
          <div className="p-4 border border-white/10 rounded-lg bg-white/5">
            <h4 className="font-medium text-light mb-2">Refer a Friend</h4>
            <p className="text-light/70 text-sm">
              Earn 500 bonus kWh credits when you refer a friend who installs their first solar system.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Credits;
