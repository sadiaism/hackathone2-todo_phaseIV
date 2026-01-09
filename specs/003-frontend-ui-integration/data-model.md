# Data Model: Todo Full-Stack Web Application – Frontend UI & Integration

**Feature**: Frontend UI & Integration
**Branch**: 003-frontend-ui-integration
**Created**: 2026-01-08

## Overview

This document defines the data structures and state management patterns for the frontend of the Todo application. It covers both the data received from the backend API and the client-side state management.

## Frontend Data Structures

### User Entity
```typescript
interface User {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
}
```

**Fields**:
- `id`: Unique identifier for the user (UUID format)
- `email`: User's email address for login
- `createdAt`: Timestamp when the user account was created
- `updatedAt`: Timestamp when the user account was last updated
- `isAuthenticated`: Boolean indicating if user is currently authenticated
- `isLoading`: Boolean for authentication loading states
- `error`: Error message if authentication failed
- `token`: JWT token for API authentication

**Validation Rules**:
- Email must be a valid email format
- User ID must be a valid UUID
- Token must be a valid JWT format

### Task Entity
```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  filter: 'all' | 'active' | 'completed';
}
```

**Fields**:
- `id`: Unique identifier for the task (UUID format)
- `title`: Task title (required, max 255 characters)
- `description`: Optional task description
- `completed`: Boolean indicating if task is completed
- `userId`: Foreign key linking to the user who owns the task
- `createdAt`: Timestamp when the task was created
- `updatedAt`: Timestamp when the task was last updated
- `filter`: Current filter applied to task list

**Validation Rules**:
- Title must not be empty
- Title must be less than 255 characters
- Task must belong to the authenticated user
- Completed status must be a boolean value

### API Response Structures
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}

interface TaskListResponse {
  success: boolean;
  tasks: Task[];
  error?: string;
}

interface TaskResponse {
  success: boolean;
  task?: Task;
  error?: string;
}
```

## State Management Patterns

### Authentication Context
The authentication state will be managed using React Context to provide authentication status throughout the application:

```typescript
interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}
```

### Task Management Context
The task state will be managed separately to handle task operations:

```typescript
interface TaskContextType {
  state: TaskState;
  createTask: (title: string, description?: string) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskCompletion: (id: string) => Promise<void>;
  setFilter: (filter: 'all' | 'active' | 'completed') => void;
}
```

## Data Flow Patterns

### From Backend to Frontend
1. Backend API returns Task objects in response to GET requests
2. Frontend receives and stores Task objects in local state
3. Components subscribe to state changes and update UI accordingly

### From Frontend to Backend
1. User interacts with UI components
2. Actions trigger API calls with Task data
3. Backend processes requests and returns updated Task objects
4. Frontend updates local state with response data

## Relationships
- A User can have many Tasks (one-to-many relationship)
- Each Task belongs to exactly one User
- The userId field in Task entity establishes the foreign key relationship

## State Transitions

### Authentication State Transitions
- `uninitialized` → `loading` (during auth initialization)
- `loading` → `authenticated` (login/signup successful)
- `loading` → `unauthenticated` (login/signup failed)
- `authenticated` → `unauthenticated` (logout or token expiration)

### Task State Transitions
- `idle` → `loading` (during API operations)
- `loading` → `success` (operation completed successfully)
- `loading` → `error` (operation failed)
- `success` → `idle` (after brief success notification)

## Client-Side Validation
- Form inputs validated before submission
- Email format validation for authentication
- Task title length validation
- Required field validation
- Immediate feedback for validation errors