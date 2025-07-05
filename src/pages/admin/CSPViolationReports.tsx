import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAdminGuard } from '../../hooks/useAdminGuard';
import { format } from 'date-fns';

interface CSPViolationReport {
  id: string;
  document_uri: string;
  referrer: string;
  violated_directive: string;
  effective_directive: string;
  blocked_uri: string;
  created_at: string;
  processed: boolean;
}

const CSPViolationReports: React.FC = () => {
  const { isAdmin, isLoading: adminCheckLoading } = useAdminGuard();
  const [reports, setReports] = useState<CSPViolationReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterBy, setFilterBy] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('24h');

  useEffect(() => {
    if (adminCheckLoading) return;
    if (!isAdmin) return;

    fetchViolationReports();
  }, [isAdmin, adminCheckLoading, filterBy, timeRange]);

  const fetchViolationReports = async () => {
    try {
      setLoading(true);
      
      // Calculate time filter based on selected range
      let timeFilter = new Date();
      switch (timeRange) {
        case '24h':
          timeFilter.setHours(timeFilter.getHours() - 24);
          break;
        case '7d':
          timeFilter.setDate(timeFilter.getDate() - 7);
          break;
        case '30d':
          timeFilter.setDate(timeFilter.getDate() - 30);
          break;
        case 'all':
          timeFilter = new Date(0); // Beginning of time
          break;
      }

      // Build query based on filters
      let query = supabase
        .from('csp_violation_reports')
        .select('*')
        .gte('created_at', timeFilter.toISOString());

      // Add directive filter if not 'all'
      if (filterBy !== 'all') {
        query = query.eq('violated_directive', filterBy);
      }

      // Execute query and sort by creation date (newest first)
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      
      setReports(data || []);
    } catch (err) {
      console.error('Error fetching CSP violation reports:', err);
      setError('Failed to load CSP violation reports');
    } finally {
      setLoading(false);
    }
  };

  const markAsProcessed = async (id: string) => {
    try {
      const { error } = await supabase
        .from('csp_violation_reports')
        .update({ processed: true })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setReports(reports.map(report => 
        report.id === id ? { ...report, processed: true } : report
      ));
    } catch (err) {
      console.error('Error updating CSP violation report:', err);
      setError('Failed to update report status');
    }
  };

  // Generate unique directive options for filter
  const directiveOptions = [
    'all',
    ...new Set(reports.map(report => report.violated_directive))
  ];

  if (adminCheckLoading) {
    return <div className="p-8 text-center">Verifying admin access...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="mt-4">You must be an admin to view this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">CSP Violation Reports</h1>
      
      <div className="mb-6 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Directive</label>
          <select
            className="border border-gray-300 rounded-md p-2 w-full"
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
          >
            {directiveOptions.map(option => (
              <option key={option} value={option}>
                {option === 'all' ? 'All Directives' : option}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
          <select
            className="border border-gray-300 rounded-md p-2 w-full"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
        
        <div className="self-end">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            onClick={() => fetchViolationReports()}
          >
            Refresh
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-8">Loading reports...</div>
      ) : reports.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No CSP violation reports found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Directive</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blocked URI</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report.id} className={report.processed ? 'bg-gray-50' : ''}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(report.created_at), 'yyyy-MM-dd HH:mm:ss')}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {report.violated_directive}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                    <span title={report.blocked_uri}>{report.blocked_uri}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                    <span title={report.document_uri}>{report.document_uri}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {report.processed ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Processed
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        New
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    <button
                      onClick={() => markAsProcessed(report.id)}
                      disabled={report.processed}
                      className={`px-3 py-1 text-xs rounded ${report.processed ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                    >
                      Mark Processed
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CSPViolationReports;
