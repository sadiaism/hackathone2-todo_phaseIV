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


@router.post("/chat", response_model=dict)  # Using dict since frontend expects different structure
async def chat_endpoint(
    chat_request: dict,  # Using dict to match frontend expectations
    current_user: User = Depends(require_chat_auth),
    conversation_service: ConversationService = Depends(get_conversation_service)
):
    """
    Main chat endpoint for AI interaction.
    Expects: {"message": "...", "conversation_id": "..."}
    """
    message_content = chat_request.get("message", "")
    conversation_id = chat_request.get("conversation_id")

    if not message_content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message content is required"
        )

    # If no conversation_id provided, create a new conversation
    if not conversation_id:
        # Create new conversation
        conversation_data = ConversationCreate(
            title=f"Chat: {message_content[:50]}...",
            user_id=current_user.id
        )
        conversation = conversation_service.create_conversation(conversation_data)
        conversation_id = conversation.id
    else:
        # Verify the conversation belongs to the user
        try:
            conversation_id_int = int(conversation_id)
            conversation = conversation_service.get_conversation_by_id(
                conversation_id_int, current_user.id
            )
            if not conversation:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Conversation not found"
                )
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid conversation ID"
            )

    # Add user message to conversation
    user_message_data = ChatMessageCreate(
        role="user",
        content=message_content,
        conversation_id=int(conversation_id),
        user_id=current_user.id
    )
    user_message = conversation_service.add_message_to_conversation(user_message_data)

    # Here we would typically call the AI service to get a response
    # For now, returning a placeholder response
    ai_response_content = f"I received your message: '{message_content}'. This is a placeholder response. In a real implementation, an AI would process this and potentially interact with the todo system."

    # Add AI response to conversation
    ai_message_data = ChatMessageCreate(
        role="assistant",
        content=ai_response_content,
        conversation_id=int(conversation_id),
        user_id=current_user.id
    )
    ai_message = conversation_service.add_message_to_conversation(ai_message_data)

    # Return the expected format for the frontend
    return {
        "conversation_id": str(conversation_id),
        "message": message_content,
        "ai_response": ai_response_content,
        "timestamp": ai_message.timestamp.isoformat() if hasattr(ai_message, 'timestamp') else None,
        "todo_action_result": None  # Placeholder - would be populated by AI when it performs todo actions
    }


@router.get("/chat/{conversation_id}", response_model=ConversationRead)
async def get_chat_conversation(
    conversation_id: str,
    current_user: User = Depends(require_chat_auth),
    conversation_service: ConversationService = Depends(get_conversation_service)
):
    """
    Get a specific conversation by ID.
    """
    try:
        conv_id = int(conversation_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid conversation ID"
        )

    conversation = conversation_service.get_conversation_by_id(
        conv_id, current_user.id
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


@router.get("/chat", response_model=dict)  # Using dict to match frontend expectations
async def get_user_chats(
    limit: int = 10,
    offset: int = 0,
    current_user: User = Depends(require_chat_auth),
    conversation_service: ConversationService = Depends(get_conversation_service)
):
    """
    Get all conversations for the authenticated user.
    """
    conversations = conversation_service.get_user_conversations(current_user.id)

    # Limit and offset for pagination
    paginated_conversations = conversations[offset:offset + limit]

    result_conversations = []
    for conv in paginated_conversations:
        result_conversations.append(
            {
                "id": str(conv.id),
                "user_id": str(conv.user_id),
                "title": conv.title,
                "created_at": conv.created_at.isoformat(),
                "updated_at": conv.updated_at.isoformat(),
                "status": "active",  # Default status
                "messages": []  # Don't include messages in list view for performance
            }
        )

    return {
        "conversations": result_conversations,
        "total_count": len(conversations),
        "has_more": offset + limit < len(conversations)
    }