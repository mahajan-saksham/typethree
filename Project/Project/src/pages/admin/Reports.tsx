import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import AdminLayout from '../../components/admin/AdminLayout';

const typeColors: Record<string, string> = {
  summary: 'bg-blue-600 text-white',
  detailed: 'bg-green-600 text-white',
  error: 'bg-red-700 text-white',
};

interface Report {
  id: string;
  title: string;
  type: string;
  created_at: string;
  file_url?: string;
  notes?: string;
}

const Reports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReport, setNewReport] = useState({ title: '', type: 'summary', notes: '', file_url: '' });
  const [adding, setAdding] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    async function fetchReports() {
      setLoading(true);
      setError(null);
      try {
        let query = supabase.from('reports').select('*').order('created_at', { ascending: false });
        if (typeFilter) query = query.eq('type', typeFilter);
        const { data, error } = await query;
        if (error) throw error;
        setReports(data || []);
      } catch (err: any) {
        setError('Failed to load reports. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, [typeFilter]);

  async function handleAddReport(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError(null);
    try {
      const { data, error } = await supabase.from('reports').insert([
        {
          title: newReport.title,
          type: newReport.type,
          notes: newReport.notes,
          file_url: newReport.file_url,
        },
      ]).select();
      if (error) throw error;
      setReports((prev) => [data[0], ...prev]);
      setShowAddModal(false);
      setNewReport({ title: '', type: 'summary', notes: '', file_url: '' });
    } catch (err: any) {
      setError('Failed to add report. Please try again.');
    } finally {
      setAdding(false);
    }
  }

  return (
    <AdminLayout title="Reports">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-2xl font-bold text-primary">Reports</h2>
          <button
            className="bg-primary text-black px-5 py-2 rounded-lg font-medium shadow transition hover:scale-105"
            onClick={() => setShowAddModal(true)}
            aria-label="Add new report"
          >
            + Add Report
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center bg-dark-100 rounded-xl p-4 shadow">
          <select
            className="px-4 py-2 rounded-lg bg-dark-200 text-light focus:ring-2 focus:ring-primary outline-none transition"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            aria-label="Filter by type"
          >
            <option value="">All Types</option>
            <option value="summary">Summary</option>
            <option value="detailed">Detailed</option>
            <option value="error">Error</option>
          </select>
          <button className="bg-dark-300 text-light px-4 py-2 rounded-lg border border-dark-200 hover:bg-dark-200 transition" onClick={() => setTypeFilter('')}>Reset</button>
        </div>

        {/* Error/Loading/Empty States */}
        {loading && (
          <div className="flex justify-center items-center min-h-[120px]">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <span className="ml-4 text-light/60">Loading reports...</span>
          </div>
        )}
        {error && (
          <div className="bg-red-700/60 text-white rounded-lg p-4 text-center font-medium">{error}</div>
        )}
        {!loading && !error && reports.length === 0 && (
          <div className="bg-dark-200 text-light/70 rounded-lg p-6 text-center">No reports found. Try adjusting your filters or add a new report.</div>
        )}

        {/* Reports Table */}
        {!loading && !error && reports.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-dark-100 rounded-xl shadow divide-y divide-dark-200">
            <thead>
              <tr className="text-left text-light/70 text-sm">
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Created At</th>
                <th className="px-6 py-3">File</th>
                <th className="px-6 py-3">Notes</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-200">
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-dark-200 transition">
                  <td className="px-6 py-4 font-medium text-light">{r.title}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow ${typeColors[r.type]}`}>{r.type}</span>
                  </td>
                  <td className="px-6 py-4 text-light/80">{r.created_at ? new Date(r.created_at).toLocaleString() : '-'}</td>
                  <td className="px-6 py-4 text-light/80">
                    {r.file_url ? (
                      <a href={r.file_url} target="_blank" rel="noopener noreferrer" className="underline text-primary">File</a>
                    ) : (
                      <span className="text-light/40">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-light/80">{r.notes || '-'}</td>
                  <td className="px-6 py-4">
                    <button className="bg-primary text-black px-3 py-1 rounded-lg text-xs font-semibold mr-2 hover:scale-105 transition">View</button>
                    <button className="bg-dark-300 text-light px-3 py-1 rounded-lg text-xs font-semibold hover:bg-dark-400 transition">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {/* Add Report Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="bg-dark-100 rounded-xl p-8 shadow-xl w-full max-w-md relative animate-fadeIn">
              <button
                className="absolute top-4 right-4 text-light/60 hover:text-primary text-xl"
                onClick={() => setShowAddModal(false)}
                aria-label="Close add report modal"
              >
                ×
              </button>
              <h3 className="text-xl font-bold text-primary mb-4">Add Report</h3>
              <form onSubmit={handleAddReport} className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="Title"
                  value={newReport.title}
                  onChange={e => setNewReport({ ...newReport, title: e.target.value })}
                  className="px-4 py-2 rounded-lg bg-dark-200 text-light placeholder:text-light/50 focus:ring-2 focus:ring-primary outline-none transition"
                  required
                  autoFocus
                />
                <select
                  value={newReport.type}
                  onChange={e => setNewReport({ ...newReport, type: e.target.value })}
                  className="px-4 py-2 rounded-lg bg-dark-200 text-light focus:ring-2 focus:ring-primary outline-none transition"
                  required
                >
                  <option value="summary">Summary</option>
                  <option value="detailed">Detailed</option>
                  <option value="error">Error</option>
                </select>
                <input
                  type="text"
                  placeholder="File URL (optional)"
                  value={newReport.file_url}
                  onChange={e => setNewReport({ ...newReport, file_url: e.target.value })}
                  className="px-4 py-2 rounded-lg bg-dark-200 text-light placeholder:text-light/50 focus:ring-2 focus:ring-primary outline-none transition"
                />
                <textarea
                  placeholder="Notes (optional)"
                  value={newReport.notes}
                  onChange={e => setNewReport({ ...newReport, notes: e.target.value })}
                  className="px-4 py-2 rounded-lg bg-dark-200 text-light placeholder:text-light/50 focus:ring-2 focus:ring-primary outline-none transition"
                  rows={3}
                />
                <button
                  type="submit"
                  className="bg-primary text-black px-5 py-2 rounded-lg font-semibold shadow transition hover:scale-105 disabled:opacity-60"
                  disabled={adding}
                >
                  {adding ? 'Adding...' : 'Add Report'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
export default Reports;
