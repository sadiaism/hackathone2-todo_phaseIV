from fastapi import Depends
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
    return current_user