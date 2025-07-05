import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import AdminLayout from '../../components/admin/AdminLayout';

const statusColors: Record<string, string> = {
  scheduled: 'bg-yellow-500 text-black',
  in_progress: 'bg-blue-600 text-white',
  completed: 'bg-green-600 text-white',
  canceled: 'bg-red-700 text-white',
};

interface Installation {
  id: string;
  proposal_id: string;
  engineer_id: string;
  scheduled_date: string;
  status: string;
  completion_date?: string;
  notes?: string;
}

const RooftopInstallations: React.FC = () => {
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newInstallation, setNewInstallation] = useState({ proposal_id: '', engineer_id: '', scheduled_date: '', status: 'scheduled', notes: '' });
  const [adding, setAdding] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    async function fetchInstallations() {
      setLoading(true);
      setError(null);
      try {
        let query = supabase.from('installations').select('*').order('scheduled_date', { ascending: false });
        if (statusFilter) query = query.eq('status', statusFilter);
        const { data, error } = await query;
        if (error) throw error;
        setInstallations(data || []);
      } catch (err: any) {
        setError('Failed to load installations. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchInstallations();
  }, [statusFilter]);

  async function handleAddInstallation(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError(null);
    try {
      const { data, error } = await supabase.from('installations').insert([
        {
          proposal_id: newInstallation.proposal_id,
          engineer_id: newInstallation.engineer_id,
          scheduled_date: newInstallation.scheduled_date,
          status: newInstallation.status,
          notes: newInstallation.notes,
        },
      ]).select();
      if (error) throw error;
      setInstallations((prev) => [data[0], ...prev]);
      setShowAddModal(false);
      setNewInstallation({ proposal_id: '', engineer_id: '', scheduled_date: '', status: 'scheduled', notes: '' });
    } catch (err: any) {
      setError('Failed to add installation. Please try again.');
    } finally {
      setAdding(false);
    }
  }

  return (
    <AdminLayout title="Installations">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-2xl font-bold text-primary">Installations</h2>
          <button
            className="bg-primary text-black px-5 py-2 rounded-lg font-medium shadow transition hover:scale-105"
            onClick={() => setShowAddModal(true)}
            aria-label="Add new installation"
          >
            + Add Installation
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center bg-dark-100 rounded-xl p-4 shadow">
          <select
            className="px-4 py-2 rounded-lg bg-dark-200 text-light focus:ring-2 focus:ring-primary outline-none transition"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="canceled">Canceled</option>
          </select>
          <button className="bg-dark-300 text-light px-4 py-2 rounded-lg border border-dark-200 hover:bg-dark-200 transition" onClick={() => setStatusFilter('')}>Reset</button>
        </div>

        {/* Error/Loading/Empty States */}
        {loading && (
          <div className="flex justify-center items-center min-h-[120px]">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <span className="ml-4 text-light/60">Loading installations...</span>
          </div>
        )}
        {error && (
          <div className="bg-red-700/60 text-white rounded-lg p-4 text-center font-medium">{error}</div>
        )}
        {!loading && !error && installations.length === 0 && (
          <div className="bg-dark-200 text-light/70 rounded-lg p-6 text-center">No installations found. Try adjusting your filters or add a new installation.</div>
        )}

        {/* Installations Table */}
        {!loading && !error && installations.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-dark-100 rounded-xl shadow divide-y divide-dark-200">
            <thead>
              <tr className="text-left text-light/70 text-sm">
                <th className="px-6 py-3">Proposal ID</th>
                <th className="px-6 py-3">Engineer ID</th>
                <th className="px-6 py-3">Scheduled Date</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Completion Date</th>
                <th className="px-6 py-3">Notes</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-200">
              {installations.map((i) => (
                <tr key={i.id} className="hover:bg-dark-200 transition">
                  <td className="px-6 py-4 font-medium text-light">{i.proposal_id}</td>
                  <td className="px-6 py-4 text-light/90">{i.engineer_id}</td>
                  <td className="px-6 py-4 text-light/80">{i.scheduled_date ? new Date(i.scheduled_date).toLocaleString() : '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow ${statusColors[i.status]}`}>{i.status}</span>
                  </td>
                  <td className="px-6 py-4 text-light/80">{i.completion_date ? new Date(i.completion_date).toLocaleString() : '-'}</td>
                  <td className="px-6 py-4 text-light/80">{i.notes || '-'}</td>
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

        {/* Add Installation Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="bg-dark-100 rounded-xl p-8 shadow-xl w-full max-w-md relative animate-fadeIn">
              <button
                className="absolute top-4 right-4 text-light/60 hover:text-primary text-xl"
                onClick={() => setShowAddModal(false)}
                aria-label="Close add installation modal"
              >
                ×
              </button>
              <h3 className="text-xl font-bold text-primary mb-4">Add Installation</h3>
              <form onSubmit={handleAddInstallation} className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="Proposal ID"
                  value={newInstallation.proposal_id}
                  onChange={e => setNewInstallation({ ...newInstallation, proposal_id: e.target.value })}
                  className="px-4 py-2 rounded-lg bg-dark-200 text-light placeholder:text-light/50 focus:ring-2 focus:ring-primary outline-none transition"
                  required
                  autoFocus
                />
                <input
                  type="text"
                  placeholder="Engineer ID"
                  value={newInstallation.engineer_id}
                  onChange={e => setNewInstallation({ ...newInstallation, engineer_id: e.target.value })}
                  className="px-4 py-2 rounded-lg bg-dark-200 text-light placeholder:text-light/50 focus:ring-2 focus:ring-primary outline-none transition"
                  required
                />
                <input
                  type="datetime-local"
                  value={newInstallation.scheduled_date}
                  onChange={e => setNewInstallation({ ...newInstallation, scheduled_date: e.target.value })}
                  className="px-4 py-2 rounded-lg bg-dark-200 text-light focus:ring-2 focus:ring-primary outline-none transition"
                  required
                />
                <select
                  value={newInstallation.status}
                  onChange={e => setNewInstallation({ ...newInstallation, status: e.target.value })}
                  className="px-4 py-2 rounded-lg bg-dark-200 text-light focus:ring-2 focus:ring-primary outline-none transition"
                  required
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="canceled">Canceled</option>
                </select>
                <textarea
                  placeholder="Notes (optional)"
                  value={newInstallation.notes}
                  onChange={e => setNewInstallation({ ...newInstallation, notes: e.target.value })}
                  className="px-4 py-2 rounded-lg bg-dark-200 text-light placeholder:text-light/50 focus:ring-2 focus:ring-primary outline-none transition"
                  rows={3}
                />
                <button
                  type="submit"
                  className="bg-primary text-black px-5 py-2 rounded-lg font-semibold shadow transition hover:scale-105 disabled:opacity-60"
                  disabled={adding}
                >
                  {adding ? 'Adding...' : 'Add Installation'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
export default RooftopInstallations;
