# Quickstart Guide: Authentication & API Security Implementation

## Overview
This guide provides the essential steps to implement JWT-based authentication and user data isolation in the Todo application.

## Prerequisites
- Next.js 16+ project with Better Auth installed
- FastAPI backend with existing task endpoints
- Neon Serverless PostgreSQL database
- Environment variables configured for secrets

## Environment Setup

### Backend Environment Variables
```bash
# JWT Configuration
BETTER_AUTH_SECRET="your-32-character-secret-here"  # Minimum 32 characters, random
JWT_ALGORITHM="RS256"
JWT_EXPIRATION_DELTA=604800  # 7 days in seconds
```

### Frontend Environment Variables
```bash
# Better Auth Configuration
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"  # Your frontend URL
BETTER_AUTH_SECRET="same-secret-as-backend"  # Must match backend secret
```

## Implementation Steps

### 1. Configure Better Auth for JWT
```javascript
// frontend/lib/auth.ts or similar
import { BetterAuth } from "better-auth";

export const auth = BetterAuth({
  // ... other config
  jwt: {
    expiresIn: "7d",  // 7 days expiration
    includeUser: true,  // Include user info in token
  },
  // Configure JWT to include user ID and email
  emailAndPassword: {
    enabled: true,
  },
  // ... rest of config
});
```

### 2. Create JWT Verification Utilities
```python
# backend/auth/jwt_utils.py
from datetime import datetime, timedelta
from typing import Optional
import jwt
from fastapi import HTTPException, status, Request
from pydantic import BaseModel

class TokenData(BaseModel):
    user_id: int
    email: str

def verify_jwt_token(token: str) -> Optional[TokenData]:
    try:
        # Decode the token using the shared secret
        payload = jwt.decode(
            token,
            settings.BETTER_AUTH_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )

        user_id: int = payload.get("sub")
        email: str = payload.get("email")

        if user_id is None or email is None:
            return None

        return TokenData(user_id=user_id, email=email)
    except jwt.PyJWTError:
        return None

async def get_current_user(request: Request) -> TokenData:
    authorization: str = request.headers.get("Authorization")
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = authorization[7:]  # Remove "Bearer " prefix
    token_data = verify_jwt_token(token)

    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return token_data
```

### 3. Create Authentication Dependency
```python
# backend/auth/dependencies.py
from fastapi import Depends
from .jwt_utils import get_current_user, TokenData

async def require_auth(current_user: TokenData = Depends(get_current_user)) -> TokenData:
    """Dependency to require authentication on endpoints"""
    return current_user
```

### 4. Update Task Endpoints with Authentication
```python
# backend/api/tasks.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

from models.task import Task, TaskRead, TaskCreate, TaskUpdate
from auth.dependencies import require_auth
from auth.jwt_utils import TokenData
from database import get_session

router = APIRouter()

@router.get("/users/{user_id}/tasks", response_model=List[TaskRead])
async def get_tasks(
    user_id: int,
    current_user: TokenData = Depends(require_auth),
    session: Session = Depends(get_session)
):
    # Verify user is accessing their own data
    if current_user.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this user's tasks"
        )

    # Filter tasks by authenticated user
    statement = select(Task).where(Task.user_id == current_user.user_id)
    tasks = session.exec(statement).all()
    return tasks

@router.post("/users/{user_id}/tasks", response_model=TaskRead)
async def create_task(
    user_id: int,
    task: TaskCreate,
    current_user: TokenData = Depends(require_auth),
    session: Session = Depends(get_session)
):
    # Verify user is creating for themselves
    if current_user.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create tasks for this user"
        )

    # Create task assigned to authenticated user
    db_task = Task.from_orm(task)
    db_task.user_id = current_user.user_id  # Ensure ownership
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task

@router.get("/users/{user_id}/tasks/{task_id}", response_model=TaskRead)
async def get_task(
    user_id: int,
    task_id: int,
    current_user: TokenData = Depends(require_auth),
    session: Session = Depends(get_session)
):
    # Verify user is accessing their own data
    if current_user.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this user's tasks"
        )

    # Get task and verify ownership
    task = session.get(Task, task_id)
    if not task or task.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return task

# Similar patterns for PUT and DELETE endpoints...
```

### 5. Update Frontend API Calls
```javascript
// frontend/lib/api.ts
import { getAuthClient } from "better-auth/client";

const authClient = getAuthClient();

// Function to make authenticated API calls
export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  // Get JWT token from Better Auth
  const session = await authClient.getSession();
  const token = session?.token; // This should be the JWT token

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Handle unauthorized - redirect to login
    window.location.href = '/login';
  }

  return response;
}

// Example usage for getting user tasks
export async function getUserTasks(userId: number) {
  const response = await authenticatedFetch(`/api/users/${userId}/tasks`);
  return response.json();
}
```

## Testing Strategy

### Authentication Tests
```python
# test_auth.py
def test_valid_token_access():
    # Test that valid JWT tokens allow access
    pass

def test_invalid_token_rejection():
    # Test that invalid JWT tokens return 401
    pass

def test_missing_token_rejection():
    # Test that missing tokens return 401
    pass
```

### Authorization Tests
```python
# test_authorization.py
def test_user_data_isolation():
    # Test that users can only access their own tasks
    pass

def test_cross_user_access_prevention():
    # Test that users cannot access other users' tasks
    pass
```

## Security Considerations

1. **Token Security**: Ensure JWT secrets are stored securely and not exposed in client code
2. **User ID Validation**: Always validate that the user_id in the URL matches the authenticated user
3. **Data Filtering**: Always filter database queries by the authenticated user_id
4. **Error Handling**: Return 404 instead of 403 for unauthorized resource access to prevent user enumeration

## Next Steps

1. Implement the JWT verification middleware
2. Update all existing endpoints to require authentication
3. Add comprehensive tests for authentication and authorization
4. Deploy and test the complete authentication flow