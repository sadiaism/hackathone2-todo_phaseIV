// User interface
export interface User {
  id: number;
  email: string;
  username: string;
  is_active?: boolean;
  is_superuser?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
}

// Task interface
export interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  user_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  filter: 'all' | 'active' | 'completed';
}

// API Response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}

export interface TaskListResponse {
  success: boolean;
  tasks: Task[];
  error?: string;
}

export interface TaskResponse {
  success: boolean;
  task?: Task;
  error?: string;
}

// Context interfaces
export interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

export interface TaskContextType {
  state: TaskState;
  createTask: (title: string, description?: string) => Promise<void>;
  updateTask: (id: number, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  toggleTaskCompletion: (id: number) => Promise<void>;
  setFilter: (filter: 'all' | 'active' | 'completed') => void;
}