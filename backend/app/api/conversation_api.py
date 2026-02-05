from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlmodel import Session
from ..database import get_session
from ..middleware.auth_middleware import require_chat_auth
from ..user_models import User
from ..conversation_models import (
    ConversationRead,
    ChatMessageRead,
    ChatMessageCreate,
    ConversationCreate
)
from ..conversation_service import ConversationService, get_conversation_service


router = APIRouter(prefix="", tags=["chat"])


@router.post("/", response_model=ConversationRead)
async def create_conversation(
    conversation_data: ConversationCreate,
    current_user: User = Depends(require_chat_auth),
    conversation_service: ConversationService = Depends(get_conversation_service)
):
    """
    Create a new conversation for the authenticated user.
    """
    # Ensure the conversation belongs to the current user
    conversation_data.user_id = current_user.id
    return conversation_service.create_conversation(conversation_data)


@router.get("/{conversation_id}", response_model=ConversationRead)
async def get_conversation(
    conversation_id: int,
    current_user: User = Depends(require_chat_auth),
    conversation_service: ConversationService = Depends(get_conversation_service)
):
    """
    Get a specific conversation by ID for the authenticated user.
    """
    conversation = conversation_service.get_conversation_by_id(
        conversation_id, current_user.id
    )
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    return ConversationRead(
        id=conversation.id,
        title=conversation.title,
        user_id=conversation.user_id,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at,
        messages=[
            ChatMessageRead(
                id=msg.id,
                role=msg.role,
                content=msg.content,
                conversation_id=msg.conversation_id,
                user_id=msg.user_id,
                timestamp=msg.timestamp,
                status=msg.status
            )
            for msg in conversation.messages
        ]
    )


@router.get("/", response_model=List[ConversationRead])
async def get_user_conversations(
    current_user: User = Depends(require_chat_auth),
    conversation_service: ConversationService = Depends(get_conversation_service)
):
    """
    Get all conversations for the authenticated user.
    """
    conversations = conversation_service.get_user_conversations(current_user.id)
    result = []
    for conv in conversations:
        result.append(
            ConversationRead(
                id=conv.id,
                title=conv.title,
                user_id=conv.user_id,
                created_at=conv.created_at,
                updated_at=conv.updated_at,
                messages=[]  # Don't include messages in the list view to avoid performance issues
            )
        )
    return result


@router.post("/{conversation_id}/messages", response_model=ChatMessageRead)
async def add_message_to_conversation(
    conversation_id: int,
    message_data: ChatMessageCreate,
    current_user: User = Depends(require_chat_auth),
    conversation_service: ConversationService = Depends(get_conversation_service)
):
    """
    Add a message to a specific conversation.
    """
    # Verify the conversation belongs to the user
    conversation = conversation_service.get_conversation_by_id(
        conversation_id, current_user.id
    )
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    # Ensure the message belongs to the same user and conversation
    message_data.conversation_id = conversation_id
    message_data.user_id = current_user.id

    return conversation_service.add_message_to_conversation(message_data)


@router.get("/{conversation_id}/messages", response_model=List[ChatMessageRead])
async def get_conversation_messages(
    conversation_id: int,
    current_user: User = Depends(require_chat_auth),
    conversation_service: ConversationService = Depends(get_conversation_service)
):
    """
    Get all messages for a specific conversation.
    """
    conversation = conversation_service.get_conversation_by_id(
        conversation_id, current_user.id
    )
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    messages = conversation_service.get_conversation_messages(
        conversation_id, current_user.id
    )
    result = []
    for msg in messages:
        result.append(
            ChatMessageRead(
                id=msg.id,
                role=msg.role,
                content=msg.content,
                conversation_id=msg.conversation_id,
                user_id=msg.user_id,
                timestamp=msg.timestamp,
                status=msg.status
            )
        )
    return result