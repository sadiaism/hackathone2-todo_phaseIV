'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { TaskState, Task, TaskContextType } from '../types';
import { apiClient } from './api-client';

// Initial state
const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
  filter: 'all',
};

// Action types
type TaskAction =
  | { type: 'FETCH_TASKS_START' }
  | { type: 'FETCH_TASKS_SUCCESS'; payload: Task[] }
  | { type: 'FETCH_TASKS_FAILURE'; payload: string }
  | { type: 'CREATE_TASK_START' }
  | { type: 'CREATE_TASK_SUCCESS'; payload: Task }
  | { type: 'CREATE_TASK_FAILURE'; payload: string }
  | { type: 'UPDATE_TASK_START' }
  | { type: 'UPDATE_TASK_SUCCESS'; payload: Task }
  | { type: 'UPDATE_TASK_FAILURE'; payload: string }
  | { type: 'DELETE_TASK_START' }
  | { type: 'DELETE_TASK_SUCCESS'; payload: number }
  | { type: 'DELETE_TASK_FAILURE'; payload: string }
  | { type: 'TOGGLE_TASK_START' }
  | { type: 'TOGGLE_TASK_SUCCESS'; payload: Task }
  | { type: 'TOGGLE_TASK_FAILURE'; payload: string }
  | { type: 'SET_FILTER'; payload: 'all' | 'active' | 'completed' }
  | { type: 'SET_ERROR'; payload: string };

// Reducer
const taskReducer = (state: TaskState, action: TaskAction): TaskState => {
  switch (action.type) {
    case 'FETCH_TASKS_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'FETCH_TASKS_SUCCESS':
      return {
        ...state,
        tasks: action.payload,
        loading: false,
      };
    case 'FETCH_TASKS_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'CREATE_TASK_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'CREATE_TASK_SUCCESS':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
        loading: false,
      };
    case 'CREATE_TASK_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'UPDATE_TASK_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'UPDATE_TASK_SUCCESS':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        ),
        loading: false,
      };
    case 'UPDATE_TASK_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'DELETE_TASK_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'DELETE_TASK_SUCCESS':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
        loading: false,
      };
    case 'DELETE_TASK_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'TOGGLE_TASK_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'TOGGLE_TASK_SUCCESS':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        ),
        loading: false,
      };
    case 'TOGGLE_TASK_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'SET_FILTER':
      return {
        ...state,
        filter: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
};

// Create context
export const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Provider component
export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // Fetch tasks on mount
  useEffect(() => {
    const fetchTasks = async () => {
      dispatch({ type: 'FETCH_TASKS_START' });
      try {
        // Get user ID from stored user data
        const storedUser = typeof window !== 'undefined' ? localStorage.getItem('auth-user') : null;
        let userId = '1'; // default fallback
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            userId = user.id || '1';
          } catch (e) {
            console.error('Failed to parse stored user data:', e);
          }
        }

        const response = await apiClient.get(`/api/users/${userId}/tasks`);
        // Our backend returns the tasks directly in the response.data, not wrapped in a success object
        if (response.data && response.data.tasks) {
          dispatch({
            type: 'FETCH_TASKS_SUCCESS',
            payload: response.data.tasks,
          });
        } else {
          throw new Error('Failed to fetch tasks');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tasks';
        dispatch({ type: 'FETCH_TASKS_FAILURE', payload: errorMessage });
      }
    };

    fetchTasks();
  }, []);

  const createTask = async (title: string, description?: string) => {
    dispatch({ type: 'CREATE_TASK_START' });
    try {
      // Get user ID from stored user data
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('auth-user') : null;
      let userId = '1'; // default fallback
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          userId = user.id || '1';
        } catch (e) {
          console.error('Failed to parse stored user data:', e);
        }
      }

      const response = await apiClient.post(`/api/users/${userId}/tasks`, { title, description });
      // Our backend returns the task directly in the response.data, not wrapped in a success object
      if (response.data) {
        dispatch({
          type: 'CREATE_TASK_SUCCESS',
          payload: response.data,
        });
      } else {
        throw new Error('Failed to create task');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create task';
      dispatch({ type: 'CREATE_TASK_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const updateTask = async (id: number, updates: Partial<Task>) => {
    dispatch({ type: 'UPDATE_TASK_START' });
    try {
      // Get user ID from stored user data
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('auth-user') : null;
      let userId = '1'; // default fallback
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          userId = user.id || '1';
        } catch (e) {
          console.error('Failed to parse stored user data:', e);
        }
      }

      const response = await apiClient.put(`/api/users/${userId}/tasks/${id.toString()}`, updates);
      // Our backend returns the task directly in the response.data, not wrapped in a success object
      if (response.data) {
        dispatch({
          type: 'UPDATE_TASK_SUCCESS',
          payload: response.data,
        });
      } else {
        throw new Error('Failed to update task');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task';
      dispatch({ type: 'UPDATE_TASK_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const deleteTask = async (id: number) => {
    dispatch({ type: 'DELETE_TASK_START' });
    try {
      // Get user ID from stored user data
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('auth-user') : null;
      let userId = '1'; // default fallback
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          userId = user.id || '1';
        } catch (e) {
          console.error('Failed to parse stored user data:', e);
        }
      }

      const response = await apiClient.delete(`/api/users/${userId}/tasks/${id.toString()}`);
      // Our backend returns 204 No Content on successful deletion, so check status
      if (response.status === 204 || response.status === 200) {
        dispatch({
          type: 'DELETE_TASK_SUCCESS',
          payload: id,
        });
      } else {
        throw new Error('Failed to delete task');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete task';
      dispatch({ type: 'DELETE_TASK_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const toggleTaskCompletion = async (id: number) => {
    dispatch({ type: 'TOGGLE_TASK_START' });
    try {
      // Find the current task to get its current completion status
      const currentTask = state.tasks.find(task => task.id === id);
      if (!currentTask) {
        throw new Error('Task not found');
      }

      // Get user ID from stored user data
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('auth-user') : null;
      let userId = '1'; // default fallback
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          userId = user.id || '1';
        } catch (e) {
          console.error('Failed to parse stored user data:', e);
        }
      }

      const response = await apiClient.patch(`/api/users/${userId}/tasks/${id.toString()}/complete`, {
        completed: !currentTask.completed
      });

      // Our backend returns the task directly in the response.data, not wrapped in a success object
      if (response.data) {
        dispatch({
          type: 'TOGGLE_TASK_SUCCESS',
          payload: response.data,
        });
      } else {
        throw new Error('Failed to toggle task completion');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle task completion';
      dispatch({ type: 'TOGGLE_TASK_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const setFilter = (filter: 'all' | 'active' | 'completed') => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  };

  return (
    <TaskContext.Provider
      value={{
        state,
        createTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
        setFilter,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

// Custom hook to use task context
export const useTasks = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};