// src/components/TaskMasterWebGUI/WebGUI.tsx
import React, { useState } from 'react';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import TaskBoard from './TaskBoard';

// Navigation items
const navItems = [
  { id: 'board', label: 'Board', icon: 'layout-grid' },
  { id: 'list', label: 'List', icon: 'list' },
  { id: 'analytics', label: 'Analytics', icon: 'bar-chart' },
  { id: 'settings', label: 'Settings', icon: 'settings' }
];

/**
 * Main Web GUI component
 * Provides layout and navigation for the Task Master Web GUI
 */
const WebGUI: React.FC = () => {
  const { user, isLoading, signOut } = useSupabaseAuth();
  const [activeView, setActiveView] = useState('board');

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-dark">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-light">Loading Task Master Web GUI...</p>
        </div>
      </div>
    );
  }

  // Handle unauthenticated state
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-dark">
        <div className="bg-dark-200 p-8 rounded-lg max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6 text-center">Task Master</h1>
          <p className="text-light/60 mb-4 text-center">
            Please sign in to access the Task Master Web GUI
          </p>
          <a
            href="/auth"
            className="block w-full py-3 px-4 bg-primary text-dark rounded-lg font-medium text-center"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  // Render main layout
  return (
    <div className="flex h-screen bg-dark text-light">
      {/* Sidebar */}
      <div className="w-64 bg-dark-200 border-r border-dark-400 flex flex-col">
        <div className="p-4 border-b border-dark-400">
          <h1 className="text-xl font-bold">Task Master</h1>
          <p className="text-sm text-light/60">Type 3 Solar Platform</p>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map(item => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveView(item.id)}
                  className={`flex items-center w-full p-3 rounded-lg ${
                    activeView === item.id
                      ? 'bg-primary/20 text-primary'
                      : 'text-light/60 hover:bg-dark-300'
                  }`}
                >
                  <span className="mr-3">{/* Icon would go here */}</span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* User Info */}
        <div className="p-4 border-t border-dark-400">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm mr-2">
              {user.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 truncate">
              <div className="font-medium truncate">
                {user.email}
              </div>
              <div className="text-xs text-light/60">
                {user.user_metadata?.role || 'User'}
              </div>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full py-2 text-sm text-light/60 hover:text-light"
          >
            Sign Out
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-dark-200 border-b border-dark-400 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {navItems.find(item => item.id === activeView)?.label || 'Dashboard'}
          </h2>
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-lg bg-dark-300 text-light/60 hover:text-light">
              {/* Search icon would go here */}
              Search
            </button>
            <button className="p-2 rounded-lg bg-primary text-dark">
              + New Task
            </button>
          </div>
        </header>
        
        {/* Content Area */}
        <main className="p-0">
          {activeView === 'board' && <TaskBoard />}
          {activeView === 'list' && <div className="p-6">List view coming soon</div>}
          {activeView === 'analytics' && <div className="p-6">Analytics coming soon</div>}
          {activeView === 'settings' && <div className="p-6">Settings coming soon</div>}
        </main>
      </div>
    </div>
  );
};

export default WebGUI;
