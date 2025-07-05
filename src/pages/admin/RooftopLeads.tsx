import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import AdminLayout from '../../components/admin/AdminLayout';

const statusColors: Record<string, string> = {
  new: 'bg-blue-600 text-white',
  assigned: 'bg-yellow-500 text-black',
  scheduled: 'bg-purple-500 text-white',
  closed: 'bg-green-600 text-white',
};

interface Lead {
  id: string;
  name: string;
  contact: string;
  status: string;
  preferred_date: string;
}

const RooftopLeads: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLead, setNewLead] = useState({ name: '', contact: '', preferred_date: '' });
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    async function fetchLeads() {
      setLoading(true);
      setError(null);
      try {
        let query = supabase.from('rooftop_leads').select('*').order('created_at', { ascending: false });
        if (search) query = query.ilike('name', `%${search}%`);
        if (statusFilter) query = query.eq('status', statusFilter);
        const { data, error } = await query;
        if (error) throw error;
        setLeads(data || []);
      } catch (err: any) {
        setError('Failed to load leads. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchLeads();
  }, [search, statusFilter]);

  // Handle View Lead - Opens modal with lead details
  const handleViewLead = (lead: Lead) => {
    setSelectedLead(lead);
    setShowViewModal(true);
  };

  // Handle Edit Lead - Opens edit modal with prefilled data
  const handleEditLead = (lead: Lead) => {
    setEditLead({...lead});
    setShowEditModal(true);
  };

  // Handle Update Lead - Saves edits to database
  const handleUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editLead) return;
    
    try {
      const { error } = await supabase
        .from('rooftop_leads')
        .update(editLead)
        .eq('id', editLead.id);
        
      if (error) throw error;
      
      // Update local state
      setLeads(leads.map(lead => lead.id === editLead.id ? editLead : lead));
      setShowEditModal(false);
      setEditLead(null);
    } catch (err: any) {
      setError('Failed to update lead. Please try again.');
      console.error(err);
    }
  };

  // Close modals
  const closeModals = () => {
    setShowViewModal(false);
    setShowEditModal(false);
    setSelectedLead(null);
    setEditLead(null);
  };

  async function handleAddLead(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError(null);
    try {
      const { data, error } = await supabase.from('rooftop_leads').insert([
        {
          name: newLead.name,
          contact: newLead.contact,
          preferred_date: newLead.preferred_date,
        },
      ]).select();
      if (error) throw error;
      setLeads((prev) => [data[0], ...prev]);
      setShowAddModal(false);
      setNewLead({ name: '', contact: '', preferred_date: '' });
    } catch (err: any) {
      setError('Failed to add lead. Please try again.');
    } finally {
      setAdding(false);
    }
  }

  return (
    <AdminLayout title="Rooftop Leads">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-2xl font-bold text-primary">Lead Management</h2>
          <button
            className="bg-primary text-black px-5 py-2 rounded-lg font-medium shadow transition hover:scale-105"
            onClick={() => setShowAddModal(true)}
            aria-label="Add new lead"
          >
            + Add New Lead
          </button>
        </div>

        {/* Filter/Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center bg-dark-100 rounded-xl p-4 shadow">
          <input
            type="text"
            placeholder="Search by name or contact..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg bg-dark-200 text-light placeholder:text-light/50 focus:ring-2 focus:ring-primary outline-none transition"
            aria-label="Search leads"
          />
          <select
            className="px-4 py-2 rounded-lg bg-dark-200 text-light focus:ring-2 focus:ring-primary outline-none transition"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="assigned">Assigned</option>
            <option value="scheduled">Scheduled</option>
            <option value="closed">Closed</option>
          </select>
          <button className="bg-dark-300 text-light px-4 py-2 rounded-lg border border-dark-200 hover:bg-dark-200 transition" onClick={() => { setSearch(''); setStatusFilter(''); }}>Reset</button>
        </div>

        {/* Error/Loading/Empty States */}
        {loading && (
          <div className="flex justify-center items-center min-h-[120px]">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <span className="ml-4 text-light/60">Loading leads...</span>
          </div>
        )}
        {error && (
          <div className="bg-red-700/60 text-white rounded-lg p-4 text-center font-medium">{error}</div>
        )}
        {!loading && !error && leads.length === 0 && (
          <div className="bg-dark-200 text-light/70 rounded-lg p-6 text-center">No leads found. Try adjusting your filters or add a new lead.</div>
        )}

        {/* Leads Table */}
        {!loading && !error && leads.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-dark-100 rounded-xl shadow divide-y divide-dark-200">
            <thead>
              <tr className="text-left text-light/70 text-sm">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Preferred Date</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-200">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-dark-200 transition">
                  <td className="px-6 py-4 font-medium text-light">{lead.name}</td>
                  <td className="px-6 py-4 text-light/90">{lead.contact}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow ${statusColors[lead.status]}`}>{lead.status}</span>
                  </td>
                  <td className="px-6 py-4 text-light/80">{lead.preferred_date ? new Date(lead.preferred_date).toLocaleDateString() : '-'}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleViewLead(lead)}
                      className="bg-primary text-black px-3 py-1 rounded-lg text-xs font-semibold mr-2 hover:scale-105 transition"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEditLead(lead)}
                      className="bg-dark-300 text-light px-3 py-1 rounded-lg text-xs font-semibold hover:bg-dark-400 transition"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {/* View Lead Modal */}
        {showViewModal && selectedLead && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-100 rounded-xl w-full max-w-xl p-6 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={closeModals}
                className="absolute top-4 right-4 text-light/60 hover:text-light"
              >
                ×
              </button>
              <h2 className="text-2xl font-bold text-light mb-6">Lead Details</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-light/60 text-sm">Name</h3>
                  <p className="text-light text-lg">{selectedLead.name}</p>
                </div>
                
                <div>
                  <h3 className="text-light/60 text-sm">Contact</h3>
                  <p className="text-light text-lg">{selectedLead.contact}</p>
                </div>
                
                <div>
                  <h3 className="text-light/60 text-sm">Status</h3>
                  <p className="text-light">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold shadow ${statusColors[selectedLead.status]}`}>
                      {selectedLead.status}
                    </span>
                  </p>
                </div>
                
                <div>
                  <h3 className="text-light/60 text-sm">Preferred Date</h3>
                  <p className="text-light text-lg">{selectedLead.preferred_date ? new Date(selectedLead.preferred_date).toLocaleDateString() : 'Not specified'}</p>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={closeModals}
                  className="px-4 py-2 bg-dark-300 text-light rounded-lg hover:bg-dark-400 transition"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    closeModals();
                    handleEditLead(selectedLead);
                  }}
                  className="px-4 py-2 bg-primary text-black rounded-lg hover:bg-primary/90 transition"
                >
                  Edit Lead
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Lead Modal */}
        {showEditModal && editLead && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-100 rounded-xl w-full max-w-xl p-6 relative">
              <button
                onClick={closeModals}
                className="absolute top-4 right-4 text-light/60 hover:text-light"
              >
                ×
              </button>
              <h2 className="text-2xl font-bold text-light mb-6">Edit Lead</h2>
              
              <form onSubmit={handleUpdateLead} className="space-y-4">
                <div>
                  <label className="block text-light/60 text-sm mb-1">Name</label>
                  <input
                    type="text"
                    value={editLead.name}
                    onChange={(e) => setEditLead({...editLead, name: e.target.value})}
                    className="w-full bg-dark-200 border border-dark-300 rounded-lg px-4 py-2 text-light focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-light/60 text-sm mb-1">Contact</label>
                  <input
                    type="text"
                    value={editLead.contact}
                    onChange={(e) => setEditLead({...editLead, contact: e.target.value})}
                    className="w-full bg-dark-200 border border-dark-300 rounded-lg px-4 py-2 text-light focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-light/60 text-sm mb-1">Status</label>
                  <select
                    value={editLead.status}
                    onChange={(e) => setEditLead({...editLead, status: e.target.value})}
                    className="w-full bg-dark-200 border border-dark-300 rounded-lg px-4 py-2 text-light focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="new">New</option>
                    <option value="assigned">Assigned</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-light/60 text-sm mb-1">Preferred Date</label>
                  <input
                    type="date"
                    value={editLead.preferred_date ? new Date(editLead.preferred_date).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditLead({...editLead, preferred_date: e.target.value})}
                    className="w-full bg-dark-200 border border-dark-300 rounded-lg px-4 py-2 text-light focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                
                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeModals}
                    className="px-4 py-2 bg-dark-300 text-light rounded-lg hover:bg-dark-400 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-black rounded-lg hover:bg-primary/90 transition"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Lead Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="bg-dark-100 rounded-xl p-8 shadow-xl w-full max-w-md relative animate-fadeIn">
              <button
                className="absolute top-4 right-4 text-light/60 hover:text-primary text-xl"
                onClick={() => setShowAddModal(false)}
                aria-label="Close add lead modal"
              >
                ×
              </button>
              <h3 className="text-xl font-bold text-primary mb-4">Add New Lead</h3>
              <form onSubmit={handleAddLead} className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="Lead name"
                  value={newLead.name}
                  onChange={e => setNewLead({ ...newLead, name: e.target.value })}
                  className="px-4 py-2 rounded-lg bg-dark-200 text-light placeholder:text-light/50 focus:ring-2 focus:ring-primary outline-none transition"
                  required
                  autoFocus
                />
                <input
                  type="text"
                  placeholder="Contact number"
                  value={newLead.contact}
                  onChange={e => setNewLead({ ...newLead, contact: e.target.value })}
                  className="px-4 py-2 rounded-lg bg-dark-200 text-light placeholder:text-light/50 focus:ring-2 focus:ring-primary outline-none transition"
                  required
                />
                <input
                  type="date"
                  value={newLead.preferred_date}
                  onChange={e => setNewLead({ ...newLead, preferred_date: e.target.value })}
                  className="px-4 py-2 rounded-lg bg-dark-200 text-light focus:ring-2 focus:ring-primary outline-none transition"
                  required
                />
                <button
                  type="submit"
                  className="bg-primary text-black px-5 py-2 rounded-lg font-semibold shadow transition hover:scale-105 disabled:opacity-60"
                  disabled={adding}
                >
                  {adding ? 'Adding...' : 'Add Lead'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
export default RooftopLeads;
