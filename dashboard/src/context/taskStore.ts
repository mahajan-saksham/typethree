import { create } from 'zustand';
import { Task, TaskFilter, TaskStatus, TasksData } from '@/types/task';
import { TaskService } from '@/services/taskService';

interface TaskStore {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  filter: TaskFilter;
  selectedTaskId: number | null;
  dashboardStats: any;

  // Actions
  fetchTasks: () => Promise<void>;
  fetchDashboardStats: () => Promise<void>;
  setFilter: (filter: Partial<TaskFilter>) => void;
  selectTask: (taskId: number | null) => void;
  getFilteredTasks: () => Task[];
  getTaskById: (id: number) => Task | undefined;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  filter: { status: 'all', priority: 'all', search: '', category: 'all' },
  selectedTaskId: null,
  dashboardStats: null,

  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const tasksData: TasksData = await TaskService.getAllTasks();
      set({ tasks: tasksData.tasks, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
    }
  },

  fetchDashboardStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const stats = await TaskService.getDashboardStats();
      set({ dashboardStats: stats, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
    }
  },

  setFilter: (newFilter) => {
    set({ filter: { ...get().filter, ...newFilter } });
  },

  selectTask: (taskId) => {
    set({ selectedTaskId: taskId });
  },

  getFilteredTasks: () => {
    const { tasks, filter } = get();
    return tasks.filter(task => {
      // Filter by status
      if (filter.status !== 'all' && task.status !== filter.status) {
        return false;
      }

      // Filter by priority
      if (filter.priority !== 'all' && task.priority !== filter.priority) {
        return false;
      }

      // Filter by search text
      if (filter.search && filter.search.trim() !== '') {
        const searchText = filter.search.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(searchText);
        const matchesDescription = task.description.toLowerCase().includes(searchText);
        if (!matchesTitle && !matchesDescription) {
          return false;
        }
      }

      // Filter by category
      if (filter.category !== 'all') {
        if (filter.category === 'security' && task.id > 15) {
          return false;
        }
        if (filter.category === 'product' && (task.id <= 15 || task.id >= 34)) {
          return false;
        }
        if (filter.category === 'infrastructure' && task.id < 34) {
          return false;
        }
      }

      return true;
    });
  },

  getTaskById: (id) => {
    return get().tasks.find(task => task.id === id);
  },
}));
