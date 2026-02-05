# Quickstart Guide: Todo AI Chatbot API

## Overview
This guide provides essential information to start using the Todo AI Chatbot API for natural language todo interactions.

## Prerequisites
- Valid JWT token from Better Auth system
- User account with proper authentication setup
- Understanding of REST API concepts

## Base URL
```
https://api.example.com/api/{user_id}/chat
```

## Authentication
All API requests require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Making Your First Request

### 1. Prepare Your Request
```json
{
  "message": "What are my tasks for today?",
  "conversation_id": "123e4567-e89b-12d3-a456-426614174000",
  "metadata": {
    "client_type": "web",
    "request_source": "user_interface"
  }
}
```

### 2. Send the Request
```bash
curl -X POST \
  https://api.example.com/api/user123/chat \
  -H "Authorization: Bearer your-jwt-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are my tasks for today?",
    "conversation_id": "123e4567-e89b-12d3-a456-426614174000",
    "metadata": {}
  }'
```

### 3. Receive the Response
```json
{
  "response": "You have 3 tasks today: Meeting with John at 10 AM, Grocery shopping, Call Sarah",
  "conversation_id": "123e4567-e89b-12d3-a456-426614174000",
  "tool_calls": [
    {
      "tool_name": "get_todos_tool",
      "parameters": {
        "date_filter": "today"
      },
      "result": {
        "todos": [
          {"id": "1", "title": "Meeting with John", "time": "10:00 AM"},
          {"id": "2", "title": "Grocery shopping", "time": "2:00 PM"},
          {"id": "3", "title": "Call Sarah", "time": "4:00 PM"}
        ]
      },
      "status": "success"
    }
  ],
  "timestamp": "2023-10-20T10:30:00Z"
}
```

## Key Concepts

### Conversation Persistence
- Each conversation has a unique UUID
- Context is reconstructed from database for each request
- No server-side session state is maintained

### MCP Tool Integration
- AI operations execute through defined MCP tools
- Tool calls are recorded and returned in responses
- All todo operations go through standardized tool interfaces

### User Isolation
- Each user can only access their own conversations
- User ID from JWT token enforces data access controls
- Cross-user data leakage is prevented

## Error Handling
Common error responses:
- `401 Unauthorized`: Invalid or expired JWT token
- `403 Forbidden`: Attempting to access another user's data
- `400 Bad Request`: Malformed request body
- `500 Internal Server Error`: Unexpected server error

## Best Practices
1. Always include a valid conversation_id to maintain context
2. Handle tool_call results to provide feedback to users
3. Respect rate limits to ensure fair usage
4. Log API responses for debugging and monitoring