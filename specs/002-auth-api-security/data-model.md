# Data Model: Authentication & API Security

## Overview
This document describes the data model changes and considerations for implementing JWT-based authentication and user data isolation in the Todo application.

## Entity: JWT Token

### Structure
- **Header**:
  - `alg`: "RS256" (algorithm)
  - `typ`: "JWT" (token type)

- **Payload**:
  - `sub`: user_id (subject - identifies the user)
  - `email`: user_email (email address for identification)
  - `name`: user_name (optional - user's name)
  - `exp`: expiration_timestamp (Unix timestamp)
  - `iat`: issued_at_timestamp (Unix timestamp)
  - `jti`: token_id (optional - unique token identifier)

- **Signature**: RSA signature using shared secret

### Validation Rules
- Token must not be expired (exp > current time)
- Signature must be valid against shared public key
- Required fields (sub, email, exp) must be present
- user_id must be a valid integer

## Entity: Task (Updated)

### Existing Fields (from Spec-1)
- `id`: int (primary key, auto-increment)
- `title`: str (max 255 characters, required)
- `description`: str (optional, text field)
- `is_completed`: bool (default: false)
- `created_at`: datetime (auto-populated)
- `updated_at`: datetime (auto-populated)

### Added Security Field
- `user_id`: int (foreign key to user, required for ownership)

### Validation Rules (Enhanced)
- All operations must be filtered by authenticated user_id
- Only the owner can modify/delete a task
- Creation automatically assigns current user as owner

## Entity: Authenticated User Context

### Structure (Runtime Context)
- `user_id`: int (extracted from JWT token)
- `email`: str (user's email from JWT)
- `is_authenticated`: bool (whether request has valid JWT)
- `permissions`: list[str] (user's permissions, currently read/write to own data)

## Security Constraints

### User Data Isolation
- All database queries for tasks must include WHERE clause: `user_id = authenticated_user_id`
- No cross-user data access is permitted
- API responses must only include data belonging to authenticated user

### Authentication Requirements
- All task-related endpoints require valid JWT token
- Token must be present in Authorization header as "Bearer {token}"
- Invalid tokens result in HTTP 401 responses

## API Data Flow

### Request Processing
1. Extract JWT from Authorization header
2. Verify token signature and validity
3. Decode user information (user_id, email)
4. Attach user context to request
5. Validate user_id in URL matches authenticated user
6. Filter database queries by authenticated user_id

### Response Processing
- Only return data that belongs to authenticated user
- Include appropriate HTTP status codes
- Sanitize responses to prevent information leakage