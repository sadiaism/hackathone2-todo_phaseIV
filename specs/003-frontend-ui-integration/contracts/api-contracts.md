# API Contracts: Todo Full-Stack Web Application – Frontend UI & Integration

**Feature**: Frontend UI & Integration
**Branch**: 003-frontend-ui-integration
**Created**: 2026-01-08

## Overview

This document defines the API contracts between the frontend and backend for the Todo application. These contracts ensure proper integration and communication between the client and server.

## Authentication API Contracts

### User Registration
- **Endpoint**: `POST /api/auth/signup`
- **Purpose**: Register a new user account
- **Authentication**: None required
- **Request**:
  ```json
  {
    "email": "string (required, valid email format)",
    "password": "string (required, minimum 8 characters)"
  }
  ```
- **Response (Success)**:
  ```json
  {
    "success": true,
    "token": "string (JWT token)",
    "user": {
      "id": "string (user UUID)",
      "email": "string (user email)"
    }
  }
  ```
  - **Status Code**: 201 Created
- **Response (Error)**:
  ```json
  {
    "success": false,
    "error": "string (error message)"
  }
  ```
  - **Status Code**: 400 Bad Request or 409 Conflict

### User Login
- **Endpoint**: `POST /api/auth/login`
- **Purpose**: Authenticate user and return JWT token
- **Authentication**: None required
- **Request**:
  ```json
  {
    "email": "string (required, valid email format)",
    "password": "string (required)"
  }
  ```
- **Response (Success)**:
  ```json
  {
    "success": true,
    "token": "string (JWT token)",
    "user": {
      "id": "string (user UUID)",
      "email": "string (user email)"
    }
  }
  ```
  - **Status Code**: 200 OK
- **Response (Error)**:
  ```json
  {
    "success": false,
    "error": "string (error message)"
  }
  ```
  - **Status Code**: 400 Bad Request or 401 Unauthorized

### User Logout
- **Endpoint**: `POST /api/auth/logout`
- **Purpose**: Invalidate user session
- **Authentication**: Bearer token required
- **Headers**:
  ```
  Authorization: Bearer {jwt_token}
  ```
- **Request**: Empty body
- **Response (Success)**:
  ```json
  {
    "success": true
  }
  ```
  - **Status Code**: 200 OK
- **Response (Error)**:
  ```json
  {
    "success": false,
    "error": "string (error message)"
  }
  ```
  - **Status Code**: 401 Unauthorized

## Task Management API Contracts

### Get User Tasks
- **Endpoint**: `GET /api/tasks`
- **Purpose**: Retrieve all tasks belonging to the authenticated user
- **Authentication**: Bearer token required
- **Headers**:
  ```
  Authorization: Bearer {jwt_token}
  ```
- **Response (Success)**:
  ```json
  {
    "success": true,
    "tasks": [
      {
        "id": "string (task UUID)",
        "title": "string (task title)",
        "description": "string (optional task description)",
        "completed": "boolean (task completion status)",
        "userId": "string (user UUID)",
        "createdAt": "string (ISO date string)",
        "updatedAt": "string (ISO date string)"
      }
    ]
  }
  ```
  - **Status Code**: 200 OK
- **Response (Error)**:
  ```json
  {
    "success": false,
    "error": "string (error message)"
  }
  ```
  - **Status Code**: 401 Unauthorized or 500 Internal Server Error

### Create Task
- **Endpoint**: `POST /api/tasks`
- **Purpose**: Create a new task for the authenticated user
- **Authentication**: Bearer token required
- **Headers**:
  ```
  Authorization: Bearer {jwt_token}
  Content-Type: application/json
  ```
- **Request**:
  ```json
  {
    "title": "string (required, task title)",
    "description": "string (optional, task description)"
  }
  ```
- **Response (Success)**:
  ```json
  {
    "success": true,
    "task": {
      "id": "string (task UUID)",
      "title": "string (task title)",
      "description": "string (task description)",
      "completed": "boolean (false by default)",
      "userId": "string (user UUID)",
      "createdAt": "string (ISO date string)",
      "updatedAt": "string (ISO date string)"
    }
  }
  ```
  - **Status Code**: 201 Created
