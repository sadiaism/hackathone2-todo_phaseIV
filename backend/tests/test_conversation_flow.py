"""
Integration tests for conversation flow
"""
import pytest
import sys
import os
# Add the backend directory to the path so we can import from src
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from src.main import app
from src.models.conversation import ConversationCreate
from src.services.database_service import DatabaseService
from src.services.conversation_service import ConversationService
from sqlmodel import Session, create_engine
from src.database import DATABASE_URL


@pytest.fixture
def client():
    """Create a test client for the API"""
    return TestClient(app)


def test_conversation_creation():
    """Test that conversation creation works properly"""
    # This test creates a conversation without going through the full API flow
    # to avoid needing authentication and OpenAI API keys

    # Create an in-memory database for testing
    engine = create_engine("sqlite:///:memory:")
    from src.models.conversation import Conversation
    from src.models.message import Message, MessageCreate
    from src.models.tool_invocation import ToolInvocation, ToolInvocationCreate

    # Create tables
    from sqlmodel import SQLModel
    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        db_service = DatabaseService(session)

        # Create a conversation
        conv_data = ConversationCreate(user_id="test_user_123")
        conversation = db_service.create_conversation(conv_data)

        # Verify the conversation was created
        assert conversation.user_id == "test_user_123"
        assert conversation.id is not None


@patch('openai.chat.completions.create')
def test_conversation_service_flow(mock_openai):
    """Test conversation service flow with mocked OpenAI"""
    # Mock the OpenAI response
    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].message = MagicMock()
    mock_response.choices[0].message.content = "This is a test response"
    mock_response.choices[0].message.tool_calls = None  # No tool calls in this test
    mock_openai.return_value = mock_response

    # Create an in-memory database for testing
    engine = create_engine("sqlite:///:memory:")
    from src.models.conversation import Conversation
    from src.models.message import Message, MessageCreate
    from src.models.tool_invocation import ToolInvocation, ToolInvocationCreate

    # Create tables
    from sqlmodel import SQLModel
    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        db_service = DatabaseService(session)
        conversation_service = ConversationService(db_service)

        # Create a conversation
        conversation = conversation_service.get_or_create_conversation("test_user_123")

        # Add a message
        message = conversation_service.add_message_to_conversation(
            conversation_id=conversation.id,
            role="user",
            content="Test message"
        )

        # Verify the message was added
        assert message.content == "Test message"
        assert message.conversation_id == conversation.id

        # Get conversation history
        history = conversation_service.get_conversation_history(conversation.id)
        assert len(history) == 1
        assert history[0].content == "Test message"