import React, { useState, useEffect } from 'react';
import { X, Download, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface ViewInvestorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
}

interface Investor {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  investment_amount: number;
  wattage_credits_allocated: number;
  created_at: string;
}

const ViewInvestorsModal: React.FC<ViewInvestorsModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectName
}) => {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchInvestors();
    }
  }, [isOpen, projectId]);

  const fetchInvestors = async () => {
    setLoading(true);
    setError(null);

    try {
      // Join investments table with user_profiles to get investor details
      const { data, error: fetchError } = await supabase
        .from('investments')
        .select(`
          id,
          investment_amount,
          wattage_credits_allocated,
          created_at,
          user_profiles:investor_id (user_id, full_name, email)
        `)
        .eq('project_id', projectId);

      if (fetchError) throw fetchError;

      if (data) {
        // Format the data to match the Investor interface
        const formattedData = data.map((item: any) => ({
          id: item.id,
          user_id: item.user_profiles?.user_id || '',
          full_name: item.user_profiles?.full_name || 'Unknown User',
          email: item.user_profiles?.email || '',
          investment_amount: item.investment_amount || 0,
          wattage_credits_allocated: item.wattage_credits_allocated || 0,
          created_at: item.created_at
        }));

        setInvestors(formattedData);
      } else {
        // If no real data, use demo data
        setInvestors(getDemoInvestors());
      }
    } catch (err) {
      console.error('Error fetching investors:', err);
      setError('Failed to load investors data.');
      // Fallback to demo data
      setInvestors(getDemoInvestors());
    } finally {
      setLoading(false);
    }
  };

  const getDemoInvestors = (): Investor[] => [
    {
      id: '1',
      user_id: 'user-1',
      full_name: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      investment_amount: 150000,
      wattage_credits_allocated: 300,
      created_at: '2025-03-15T10:30:00Z'
    },
    {
      id: '2',
      user_id: 'user-2',
      full_name: 'Priya Patel',
      email: 'priya.patel@example.com',
      investment_amount: 250000,
      wattage_credits_allocated: 500,
      created_at: '2025-03-16T14:45:00Z'
    },
    {
      id: '3',
      user_id: 'user-3',
      full_name: 'Amit Singh',
      email: 'amit.singh@example.com',
      investment_amount: 100000,
      wattage_credits_allocated: 200,
      created_at: '2025-03-17T09:15:00Z'
    }
  ];

  const exportToCSV = () => {
    // Prepare CSV header row
    const headerRow = ['Full Name', 'Email', 'Investment Amount', 'Wattage Credits', 'Investment Date'];
    
    // Prepare data rows
    const dataRows = investors.map(investor => [
      investor.full_name,
      investor.email,
      investor.investment_amount.toString(),
      investor.wattage_credits_allocated.toString(),
      formatDate(investor.created_at)
    ]);

    // Create CSV content
    const csvRows = [
      headerRow.join(','),
      ...dataRows.map(row => row.join(','))
    ];

    const csvContent = csvRows.join('\n');

    // Create a Blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // Create a link and trigger download
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${projectName.replace(/\s+/g, '_')}_Investors_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div 
        className="bg-dark-100 rounded-xl shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-dark-200 p-6">
          <h3 className="text-xl font-bold text-light">Investors for {projectName}</h3>
          <button 
            onClick={onClose}
            className="text-light/70 hover:text-light"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              <p className="mt-4 text-light/60">Loading investors data...</p>
            </div>
          ) : error ? (
            <div className="py-20 text-center">
              <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <p className="text-light/60">{error}</p>
              <button
                onClick={fetchInvestors}
                className="mt-4 px-4 py-2 bg-dark-300 text-light rounded-lg hover:bg-dark-200 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : investors.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-xl font-semibold text-light mb-2">No investors found</p>
              <p className="text-light/60">
                This project doesn't have any investors yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-light">
                <thead className="bg-dark-200 text-light/70 text-sm uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-right">Investment Amount</th>
                    <th className="px-4 py-3 text-right">Wattage Credits</th>
                    <th className="px-4 py-3 text-left">Investment Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-200">
                  {investors.map((investor) => (
                    <tr key={investor.id} className="hover:bg-dark-200/50 transition-colors">
                      <td className="px-4 py-4 text-light font-medium">{investor.full_name}</td>
                      <td className="px-4 py-4 text-light/70">{investor.email}</td>
                      <td className="px-4 py-4 text-light/70 text-right">
                        {formatCurrency(investor.investment_amount)}
                      </td>
                      <td className="px-4 py-4 text-light/70 text-right">
                        {investor.wattage_credits_allocated}
                      </td>
                      <td className="px-4 py-4 text-light/70">
                        {formatDate(investor.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        {investors.length > 0 && (
          <div className="border-t border-dark-200 p-6 flex justify-end">
            <button
              onClick={exportToCSV}
              className="flex items-center px-4 py-2 bg-primary text-dark rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Download className="mr-2 h-5 w-5" />
              Export to CSV
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewInvestorsModal;
