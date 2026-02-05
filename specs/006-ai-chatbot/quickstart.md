# Quickstart Guide: Todo AI Chatbot Implementation

## Overview
This guide provides step-by-step instructions for implementing the AI chatbot frontend with OpenAI ChatKit and JWT authentication.

## Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.11+
- Next.js 16+ project with App Router
- Better Auth configured in the application
- Access to Neon Serverless PostgreSQL database

## Step 1: Install Dependencies

### Frontend Dependencies
```bash
npm install @openai/chat-components react-icons
# Or if using yarn
yarn add @openai/chat-components react-icons
```

### Backend Dependencies
```bash
pip install python-jose[cryptography] python-multipart
```

## Step 2: Set Up Backend API Endpoints

### Create Conversation Models
Create `backend/src/models/conversation.py`:
```python
import uuid
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List


class Conversation(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str
    title: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = Field(default="active")  # active, closed, archived

    # Relationship with messages
    messages: List["ChatMessage"] = Relationship(back_populates="conversation")


class ChatMessage(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    conversation_id: str = Field(foreign_key="conversation.id")
    sender_type: str  # user, ai
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: str = Field(default="sent")  # sent, delivered, read, error
    message_type: str = Field(default="text")  # text, confirmation, error, system

    # Relationship with conversation
    conversation: Conversation = Relationship(back_populates="messages")
```

### Create Conversation Service
Create `backend/src/services/conversation_service.py`:
```python
from typing import List, Optional
from sqlmodel import Session, select
from ..models.conversation import Conversation, ChatMessage
from datetime import datetime


class ConversationService:
    def create_conversation(self, user_id: str, db_session: Session) -> Conversation:
        conversation = Conversation(user_id=user_id)
        db_session.add(conversation)
        db_session.commit()
        db_session.refresh(conversation)
        return conversation

    def get_conversation(self, conversation_id: str, user_id: str, db_session: Session) -> Optional[Conversation]:
        statement = select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id
        )
        return db_session.exec(statement).first()

    def get_user_conversations(self, user_id: str, limit: int, offset: int, db_session: Session) -> tuple[List[Conversation], int]:
        # Get conversations with limit and offset
        statement = select(Conversation).where(Conversation.user_id == user_id).order_by(Conversation.updated_at.desc()).offset(offset).limit(limit)
        conversations = db_session.exec(statement).all()

        # Get total count
        count_statement = select(Conversation).where(Conversation.user_id == user_id)
        total_count = len(db_session.exec(count_statement).all())

        return conversations, total_count

    def add_message(self, conversation_id: str, sender_type: str, content: str, db_session: Session) -> ChatMessage:
        message = ChatMessage(
            conversation_id=conversation_id,
            sender_type=sender_type,
            content=content
        )
        db_session.add(message)
        # Update conversation timestamp
        conversation = self.get_conversation(conversation_id, message.conversation.user_id, db_session)
        if conversation:
            conversation.updated_at = datetime.utcnow()
            db_session.add(conversation)
        db_session.commit()
        db_session.refresh(message)
        return message

    def get_conversation_messages(self, conversation_id: str, user_id: str, db_session: Session) -> Optional[List[ChatMessage]]:
        # Verify user has access to this conversation
        conversation = self.get_conversation(conversation_id, user_id, db_session)
        if not conversation:
            return None

        statement = select(ChatMessage).where(
            ChatMessage.conversation_id == conversation_id
        ).order_by(ChatMessage.timestamp.asc())
        return db_session.exec(statement).all()
```

