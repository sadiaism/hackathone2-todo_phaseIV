# Quickstart Guide: Todo AI Chatbot — MCP Server, Agent Tooling & Frontend Integration

**Feature**: 004-ai-chatbot-mcp
**Date**: 2026-02-02

## Overview

This guide provides step-by-step instructions to set up and run the AI-powered todo management system with MCP server and agent tooling integration.

## Prerequisites

- Python 3.11+
- Node.js 18+
- Poetry (for Python dependency management)
- npm/yarn (for frontend dependencies)
- PostgreSQL or Neon Serverless PostgreSQL
- OpenAI API key
- Better Auth configuration

## Setup Instructions

### 1. Environment Configuration

1. Copy the backend environment template:
   ```bash
   cp backend.env backend/.env
   ```

2. Update the `.env` file with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost/dbname"
   OPENAI_API_KEY="your-openai-api-key"
   BETTER_AUTH_SECRET="your-better-auth-secret"
   NEON_DATABASE_URL="your-neon-database-url"
   ```

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up the database:
   ```bash
   python create_tables.py
   ```

4. Run the backend server:
   ```bash
   python run_backend.py
   ```

### 3. MCP Server Initialization

1. The MCP server will be initialized automatically when the backend starts
2. MCP tools will be registered with the server:
   - `add_task` - Create a new todo
   - `list_tasks` - Retrieve user's todos
   - `update_task` - Modify an existing todo
   - `complete_task` - Mark a todo as completed
   - `delete_task` - Remove a todo

### 4. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### 5. AI Agent Configuration

1. The OpenAI agent is configured automatically when the backend starts
2. The agent is connected to the MCP tool registry
3. Agent behavior rules for tool selection are defined in the configuration

## Running the Application

### Development Mode

1. Start the backend:
   ```bash
   cd backend
   uvicorn app.main:app --reload --port 8000
   ```

2. In a new terminal, start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

### Using the AI Chatbot

1. Navigate to the frontend application (usually http://localhost:3000)
2. Authenticate with Better Auth
3. Use natural language commands in the AI command interface:
   - "Add a task to buy groceries"
   - "Show me my tasks"
   - "Mark task 'buy groceries' as complete"
   - "Delete my task called 'old task'"
   - "Update my task 'meeting' to tomorrow"

## Testing the Integration

### Unit Tests

1. Backend tests:
   ```bash
   cd backend
   pytest tests/unit/
   ```

2. Frontend tests:
   ```bash
   cd frontend
   npm test
   ```

### Integration Tests

1. Test AI agent functionality:
   ```bash
   cd backend
   pytest tests/integration/agent_integration_test.py
   ```

2. Test MCP tools:
   ```bash
   cd backend
   pytest tests/unit/mcp_server/test_task_tools.py
   ```

## Troubleshooting

### Common Issues

1. **MCP Server Not Starting**: Ensure the Official MCP SDK is installed correctly
2. **AI Agent Not Responding**: Check that the OpenAI API key is configured properly
3. **Authentication Errors**: Verify Better Auth configuration in environment variables
4. **Database Connection Issues**: Confirm database URL and credentials are correct

### Logging

- Backend logs are available in the console output
- AI agent interactions are logged in the AI Agent Interaction Log
- MCP tool calls are recorded for debugging purposes

## Next Steps

1. Explore the API documentation at `/docs` endpoint
2. Review the contract definitions in `specs/004-ai-chatbot-mcp/contracts/`
3. Customize the AI agent behavior rules as needed
4. Extend the MCP tools with additional functionality