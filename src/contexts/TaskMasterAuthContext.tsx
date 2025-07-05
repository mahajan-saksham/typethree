// src/contexts/TaskMasterAuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { TaskMasterAuth, TaskPermissions, AuthContext } from '../lib/taskMasterAuth';
import { supabase } from '../lib/supabaseClient';

// Create context with default values
const TaskMasterAuthContext = createContext<AuthContext>({
  user: null,
  session: null,
  permissions: null,
  isLoading: true,
  signOut: async () => {},
  refreshSession: async () => {}
});

/**
 * TaskMasterAuthProvider component 
 * Provides authentication state and methods to child components
 */
export const TaskMasterAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [permissions, setPermissions] = useState<TaskPermissions | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Function to load auth data
  const loadAuthData = async () => {
    setIsLoading(true);
    try {
      // Get current session
      const currentSession = await TaskMasterAuth.getSession();
      setSession(currentSession);

      // Get current user
      const currentUser = await TaskMasterAuth.getCurrentUser();
      setUser(currentUser);

      // Get user permissions
      if (currentUser) {
        const userPermissions = await TaskMasterAuth.getTaskPermissions();
        setPermissions(userPermissions);
      } else {
        setPermissions(null);
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load auth data on component mount
  useEffect(() => {
    loadAuthData();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          await loadAuthData();
        }
      }
    );

    // Cleanup subscription
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  /**
   * Sign out the current user
   */
  const signOut = async () => {
    await TaskMasterAuth.signOut();
    setUser(null);
    setSession(null);
    setPermissions(null);
  };

  /**
   * Refresh the current session
   */
  const refreshSession = async () => {
    await loadAuthData();
  };

  // Context value
  const value: AuthContext = {
    user,
    session,
    permissions,
    isLoading,
    signOut,
    refreshSession
  };

  return (
    <TaskMasterAuthContext.Provider value={value}>
      {children}
    </TaskMasterAuthContext.Provider>
  );
};

/**
 * Custom hook for using the Task Master auth context
 */
export const useTaskMasterAuth = () => {
  const context = useContext(TaskMasterAuthContext);
  
  if (context === undefined) {
    throw new Error('useTaskMasterAuth must be used within a TaskMasterAuthProvider');
  }
  
  return context;
};
