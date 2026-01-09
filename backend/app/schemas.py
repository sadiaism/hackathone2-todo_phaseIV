from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from .models import Task


class TaskCreateRequest(BaseModel):
    title: str
    description: Optional[str] = None


class TaskUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None


class TaskCompleteRequest(BaseModel):
    completed: bool


class TaskResponse(TaskCreateRequest):
    id: int
    completed: bool
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TaskListResponse(BaseModel):
    tasks: List[TaskResponse]


class ErrorResponse(BaseModel):
    detail: str