### Create Conversation API Routes
Create `backend/src/api/conversation_api.py`:
```python
from fastapi import APIRouter, Depends, HTTPException, Path
from sqlmodel import Session
from typing import Optional
from ..database import get_session
from ..middleware.auth_middleware import get_current_user
from ..services.conversation_service import ConversationService
from ..models.conversation import Conversation, ChatMessage
from pydantic import BaseModel
from datetime import datetime


router = APIRouter(prefix="/api", tags=["chat"])

class SendMessageRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class SendMessageResponse(BaseModel):
    conversation_id: str
    message: str
    ai_response: str
    timestamp: datetime
    todo_action_result: Optional[dict] = None

class GetConversationResponse(BaseModel):
    conversation: Conversation

class GetConversationsResponse(BaseModel):
    conversations: list[Conversation]
    total_count: int
    has_more: bool


@router.post("/{user_id}/chat", response_model=SendMessageResponse)
async def send_message(
    user_id: str,
    request: SendMessageRequest,
    current_user: dict = Depends(get_current_user),
    db_session: Session = Depends(get_session)
):
    # Verify user ID matches authenticated user
    if current_user["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    service = ConversationService()

    # Get or create conversation
    if request.conversation_id:
        conversation = service.get_conversation(request.conversation_id, user_id, db_session)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conversation = service.create_conversation(user_id, db_session)

    # Add user message to conversation
    user_message = service.add_message(conversation.id, "user", request.message, db_session)

    # Process with AI and get response
    # This is a simplified example - in reality, you'd call your AI service
    ai_response_text = f"I received your message: '{request.message}'. This is a placeholder response from the AI."

    # Add AI response to conversation
    ai_message = service.add_message(conversation.id, "ai", ai_response_text, db_session)

    # In a real implementation, you would process the natural language and perform todo operations
    todo_action_result = {"action": "none", "message": "AI processing not fully implemented in this example"}

    return SendMessageResponse(
        conversation_id=conversation.id,
        message=request.message,
        ai_response=ai_response_text,
        timestamp=datetime.utcnow(),
        todo_action_result=todo_action_result
    )


@router.get("/{user_id}/chat/{conversation_id}", response_model=GetConversationResponse)
async def get_conversation(
    user_id: str,
    conversation_id: str,
    current_user: dict = Depends(get_current_user),
    db_session: Session = Depends(get_session)
):
    # Verify user ID matches authenticated user
    if current_user["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    service = ConversationService()
    conversation = service.get_conversation(conversation_id, user_id, db_session)

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return GetConversationResponse(conversation=conversation)


@router.get("/{user_id}/chat")
async def get_user_conversations(
    user_id: str,
    limit: int = 10,
    offset: int = 0,
    current_user: dict = Depends(get_current_user),
    db_session: Session = Depends(get_session)
):
    # Verify user ID matches authenticated user
    if current_user["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    service = ConversationService()
    conversations, total_count = service.get_user_conversations(user_id, limit, offset, db_session)

    has_more = (offset + limit) < total_count

    return GetConversationsResponse(
        conversations=conversations,
        total_count=total_count,
        has_more=has_more
    )
```

### Register the API routes in main.py
In `backend/src/main.py`, add the router:
```python
from .api.conversation_api import router as conversation_router

# After other routes are registered
app.include_router(conversation_router)
```

## Step 3: Create Frontend Chat Component

