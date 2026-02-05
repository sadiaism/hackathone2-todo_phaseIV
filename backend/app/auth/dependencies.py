from fastapi import Depends, HTTPException, status
from .jwt_utils import get_current_user, TokenData


from fastapi import Depends, HTTPException, status, Request
from .jwt_utils import get_current_user, TokenData


async def require_auth(current_user: TokenData = Depends(get_current_user)) -> TokenData:
    """
    Dependency to require authentication on endpoints.

    This dependency can be added to any route that requires authentication.
    It will extract and verify the JWT token from the Authorization header,
    and return the authenticated user's information.

    Args:
        current_user: The authenticated user (injected by FastAPI dependency system)

    Returns:
        TokenData: Information about the authenticated user
    """
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    return current_user


async def require_chat_auth(request: Request, current_user: TokenData = Depends(get_current_user)) -> TokenData:
    """
    Enhanced authentication dependency specifically for chat endpoints
    This ensures that users can only access their own chat data
    """
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You must be logged in to access chat."
        )

    # Extract user_id from path parameters to validate access
    path_user_id = request.path_params.get('user_id')

    if path_user_id is not None and str(path_user_id) != str(current_user.user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Cannot access another user's resources"
        )

    return current_user