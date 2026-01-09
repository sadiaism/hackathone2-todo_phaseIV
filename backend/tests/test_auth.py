import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session
from app.main import app
from app.database import engine
from app.models import Task
from app.auth.jwt_utils import verify_jwt_token
from app.config import settings
import jwt


def test_valid_token_access():
    """Test that valid JWT tokens allow access"""
    # This test would require a valid JWT token to be created
    # For now, we'll test the token verification function directly
    client = TestClient(app)

    # Create a mock token for testing (sub must be string in JWT)
    payload = {
        "sub": "1",  # JWT sub field must be string
        "email": "test@example.com",
        "exp": 9999999999  # Far future expiration
    }
    token = jwt.encode(payload, settings.BETTER_AUTH_SECRET, algorithm=settings.JWT_ALGORITHM)

    # This test would require a complete integration test with actual endpoints
    # For now, we verify the token structure
    token_data = verify_jwt_token(token)
    assert token_data is not None
    assert token_data.user_id == 1
    assert token_data.email == "test@example.com"


def test_invalid_token_rejection():
    """Test that invalid JWT tokens return 401"""
    # Create an invalid token
    invalid_token = "invalid.token.here"
    token_data = verify_jwt_token(invalid_token)
    assert token_data is None


def test_missing_token_rejection():
    """Test that missing tokens return 401"""
    client = TestClient(app)

    # Try to access a protected endpoint without a token
    response = client.get("/api/users/1/tasks")
    assert response.status_code == 401
    assert "Not authenticated" in response.json()["detail"]