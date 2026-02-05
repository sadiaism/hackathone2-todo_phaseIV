# Data Model: Todo AI Chatbot — ChatKit Frontend UI

## Overview
This document defines the data structures required for implementing the AI chatbot frontend with conversation history management.

## Entities

### Conversation
Represents a sequence of messages between user and AI, containing message history with timestamps.

**Fields**:
- `id` (UUID/string): Unique identifier for the conversation
- `user_id` (string): Reference to the authenticated user who owns this conversation
- `created_at` (datetime): Timestamp when conversation was initiated
- `updated_at` (datetime): Timestamp of last message in conversation
- `title` (string, optional): Auto-generated title based on first message or topic
- `status` (enum): Current state of conversation ('active', 'closed', 'archived')

**Relationships**:
- One-to-many with ChatMessage (one conversation contains many messages)
- Belongs to one AuthenticatedUser

**Validation rules**:
- `user_id` must be a valid authenticated user
- `created_at` must be before or equal to `updated_at`
- `status` must be one of the allowed enum values

### ChatMessage
Individual message in conversation, including sender type (user/ai), content, timestamp, and status.

**Fields**:
- `id` (UUID/string): Unique identifier for the message
- `conversation_id` (string): Reference to the parent conversation
- `sender_type` (enum): Who sent the message ('user', 'ai')
- `content` (string): The actual message content
- `timestamp` (datetime): When the message was sent/received
- `status` (enum): Delivery/processing status ('sent', 'delivered', 'read', 'error')
- `message_type` (enum): Type of message ('text', 'confirmation', 'error', 'system')

**Relationships**:
- Belongs to one Conversation
- Optionally references previous message for threading

**Validation rules**:
- `conversation_id` must reference an existing conversation
- `sender_type` must be either 'user' or 'ai'
- `content` must not exceed maximum length (e.g., 4000 characters)
- `timestamp` must be within reasonable bounds

### AuthenticatedUser (Reference)
Verified user identity obtained through JWT token validation, linked to their conversation data.

**Fields**:
- `id` (string): User identifier from authentication system
- `email` (string): User's email address
- `created_at` (datetime): When user account was created
- `last_login` (datetime): Timestamp of last login

**Relationships**:
- One-to-many with Conversation (one user can have many conversations)

**Note**: This entity is primarily managed by Better Auth and referenced in chat data.

## State Transitions

### Conversation State Transitions
- `active` → `closed` (when user explicitly closes or conversation is inactive for extended period)
- `closed` → `active` (when user resumes conversation)
- `active` → `archived` (when user archives conversation)
- `closed` → `archived` (when archived while closed)

### ChatMessage Status Transitions
- `sent` → `delivered` (when message reaches server)
- `delivered` → `read` (when recipient views message)
- `sent` → `error` (when delivery fails)

## Indexes and Performance Considerations

### Required Indexes
- Conversation: Index on `(user_id, updated_at)` for efficient retrieval of user's recent conversations
- ChatMessage: Index on `(conversation_id, timestamp)` for chronological message retrieval
- ChatMessage: Index on `(conversation_id, id)` for efficient pagination

### Data Retention Policy
- Conversation history retained for 1 year by default
- Ability to extend retention for important conversations
- Soft-delete approach (mark as archived) rather than hard deletion

## API Response Structures

### Conversation Response Object
```json
{
  "id": "uuid-string",
  "user_id": "user-identifier",
  "title": "Auto-generated or user-defined title",
  "created_at": "ISO datetime",
  "updated_at": "ISO datetime",
  "status": "active|closed|archived",
  "messages": [
    // Array of ChatMessage objects
  ]
}
```

### ChatMessage Response Object
```json
{
  "id": "uuid-string",
  "conversation_id": "conversation-identifier",
  "sender_type": "user|ai",
  "content": "message content",
  "timestamp": "ISO datetime",
  "status": "sent|delivered|read|error",
  "message_type": "text|confirmation|error|system"
}
```

## Database Schema (SQLModel)

```python
# Conversation model
class Conversation(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str
    title: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = Field(default="active")  # active, closed, archived

# ChatMessage model
class ChatMessage(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    conversation_id: str = Field(foreign_key="conversation.id")
    sender_type: str  # user, ai
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: str = Field(default="sent")  # sent, delivered, read, error
    message_type: str = Field(default="text")  # text, confirmation, error, system
```