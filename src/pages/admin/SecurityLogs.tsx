/**
 * Security Logs Component
 * 
 * This admin component displays security logs for monitoring and analysis
 * of security events across the application.
 */

import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { SecurityEventType, SecurityEventSeverity } from '../../utils/securityLogs';

// Interface for security log items
interface SecurityLog {
  id: string;
  user_id: string;
  event_type: string;
  ip_address: string;
  user_agent: string;
  details: any;
  created_at: string;
  severity: string;
  user_email?: string; // Will be populated client-side
}

const SecurityLogs: React.FC = () => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<{
    eventType: string;
    severity: string;
    dateRange: 'today' | 'week' | 'month' | 'all';
  }>({
    eventType: '',
    severity: '',
    dateRange: 'week'
  });

  // Load security logs
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build date filter
        let dateFilter = '';
        const now = new Date();
        
        if (filter.dateRange === 'today') {
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
          dateFilter = `.gte.${today}`;
        } else if (filter.dateRange === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
          dateFilter = `.gte.${weekAgo}`;
        } else if (filter.dateRange === 'month') {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
          dateFilter = `.gte.${monthAgo}`;
        }

        // Build query
        let query = supabase
          .from('security_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(500);

        // Apply filters
        if (filter.eventType) {
          query = query.eq('event_type', filter.eventType);
        }

        if (filter.severity) {
          query = query.eq('severity', filter.severity);
        }

        if (dateFilter) {
          // Extract the operator and value from the dateFilter string
          const operator = dateFilter.split('.')[1];
          const value = dateFilter.split('.')[2];
          query = query.filter('created_at', operator as any, value);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Fetch user emails for the logs
        const securityLogs = data || [];
        const userIds = [...new Set(securityLogs.map(log => log.user_id))];
        
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('user_id, email')
          .in('user_id', userIds);

        const userMap = (profiles || []).reduce(
          (acc, profile) => {
            acc[profile.user_id] = profile.email;
            return acc;
          }, 
          {} as Record<string, string>
        );

        // Enhance logs with user information
        const enhancedLogs = securityLogs.map(log => ({
          ...log,
          user_email: userMap[log.user_id] || 'Unknown User'
        }));

        setLogs(enhancedLogs);
      } catch (err: any) {
        console.error('Error fetching security logs:', err);
        setError(err.message || 'Failed to load security logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [filter]);

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get appropriate color class based on severity
  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 font-bold';
      case 'error': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Security Logs</h1>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
            <select
              name="eventType"
              value={filter.eventType}
              onChange={handleFilterChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            >
              <option value="">All Events</option>
              {Object.values(SecurityEventType).map(type => (
                <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
            <select
              name="severity"
              value={filter.severity}
              onChange={handleFilterChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            >
              <option value="">All Severities</option>
              {Object.values(SecurityEventSeverity).map(severity => (
                <option key={severity} value={severity}>{severity}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              name="dateRange"
              value={filter.dateRange}
              onChange={handleFilterChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            >
              <option value="today">Today</option>
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Loading and error states */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      {/* Security logs table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No security logs found matching the current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.user_email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.event_type.replace(/_/g, ' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={getSeverityClass(log.severity)}>
                          {log.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.ip_address}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <pre className="whitespace-pre-wrap font-mono text-xs bg-gray-100 p-2 rounded">
                          {JSON.stringify(log.details, null, 2)}
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
    </div>
  );
};

export default SecurityLogs;
