from fastapi import Request, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from ..auth.jwt_utils import verify_jwt_token
from ..user_models import User
from ..database import get_session
from sqlmodel import Session, select
from typing import Optional


security = HTTPBearer()


def get_jwt_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """
    Extract and validate JWT token from request
    """
    token = credentials.credentials
    return token


def verify_jwt_token_wrapper(token: str = Depends(get_jwt_token)) -> dict:
    """
    Verify the JWT token and return decoded payload as a dictionary
    """
    try:
        token_data = verify_jwt_token(token)
        if token_data is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Convert TokenData to dictionary format
        return {"user_id": token_data.user_id, "email": token_data.email}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user_from_token(
    token_payload: dict = Depends(verify_jwt_token_wrapper),
    session: Session = Depends(get_session)
) -> User:
    """
    Get current user from JWT token payload
    """
    user_id: int = token_payload.get("user_id")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials: Missing user_id",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Retrieve user from database
    user = session.exec(select(User).where(User.id == user_id)).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


# Enhanced middleware for chat endpoints
def require_chat_auth(request: Request, current_user: User = Depends(get_current_user_from_token)) -> User:
    """
    Enhanced authentication middleware specifically for chat endpoints
    This ensures that users can only access their own chat data
    """
    # Extract user_id from path parameters to validate access
    path_user_id = request.path_params.get('user_id')

    if path_user_id is not None and str(path_user_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Cannot access another user's resources"
        )

    return current_user