'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthState, User, AuthResponse, AuthContextType } from '../types';

// Initial state
const initialState: AuthState = {
  currentUser: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  token: null,
};

// Action types
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'SIGNUP_START' }
  | { type: 'SIGNUP_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'SIGNUP_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'CHECK_AUTH_STATUS' };

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
    case 'SIGNUP_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
    case 'SIGNUP_SUCCESS':
      return {
        ...state,
        currentUser: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        token: action.payload.token,
        error: null,
      };
    case 'LOGIN_FAILURE':
    case 'SIGNUP_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
        token: null,
      };
    case 'LOGOUT':
      return {
        ...state,
        currentUser: null,
        isAuthenticated: false,
        token: null,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'CHECK_AUTH_STATUS':
      return {
        ...state,
        isLoading: false,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check auth status on mount
  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    const user = localStorage.getItem('auth-user');

    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user: parsedUser, token },
        });
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        dispatch({ type: 'LOGOUT' });
      }
    } else {
      dispatch({ type: 'CHECK_AUTH_STATUS' });
    }
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      // Use our backend API for login
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();

      // Extract token and user info from the response
      const token = data.access_token;
      const user = { id: data.id, email: data.email, username: data.username };

      if (token) {
        localStorage.setItem('auth-token', token);
        localStorage.setItem('auth-user', JSON.stringify(user));

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token },
        });

        return;
      } else {
        throw new Error('Login failed - no token received');
      }
    } catch (error) {
      // Check if the error is due to receiving HTML instead of JSON
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        throw new Error('Invalid response format from server');
      }
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const signup = async (email: string, password: string) => {
    dispatch({ type: 'SIGNUP_START' });

    try {
      // Use our backend API for signup
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username: email.split('@')[0], password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Signup failed');
      }

      const data = await response.json();

      // Extract token and user info from the response
      const token = data.access_token;
      const user = { id: data.id, email: data.email, username: data.username };

      if (token) {
        localStorage.setItem('auth-token', token);
        localStorage.setItem('auth-user', JSON.stringify(user));

        dispatch({
          type: 'SIGNUP_SUCCESS',
          payload: { user, token },
        });

        return;
      } else {
        throw new Error('Signup failed - no token received');
      }
    } catch (error) {
      // Check if the error is due to receiving HTML instead of JSON
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        throw new Error('Invalid response format from server');
      }
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      dispatch({ type: 'SIGNUP_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear local storage
      localStorage.removeItem('auth-token');
      localStorage.removeItem('auth-user');

      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the API call fails, still clear local storage
      localStorage.removeItem('auth-token');
      localStorage.removeItem('auth-user');
      dispatch({ type: 'LOGOUT' });
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    // Implement token refresh logic if needed
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        state,
        login,
        signup,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};