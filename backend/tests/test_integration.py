import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session
from app.main import app
from app.database import engine, SQLModel
from app.models import Task
from app.config import settings
import jwt


def test_end_to_end_authentication_flow():
    """Test end-to-end authentication flow"""
    client = TestClient(app)

    # Create a valid token for testing (sub must be string in JWT)
    payload = {
        "sub": "1",  # JWT sub field must be string
        "email": "test@example.com",
        "exp": 9999999999  # Far future expiration
    }
    token = jwt.encode(payload, settings.BETTER_AUTH_SECRET, algorithm=settings.JWT_ALGORITHM)

    # Test that authenticated user can access their own tasks
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/users/1/tasks", headers=headers)
    assert response.status_code == 200

    # Test that authenticated user can create a task for themselves
    response = client.post("/api/users/1/tasks", headers=headers, json={
        "title": "Test task",
        "description": "Test description"
    })
    assert response.status_code == 201
    assert response.json()["title"] == "Test task"

    # Test that authenticated user can get a specific task
    task_id = response.json()["id"]
    response = client.get(f"/api/users/1/tasks/{task_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["id"] == task_id

    # Test that authenticated user can update their task
    response = client.put(f"/api/users/1/tasks/{task_id}", headers=headers, json={
        "title": "Updated task"
    })
    assert response.status_code == 200
    assert response.json()["title"] == "Updated task"

    # Test that authenticated user can update task completion
    response = client.patch(f"/api/users/1/tasks/{task_id}/complete", headers=headers, json={
        "completed": True
    })
    assert response.status_code == 200
    assert response.json()["completed"] is True

    # Test that authenticated user can delete their task
    response = client.delete(f"/api/users/1/tasks/{task_id}", headers=headers)
    assert response.status_code == 204


def test_jwt_token_lifecycle():
    """Test JWT token lifecycle"""
    # Test token creation and verification (sub must be string in JWT)
    payload = {
        "sub": "1",  # JWT sub field must be string
        "email": "test@example.com",
        "exp": 9999999999  # Far future expiration
    }
    token = jwt.encode(payload, settings.BETTER_AUTH_SECRET, algorithm=settings.JWT_ALGORITHM)

    # Verify the token can be decoded correctly
    decoded_payload = jwt.decode(token, settings.BETTER_AUTH_SECRET, algorithms=[settings.JWT_ALGORITHM])
    assert decoded_payload["sub"] == "1"
    assert decoded_payload["email"] == "test@example.com"


def test_error_handling_scenarios():
    """Test error handling scenarios"""
    client = TestClient(app)

    # Test invalid token format
    headers = {"Authorization": "Bearer invalid.token.format"}
    response = client.get("/api/users/1/tasks", headers=headers)
    assert response.status_code == 401

    # Test missing authorization header
    response = client.get("/api/users/1/tasks")
    assert response.status_code == 401

    # Test wrong user ID in URL vs token
    payload = {
        "sub": "1",  # JWT sub field must be string
        "email": "test@example.com",
        "exp": 9999999999
    }
    token = jwt.encode(payload, settings.BETTER_AUTH_SECRET, algorithm=settings.JWT_ALGORITHM)
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/users/2/tasks", headers=headers)
    assert response.status_code == 403  # Forbidden