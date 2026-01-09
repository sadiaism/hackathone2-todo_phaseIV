# API Documentation: Todo Application with Authentication

## Authentication

All API endpoints require JWT authentication in the form of a Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token_here>
```

### JWT Token Structure

- `sub`: User ID (string)
- `email`: User email (string)
- `exp`: Expiration timestamp (Unix timestamp)

### Token Configuration

- Algorithm: HS256
- Expiration: 7 days (604800 seconds)
- Secret: Configured via `BETTER_AUTH_SECRET` environment variable

## API Endpoints

### Task Management

#### GET /api/users/{user_id}/tasks
Get all tasks for the authenticated user.

**Path Parameters:**
- `user_id` (int): The ID of the user whose tasks to retrieve

**Headers:**
- `Authorization` (required): Bearer token

**Response:**
- `200 OK`: List of tasks belonging to the authenticated user
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User trying to access tasks of another user

#### POST /api/users/{user_id}/tasks
Create a new task for the authenticated user.

**Path Parameters:**
- `user_id` (int): The ID of the user for whom to create the task

**Headers:**
- `Authorization` (required): Bearer token

**Request Body:**
```json
{
  "title": "Task title (string, required)",
  "description": "Task description (string, optional)"
}
```

**Response:**
- `201 Created`: Task created successfully
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User trying to create task for another user

#### GET /api/users/{user_id}/tasks/{id}
Get a specific task for the authenticated user.

**Path Parameters:**
- `user_id` (int): The ID of the user
- `id` (int): The ID of the task

**Headers:**
- `Authorization` (required): Bearer token

**Response:**
- `200 OK`: Task data
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User trying to access task of another user
- `404 Not Found`: Task not found

#### PUT /api/users/{user_id}/tasks/{id}
Update a specific task for the authenticated user.

**Path Parameters:**
- `user_id` (int): The ID of the user
- `id` (int): The ID of the task

**Headers:**
- `Authorization` (required): Bearer token

**Request Body:**
```json
{
  "title": "Updated task title (string, optional)",
  "description": "Updated task description (string, optional)"
}
```

**Response:**
- `200 OK`: Updated task data
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User trying to update task of another user
- `404 Not Found`: Task not found

#### DELETE /api/users/{user_id}/tasks/{id}
Delete a specific task for the authenticated user.

**Path Parameters:**
- `user_id` (int): The ID of the user
- `id` (int): The ID of the task

**Headers:**
- `Authorization` (required): Bearer token

**Response:**
- `204 No Content`: Task deleted successfully
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User trying to delete task of another user
- `404 Not Found`: Task not found

#### PATCH /api/users/{user_id}/tasks/{id}/complete
Update the completion status of a task for the authenticated user.

**Path Parameters:**
- `user_id` (int): The ID of the user
- `id` (int): The ID of the task

**Headers:**
- `Authorization` (required): Bearer token

**Request Body:**
```json
{
  "completed": true
}
```

**Response:**
- `200 OK`: Updated task data
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User trying to update task of another user
- `404 Not Found`: Task not found

## Error Handling

### HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `204 No Content`: Request successful, no content to return
- `400 Bad Request`: Invalid request parameters or body
- `401 Unauthorized`: Invalid or missing authentication token
- `403 Forbidden`: User not authorized to perform the action
- `404 Not Found`: Requested resource not found

### Error Response Format

```json
{
  "detail": "Error message"
}
```

## Security

- All endpoints require valid JWT tokens
- Users can only access their own data
- User ID in URL must match the authenticated user's ID
- Invalid tokens result in 401 responses
- Cross-user access attempts result in 403 responses