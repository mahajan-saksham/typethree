import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send, Paperclip, ArrowUpRight, LifeBuoy, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface Ticket {
  id: string;
  subject: string;
  category: 'technical' | 'billing' | 'system' | 'general';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  last_updated: string;
}

interface Message {
  id: string;
  ticket_id: string;
  sender: 'user' | 'support';
  content: string;
  created_at: string;
}

const Support: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [newTicketFormVisible, setNewTicketFormVisible] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'general',
    description: ''
  });
  
  // Fetch support tickets
  useEffect(() => {
    const fetchTickets = async () => {
      setIsLoading(true);
      try {
        // In a real app, we would fetch from Supabase
        const { data, error } = await supabase
          .from('support_tickets')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          setTickets(data as Ticket[]);
          // Set first ticket as active by default
          setActiveTicket(data[0] as Ticket);
        } else {
          // Mock data for demonstration
          const mockTickets: Ticket[] = [
            {
              id: 'ticket-1',
              subject: 'Question about ROI calculation',
              category: 'investment',
              status: 'open',
              created_at: '2025-03-15T10:30:00Z',
              last_updated: '2025-03-15T10:30:00Z'
            },
            {
              id: 'ticket-2',
              subject: 'Payment confirmation for my recent investment',
              category: 'billing',
              status: 'in_progress',
              created_at: '2025-03-10T14:20:00Z',
              last_updated: '2025-03-11T09:15:00Z'
            },
            {
              id: 'ticket-3',
              subject: 'Unable to view my wattage credits',
              category: 'technical',
              status: 'resolved',
              created_at: '2025-03-01T11:45:00Z',
              last_updated: '2025-03-05T16:30:00Z'
            }
          ];
          
          setTickets(mockTickets);
          setActiveTicket(mockTickets[0]);
        }
      } catch (error) {
        console.error('Error fetching support tickets:', error);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 800);
      }
    };

    fetchTickets();
  }, []);
  
  // Fetch messages for active ticket
  useEffect(() => {
    if (activeTicket) {
      const fetchMessages = async () => {
        try {
          // In a real app, we would fetch from Supabase
          const { data, error } = await supabase
            .from('support_messages')
            .select('*')
            .eq('ticket_id', activeTicket.id)
            .order('created_at', { ascending: true });

          if (error) throw error;

          if (data && data.length > 0) {
            setMessages(data as Message[]);
          } else {
            // Mock data for demonstration
            const mockMessages: Message[] = [
              {
                id: 'msg-1',
                ticket_id: activeTicket.id,
                sender: 'user',
                content: `I have a question about the energy production calculation for my rooftop solar system. The dashboard shows 14.5% above expected output but the performance details page mentioned 14.8%. Which one is correct?`,
                created_at: '2025-03-15T10:30:00Z'
              },
              {
                id: 'msg-2',
                ticket_id: activeTicket.id,
                sender: 'support',
                content: `Hello! Thank you for reaching out. The correct IRR is 14.8% as mentioned in the project details. There was a minor display issue on the dashboard which has now been fixed. You should see the updated value on refreshing your dashboard. Let me know if you have any other questions!`,
                created_at: '2025-03-15T11:15:00Z'
              },
              {
                id: 'msg-3',
                ticket_id: activeTicket.id,
                sender: 'user',
                content: `Thanks for the quick response! I refreshed the dashboard and now I can see the correct value. One more question - when will the first payout for this project be processed?`,
                created_at: '2025-03-15T11:30:00Z'
              },
            ];
            
            setMessages(mockMessages);
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };

      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [activeTicket]);

  // Handle sending a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeTicket) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      ticket_id: activeTicket.id,
      sender: 'user',
      content: newMessageText,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
    setNewMessageText('');

    // In a real app, we would send to Supabase
    // const { data, error } = await supabase.from('support_messages').insert([newMessage]);
    
    // Simulate support response after a delay
    setTimeout(() => {
      const supportResponse: Message = {
        id: `msg-${Date.now() + 1}`,
        ticket_id: activeTicket.id,
        sender: 'support',
        content: 'Thank you for your message. Our team will get back to you shortly with more information about the payout schedule.',
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, supportResponse]);
    }, 5000);
  };

  // Create a new ticket
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.subject.trim() || !newTicket.description.trim()) return;

    const ticketId = `ticket-${Date.now()}`;
    const newTicketObj: Ticket = {
      id: ticketId,
      subject: newTicket.subject,
      category: newTicket.category as any,
      status: 'open',
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString()
    };

    const initialMessage: Message = {
      id: `msg-${Date.now()}`,
      ticket_id: ticketId,
      sender: 'user',
      content: newTicket.description,
      created_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert([newTicketObj]);

      if (error) throw error;

      const { data: msgData, error: msgError } = await supabase
        .from('support_messages')
        .insert([initialMessage]);

      if (msgError) throw msgError;

      setTickets(prev => [newTicketObj, ...prev]);
      setActiveTicket(newTicketObj);
      setMessages([initialMessage]);
      setNewTicketFormVisible(false);
      setNewTicket({
        subject: '',
        category: 'general',
        description: ''
      });
    } catch (error) {
      console.error('Error creating new ticket:', error);
    }
  };

  // Format date string to readable format
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render ticket status badge
  const renderTicketStatus = (status: Ticket['status']) => {
    switch (status) {
      case 'open':
        return <span className="flex items-center text-blue-400 text-xs"><Clock className="h-3 w-3 mr-1" /> Open</span>;
      case 'in_progress':
        return <span className="flex items-center text-amber-400 text-xs"><AlertCircle className="h-3 w-3 mr-1" /> In Progress</span>;
      case 'resolved':
        return <span className="flex items-center text-green-400 text-xs"><CheckCircle className="h-3 w-3 mr-1" /> Resolved</span>;
      case 'closed':
        return <span className="flex items-center text-light/60 text-xs"><CheckCircle className="h-3 w-3 mr-1" /> Closed</span>;
      default:
        return null;
    }
  };

  // Render category badge
  const renderCategory = (category: Ticket['category']) => {
    switch (category) {
      case 'technical':
        return <span className="px-2 py-1 bg-purple-400/20 text-purple-400 text-xs rounded-full">Technical</span>;
      case 'billing':
        return <span className="px-2 py-1 bg-amber-400/20 text-amber-400 text-xs rounded-full">Billing</span>;
      case 'investment':
        return <span className="px-2 py-1 bg-blue-400/20 text-blue-400 text-xs rounded-full">Investment</span>;
      case 'general':
        return <span className="px-2 py-1 bg-green-400/20 text-green-400 text-xs rounded-full">General</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <section className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-light">Support & Inquiries</h1>
            <p className="text-light/60 mt-1">Get help and support for your rooftop solar system</p>
          </div>
          <button 
            onClick={() => setNewTicketFormVisible(true)}
            className="mt-4 md:mt-0 bg-primary hover:bg-primary/90 text-dark font-medium rounded-lg px-4 py-2 flex items-center"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            New Support Ticket
          </button>
        </div>
      </section>

      {newTicketFormVisible ? (
        <motion.section 
          className="mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-dark-100 border border-white/10 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-light">Create New Support Ticket</h2>
              <button 
                onClick={() => setNewTicketFormVisible(false)}
                className="text-light/60 hover:text-light"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleCreateTicket}>
              <div className="mb-4">
                <label className="block text-light font-medium mb-2">Subject</label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                  className="w-full bg-dark-200 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-light"
                  placeholder="Enter a subject for your inquiry"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-light font-medium mb-2">Category</label>
                <select
                  value={newTicket.category}
                  onChange={(e) => setNewTicket({...newTicket, category: e.target.value as any})}
                  className="w-full bg-dark-200 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-light appearance-none"
                >
                  <option value="general">General Inquiry</option>
                  <option value="technical">Technical Support</option>
                  <option value="billing">Billing & Payments</option>
                  <option value="system">Solar System Questions</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-light font-medium mb-2">Description</label>
                <textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                  className="w-full bg-dark-200 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-light min-h-[120px]"
                  placeholder="Describe your issue or question in detail"
                  required
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button 
                  type="button"
                  onClick={() => setNewTicketFormVisible(false)}
                  className="bg-dark-200 hover:bg-dark-300 text-light font-medium rounded-lg px-6 py-2"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-dark font-medium rounded-lg px-6 py-2"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </motion.section>
      ) : (
        <section className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tickets list */}
          <div className="bg-dark-100 border border-white/10 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-light">My Tickets</h2>
            </div>
            
            {isLoading ? (
              <div className="p-8 flex justify-center items-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : tickets.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-light/60">You haven't created any support tickets yet.</p>
              </div>
            ) : (
              <div className="overflow-y-auto max-h-[500px]">
                {tickets.map((ticket) => (
                  <motion.div 
                    key={ticket.id}
                    onClick={() => setActiveTicket(ticket)}
                    className={`p-4 border-b border-white/5 cursor-pointer transition-colors ${activeTicket?.id === ticket.id ? 'bg-white/5' : 'hover:bg-white/5'}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`font-medium ${activeTicket?.id === ticket.id ? 'text-primary' : 'text-light'}`}>{ticket.subject}</h3>
                      {renderTicketStatus(ticket.status)}
                    </div>
                    <div className="flex justify-between items-center">
                      <div>{renderCategory(ticket.category)}</div>
                      <div className="text-light/60 text-xs">{new Date(ticket.created_at).toLocaleDateString()}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Conversation */}
          <div className="col-span-1 lg:col-span-2 bg-dark-100 border border-white/10 rounded-xl flex flex-col">
            {activeTicket ? (
              <>
                <div className="p-4 border-b border-white/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-bold text-light">{activeTicket.subject}</h2>
                      <div className="flex items-center mt-1 space-x-3">
                        <div>{renderCategory(activeTicket.category)}</div>
                        <div>{renderTicketStatus(activeTicket.status)}</div>
                      </div>
                    </div>
                    <div className="text-light/60 text-xs">
                      Created: {formatDate(activeTicket.created_at)}
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[350px]">
                  {messages.map((message) => (
                    <motion.div 
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className={`max-w-[80%] rounded-lg p-3 ${message.sender === 'user' ? 'bg-primary/20 text-light' : 'bg-dark-200 text-light'}`}>
                        <div className="text-sm mb-1">{message.content}</div>
                        <div className="text-xs text-light/60 text-right">{formatDate(message.created_at)}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="p-4 border-t border-white/10">
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <button 
                      type="button"
                      className="text-light/40 hover:text-light p-2"
                    >
                      <Paperclip className="h-5 w-5" />
                    </button>
                    <input
                      type="text"
                      value={newMessageText}
                      onChange={(e) => setNewMessageText(e.target.value)}
                      className="flex-1 bg-dark-200 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-light"
                      placeholder="Type your message..."
                      disabled={activeTicket.status === 'closed' || activeTicket.status === 'resolved'}
                    />
                    <button 
                      type="submit"
                      className="bg-primary text-dark p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!newMessageText.trim() || activeTicket.status === 'closed' || activeTicket.status === 'resolved'}
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </form>
                  
                  {(activeTicket.status === 'closed' || activeTicket.status === 'resolved') && (
                    <div className="mt-2 text-center text-light/60 text-sm">
                      This ticket is {activeTicket.status === 'closed' ? 'closed' : 'resolved'}. 
                      <button className="text-primary ml-1">Reopen ticket</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-8 flex flex-col items-center justify-center h-full">
                <div className="bg-dark-200 p-6 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <MessageCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-light mb-2">No conversation selected</h3>
                <p className="text-light/60 mb-6 text-center max-w-md">
                  Select a ticket from the list or create a new support ticket to start a conversation.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* FAQs & Resources */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-light mb-6">Frequently Asked Questions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-dark-100 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-light mb-4">Investment FAQs</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-light mb-2">What is the average installation time?</h4>
                <p className="text-light/70">Most Type 3 rooftop solar systems are installed within 3-7 business days.</p>
              </div>
              
              <div>
                <h4 className="font-medium text-light mb-2">How much can I save on my electricity bill?</h4>
                <p className="text-light/70">A typical rooftop solar system can reduce your electricity bills by 70-90% depending on your consumption pattern.</p>
              </div>
              
              <div>
                <h4 className="font-medium text-light mb-2">How do wattage credits work?</h4>
                <p className="text-light/70">Wattage credits represent excess energy your system generates, which can be applied to future bills or redeemed for cash.</p>
              </div>
              
              <a href="#" className="text-primary flex items-center mt-4 hover:underline">
                <span>View all rooftop solar FAQs</span>
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </a>
            </div>
          </div>
          
          <div className="bg-dark-100 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-light mb-4">Technical Support</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-light mb-2">How do I update my account information?</h4>
                <p className="text-light/70">You can update your profile information from the Profile section in your dashboard.</p>
              </div>
              
              <div>
                <h4 className="font-medium text-light mb-2">What payment methods are accepted?</h4>
                <p className="text-light/70">We accept UPI, NEFT/RTGS transfers, and all major credit/debit cards for investments.</p>
              </div>
              
              <div className="p-4 border border-primary/20 rounded-lg bg-primary/5">
                <h4 className="font-medium text-primary mb-2">Need immediate assistance?</h4>
                <p className="text-light/70 text-sm mb-3">
                  Our support team is available Monday-Saturday, 9am to 6pm IST.
                </p>
                <div className="flex items-center">
                  <LifeBuoy className="h-5 w-5 mr-2 text-primary" />
                  <span className="text-light">+91 9922116543</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Support;