- **Response (Error)**:
  ```json
  {
    "success": false,
    "error": "string (error message)"
  }
  ```
  - **Status Code**: 400 Bad Request, 401 Unauthorized, or 500 Internal Server Error

### Update Task
- **Endpoint**: `PUT /api/tasks/{taskId}`
- **Purpose**: Update an existing task for the authenticated user
- **Authentication**: Bearer token required
- **Headers**:
  ```
  Authorization: Bearer {jwt_token}
  Content-Type: application/json
  ```
- **Parameters**: `taskId` in URL path
- **Request**:
  ```json
  {
    "title": "string (optional, new task title)",
    "description": "string (optional, new task description)",
    "completed": "boolean (optional, new completion status)"
  }
  ```
- **Response (Success)**:
  ```json
  {
    "success": true,
    "task": {
      "id": "string (task UUID)",
      "title": "string (task title)",
      "description": "string (task description)",
      "completed": "boolean (task completion status)",
      "userId": "string (user UUID)",
      "createdAt": "string (ISO date string)",
      "updatedAt": "string (ISO date string)"
    }
  }
  ```
  - **Status Code**: 200 OK
- **Response (Error)**:
  ```json
  {
    "success": false,
    "error": "string (error message)"
  }
  ```
  - **Status Code**: 400 Bad Request, 401 Unauthorized, 404 Not Found, or 500 Internal Server Error

### Delete Task
- **Endpoint**: `DELETE /api/tasks/{taskId}`
- **Purpose**: Delete a task belonging to the authenticated user
- **Authentication**: Bearer token required
- **Headers**:
  ```
  Authorization: Bearer {jwt_token}
  ```
- **Parameters**: `taskId` in URL path
- **Response (Success)**:
  ```json
  {
    "success": true
  }
  ```
  - **Status Code**: 200 OK
- **Response (Error)**:
  ```json
  {
    "success": false,
    "error": "string (error message)"
  }
  ```
  - **Status Code**: 401 Unauthorized, 404 Not Found, or 500 Internal Server Error

### Toggle Task Completion
- **Endpoint**: `PATCH /api/tasks/{taskId}/toggle`
- **Purpose**: Toggle the completion status of a task
- **Authentication**: Bearer token required
- **Headers**:
  ```
  Authorization: Bearer {jwt_token}
  Content-Type: application/json
  ```
- **Parameters**: `taskId` in URL path
- **Request**:
  ```json
  {
    "completed": "boolean (new completion status)"
  }
  ```
- **Response (Success)**:
  ```json
  {
    "success": true,
    "task": {
      "id": "string (task UUID)",
      "title": "string (task title)",
      "description": "string (task description)",
      "completed": "boolean (new completion status)",
      "userId": "string (user UUID)",
      "createdAt": "string (ISO date string)",
      "updatedAt": "string (ISO date string)"
    }
  }
  ```
  - **Status Code**: 200 OK
- **Response (Error)**:
  ```json
  {
    "success": false,
    "error": "string (error message)"
  }
  ```
  - **Status Code**: 400 Bad Request, 401 Unauthorized, 404 Not Found, or 500 Internal Server Error

## Error Response Format

All error responses follow this format:
```json
{
  "success": false,
  "error": "string (descriptive error message)",
  "timestamp": "string (ISO date string)",
  "path": "string (requested path)"
}
```

## Common HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: New resource created successfully
- `400 Bad Request`: Invalid request format or parameters
- `401 Unauthorized`: Authentication required or invalid token
- `403 Forbidden`: Valid token but insufficient permissions
- `404 Not Found`: Requested resource doesn't exist
- `409 Conflict`: Request conflicts with current state (e.g., duplicate email)
- `500 Internal Server Error`: Server-side error occurred

## Security Requirements

- All authenticated endpoints require valid JWT in Authorization header
- User data isolation: Users can only access their own tasks
- Input validation on both frontend and backend
- Proper error handling without sensitive information exposure
- HTTPS required for all API communications