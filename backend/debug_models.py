#!/usr/bin/env python3
"""Debug script to test individual model imports"""

print("Testing model imports...")

try:
    print("1. Importing basic modules...")
    from sqlmodel import SQLModel, Field
    from datetime import datetime
    import uuid
    from typing import Optional
    from enum import Enum
    from sqlalchemy import JSON, Column

    print("2. Defining enums...")
    class RoleEnum(str, Enum):
        user = "user"
        assistant = "assistant"

    class StatusEnum(str, Enum):
        pending = "pending"
        success = "success"
        failed = "failed"

    print("3. Defining Conversation model...")
    class Conversation(SQLModel, table=True):
        __tablename__ = "conversations"
        id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
        user_id: str = Field(index=True)
        title: Optional[str] = Field(default=None)
        is_active: bool = Field(default=True)
        created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
        updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)

    print("4. Defining Message model...")
    class Message(SQLModel, table=True):
        __tablename__ = "messages"
        id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
        conversation_id: uuid.UUID = Field(index=True)
        role: RoleEnum = Field(sa_column_kwargs={"index": True})
        content: str
        metadata: Optional[dict] = Field(default=None, sa_column=Column(JSON))
        timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)

    print("5. Defining ToolInvocation model...")
    class ToolInvocation(SQLModel, table=True):
        __tablename__ = "tool_invocations"
        id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
        conversation_id: uuid.UUID = Field(index=True)
        message_id: Optional[uuid.UUID] = Field(default=None)
        tool_name: str = Field(sa_column_kwargs={"index": True})
        parameters: dict = Field(default={}, sa_column=Column(JSON))
        result: Optional[dict] = Field(default=None, sa_column=Column(JSON))
        status: StatusEnum = Field(default=StatusEnum.pending, sa_column_kwargs={"index": True})
        created_at: datetime = Field(default_factory=datetime.utcnow, index=True)

    print("All models defined successfully!")

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()