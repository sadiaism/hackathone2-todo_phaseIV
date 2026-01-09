from sqlmodel import Session, select, update
from datetime import datetime
from typing import List, Optional
from .models import Task, TaskUpdate, TaskComplete
from .schemas import TaskCreateRequest
from .user_models import User, UserBase
import bcrypt


def create_task(session: Session, task_data: TaskCreateRequest, user_id: int) -> Task:
    """Create a new task for a user"""
    task = Task(
        title=task_data.title,
        description=task_data.description,
        user_id=user_id
    )
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


def get_tasks_by_user(session: Session, user_id: int) -> List[Task]:
    """Get all tasks for a specific user"""
    statement = select(Task).where(Task.user_id == user_id).order_by(Task.created_at.desc())
    results = session.exec(statement)
    return results.all()


def get_task_by_id_and_user(session: Session, task_id: int, user_id: int) -> Optional[Task]:
    """Get a specific task by ID and user ID"""
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    result = session.exec(statement)
    return result.first()


def update_task(session: Session, task_id: int, user_id: int, task_update: TaskUpdate) -> Optional[Task]:
    """Update a task by ID for a specific user"""
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    result = session.exec(statement)
    task = result.first()

    if not task:
        return None

    # Update only the fields that are provided
    update_data = task_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    task.updated_at = datetime.utcnow()
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


def delete_task(session: Session, task_id: int, user_id: int) -> bool:
    """Delete a task by ID for a specific user"""
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    result = session.exec(statement)
    task = result.first()

    if not task:
        return False

    session.delete(task)
    session.commit()
    return True


def update_task_completion(session: Session, task_id: int, user_id: int, task_complete: TaskComplete) -> Optional[Task]:
    """Update the completion status of a task"""
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    result = session.exec(statement)
    task = result.first()

    if not task:
        return None

    task.completed = task_complete.completed
    task.updated_at = datetime.utcnow()
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


def get_user_by_email(session: Session, email: str) -> Optional[User]:
    """Get a user by email"""
    statement = select(User).where(User.email == email)
    result = session.exec(statement)
    return result.first()


def create_user(session: Session, user_create) -> User:
    """Create a new user with hashed password"""
    # Hash the password
    hashed_password = bcrypt.hashpw(user_create.password.encode('utf-8'), bcrypt.gensalt())

    user = User(
        email=user_create.email,
        username=user_create.username,
        hashed_password=hashed_password.decode('utf-8')
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password"""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))