### Create Chat Service
Create `frontend/src/services/chat-service.ts`:
```typescript
import { getToken } from "@/utils/auth";

export interface SendMessageRequest {
  message: string;
  conversation_id?: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_type: 'user' | 'ai';
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'error';
  message_type: 'text' | 'confirmation' | 'error' | 'system';
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'closed' | 'archived';
  messages: ChatMessage[];
}

export interface SendMessageResponse {
  conversation_id: string;
  message: string;
  ai_response: string;
  timestamp: string;
  todo_action_result?: {
    action: string;
    todo_id?: string;
    todo_title?: string;
  };
}

class ChatService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  }

  async sendMessage(userId: string, request: SendMessageRequest): Promise<SendMessageResponse> {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch(`${this.baseUrl}/api/${userId}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getConversation(userId: string, conversationId: string): Promise<Conversation> {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch(`${this.baseUrl}/api/${userId}/chat/${conversationId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getUserConversations(userId: string, limit: number = 10, offset: number = 0): Promise<{
    conversations: Conversation[];
    total_count: number;
    has_more: boolean;
  }> {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch(
      `${this.baseUrl}/api/${userId}/chat?limit=${limit}&offset=${offset}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export const chatService = new ChatService();
```

### Create Chat Component
Create `frontend/src/components/ai-todo-interface/chat-component.tsx`:
```tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { chatService, SendMessageRequest, Conversation, ChatMessage } from '@/services/chat-service';
import { Send, RotateCcw } from 'react-icons/all';

interface ChatComponentProps {
  conversationId?: string;
  onConversationChange?: (id: string) => void;
}

export default function ChatComponent({ conversationId: propConversationId, onConversationChange }: ChatComponentProps) {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(propConversationId);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversation if we have an ID
  useEffect(() => {
    if (propConversationId && user?.id) {
      loadConversation(propConversationId);
    } else if (user?.id && !propConversationId) {
      // Start a new conversation
      setMessages([]);
      setCurrentConversationId(undefined);
    }
  }, [propConversationId, user?.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversation = async (id: string) => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await chatService.getConversation(user.id, id);
      setMessages(response.messages);
      setCurrentConversationId(id);
      onConversationChange?.(id);
    } catch (err) {
      console.error('Error loading conversation:', err);
      setError('Failed to load conversation history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || !user?.id) return;

    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: currentConversationId || '',
      sender_type: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
      status: 'sent',
      message_type: 'text'
    };

    // Add user message optimistically
    setMessages(prev => [...prev, userMessage]);
    const userInput = inputValue;
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const request: SendMessageRequest = {
        message: userInput,
        conversation_id: currentConversationId
      };

      const response = await chatService.sendMessage(user.id, request);

      // Update conversation ID if it's new
      if (!currentConversationId) {
        setCurrentConversationId(response.conversation_id);
        onConversationChange?.(response.conversation_id);
      }

      // Add AI response
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        conversation_id: response.conversation_id,
        sender_type: 'ai',
        content: response.ai_response,
        timestamp: response.timestamp,
        status: 'delivered',
        message_type: 'text'
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');

      // Remove the optimistic user message
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (error) {
      setError(null);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Please sign in to use the chat interface</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gray-100 px-4 py-3 border-b">
        <h2 className="text-lg font-semibold text-gray-800">Todo AI Assistant</h2>
        {currentConversationId && (
          <p className="text-sm text-gray-600">Conversation: {currentConversationId.substring(0, 8)}...</p>
        )}
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
            <span className="mr-2">{error}</span>
            <button
              onClick={handleRetry}
              className="ml-2 text-red-700 hover:text-red-900 underline"
            >
              Retry
            </button>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <p className="mb-4">Start a conversation with the AI assistant</p>
            <p className="text-sm">Try asking:</p>
            <ul className="mt-2 text-sm text-left list-disc pl-5 space-y-1">
              <li>"Add a todo to buy groceries"</li>
              <li>"Show me my tasks"</li>
              <li>"Mark my shopping task as complete"</li>
            </ul>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.sender_type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div className={`text-xs mt-1 ${message.sender_type === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 rounded-lg px-4 py-2 max-w-[80%]">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="border-t bg-white p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message here..."
            disabled={isLoading}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            aria-label="Type your message"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="bg-blue-500 text-white rounded-lg px-4 py-2 flex items-center justify-center hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Ask the AI to help manage your todos using natural language
        </p>
      </form>
    </div>
  );
}
```

## Step 4: Create Chat Page

Create `frontend/src/app/chat/page.tsx`:
```tsx
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import ChatComponent from '@/components/ai-todo-interface/chat-component';
import { useRouter } from 'next/navigation';

export default function ChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    router.push('/login'); // Redirect to login if not authenticated
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Todo Assistant</h1>
        <p className="text-gray-600">
          Chat naturally to manage your todos. Ask to add, update, or view your tasks.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden" style={{ height: '60vh' }}>
        <ChatComponent
          conversationId={conversationId}
          onConversationChange={setConversationId}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Examples</h3>
          <ul className="space-y-1">
            <li>• "Add a task to buy groceries"</li>
            <li>• "Show me my tasks"</li>
            <li>• "Mark the shopping task as complete"</li>
          </ul>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Tips</h3>
          <ul className="space-y-1">
            <li>• Be specific with your requests</li>
            <li>• You can ask to modify existing tasks</li>
            <li>• The conversation history persists after refresh</li>
          </ul>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Privacy</h3>
          <p>Your conversations are securely stored and accessible only to you.</p>
        </div>
      </div>
    </div>
  );
}
```

## Step 5: Update Main Layout

Add the chat route to your main layout in `frontend/src/app/layout.tsx` (if needed):
```tsx
// Import and add navigation to the chat page
// Make sure your navigation includes a link to /chat if appropriate
```

## Step 6: Environment Variables

Add the following to your `.env.local` in the frontend directory:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Step 7: Run the Application

1. Start the backend server:
```bash
cd backend
python -m src.main
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

The chat interface will be available at `http://localhost:3000/chat` (or your configured path).

## Testing the Implementation

1. Navigate to the chat page
2. Verify that the chat interface loads properly
3. Send a test message and confirm:
   - Message appears in the UI immediately
   - Loading indicator shows while waiting for response
   - AI response appears in the chat
   - Conversation ID is maintained
4. Refresh the page and verify conversation history persists
5. Test error handling by disconnecting from the network temporarily
6. Verify authentication requirements by logging out and trying to access the chat