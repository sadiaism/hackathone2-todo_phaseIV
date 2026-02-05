# Data Model: Todo AI Chatbot — Conversational API & Persistent Memory

## Overview
This document defines the database schema and data relationships for the Todo AI Chatbot feature, focusing on conversation persistence and context reconstruction.

## Entity Definitions

### 1. Conversation Entity
**Purpose**: Represents a logical conversation thread between user and AI assistant

**Fields**:
- `id` (UUID, Primary Key): Unique identifier for the conversation
- `user_id` (String, Indexed): Identifier of the user who owns this conversation
- `title` (String, Optional): Auto-generated title based on conversation content
- `created_at` (DateTime, Indexed): Timestamp when conversation started
- `updated_at` (DateTime, Indexed): Timestamp of last activity
- `is_active` (Boolean, Default: True): Whether conversation is currently active

**Relationships**:
- One Conversation has Many Messages
- One Conversation has Many ToolInvocations

**Validation Rules**:
- `user_id` must not be empty
- `created_at` is set on creation and immutable
- `updated_at` is updated on any conversation activity

### 2. Message Entity
**Purpose**: Individual message within a conversation thread

**Fields**:
- `id` (UUID, Primary Key): Unique identifier for the message
- `conversation_id` (UUID, Foreign Key, Indexed): Links to parent conversation
- `role` (String, Enum: ['user', 'assistant'], Indexed): Who sent the message
- `content` (Text): The actual message content
- `timestamp` (DateTime, Indexed): When the message was created
- `metadata` (JSON, Optional): Additional data (e.g., message type, source)

**Relationships**:
- Many Messages belong to One Conversation
- Messages are ordered by timestamp within conversation

**Validation Rules**:
- `conversation_id` must reference existing conversation
- `role` must be either 'user' or 'assistant'
- `content` must not be empty
- `timestamp` is set on creation and immutable

### 3. ToolInvocation Entity
**Purpose**: Record of MCP tool calls made during conversation

**Fields**:
- `id` (UUID, Primary Key): Unique identifier for the tool invocation
- `conversation_id` (UUID, Foreign Key, Indexed): Links to parent conversation
- `message_id` (UUID, Foreign Key, Optional): Links to message that triggered this tool call
- `tool_name` (String, Indexed): Name of the MCP tool invoked
- `parameters` (JSON): Parameters passed to the tool
- `result` (JSON, Optional): Result returned by the tool
- `status` (String, Enum: ['pending', 'success', 'failed'], Default: 'pending')
- `created_at` (DateTime, Indexed): When tool was invoked

**Relationships**:
- Many ToolInvocations belong to One Conversation
- One ToolInvocation optionally belongs to One Message

**Validation Rules**:
- `conversation_id` must reference existing conversation
- `tool_name` must not be empty
- `status` must be one of allowed values
- `created_at` is set on creation and immutable

## Database Indexes

### Conversation Table
- Primary: `id`
- Secondary: `user_id` (for user-based queries)
- Secondary: `created_at` (for chronological ordering)
- Secondary: `updated_at` (for recency queries)
- Composite: `(user_id, is_active)` (for active conversations per user)

### Message Table
- Primary: `id`
- Secondary: `conversation_id` (foreign key)
- Secondary: `role` (for filtering by sender)
- Secondary: `timestamp` (for chronological ordering)
- Composite: `(conversation_id, timestamp)` (for conversation history)

### ToolInvocation Table
- Primary: `id`
- Secondary: `conversation_id` (foreign key)
- Secondary: `message_id` (foreign key, nullable)
- Secondary: `tool_name` (for tool-based queries)
- Secondary: `status` (for status-based queries)
- Secondary: `created_at` (for chronological ordering)

## Data Relationships

```
Conversation (1) <---> (Many) Message
Conversation (1) <---> (Many) ToolInvocation
Message (1) <---> (Many) ToolInvocation (optional)
```

## Constraints and Business Rules

1. **User Isolation**: All queries must filter by `user_id` to enforce data isolation
2. **Referential Integrity**: Foreign key constraints ensure data consistency
3. **Audit Trail**: All entities have creation timestamps for audit purposes
4. **Soft Deletion**: Consider soft deletion for messages to maintain conversation context
5. **Size Limits**: Content fields should have reasonable size limits to prevent abuse

## Migration Strategy

### Initial Schema Creation
1. Create `conversation` table
2. Create `message` table
3. Create `tool_invocation` table
4. Establish foreign key relationships
5. Create indexes for performance

### Future Evolution Considerations
- Add `updated_at` fields to all entities for better change tracking
- Consider partitioning large conversation histories
- Add full-text search indexes for conversation search capabilities
- Consider archiving old conversations to optimize performance