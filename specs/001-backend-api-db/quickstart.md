# Quickstart Guide: Todo Backend API

**Feature**: Todo Full-Stack Web Application – Spec 1 (Backend API & Database)
**Date**: 2026-01-08

## Prerequisites

- Python 3.8+
- pip package manager
- Access to Neon PostgreSQL database instance

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install fastapi sqlmodel python-dotenv uvicorn psycopg2-binary alembic pytest httpx
```

### 4. Configure Environment Variables
Create a `.env` file in the project root with the following variables:

```env
DATABASE_URL=postgresql+psychopg2://username:password@neon-host.region.neon.tech/dbname
NEON_DB_HOST=your-neon-host.region.neon.tech
NEON_DB_NAME=your-database-name
NEON_DB_USER=your-username
NEON_DB_PASSWORD=your-password
NEON_DB_PORT=5432
```

### 5. Initialize Database
```bash
# Initialize Alembic if not already done
alembic init alembic

# Run migrations to create tables
alembic upgrade head
```

### 6. Start the Server
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000` with documentation at `http://localhost:8000/docs`.

## API Usage Examples

### Create a Task
```bash
curl -X POST http://localhost:8000/api/1/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Sample Task", "description": "This is a sample task"}'
```

### Get All Tasks for User
```bash
curl -X GET http://localhost:8000/api/1/tasks
```

### Get Specific Task
```bash
curl -X GET http://localhost:8000/api/1/tasks/1
```

### Update a Task
```bash
curl -X PUT http://localhost:8000/api/1/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Task", "completed": true}'
```

### Mark Task as Complete
```bash
curl -X PATCH http://localhost:8000/api/1/tasks/1/complete \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

### Delete a Task
```bash
curl -X DELETE http://localhost:8000/api/1/tasks/1
```

## Testing

Run the tests with pytest:
```bash
pytest
```

## Next Steps

1. Implement the complete backend with all endpoints
2. Add authentication in the next spec phase
3. Connect with the frontend application