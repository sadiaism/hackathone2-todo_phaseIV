from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import Optional
import jwt
from datetime import datetime, timedelta
from pydantic import BaseModel
from app.config import settings
from app.database import get_session
from app.auth.models import TokenData
from app.user_models import User
from app import crud
from app.auth.dependencies import require_auth


# Define Pydantic models for authentication
class UserCreateRequest(BaseModel):
    email: str
    username: str
    password: str


class UserLoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


class UserResponse(BaseModel):
    id: Optional[int] = None
    email: str
    username: str
    is_active: bool = True
    is_superuser: bool = False


class UserWithTokenResponse(BaseModel):
    id: Optional[int] = None
    email: str
    username: str
    is_active: bool
    is_superuser: bool
    access_token: str
    token_type: str

# Create a new router for authentication endpoints
auth_router = APIRouter(prefix="/auth", tags=["authentication"])


@auth_router.post("/register", response_model=UserWithTokenResponse)
def register_user(
    user_data: UserCreateRequest,
    session: Session = Depends(get_session)
):
    """
    Register a new user and return a JWT token.
    """
    # Check if user already exists
    existing_user = crud.get_user_by_email(session, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email already exists"
        )

    # Create the new user
    user = crud.create_user(session, user_data)

    # Generate JWT token
    token_data = {
        "sub": str(user.id),  # JWT sub field must be string
        "email": user.email,
        "exp": datetime.utcnow() + timedelta(seconds=settings.JWT_EXPIRATION_DELTA)
    }
    token = jwt.encode(token_data, settings.BETTER_AUTH_SECRET, algorithm=settings.JWT_ALGORITHM)

    # Return user data with token
    return UserWithTokenResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        is_active=user.is_active,
        is_superuser=user.is_superuser,
        access_token=token,
        token_type="bearer"
    )


@auth_router.post("/login", response_model=UserWithTokenResponse)
def login_user(
    user_credentials: UserLoginRequest,
    session: Session = Depends(get_session)
):
    """
    Authenticate user and return a JWT token.
    """
    # Find user by email
    user = crud.get_user_by_email(session, user_credentials.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    # Verify password
    if not crud.verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    # Generate JWT token
    token_data = {
        "sub": str(user.id),  # JWT sub field must be string
        "email": user.email,
        "exp": datetime.utcnow() + timedelta(seconds=settings.JWT_EXPIRATION_DELTA)
    }
    token = jwt.encode(token_data, settings.BETTER_AUTH_SECRET, algorithm=settings.JWT_ALGORITHM)

    return UserWithTokenResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        is_active=user.is_active,
        is_superuser=user.is_superuser,
        access_token=token,
        token_type="bearer"
    )


@auth_router.post("/token/refresh")
def refresh_token():
    """
    Refresh JWT token (placeholder - in a real app, you'd use refresh tokens).
    """
    # This would typically require a refresh token mechanism
    # For now, this is a placeholder that would require additional implementation
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Token refresh not implemented in this example"
    )


@auth_router.get("/me", response_model=UserResponse)
def get_current_user(token_data: TokenData = Depends(require_auth), session: Session = Depends(get_session)):
    """
    Get current authenticated user's information.
    """
    # Fetch user from database based on token
    user = crud.get_user_by_email(session, token_data.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return UserResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        is_active=user.is_active,
        is_superuser=user.is_superuser
    )