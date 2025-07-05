import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Receipt, Search, Calendar, Clock, CreditCard, Download } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface Transaction {
  id: string;
  date: string;
  type: 'purchase' | 'redemption' | 'payout';
  amount: number;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  reference: string;
}

const History: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  
  // Fetch transaction data
  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        // In a real app, we would fetch from Supabase
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('date', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          setTransactions(data as Transaction[]);
        } else {
          // Mock data for demonstration
          setTransactions([
            {
              id: 'txn-1',
              date: '2025-03-15',
              type: 'purchase',
              amount: 25000,
              description: 'Premium Rooftop Solar System Installation',
              status: 'completed',
              reference: 'INV-2025-001'
            },
            {
              id: 'txn-2',
              date: '2025-03-01',
              type: 'payout',
              amount: 1875,
              description: 'Monthly earnings payout - February 2025',
              status: 'completed',
              reference: 'PAY-2025-023'
            },
            {
              id: 'txn-3',
              date: '2025-02-15',
              type: 'purchase',
              amount: 10000,
              description: 'Standard Rooftop Solar System Installation',
              status: 'completed',
              reference: 'INV-2025-018'
            },
            {
              id: 'txn-4',
              date: '2025-02-01',
              type: 'payout',
              amount: 1500,
              description: 'Monthly earnings payout - January 2025',
              status: 'completed',
              reference: 'PAY-2025-011'
            },
            {
              id: 'txn-5',
              date: '2025-01-20',
              type: 'redemption',
              amount: 5000,
              description: 'Wattage credits redemption',
              status: 'completed',
              reference: 'RED-2025-007'
            },
          ]);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 800);
      }
    };

    fetchTransactions();
  }, []);

  // Filter transactions based on search term and filter type
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         transaction.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || transaction.type === filterType;
    return matchesSearch && matchesType;
  });

  // Format date string to readable format
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    });
  };

  // Render transaction type badge
  const renderTransactionType = (type: Transaction['type']) => {
    switch (type) {
      case 'purchase':
        return <span className="px-2 py-1 bg-blue-400/20 text-blue-400 text-xs rounded-full">Purchase</span>;
      case 'redemption':
        return <span className="px-2 py-1 bg-amber-400/20 text-amber-400 text-xs rounded-full">Redemption</span>;
      case 'payout':
        return <span className="px-2 py-1 bg-green-400/20 text-green-400 text-xs rounded-full">Payout</span>;
      default:
        return null;
    }
  };

  // Render transaction status badge
  const renderTransactionStatus = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return <span className="text-green-400 text-sm">Completed</span>;
      case 'pending':
        return <span className="text-amber-400 text-sm">Pending</span>;
      case 'failed':
        return <span className="text-red-400 text-sm">Failed</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <section className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-light">Purchase History</h1>
            <p className="text-light/60 mt-1">Your complete financial transaction history</p>
          </div>
          <button className="mt-4 md:mt-0 bg-dark-200 hover:bg-dark-300 text-light font-medium rounded-lg px-4 py-2 flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export History
          </button>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="mb-8">
        <div className="bg-dark-100 border border-white/10 rounded-xl p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-light/40" />
              </div>
              <input
                type="text"
                placeholder="Search transactions..."
                className="w-full bg-dark-200 border border-white/10 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-light"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="md:w-48">
              <select
                className="w-full bg-dark-200 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-light appearance-none"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="investment">Investments</option>
                <option value="redemption">Redemptions</option>
                <option value="payout">Payouts</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Transactions Table */}
      <section className="mb-8">
        <div className="bg-dark-100 border border-white/10 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 flex justify-center items-center">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="bg-dark-200 p-6 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Receipt className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-light mb-2">No transactions found</h3>
              <p className="text-light/60 mb-6 max-w-md mx-auto">
                {searchTerm || filterType !== 'all'
                  ? "No transactions match your search criteria. Try adjusting your filters."
                  : "You haven't made any transactions yet. Start by making your first investment!"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-dark-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-light/60 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light/60 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light/60 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-light/60 uppercase tracking-wider">Reference</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-light/60 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-light/60 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <motion.tr 
                      key={transaction.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-light flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-light/40" />
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderTransactionType(transaction.type)}
                      </td>
                      <td className="px-6 py-4 text-sm text-light">{transaction.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-light/70">{transaction.reference}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                        <span className={transaction.type === 'payout' || transaction.type === 'redemption' ? 'text-green-400' : 'text-light'}>
                          {transaction.type === 'purchase' ? '-' : '+'}₹{transaction.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {renderTransactionStatus(transaction.status)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Information Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-dark-100 border border-white/10 rounded-xl p-6 col-span-1 md:col-span-2">
          <h3 className="text-lg font-bold text-light mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-primary" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {filteredTransactions.slice(0, 3).map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-start border-b border-white/5 pb-3">
                <div>
                  <div className="text-light font-medium">{transaction.description}</div>
                  <div className="text-light/60 text-sm flex items-center mt-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(transaction.date)}
                  </div>
                </div>
                <div className="text-right">
                  <div className={transaction.type === 'payout' || transaction.type === 'redemption' ? 'text-green-400 font-medium' : 'text-light font-medium'}>
                    {transaction.type === 'purchase' ? '-' : '+'}₹{transaction.amount.toLocaleString()}
                  </div>
                  <div className="mt-1">{renderTransactionType(transaction.type)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-dark-100 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-light mb-4 flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-primary" />
            Receipts & Invoices
          </h3>
          <p className="text-light/70 mb-4">
            Need a tax receipt or detailed invoice for any of your transactions? Download them directly or request a specific statement.
          </p>
          <button className="w-full bg-primary hover:bg-primary/90 text-dark font-medium rounded-lg p-3">
            Request Tax Statement
          </button>
        </div>
      </section>
    </div>
  );
};

export default History;
