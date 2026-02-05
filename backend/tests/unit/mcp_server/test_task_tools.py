import pytest
from unittest.mock import MagicMock, patch
from backend.src.mcp_server.tools.task_tools import (
    add_task_handler,
    list_tasks_handler,
    update_task_handler,
    complete_task_handler,
    delete_task_handler
)
from backend.src.mcp_server.tools.validators import validate_add_task_params
from backend.src.models.task import TaskStatus
from pydantic import ValidationError


class TestAddTaskHandler:
    """Test cases for the add_task_handler function."""

    @patch('backend.src.mcp_server.tools.task_tools.create_engine')
    @patch('backend.src.mcp_server.tools.task_tools.Session')
    def test_add_task_success(self, mock_session_class, mock_create_engine):
        """Test successful addition of a task."""
        # Mock the database session and service
        mock_session = MagicMock()
        mock_session_class.return_value.__enter__.return_value = mock_session

        mock_task_service = MagicMock()
        mock_task_service.create_task.return_value = MagicMock(
            id="test-id",
            title="Test Task",
            status=TaskStatus.PENDING
        )

        with patch('backend.src.mcp_server.tools.task_tools.TaskService', return_value=mock_task_service):
            from backend.src.mcp_server.tools.task_tools import AddTaskParams

            params = AddTaskParams(
                title="Test Task",
                description="Test Description",
                user_id="123e4567-e89b-12d3-a456-426614174000"
            )

            result = add_task_handler(params)

            assert result["success"] is True
            assert result["message"] == "Successfully created task: Test Task"
            assert result["task_title"] == "Test Task"
            mock_task_service.create_task.assert_called_once()

    @patch('backend.src.mcp_server.tools.task_tools.create_engine')
    @patch('backend.src.mcp_server.tools.task_tools.Session')
    def test_add_task_validation_error(self, mock_session_class, mock_create_engine):
        """Test handling of validation errors in add_task."""
        from backend.src.mcp_server.tools.task_tools import AddTaskParams

        # Create invalid parameters to trigger validation error
        params = AddTaskParams(
            title="",  # Invalid - empty title
            user_id="invalid-uuid"  # Invalid UUID
        )

        result = add_task_handler(params)

        assert result["success"] is False
        assert "Validation failed" in result["message"]


class TestListTasksHandler:
    """Test cases for the list_tasks_handler function."""

    @patch('backend.src.mcp_server.tools.task_tools.create_engine')
    @patch('backend.src.mcp_server.tools.task_tools.Session')
    def test_list_tasks_success(self, mock_session_class, mock_create_engine):
        """Test successful listing of tasks."""
        # Mock the database session and service
        mock_session = MagicMock()
        mock_session_class.return_value.__enter__.return_value = mock_session

        mock_task_service = MagicMock()
        mock_task_service.get_tasks_by_user.return_value = [
            MagicMock(
                id="test-id-1",
                title="Task 1",
                description="Description 1",
                status=TaskStatus.PENDING,
                created_at="2023-01-01T00:00:00Z",
                updated_at="2023-01-01T00:00:00Z"
            )
        ]

        with patch('backend.src.mcp_server.tools.task_tools.TaskService', return_value=mock_task_service):
            from backend.src.mcp_server.tools.task_tools import ListTasksParams

            params = ListTasksParams(
                user_id="123e4567-e89b-12d3-a456-426614174000",
                status=None
            )

            result = list_tasks_handler(params)

            assert result["success"] is True
            assert len(result["tasks"]) == 1
            assert result["tasks"][0]["title"] == "Task 1"
            mock_task_service.get_tasks_by_user.assert_called_once()


