// src/lib/taskMasterAuth.ts
import { supabase } from './supabaseClient';
import { Session, User } from '@supabase/supabase-js';

/**
 * Task Master Authentication Service 
 * Provides integration between Task Master and Supabase Authentication
 */
export class TaskMasterAuth {
  /**
   * Get the current authenticated user
   * @returns Promise with User object or null if not authenticated
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error('Error fetching current user:', error);
        return null;
      }

      return data?.user || null;
    } catch (error) {
      console.error('Unexpected error in getCurrentUser:', error);
      return null;
    }
  }

  /**
   * Get the current session
   * @returns Promise with Session object or null if no active session
   */
  static async getSession(): Promise<Session | null> {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error fetching session:', error);
        return null;
      }

      return data?.session || null;
    } catch (error) {
      console.error('Unexpected error in getSession:', error);
      return null;
    }
  }

  /**
   * Check if the current user has a specific role
   * @param role The role to check for
   * @returns Promise<boolean> True if user has the role
   */
  static async hasRole(role: string): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        return false;
      }

      // First check user metadata
      const userRole = user.user_metadata?.role;
      if (userRole === role) {
        return true;
      }

      // Then check user_profiles table
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return false;
      }

      return profile?.role === role;
    } catch (error) {
      console.error('Unexpected error in hasRole:', error);
      return false;
    }
  }

  /**
   * Check if the current user is an admin
   * @returns Promise<boolean> True if user is an admin
   */
  static async isAdmin(): Promise<boolean> {
    return this.hasRole('admin');
  }

  /**
   * Sign out the current user
   * @returns Promise<void>
   */
  static async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
      }
    } catch (error) {
      console.error('Unexpected error in signOut:', error);
    }
  }

  /**
   * Get task permissions for the current user
   * @returns Promise with user's task permissions
   */
  static async getTaskPermissions(): Promise<TaskPermissions | null> {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        return null;
      }

      // Check if admin (admins have all permissions)
      const isAdmin = await this.isAdmin();
      if (isAdmin) {
        return {
          canCreate: true,
          canUpdate: true,
          canDelete: true,
          canAssign: true,
          isAdmin: true
        };
      }

      // Fetch user-specific permissions
      const { data: permissions, error } = await supabase
        .from('task_permissions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching task permissions:', error);
        
        // Return default user permissions
        return {
          canCreate: true,
          canUpdate: true,
          canDelete: false,
          canAssign: false,
          isAdmin: false
        };
      }

      return {
        canCreate: permissions?.can_create || false,
        canUpdate: permissions?.can_update || false,
        canDelete: permissions?.can_delete || false,
        canAssign: permissions?.can_assign || false,
        isAdmin: false
      };
    } catch (error) {
      console.error('Unexpected error in getTaskPermissions:', error);
      return null;
    }
  }
}

/**
 * Task permissions interface
 */
export interface TaskPermissions {
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canAssign: boolean;
  isAdmin: boolean;
}

/**
 * Auth context interface for React context
 */
export interface AuthContext {
  user: User | null;
  session: Session | null;
  permissions: TaskPermissions | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}
