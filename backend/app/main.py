from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session
from typing import List, AsyncGenerator
from .database import get_session, create_db_and_tables
from .models import Task, TaskUpdate, TaskComplete
from .schemas import (
    TaskCreateRequest,
    TaskUpdateRequest,
    TaskCompleteRequest,
    TaskResponse,
    TaskListResponse,
    ErrorResponse
)
from . import crud
from .exceptions import TaskNotFoundException
from .auth.dependencies import require_auth
from .auth.models import TokenData
from .auth.routes import auth_router
from .api.conversation_api import router as conversation_router
from .api.chat_api import router as chat_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # Startup
    create_db_and_tables()
    yield
    # Shutdown (if needed)


app = FastAPI(
    title="Todo API",
    description="API for managing todo tasks with user isolation",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],  # Allow frontend origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include authentication routes
app.include_router(auth_router)

# Include conversation routes
app.include_router(conversation_router, prefix="/api/{user_id}")

# Include chat routes
app.include_router(chat_router, prefix="/api/{user_id}")


@app.get("/")
def read_root():
    return {"message": "Welcome to the Todo API"}


@app.get("/api/users/{user_id}/tasks", response_model=TaskListResponse)
def get_tasks(
    user_id: int,
    current_user: TokenData = Depends(require_auth),
    session: Session = Depends(get_session)
):
    """Get all tasks for the authenticated user"""
    # Check if user is authenticated
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    # Verify user is accessing their own data
    if current_user.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this user's tasks"
        )

    # Filter tasks by authenticated user
    tasks = crud.get_tasks_by_user(session, current_user.user_id)
    task_responses = [TaskResponse.model_validate(task) for task in tasks]
    return TaskListResponse(tasks=task_responses)


@app.post("/api/users/{user_id}/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_data: TaskCreateRequest,
    user_id: int,
    current_user: TokenData = Depends(require_auth),
    session: Session = Depends(get_session)
):
    """Create a new task for the authenticated user"""
    # Check if user is authenticated
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    # Verify user is creating for themselves
    if current_user.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create tasks for this user"
        )

    # Create task assigned to authenticated user
    task = crud.create_task(session, task_data, current_user.user_id)
    return TaskResponse.model_validate(task)


@app.get("/api/users/{user_id}/tasks/{id}", response_model=TaskResponse)
def get_task(
    user_id: int,
    id: int,
    current_user: TokenData = Depends(require_auth),
    session: Session = Depends(get_session)
):
    """Get a specific task by ID for the authenticated user"""
    # Check if user is authenticated
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    # Verify user is accessing their own data
    if current_user.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this user's tasks"
        )

    # Get task and verify ownership
    task = crud.get_task_by_id_and_user(session, id, current_user.user_id)
    if not task:
        raise TaskNotFoundException(id)
    return TaskResponse.model_validate(task)


@app.put("/api/users/{user_id}/tasks/{id}", response_model=TaskResponse)
def update_task(
    user_id: int,
    id: int,
    task_update: TaskUpdateRequest,
    current_user: TokenData = Depends(require_auth),
    session: Session = Depends(get_session)
):
    """Update a specific task for the authenticated user"""
    # Check if user is authenticated
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    # Verify user is accessing their own data
    if current_user.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this user's tasks"
        )

    # Convert schema to model
    update_data = TaskUpdate(**task_update.model_dump(exclude_unset=True))
    updated_task = crud.update_task(session, id, current_user.user_id, update_data)
    if not updated_task:
        raise TaskNotFoundException(id)
    return TaskResponse.model_validate(updated_task)


@app.delete("/api/users/{user_id}/tasks/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    user_id: int,
    id: int,
    current_user: TokenData = Depends(require_auth),
    session: Session = Depends(get_session)
):
    """Delete a specific task for the authenticated user"""
    # Check if user is authenticated
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    # Verify user is accessing their own data
    if current_user.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this user's tasks"
        )

    success = crud.delete_task(session, id, current_user.user_id)
    if not success:
        raise TaskNotFoundException(id)
    return


@app.patch("/api/users/{user_id}/tasks/{id}/complete", response_model=TaskResponse)
def update_task_completion(
    user_id: int,
    id: int,
    task_complete: TaskCompleteRequest,
    current_user: TokenData = Depends(require_auth),
    session: Session = Depends(get_session)
):
    """Update the completion status of a task for the authenticated user"""
    # Check if user is authenticated
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    # Verify user is accessing their own data
    if current_user.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this user's tasks"
        )

    task_complete_model = TaskComplete(completed=task_complete.completed)
    updated_task = crud.update_task_completion(session, id, current_user.user_id, task_complete_model)
    if not updated_task:
        raise TaskNotFoundException(id)
    return TaskResponse.model_validate(updated_task)