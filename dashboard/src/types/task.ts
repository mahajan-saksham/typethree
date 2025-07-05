export type TaskStatus = 'pending' | 'in-progress' | 'done' | 'review' | 'deferred' | 'cancelled';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface Subtask {
  id: number;
  title: string;
  description: string;
  details?: string;
  status: TaskStatus;
  dependencies: number[];
  parentTaskId: number;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  details?: string;
  testStrategy?: string;
  status: TaskStatus;
  dependencies: number[];
  priority: TaskPriority;
  subtasks: Subtask[];
}

export interface TasksData {
  tasks: Task[];
  lastId: number;
}

export interface CategoryGroup {
  name: string;
  tasks: Task[];
}

export interface TaskStatusCounts {
  pending: number;
  inProgress: number;
  done: number;
  review: number;
  deferred: number;
  cancelled: number;
  total: number;
}

export interface TaskFilter {
  status?: TaskStatus | 'all';
  priority?: TaskPriority | 'all';
  search?: string;
  category?: string | 'all';
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  completionPercentage: number;
  statusCounts: TaskStatusCounts;
  categoryBreakdown: Record<string, number>;
  highPriorityTasks: number;
  nextTasks: Task[];
  recentlyCompletedTasks: Task[];
}
