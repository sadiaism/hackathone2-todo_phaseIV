import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session
from app.main import app
from app.database import engine, SQLModel
from app.models import Task
from app.config import settings
import jwt


def test_user_data_isolation():
    """Test that users can only access their own tasks"""
    client = TestClient(app)

    # Create a valid token for user 1 (sub must be string in JWT)
    payload_user1 = {
        "sub": "1",  # JWT sub field must be string
        "email": "user1@example.com",
        "exp": 9999999999  # Far future expiration
    }
    token_user1 = jwt.encode(payload_user1, settings.BETTER_AUTH_SECRET, algorithm=settings.JWT_ALGORITHM)

    # Test that user 1 cannot access user 2's tasks by trying to access user 2's endpoint with user 1's token
    headers = {"Authorization": f"Bearer {token_user1}"}
    response = client.get("/api/users/2/tasks", headers=headers)
    assert response.status_code == 403  # Forbidden


def test_cross_user_access_prevention():
    """Test that users cannot access other users' tasks with valid tokens"""
    client = TestClient(app)

    # Create a valid token for user 1 (sub must be string in JWT)
    payload_user1 = {
        "sub": "1",  # JWT sub field must be string
        "email": "user1@example.com",
        "exp": 9999999999  # Far future expiration
    }
    token_user1 = jwt.encode(payload_user1, settings.BETTER_AUTH_SECRET, algorithm=settings.JWT_ALGORITHM)

    # Try to access user 2's specific task with user 1's token
    headers = {"Authorization": f"Bearer {token_user1}"}
    response = client.get("/api/users/2/tasks/1", headers=headers)
    assert response.status_code == 403  # Forbidden

    # Try to create a task for user 2 with user 1's token
    response = client.post("/api/users/2/tasks", headers=headers, json={"title": "Test task"})
    assert response.status_code == 403  # Forbidden

    # Try to update user 2's task with user 1's token
    response = client.put("/api/users/2/tasks/1", headers=headers, json={"title": "Updated task"})
    assert response.status_code == 403  # Forbidden

    # Try to delete user 2's task with user 1's token
    response = client.delete("/api/users/2/tasks/1", headers=headers)
    assert response.status_code == 403  # Forbidden