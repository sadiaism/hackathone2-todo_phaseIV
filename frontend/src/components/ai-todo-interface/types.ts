export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface AIResponse {
  status: 'success' | 'error';
  result?: {
    type: string;
    message: string;
    task?: Task;
    tasks?: Task[];
  };
  tool_used?: string;
  execution_time_ms?: number;
  error_code?: string;
  message?: string;
  suggestions?: string[];
}