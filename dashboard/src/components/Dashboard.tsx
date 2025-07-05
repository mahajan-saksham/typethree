import React, { useEffect } from 'react';
import { useTaskStore } from '@/context/taskStore';
import TaskStatusChart from './charts/TaskStatusChart';
import TaskProgressChart from './charts/TaskProgressChart';
import TasksTable from './tasks/TasksTable';
import TasksSummary from './summary/TasksSummary';
import ProjectProgress from './progress/ProjectProgress';
import TaskLists from './lists/TaskLists';
import PageHeader from './ui/PageHeader';

const Dashboard: React.FC = () => {
  const { fetchTasks, fetchDashboardStats, isLoading, error, dashboardStats } = useTaskStore();

  useEffect(() => {
    fetchTasks();
    fetchDashboardStats();
  }, [fetchTasks, fetchDashboardStats]);

  if (isLoading && !dashboardStats) {
    return (
      <div className="dashboard-container flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-medium">Error Loading Dashboard</h2>
          <p>{error}</p>
          <button 
            className="mt-2 btn btn-primary"
            onClick={() => {
              fetchTasks();
              fetchDashboardStats();
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <PageHeader 
        title="Type 3 Solar - TaskMaster Dashboard" 
        subtitle={`Last updated: ${new Date().toLocaleString()}`} 
      />

      <TasksSummary stats={dashboardStats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <TaskStatusChart stats={dashboardStats} />
        <TaskProgressChart stats={dashboardStats} />
      </div>

      <TasksTable />

      <ProjectProgress stats={dashboardStats} />

      <TaskLists />
    </div>
  );
};

export default Dashboard;
