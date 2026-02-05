from datetime import datetime, timedelta
from typing import Optional
import jwt
from fastapi import HTTPException, status, Request
from ..config import settings
from .models import TokenData


def verify_jwt_token(token: str) -> Optional[TokenData]:
    """
    Verify JWT token and return user information.

    Args:
        token: JWT token string to verify

    Returns:
        TokenData with user information if valid, None if invalid
    """
    try:
        # Decode the token using the shared secret
        payload = jwt.decode(
            token,
            settings.BETTER_AUTH_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )

        user_id_str: str = payload.get("sub")
        email: str = payload.get("email")

        if user_id_str is None or email is None:
            return None

        # Convert user_id from string to integer (JWT sub field is always a string)
        try:
            user_id = int(user_id_str)
        except (ValueError, TypeError):
            return None

        return TokenData(user_id=user_id, email=email)
    except jwt.PyJWTError:
        return None


async def get_current_user(request: Request) -> TokenData:
    """
    Get current authenticated user from request headers.

    Args:
        request: FastAPI request object

    Returns:
        TokenData with user information

    Raises:
        HTTPException: If authentication fails
    """
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