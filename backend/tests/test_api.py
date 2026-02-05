import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool
from unittest.mock import patch
from app.main import app
from app.database import get_session
from app.models import Task


# Mock the settings to use SQLite for testing
@pytest.fixture(name="mock_settings")
def mock_settings_fixture():
    with patch("app.config.Settings") as mock_settings_class:
        mock_settings_instance = mock_settings_class.return_value
        mock_settings_instance.database_url = "sqlite://"
        mock_settings_instance.neon_db_host = None
        mock_settings_instance.neon_db_name = None
        mock_settings_instance.neon_db_user = None
        mock_settings_instance.neon_db_password = None
        mock_settings_instance.neon_db_port = 5432
        yield mock_settings_instance


# Create an in-memory SQLite database for testing
@pytest.fixture(name="session")
def session_fixture(mock_settings):
    from app.database import engine, create_db_and_tables
    # Create a test engine
    test_engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
    SQLModel.metadata.create_all(bind=test_engine)
    with Session(test_engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


def test_create_task(client: TestClient):
    # Test creating a task
    response = client.post(
        "/api/users/1/tasks",
        json={"title": "Test Task", "description": "Test Description"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Task"
    assert data["description"] == "Test Description"
    assert data["completed"] is False
    assert data["user_id"] == 1
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data


def test_get_tasks_for_user(client: TestClient):
    # Create a task first
    response = client.post(
        "/api/users/1/tasks",
        json={"title": "Test Task", "description": "Test Description"}
    )
    assert response.status_code == 201

    # Get tasks for user
    response = client.get("/api/users/1/tasks")
    assert response.status_code == 200
    data = response.json()
    assert len(data["tasks"]) == 1
    assert data["tasks"][0]["title"] == "Test Task"


def test_get_specific_task(client: TestClient):
    # Create a task first
    create_response = client.post(
        "/api/users/1/tasks",
        json={"title": "Test Task", "description": "Test Description"}
    )
    assert create_response.status_code == 201
    task_id = create_response.json()["id"]

    # Get the specific task
    response = client.get(f"/api/users/1/tasks/{task_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Task"


def test_update_task(client: TestClient):
    # Create a task first
    create_response = client.post(
        "/api/users/1/tasks",
        json={"title": "Test Task", "description": "Test Description"}
    )
    assert create_response.status_code == 201
    task_id = create_response.json()["id"]

    # Update the task
    response = client.put(
        f"/api/users/1/tasks/{task_id}",
        json={"title": "Updated Task", "completed": True}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Task"
    assert data["completed"] is True


def test_complete_task(client: TestClient):
    # Create a task first
    create_response = client.post(
        "/api/users/1/tasks",
        json={"title": "Test Task", "description": "Test Description"}
    )
    assert create_response.status_code == 201
    task_id = create_response.json()["id"]

    # Update the task completion status
    response = client.patch(
        f"/api/users/1/tasks/{task_id}/complete",
        json={"completed": True}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["completed"] is True


def test_delete_task(client: TestClient):
    # Create a task first
    create_response = client.post(
        "/api/users/1/tasks",
        json={"title": "Test Task", "description": "Test Description"}
    )
    assert create_response.status_code == 201
    task_id = create_response.json()["id"]

    # Delete the task
    response = client.delete(f"/api/users/1/tasks/{task_id}")
    assert response.status_code == 204

    # Verify the task is gone
    response = client.get(f"/api/users/1/tasks/{task_id}")
    assert response.status_code == 404