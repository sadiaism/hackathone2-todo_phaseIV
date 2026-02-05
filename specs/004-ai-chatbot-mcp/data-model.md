# Data Model: Todo AI Chatbot — MCP Server, Agent Tooling & Frontend Integration

**Feature**: 004-ai-chatbot-mcp
**Date**: 2026-02-02

## Overview

This document defines the data model for the AI-powered todo management system, extending the existing task model to support AI agent interactions while maintaining user data isolation and security requirements.

## Entity Definitions

### Todo Item (Extended from existing model)
**Description**: Represents a user's task with properties that support both traditional UI operations and AI agent interactions

**Fields**:
- `id`: UUID (primary key) - Unique identifier for the task
- `title`: String (required) - Task title/description from user
- `description`: String (optional) - Additional details about the task
- `status`: Enum ['pending', 'in-progress', 'completed'] (default: 'pending') - Current status of the task
- `created_at`: DateTime (auto-generated) - Timestamp when task was created
- `updated_at`: DateTime (auto-generated/updated) - Timestamp when task was last modified
- `user_id`: UUID (foreign key) - Links task to the owning user
- `ai_generated`: Boolean (default: false) - Indicates if task was created by AI agent
- `natural_language_input`: String (optional) - Original natural language command that created this task

**Validation Rules**:
- Title must not exceed 200 characters
- User ID must correspond to an existing authenticated user
- Status must be one of the allowed enum values
- All operations must be scoped to the authenticated user

**Relationships**:
- Belongs to one User (via user_id foreign key)
- One User has many Todo Items

### User Session Context
**Description**: Temporary context for tracking user session during AI agent operations

**Fields**:
- `session_id`: UUID (primary key) - Unique identifier for the session
- `user_id`: UUID (foreign key) - Associated user
- `created_at`: DateTime (auto-generated) - Session creation time
- `expires_at`: DateTime - Session expiration time
- `last_interaction`: DateTime - Last activity in the session

**Validation Rules**:
- Session must be valid and not expired
- User ID must match authenticated user
- Expires at must be in the future

**Relationships**:
- Belongs to one User (via user_id foreign key)

### AI Agent Interaction Log
**Description**: Audit trail for AI agent operations to ensure traceability and security

**Fields**:
- `id`: UUID (primary key) - Unique identifier for the log entry
- `user_id`: UUID (foreign key) - User who initiated the request
- `input_text`: String (required) - Original natural language input
- `selected_tool`: String (required) - Name of the MCP tool selected by AI
- `tool_parameters`: JSON (optional) - Parameters passed to the selected tool
- `result_status`: Enum ['success', 'failure', 'error'] - Outcome of the operation
- `result_message`: String (optional) - Description of the result
- `timestamp`: DateTime (auto-generated) - When the interaction occurred
- `task_ids_affected`: Array[UUID] - IDs of tasks affected by the operation

**Validation Rules**:
- Input text must not exceed 1000 characters
- Selected tool must be a registered MCP tool
- User ID must match authenticated user

**Relationships**:
- Belongs to one User (via user_id foreign key)
- Many AI Agent Interaction Logs may reference many Todo Items (via task_ids_affected)

## State Transitions

### Todo Item Status Transitions
- `pending` → `in-progress`: When user starts working on the task
- `in-progress` → `completed`: When user marks task as done
- `completed` → `pending`: When user reopens a completed task
- `in-progress` → `pending`: When user stops working on the task

### Validation for Transitions
- Only the owning user can change task status
- Status changes must be authenticated
- All transitions must be logged in AI Agent Interaction Log

## Constraints & Business Rules

### User Data Isolation
- Each user can only access their own tasks
- Queries must filter by user_id
- Cross-user data access is prohibited

### AI Agent Access Control
- AI agent can only operate on tasks belonging to the authenticated user
- All AI operations must be logged for audit purposes
- AI agent cannot access user credentials or personal information

### Data Persistence Requirements
- All MCP tool operations must persist changes to the database
- No in-memory storage of task data
- Transactional integrity must be maintained for all operations