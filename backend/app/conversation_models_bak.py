from __future__ import annotations
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional


class ConversationBase(SQLModel):
    title: str = Field(max_length=255, default="New Conversation")
    user_id: int = Field(index=True)


class ChatMessageBase(SQLModel):
    role: str = Field(max_length=20)  # 'user' or 'assistant'
    content: str
    conversation_id: int = Field(foreign_key="conversation.id")
    user_id: int = Field(index=True)


class ChatMessage(ChatMessageBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    timestamp: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    status: str = Field(default="delivered", max_length=20)  # delivered, pending, error

    # Relationship to conversation - with minimal annotation
    conversation: 'Conversation' = Relationship(back_populates="messages")


class Conversation(ConversationBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationship to messages - with minimal annotation
    messages: list['ChatMessage'] = Relationship(back_populates="conversation")


class ConversationCreate(ConversationBase):
    pass


class ChatMessageCreate(ChatMessageBase):
    pass


class ChatMessageRead(ChatMessageBase):
    id: int
    timestamp: datetime
    status: str


class ConversationRead(ConversationBase):
    id: int
    created_at: datetime
    updated_at: datetime
    messages: list = []  # Plain list for response model