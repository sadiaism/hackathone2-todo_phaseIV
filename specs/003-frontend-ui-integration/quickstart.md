# Quickstart Guide: Todo Frontend Development

**Feature**: Frontend UI & Integration
**Branch**: 003-frontend-ui-integration
**Created**: 2026-01-08

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git for version control
- Access to the backend API

## Setup Instructions

### 1. Clone and Navigate
```bash
# Navigate to your project directory
cd D:\hackathone-TodoApp\phase_II
```

### 2. Create Next.js Project
```bash
# Initialize new Next.js project with App Router
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd frontend
```

### 3. Install Dependencies
```bash
npm install @better-auth/react better-auth
npm install axios
npm install react-icons  # For UI icons
```

### 4. Project Structure
After setup, your frontend directory should look like:
```
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── signup/
│   │   │       └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── SignupForm.tsx
│   │   ├── tasks/
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskItem.tsx
│   │   │   └── TaskForm.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       └── Card.tsx
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── auth-client.ts
│   │   │   └── auth-context.tsx
│   │   ├── api/
│   │   │   ├── api-client.ts
│   │   │   └── task-service.ts
│   │   └── types/
│   │       └── index.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useTasks.ts
│   └── utils/
│       └── validators.ts
├── public/
├── package.json
└── tailwind.config.js
```

## Configuration Files

### Environment Variables (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-key-here
```

### API Client Setup (src/lib/api/api-client.ts)
```typescript
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login or clear auth state
      localStorage.removeItem('auth-token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## Running the Application

### Development Mode
```bash
npm run dev
```
The application will be available at http://localhost:3000

### Production Build
```bash
npm run build
npm start
```

## Key Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## API Integration Points

### Authentication API Calls
- Login: `POST /auth/login`
- Signup: `POST /auth/signup`
- Logout: `POST /auth/logout`

### Task Management API Calls
- Get tasks: `GET /tasks`
- Create task: `POST /tasks`
- Update task: `PUT /tasks/{id}`
- Delete task: `DELETE /tasks/{id}`
- Toggle completion: `PATCH /tasks/{id}/toggle`

## Testing the Application

### Manual Testing Steps
1. Start the backend server
2. Run the frontend with `npm run dev`
3. Navigate to http://localhost:3000
4. Test user registration flow
5. Test user login flow
6. Test task creation, viewing, updating, and deletion
7. Verify responsive design on different screen sizes
8. Test error handling and loading states

### Environment Setup for Testing
- Backend must be running on configured API URL
- Database must be accessible
- Authentication service must be operational