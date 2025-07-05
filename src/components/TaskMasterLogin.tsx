// src/components/TaskMasterLogin.tsx
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Loader2, AlertCircle, ArrowRight } from 'lucide-react';

interface TaskMasterLoginProps {
  onSuccess?: () => void;
}

/**
 * Task Master Login Component
 * Provides a login interface for Task Master authentication
 */
const TaskMasterLogin: React.FC<TaskMasterLoginProps> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-dark-200 rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-light mb-6">Task Master Login</h2>
      
      {error && (
        <div className="p-4 mb-4 bg-error/10 border border-error/20 rounded-lg flex items-center gap-3 text-error">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-light/80 mb-1">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-10 rounded-lg border border-light/20 bg-dark-300 text-light px-3"
            required
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-light/80 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-10 rounded-lg border border-light/20 bg-dark-300 text-light px-3"
            required
          />
        </div>
        
        <button
          type="submit"
          className="w-full h-10 bg-primary text-dark rounded-lg font-medium flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              Log In
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default TaskMasterLogin;
