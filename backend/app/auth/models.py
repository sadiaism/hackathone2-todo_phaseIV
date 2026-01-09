from pydantic import BaseModel


class TokenData(BaseModel):
    """
    Model representing the data contained in a JWT token.

    Attributes:
        user_id: The ID of the authenticated user
        email: The email of the authenticated user
    """
    user_id: int
    email: str


class AuthenticatedUserContext(BaseModel):
    """
    Model representing the runtime context for an authenticated user.

    Attributes:
        user_id: The ID of the authenticated user
        email: The email of the authenticated user
        is_authenticated: Whether the request has valid authentication
        permissions: List of permissions for the user
    """
    user_id: int
    email: str
    is_authenticated: bool
    permissions: list[str] = ["read:own_tasks", "write:own_tasks"]