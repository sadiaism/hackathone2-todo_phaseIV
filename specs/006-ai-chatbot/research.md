# Research: Todo AI Chatbot — ChatKit Frontend UI

## Overview
This research document outlines the technical investigation for implementing the AI chatbot frontend using OpenAI ChatKit with JWT authentication integration.

## Decision: OpenAI ChatKit Integration
**Rationale**: OpenAI ChatKit provides a pre-built, well-tested chat interface that aligns with the requirement to avoid custom chat UI components. It offers conversation history management, loading states, and error handling out-of-the-box.

**Alternatives considered**:
- Building custom chat UI components: Would violate the constraint of not building custom chat UI components outside ChatKit
- Using other chat libraries (React Chat Elements, ChatUI): Would not leverage OpenAI's ecosystem and might not integrate as well with potential future AI services

## Decision: JWT Authentication Strategy
**Rationale**: JWT tokens from Better Auth will be attached to all chat API requests to ensure secure communication. This aligns with the requirement for JWT-based authentication and user data isolation.

**Implementation approach**:
- Intercept ChatKit's API calls to inject Authorization header
- Use Next.js middleware to validate JWT tokens before forwarding to backend
- Implement token refresh mechanism for seamless user experience

**Alternatives considered**:
- Session cookies: Would not align with JWT-based requirement
- API keys: Would not provide user-specific authentication

## Decision: Conversation State Management
**Rationale**: Conversation history will be managed using a combination of client-side state (for immediate UI updates) and server-side persistence (for data integrity and cross-session continuity).

**Implementation approach**:
- Store conversation_id in localStorage to maintain session across page refreshes
- Fetch conversation history from backend API on component mount
- Update UI in real-time as messages are exchanged

**Alternatives considered**:
- Full client-side storage: Would not persist across devices/browsers
- Server-only storage: Would cause latency issues for UI updates

## Decision: Backend API Endpoint Design
**Rationale**: Create a dedicated `/api/{user_id}/chat` endpoint that handles JWT authentication and routes chat requests to appropriate services.

**Endpoint structure**:
- POST `/api/{user_id}/chat`: Send a new message and receive AI response
- GET `/api/{user_id}/chat/{conversation_id}`: Retrieve conversation history

**Alternatives considered**:
- Generic message endpoint: Would not provide user-specific routing
- WebSocket connections: Would violate constraint of not building streaming responses

## Decision: Error Handling Strategy
**Rationale**: Implement comprehensive error handling for network failures, authentication issues, and AI processing errors to provide graceful user experience.

**Implementation approach**:
- Network error handling with retry mechanisms
- Authentication failure detection and re-authentication prompts
- AI processing error messages with fallback options
- Loading state management during API calls

## Technology Best Practices Researched

### OpenAI ChatKit Integration
- Proper initialization with custom message handlers
- Event subscription for real-time updates
- Error boundary implementation for chat components

### Next.js App Router Patterns
- Client components for interactive chat UI
- Server components for initial data fetching
- Proper state management across navigation

### Better Auth Integration
- Secure token storage and retrieval
- Middleware validation for protected routes
- Automatic token refresh mechanisms

### Type Safety
- Strong typing for chat messages and conversation objects
- API response validation using Zod or similar
- Consistent error type definitions