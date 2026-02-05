from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime
from .conversation_models import (
    Conversation,
    ChatMessage,
    ConversationCreate,
    ChatMessageCreate,
    ConversationRead,
    ChatMessageRead
)
from .database import get_session
from fastapi import Depends


class ConversationService:
    def __init__(self, db: Session = Depends(get_session)):
        self.db = db

    def create_conversation(self, conversation_data: ConversationCreate) -> ConversationRead:
        """Create a new conversation"""
        conversation = Conversation(
            title=conversation_data.title,
            user_id=conversation_data.user_id
        )
        self.db.add(conversation)
        self.db.commit()
        self.db.refresh(conversation)

        return ConversationRead(
            id=conversation.id,
            title=conversation.title,
            user_id=conversation.user_id,
            created_at=conversation.created_at,
            updated_at=conversation.updated_at,
            messages=[]
        )

    def get_conversation_by_id(self, conversation_id: int, user_id: int) -> Optional[Conversation]:
        """Get a conversation by ID for a specific user"""
        statement = select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id
        )
        return self.db.exec(statement).first()

    def get_user_conversations(self, user_id: int) -> List[Conversation]:
        """Get all conversations for a specific user"""
        statement = select(Conversation).where(Conversation.user_id == user_id)
        return self.db.exec(statement).all()

    def add_message_to_conversation(self, message_data: ChatMessageCreate) -> ChatMessageRead:
        """Add a message to a conversation"""
        message = ChatMessage(
            role=message_data.role,
            content=message_data.content,
            conversation_id=message_data.conversation_id,
            user_id=message_data.user_id
        )
        self.db.add(message)
        self.db.commit()
        self.db.refresh(message)

        return ChatMessageRead(
            id=message.id,
            role=message.role,
            content=message.content,
            conversation_id=message.conversation_id,
            user_id=message.user_id,
            timestamp=message.timestamp,
            status=message.status
        )

    def get_conversation_messages(self, conversation_id: int, user_id: int) -> List[ChatMessage]:
        """Get all messages for a specific conversation"""
        statement = select(ChatMessage).where(
            ChatMessage.conversation_id == conversation_id,
            ChatMessage.user_id == user_id
        ).order_by(ChatMessage.timestamp.asc())
        return self.db.exec(statement).all()

    def update_conversation_title(self, conversation_id: int, new_title: str, user_id: int) -> Optional[Conversation]:
        """Update conversation title"""
        conversation = self.get_conversation_by_id(conversation_id, user_id)
        if conversation:
            conversation.title = new_title
            conversation.updated_at = datetime.utcnow()
            self.db.add(conversation)
            self.db.commit()
            self.db.refresh(conversation)
        return conversation


# Helper function to get service instance
def get_conversation_service(db: Session = Depends(get_session)) -> ConversationService:
    return ConversationService(db=db)


class ConversationService:
    def __init__(self, db: Session = Depends(get_session)):
        self.db = db

    def create_conversation(self, conversation_data: ConversationCreate) -> ConversationRead:
        """Create a new conversation"""
        conversation = Conversation(
            title=conversation_data.title,
            user_id=conversation_data.user_id
        )
        self.db.add(conversation)
        self.db.commit()
        self.db.refresh(conversation)

        return ConversationRead(
            id=conversation.id,
            title=conversation.title,
            user_id=conversation.user_id,
            created_at=conversation.created_at,
            updated_at=conversation.updated_at,
            messages=[]
        )

    def get_conversation_by_id(self, conversation_id: int, user_id: int) -> Optional[Conversation]:
        """Get a conversation by ID for a specific user"""
        statement = select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id
        )
        return self.db.exec(statement).first()

    def get_user_conversations(self, user_id: int) -> List[Conversation]:
        """Get all conversations for a specific user"""
        statement = select(Conversation).where(Conversation.user_id == user_id)
        return self.db.exec(statement).all()

    def add_message_to_conversation(self, message_data: ChatMessageCreate) -> ChatMessageRead:
        """Add a message to a conversation"""
        message = ChatMessage(
            role=message_data.role,
            content=message_data.content,
            conversation_id=message_data.conversation_id,
            user_id=message_data.user_id
        )
        self.db.add(message)
        self.db.commit()
        self.db.refresh(message)

        return ChatMessageRead(
            id=message.id,
            role=message.role,
            content=message.content,
            conversation_id=message.conversation_id,
            user_id=message.user_id,
            timestamp=message.timestamp,
            status=message.status
        )

    def get_conversation_messages(self, conversation_id: int, user_id: int) -> List[ChatMessage]:
        """Get all messages for a specific conversation"""
        statement = select(ChatMessage).where(
            ChatMessage.conversation_id == conversation_id,
            ChatMessage.user_id == user_id
        ).order_by(ChatMessage.timestamp.asc())
        return self.db.exec(statement).all()

    def update_conversation_title(self, conversation_id: int, new_title: str, user_id: int) -> Optional[Conversation]:
        """Update conversation title"""
        conversation = self.get_conversation_by_id(conversation_id, user_id)
        if conversation:
            conversation.title = new_title
            conversation.updated_at = datetime.utcnow()
            self.db.add(conversation)
            self.db.commit()
            self.db.refresh(conversation)
        return conversation


# Helper function to get service instance
def get_conversation_service(db: Session = Depends(get_session)) -> ConversationService:
    return ConversationService(db=db)