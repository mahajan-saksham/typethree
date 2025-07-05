import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Shield, LogOut, Edit, CheckCircle, Key, Bell, Download } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: 'investor' | 'rooftop';
  created_at: string;
  avatar_url?: string;
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    investment: true,
    payout: true,
    news: false
  });
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.error('No authenticated user found');
          setIsLoading(false);
          return;
        }
        
        console.log('Fetching profile for user:', user.id);
        
        // Get user profile
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          // Instead of creating a mock profile that might not work with the database,
          // let's just use the basic user info we have
          const basicProfile: UserProfile = {
            id: user.id,
            user_id: user.id,
            full_name: user.email?.split('@')[0] || 'User',
            email: user.email || '',
            phone: '',
            role: 'investor',
            created_at: new Date().toISOString(),
            avatar_url: ''
          };
          
          setProfile(basicProfile);
          setEditedProfile(basicProfile);
        } else if (data) {
          console.log('Profile found:', data);
          setProfile(data as UserProfile);
          setEditedProfile(data);
        }
      } catch (error) {
        console.error('Error in profile fetch process:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Format date to readable format
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle update profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) return;
    
    try {
      console.log('Attempting to update profile:', editedProfile);
      
      // Update profile in the Supabase database
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: editedProfile.full_name,
          phone: editedProfile.phone
        })
        .eq('user_id', profile.user_id);
      
      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }
      
      console.log('Profile updated successfully in Supabase');
      
      // Update local state
      setProfile({
        ...profile,
        full_name: editedProfile.full_name || profile.full_name,
        phone: editedProfile.phone || profile.phone
      });
      
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Toggle notification settings
  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="min-h-screen">
      <section className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-light">Profile Settings</h1>
            <p className="text-light/60 mt-1">Manage your account settings and preferences</p>
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : profile ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card - Left Column */}
          <div className="col-span-1">
            <motion.div 
              className="bg-dark-100 border border-white/10 rounded-xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-primary/20 h-32 relative">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-dark-100 rounded-full p-1.5 border-4 border-dark-100">
                  <div className="bg-primary/30 w-20 h-20 rounded-full flex items-center justify-center">
                    <span className="text-3xl font-bold text-primary">{profile.full_name.charAt(0)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-14 p-6 text-center">
                <h2 className="text-xl font-bold text-light">{profile.full_name}</h2>
                <p className="text-light/60 mt-1">{profile.role === 'investor' ? 'Solar Investor' : 'Rooftop Owner'}</p>
                
                <div className="bg-primary/10 rounded-lg px-3 py-1.5 inline-block mt-2">
                  <span className="text-primary text-sm font-medium capitalize">{profile.role} Account</span>
                </div>
                
                <div className="mt-6 border-t border-white/10 pt-6">
                  <div className="flex items-center justify-center mb-4">
                    <Mail className="h-4 w-4 mr-2 text-light/40" />
                    <span className="text-light/70">{profile.email}</span>
                  </div>
                  
                  {profile.phone && (
                    <div className="flex items-center justify-center">
                      <Phone className="h-4 w-4 mr-2 text-light/40" />
                      <span className="text-light/70">{profile.phone}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-6">
                  <button 
                    onClick={() => setIsEditing(true)} 
                    className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center w-full transition-colors"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Account Info Card */}
            <motion.div
              className="bg-dark-100 border border-white/10 rounded-xl overflow-hidden mt-6 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <h3 className="text-lg font-bold text-light mb-4">Account Info</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-light/60">Member Since</span>
                  <span className="text-light">{formatDate(profile.created_at)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-light/60">Account Type</span>
                  <span className="text-light capitalize">{profile.role}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-light/60">User ID</span>
                  <span className="text-light/70 text-xs">{profile.user_id.substring(0, 8)}...</span>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-white/10">
                <button 
                  onClick={handleLogout}
                  className="bg-dark-300 hover:bg-dark-400 text-light/70 hover:text-light px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center w-full transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </div>
          
          {/* Settings Panels - Now Single Column */}
          <div className="col-span-2">
            <div className="space-y-6">
              
              {/* Edit Profile Form */}
              <motion.div 
                className="bg-dark-100 border border-white/10 rounded-xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <h3 className="text-lg font-bold text-light mb-6">Edit Profile</h3>
                
                {successMessage && (
                  <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg mb-6">
                    {successMessage}
                  </div>
                )}
                
                <form onSubmit={handleUpdateProfile}>
                  <div className="mb-4">
                    <label className="block text-light/70 mb-2 text-sm">Full Name</label>
                    <input 
                      type="text" 
                      value={isEditing ? editedProfile.full_name : profile.full_name} 
                      onChange={(e) => setEditedProfile({...editedProfile, full_name: e.target.value})}
                      disabled={!isEditing}
                      className="w-full bg-dark-200 border border-white/10 rounded-lg px-4 py-2 text-light focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-light/70 mb-2 text-sm">Email Address</label>
                    <input 
                      type="email" 
                      value={profile.email} 
                      disabled
                      className="w-full bg-dark-300 border border-white/10 rounded-lg px-4 py-2 text-light/50 focus:outline-none cursor-not-allowed"
                    />
                    <p className="text-light/50 text-xs mt-1">Email cannot be changed. Contact support for help.</p>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-light/70 mb-2 text-sm">Phone Number</label>
                    <input 
                      type="tel" 
                      value={isEditing ? editedProfile.phone || '' : profile.phone || ''} 
                      onChange={(e) => setEditedProfile({...editedProfile, phone: e.target.value})}
                      disabled={!isEditing}
                      placeholder="+91 1234567890"
                      className="w-full bg-dark-200 border border-white/10 rounded-lg px-4 py-2 text-light focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  
                  {isEditing && (
                    <div className="flex space-x-4">
                      <button 
                        type="submit" 
                        className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex-1 transition-colors"
                      >
                        Save Changes
                      </button>
                      <button 
                        type="button" 
                        onClick={() => {
                          setIsEditing(false);
                          setEditedProfile(profile);
                        }} 
                        className="bg-dark-300 hover:bg-dark-400 text-light px-4 py-2 rounded-lg text-sm font-medium flex-1 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </form>
              </motion.div>
              
              {/* Security Section */}
              <motion.div 
                className="bg-dark-100 border border-white/10 rounded-xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <h3 className="text-lg font-bold text-light mb-6">Security</h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-dark-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Key className="h-5 w-5 mr-2 text-light/60" />
                        <div>
                          <h4 className="font-medium text-light">Password</h4>
                          <p className="text-light/60 text-sm">Change your password</p>
                        </div>
                      </div>
                      <button className="bg-dark-300 hover:bg-dark-400 text-light px-3 py-1 rounded-lg text-sm transition-colors">
                        Change
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-dark-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 mr-2 text-light/60" />
                        <div>
                          <h4 className="font-medium text-light">Email Verification</h4>
                          <p className="text-light/60 text-sm">Your email is verified</p>
                        </div>
                      </div>
                      <div className="text-green-400 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span>Verified</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-dark-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 mr-2 text-light/60" />
                        <div>
                          <h4 className="font-medium text-light">Phone Verification</h4>
                          <p className="text-light/60 text-sm">Verify your phone number</p>
                        </div>
                      </div>
                      <button className="bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1 rounded-lg text-sm transition-colors">
                        Verify
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Notification Settings */}
              <motion.div 
                className="bg-dark-100 border border-white/10 rounded-xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-light">Notifications</h3>
                  <div className="flex items-center space-x-2">
                    <Bell className="h-4 w-4 text-light/60" />
                    <span className="text-light/60 text-sm">Manage alerts</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-light">Email Notifications</h4>
                      <p className="text-light/60 text-sm">Receive emails about your account activity</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={notifications.email} 
                        onChange={() => toggleNotification('email')} 
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-dark-300 rounded-full peer peer-checked:bg-primary/30 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-dark-400 after:peer-checked:bg-primary after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-light">SMS Notifications</h4>
                      <p className="text-light/60 text-sm">Receive text messages for important updates</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={notifications.sms} 
                        onChange={() => toggleNotification('sms')} 
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-dark-300 rounded-full peer peer-checked:bg-primary/30 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-dark-400 after:peer-checked:bg-primary after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-light">Investment Updates</h4>
                      <p className="text-light/60 text-sm">Get notified about your investment activity</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={notifications.investment} 
                        onChange={() => toggleNotification('investment')} 
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-dark-300 rounded-full peer peer-checked:bg-primary/30 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-dark-400 after:peer-checked:bg-primary after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-light">Payout Notifications</h4>
                      <p className="text-light/60 text-sm">Get notified when you receive payments</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={notifications.payout} 
                        onChange={() => toggleNotification('payout')} 
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-dark-300 rounded-full peer peer-checked:bg-primary/30 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-dark-400 after:peer-checked:bg-primary after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-light">Newsletter & Tips</h4>
                      <p className="text-light/60 text-sm">Receive news about solar energy and investment tips</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={notifications.news} 
                        onChange={() => toggleNotification('news')} 
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-dark-300 rounded-full peer peer-checked:bg-primary/30 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-dark-400 after:peer-checked:bg-primary after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>
                </div>
              </motion.div>
              
              {/* Data & Privacy */}
              <motion.div 
                className="bg-dark-100 border border-white/10 rounded-xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <h3 className="text-lg font-bold text-light mb-6">Data & Privacy</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-dark-200 rounded-lg">
                    <h4 className="font-medium text-light mb-2">Export Personal Data</h4>
                    <p className="text-light/70 text-sm mb-3">
                      Download a copy of your personal data and investment records.
                    </p>
                    <button className="bg-dark-300 hover:bg-dark-400 text-light text-sm font-medium rounded-lg px-4 py-2 flex items-center">
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </button>
                  </div>
                  
                  <div className="p-4 bg-dark-200 rounded-lg">
                    <h4 className="font-medium text-red-400 mb-2">Delete Account</h4>
                    <p className="text-light/70 text-sm mb-3">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <button className="bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium rounded-lg px-4 py-2">
                      Request Account Deletion
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-dark-100 border border-white/10 rounded-xl p-6 text-center">
          <h3 className="text-xl font-bold text-light mb-2">No Profile Found</h3>
          <p className="text-light/60 mb-6">We couldn't find your profile. Please sign in again or contact support.</p>
          <button 
            onClick={handleLogout}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;
