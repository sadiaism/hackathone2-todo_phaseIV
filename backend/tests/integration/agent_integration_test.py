import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import get_db
from unittest.mock import patch, MagicMock
from backend.src.agents.executor import AgentExecutor


@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)


def test_execute_command_success(client):
    """Test successful execution of a command through the AI agent."""
    # Mock the agent executor to avoid calling external APIs
    with patch('backend.src.api.agent_endpoints.AgentExecutor') as mock_executor_class:
        mock_executor_instance = MagicMock()
        mock_executor_instance.execute_command.return_value = {
            "status": "success",
            "result": {
                "type": "task_created",
                "message": "Successfully created task: Buy groceries",
                "task": {
                    "id": "test-task-id",
                    "title": "Buy groceries",
                    "status": "pending"
                }
            },
            "tool_used": "add_task"
        }
        mock_executor_class.return_value = mock_executor_instance

        # Mock the get_current_user dependency
        with patch('backend.src.api.agent_endpoints.get_current_user') as mock_get_current_user:
            from backend.app.models import User
            mock_user = User(id="test-user-id", email="test@example.com")
            mock_get_current_user.return_value = mock_user

            response = client.post(
                "/ai-agent/execute-command",
                json={"command": "add a task to buy groceries"},
                headers={"Authorization": "Bearer fake-token"}
            )

            assert response.status_code == 200
            assert response.json()["status"] == "success"
            assert response.json()["tool_used"] == "add_task"


def test_execute_command_validation_error(client):
    """Test handling of validation errors in command execution."""
    # Mock the agent executor to return a validation error
    with patch('backend.src.api.agent_endpoints.AgentExecutor') as mock_executor_class:
        mock_executor_instance = MagicMock()
        mock_executor_instance.execute_command.return_value = {
            "status": "error",
            "error_code": "INVALID_COMMAND",
            "message": "Unable to understand the provided command",
            "suggestions": [
                "Try rephrasing your request",
                "Use commands like 'add task', 'show tasks', 'complete task'"
            ]
        }
        mock_executor_class.return_value = mock_executor_instance

        # Mock the get_current_user dependency
        with patch('backend.src.api.agent_endpoints.get_current_user') as mock_get_current_user:
            from backend.app.models import User
            mock_user = User(id="test-user-id", email="test@example.com")
            mock_get_current_user.return_value = mock_user

            response = client.post(
                "/ai-agent/execute-command",
                json={"command": "invalid command"},
                headers={"Authorization": "Bearer fake-token"}
            )

            assert response.status_code == 400
            assert response.json()["status"] == "error"
            assert response.json()["error_code"] == "INVALID_COMMAND"


def test_validate_command_success(client):
    """Test successful validation of a command."""
    with patch('backend.src.api.agent_endpoints.AgentExecutor') as mock_executor_class:
        mock_executor_instance = MagicMock()
        mock_executor_instance.validate_command.return_value = {
            "status": "success",
            "validation_result": {
                "valid": True,
                "suggested_tool": "add_task",
                "parsed_intent": "create_todo",
                "confidence": 0.95,
                "extracted_parameters": {
                    "title": "buy groceries"
                }
            }
        }
        mock_executor_class.return_value = mock_executor_instance

        # Mock the get_current_user dependency
        with patch('backend.src.api.agent_endpoints.get_current_user') as mock_get_current_user:
            from backend.app.models import User
            mock_user = User(id="test-user-id", email="test@example.com")
            mock_get_current_user.return_value = mock_user

            response = client.post(
                "/ai-agent/validate-command",
                json={"command": "add a task to buy groceries"},
                headers={"Authorization": "Bearer fake-token"}
            )

            assert response.status_code == 200
            assert response.json()["status"] == "success"
            assert response.json()["validation_result"]["valid"] is True


def test_get_command_history(client):
    """Test retrieval of command history."""
    # Mock the database query for command history
    with patch('backend.src.api.agent_endpoints.Session') as mock_session_class:
        mock_session_instance = MagicMock()
        mock_session_class.return_value.__enter__.return_value = mock_session_instance

        # Mock the query result
        mock_statement = MagicMock()
        mock_session_instance.exec.return_value = mock_statement
        mock_statement.all.return_value = []

        # Mock the get_current_user dependency
        with patch('backend.src.api.agent_endpoints.get_current_user') as mock_get_current_user:
            from backend.app.models import User
            mock_user = User(id="test-user-id", email="test@example.com")
            mock_get_current_user.return_value = mock_user

            response = client.get(
                "/ai-agent/history",
                headers={"Authorization": "Bearer fake-token"}
            )

            assert response.status_code == 200
            assert response.json()["status"] == "success"
            assert response.json()["total_count"] == 0