class TestUpdateTaskHandler:
    """Test cases for the update_task_handler function."""

    @patch('backend.src.mcp_server.tools.task_tools.create_engine')
    @patch('backend.src.mcp_server.tools.task_tools.Session')
    def test_update_task_success(self, mock_session_class, mock_create_engine):
        """Test successful update of a task."""
        # Mock the database session and service
        mock_session = MagicMock()
        mock_session_class.return_value.__enter__.return_value = mock_session

        mock_task_service = MagicMock()
        mock_task_service.update_task.return_value = MagicMock(
            id="test-id",
            title="Updated Task",
            status=TaskStatus.IN_PROGRESS
        )

        with patch('backend.src.mcp_server.tools.task_tools.TaskService', return_value=mock_task_service):
            from backend.src.mcp_server.tools.task_tools import UpdateTaskParams

            params = UpdateTaskParams(
                task_id="123e4567-e89b-12d3-a456-426614174000",
                user_id="123e4567-e89b-12d3-a456-426614174001",
                title="Updated Task",
                status="in-progress"
            )

            result = update_task_handler(params)

            assert result["success"] is True
            assert result["task_title"] == "Updated Task"
            mock_task_service.update_task.assert_called_once()


class TestCompleteTaskHandler:
    """Test cases for the complete_task_handler function."""

    @patch('backend.src.mcp_server.tools.task_tools.create_engine')
    @patch('backend.src.mcp_server.tools.task_tools.Session')
    def test_complete_task_success(self, mock_session_class, mock_create_engine):
        """Test successful completion of a task."""
        # Mock the database session and service
        mock_session = MagicMock()
        mock_session_class.return_value.__enter__.return_value = mock_session

        mock_task_service = MagicMock()
        mock_task_service.complete_task.return_value = MagicMock(
            id="test-id",
            title="Completed Task",
            status=TaskStatus.COMPLETED
        )

        with patch('backend.src.mcp_server.tools.task_tools.TaskService', return_value=mock_task_service):
            from backend.src.mcp_server.tools.task_tools import CompleteTaskParams

            params = CompleteTaskParams(
                task_id="123e4567-e89b-12d3-a456-426614174000",
                user_id="123e4567-e89b-12d3-a456-426614174001"
            )

            result = complete_task_handler(params)

            assert result["success"] is True
            assert "Successfully completed task" in result["message"]
            mock_task_service.complete_task.assert_called_once()


class TestDeleteTaskHandler:
    """Test cases for the delete_task_handler function."""

    @patch('backend.src.mcp_server.tools.task_tools.create_engine')
    @patch('backend.src.mcp_server.tools.task_tools.Session')
    def test_delete_task_success(self, mock_session_class, mock_create_engine):
        """Test successful deletion of a task."""
        # Mock the database session and service
        mock_session = MagicMock()
        mock_session_class.return_value.__enter__.return_value = mock_session

        mock_task_service = MagicMock()
        mock_task_service.delete_task.return_value = True  # Simulate successful deletion

        with patch('backend.src.mcp_server.tools.task_tools.TaskService', return_value=mock_task_service):
            from backend.src.mcp_server.tools.task_tools import DeleteTaskParams

            params = DeleteTaskParams(
                task_id="123e4567-e89b-12d3-a456-426614174000",
                user_id="123e4567-e89b-12d3-a456-426614174001"
            )

            result = delete_task_handler(params)

            assert result["success"] is True
            assert result["message"] == "Successfully deleted task"
            mock_task_service.delete_task.assert_called_once()


def test_validate_add_task_params():
    """Test validation of add task parameters."""
    params = {
        "title": "Test Task",
        "user_id": "123e4567-e89b-12d3-a456-426614174000"
    }

    result = validate_add_task_params(params)

    assert result["valid"] is True
    assert len(result["errors"]) == 0


def test_validate_add_task_params_missing_fields():
    """Test validation when required fields are missing."""
    params = {
        "user_id": "123e4567-e89b-12d3-a456-426614174000"
        # Missing title
    }

    result = validate_add_task_params(params)

    assert result["valid"] is False
    assert len(result["errors"]) > 0
    assert any("title is required" in error for error in result["errors"])