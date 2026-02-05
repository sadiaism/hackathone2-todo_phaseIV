# Todo AI Chatbot Backend

This is the backend service for the Todo AI Chatbot, providing a stateless chat API with persistent memory capabilities. Built with FastAPI and SQLModel.

## Features

- REST API for todo management with full CRUD operations
- Multi-user support with data isolation
- PostgreSQL database with Neon compatibility
- Proper error handling and validation
- Comprehensive test coverage
- Stateless chat API endpoint that processes natural language requests
- Persistent conversation history in Neon PostgreSQL database
- Context reconstruction from stored messages for each request
- MCP (Model Context Protocol) tool integration for todo operations
- JWT-based authentication and user data isolation

## API Endpoints

All endpoints follow the pattern `/api/{user_id}/...` to ensure data isolation between users.

### Operations

- `GET /api/{user_id}/tasks` - Get all tasks for a user
- `POST /api/{user_id}/tasks` - Create a new task
- `GET /api/{user_id}/tasks/{id}` - Get a specific task
- `PUT /api/{user_id}/tasks/{id}` - Update a task
- `DELETE /api/{user_id}/tasks/{id}` - Delete a task
- `PATCH /api/{user_id}/tasks/{id}/complete` - Update task completion status
- `POST /api/{user_id}/chat` - Process chat messages and return AI responses (AI Chatbot feature)

## Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file based on `.env.example` with your Neon database credentials:
   ```bash
   cp .env.example .env
   # Edit .env with your Neon database credentials
   ```

4. Create the database tables in your Neon database:
   ```bash
   python create_tables.py
   ```
   This step ensures your Neon database has the required tables.

5. Start the development server:
   ```bash
   uvicorn app.main:app --reload
   ```

6. Access the API at `http://localhost:8000`
7. API documentation is available at `http://localhost:8000/docs`

## Testing

Run the tests with pytest:

```bash
pytest
```

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string for Neon database (required)
- `NEON_DB_HOST`: Database host
- `NEON_DB_NAME`: Database name
- `NEON_DB_USER`: Database user
- `NEON_DB_PASSWORD`: Database password
- `NEON_DB_PORT`: Database port (default: 5432)
- `OPENAI_API_KEY`: OpenAI API key for AI processing (required for AI Chatbot)
- `JWT_SECRET_KEY`: Secret key for JWT token signing (required)
- `ALGORITHM`: Algorithm for JWT encoding (default: HS256)