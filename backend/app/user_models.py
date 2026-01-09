from sqlmodel import SQLModel, Field
from typing import Optional


class UserBase(SQLModel):
    email: str = Field(unique=True, nullable=False, max_length=255)
    username: str = Field(unique=True, nullable=False, max_length=255)


class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str = Field(nullable=False)
    is_active: bool = Field(default=True)
    is_superuser: bool = Field(default=False)