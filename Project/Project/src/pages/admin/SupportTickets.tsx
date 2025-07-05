import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import AdminLayout from '../../components/admin/AdminLayout';
import { Card } from '../../components/Card';
import { MoreHorizontal, RefreshCw, MessageSquare, Check, X, User, Calendar, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';

// Interfaces
interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
  assigned_to?: string;
}

interface TicketMessage {
  id: string;
  ticket_id: string;
  user_id: string;
  is_admin: boolean;
  message: string;
  created_at: string;
}

interface UserProfile {
  user_id: string;
  full_name: string;
  email: string;
}

const SupportTickets: React.FC = () => {
  // State for tickets
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for active ticket and responses
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [ticketMessages, setTicketMessages] = useState<TicketMessage[]>([]);
  const [newResponse, setNewResponse] = useState('');
  const [sendingResponse, setSendingResponse] = useState(false);
  
  // State for filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for user profiles cache
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});
  
  // Fetch all tickets on component load
  useEffect(() => {
    fetchTickets();
  }, []);
  
  // Filter tickets when filter criteria change
  useEffect(() => {
    applyFilters();
  }, [tickets, statusFilter, priorityFilter, searchQuery]);
  
  // Fetch ticket messages when active ticket changes
  useEffect(() => {
    if (activeTicket) {
      fetchTicketMessages(activeTicket.id);
      fetchUserProfile(activeTicket.user_id);
    }
  }, [activeTicket]);
  
  // Fetch tickets from Supabase
  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setTickets(data || []);
      setFilteredTickets(data || []);
    } catch (err: any) {
      console.error('Error fetching tickets:', err);
      setError('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch ticket messages
  const fetchTicketMessages = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      setTicketMessages(data || []);
      
      // Fetch user profiles for all message senders
      if (data) {
        const userIds = [...new Set(data.map(msg => msg.user_id))];
        userIds.forEach(id => {
          if (!userProfiles[id]) fetchUserProfile(id);
        });
      }
    } catch (err) {
      console.error('Error fetching ticket messages:', err);
    }
  };
  
  // Fetch user profile
  const fetchUserProfile = async (userId: string) => {
    if (userProfiles[userId]) return;
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('user_id, full_name, email')
        .eq('user_id', userId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setUserProfiles(prev => ({
          ...prev,
          [userId]: data
        }));
      }
    } catch (err) {
      console.error(`Error fetching user profile for ${userId}:`, err);
    }
  };
  
  // Apply filters to tickets
  const applyFilters = () => {
    let filtered = [...tickets];
    
    if (statusFilter) {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }
    
    if (priorityFilter) {
      filtered = filtered.filter(ticket => ticket.priority === priorityFilter);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ticket => 
        ticket.subject.toLowerCase().includes(query) || 
        ticket.message.toLowerCase().includes(query)
      );
    }
    
    setFilteredTickets(filtered);
  };
  
  // Handle sending admin response
  const handleSendResponse = async () => {
    if (!activeTicket || !newResponse.trim()) return;
    
    setSendingResponse(true);
    
    try {
      // Get current admin user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      // Create new message
      const newMessage = {
        ticket_id: activeTicket.id,
        user_id: user.id,
        is_admin: true,
        message: newResponse.trim(),
        created_at: new Date().toISOString()
      };
      
      // Save to database
      const { error: messageError } = await supabase
        .from('ticket_messages')
        .insert([newMessage]);
        
      if (messageError) throw messageError;
      
      // Update ticket status to in_progress if it was open
      if (activeTicket.status === 'open') {
        const { error: updateError } = await supabase
          .from('support_tickets')
          .update({ 
            status: 'in_progress',
            updated_at: new Date().toISOString(),
            assigned_to: user.id
          })
          .eq('id', activeTicket.id);
          
        if (updateError) throw updateError;
        
        // Update local state
        setActiveTicket({
          ...activeTicket,
          status: 'in_progress',
          updated_at: new Date().toISOString(),
          assigned_to: user.id
        });
        
        // Update tickets list
        setTickets(tickets.map(t => 
          t.id === activeTicket.id 
            ? {...t, status: 'in_progress', updated_at: new Date().toISOString(), assigned_to: user.id}
            : t
        ));
      }
      
      // Refresh messages
      fetchTicketMessages(activeTicket.id);
      setNewResponse('');
    } catch (err) {
      console.error('Error sending response:', err);
    } finally {
      setSendingResponse(false);
    }
  };
  
  // Update ticket status
  const updateTicketStatus = async (ticketId: string, newStatus: SupportTicket['status']) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);
        
      if (error) throw error;
      
      // Update local state
      if (activeTicket && activeTicket.id === ticketId) {
        setActiveTicket({
          ...activeTicket,
          status: newStatus,
          updated_at: new Date().toISOString()
        });
      }
      
      // Update tickets list
      setTickets(tickets.map(t => 
        t.id === ticketId 
          ? {...t, status: newStatus, updated_at: new Date().toISOString()}
          : t
      ));
    } catch (err) {
      console.error('Error updating ticket status:', err);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };
  
  // Get status badge class
  const getStatusBadge = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open':
        return 'bg-blue-500/20 text-blue-400';
      case 'in_progress':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'resolved':
        return 'bg-green-500/20 text-green-400';
      case 'closed':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };
  
  // Get priority badge class
  const getPriorityBadge = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case 'low':
        return 'bg-blue-500/20 text-blue-400';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'high':
        return 'bg-orange-500/20 text-orange-400';
      case 'urgent':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <AdminLayout title="Support Tickets">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-light">Support & Inquiries</h1>
          <button 
            onClick={fetchTickets}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
        
        {/* Filters */}
        <Card variant="glass" padding="md" className="backdrop-blur-sm">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light/40 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-light focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
            
            <div className="w-40">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-light focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            
            <div className="w-40">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-light focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        </Card>
        
        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tickets list */}
          <div className="lg:col-span-1">
            <Card variant="glass" padding="md" className="h-[calc(100vh-240px)] flex flex-col">
              <h2 className="text-xl font-bold text-light mb-4">Tickets</h2>
              
              {loading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : error ? (
                <div className="flex-1 flex items-center justify-center text-red-400">
                  <p>{error}</p>
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-light/50">
                  <p>No tickets found</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                  {filteredTickets.map(ticket => (
                    <div 
                      key={ticket.id}
                      onClick={() => setActiveTicket(ticket)}
                      className={`p-4 rounded-lg cursor-pointer transition-colors ${
                        activeTicket?.id === ticket.id
                          ? 'bg-primary/20 border border-primary/30'
                          : 'bg-dark-200 border border-white/5 hover:bg-dark-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-light line-clamp-1">{ticket.subject}</h3>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadge(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </div>
                      
                      <p className="text-light/70 text-sm line-clamp-2 mb-3">
                        {ticket.message}
                      </p>
                      
                      <div className="flex justify-between items-center text-xs text-light/50">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(ticket.created_at), 'MMM d, yyyy')}
                        </div>
                        <span className={`px-2 py-0.5 rounded-full ${getPriorityBadge(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
          
          {/* Ticket detail view */}
          <div className="lg:col-span-2">
            <Card variant="glass" padding="md" className="h-[calc(100vh-240px)] flex flex-col">
              {!activeTicket ? (
                <div className="flex-1 flex items-center justify-center text-light/50">
                  <p>Select a ticket to view details</p>
                </div>
              ) : (
                <>
                  {/* Ticket header */}
                  <div className="border-b border-white/10 pb-4 mb-4">
                    <div className="flex justify-between items-start">
                      <h2 className="text-xl font-bold text-light">{activeTicket.subject}</h2>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(activeTicket.status)}`}>
                          {activeTicket.status}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityBadge(activeTicket.priority)}`}>
                          {activeTicket.priority}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center mt-2 text-sm text-light/60">
                      <User className="h-4 w-4 mr-1" />
                      <span>
                        {userProfiles[activeTicket.user_id]?.full_name || 'Loading user...'}
                        {userProfiles[activeTicket.user_id]?.email && ` (${userProfiles[activeTicket.user_id].email})`}
                      </span>
                      <span className="mx-2">•</span>
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{formatDate(activeTicket.created_at)}</span>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex gap-2 mt-4">
                      {activeTicket.status === 'open' && (
                        <button
                          onClick={() => updateTicketStatus(activeTicket.id, 'in_progress')}
                          className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm hover:bg-yellow-500/30 transition-colors"
                        >
                          Mark In Progress
                        </button>
                      )}
                      
                      {(activeTicket.status === 'open' || activeTicket.status === 'in_progress') && (
                        <button
                          onClick={() => updateTicketStatus(activeTicket.id, 'resolved')}
                          className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition-colors"
                        >
                          Mark Resolved
                        </button>
                      )}
                      
                      {activeTicket.status !== 'closed' && (
                        <button
                          onClick={() => updateTicketStatus(activeTicket.id, 'closed')}
                          className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
                        >
                          Close Ticket
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto pr-2 mb-4">
                    <div className="space-y-4">
                      {/* Initial message */}
                      <div className="bg-dark-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-light">
                            {userProfiles[activeTicket.user_id]?.full_name || 'User'}
                          </span>
                          <span className="text-xs text-light/50">
                            {formatDate(activeTicket.created_at)}
                          </span>
                        </div>
                        <p className="text-light/80">{activeTicket.message}</p>
                      </div>
                      
                      {/* Conversation */}
                      {ticketMessages.map(msg => (
                        <div 
                          key={msg.id}
                          className={`rounded-lg p-4 ${
                            msg.is_admin 
                              ? 'bg-primary/10 border border-primary/20 ml-4' 
                              : 'bg-dark-200 border border-white/5 mr-4'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-light">
                              {msg.is_admin 
                                ? 'Support Agent' 
                                : userProfiles[msg.user_id]?.full_name || 'User'}
                            </span>
                            <span className="text-xs text-light/50">
                              {formatDate(msg.created_at)}
                            </span>
                          </div>
                          <p className="text-light/80">{msg.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Reply form */}
                  {activeTicket.status !== 'closed' && (
                    <div className="border-t border-white/10 pt-4">
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSendResponse();
                        }}
                        className="flex gap-2"
                      >
                        <input
                          type="text"
                          value={newResponse}
                          onChange={(e) => setNewResponse(e.target.value)}
                          placeholder="Type your response..."
                          className="flex-1 px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-light focus:outline-none focus:ring-2 focus:ring-primary/50"
                          disabled={sendingResponse}
                        />
                        <button
                          type="submit"
                          disabled={!newResponse.trim() || sendingResponse}
                          className="px-4 py-2 bg-primary hover:bg-primary/90 text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {sendingResponse ? (
                            <RefreshCw className="h-5 w-5 animate-spin" />
                          ) : (
                            <Send className="h-5 w-5" />
                          )}
                        </button>
                      </form>
                    </div>
                  )}
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SupportTickets;