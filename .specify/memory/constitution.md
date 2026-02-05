<!-- SYNC IMPACT REPORT
Version change: 1.0.0 → 2.0.0
Modified principles:
- Spec-driven development → Spec-driven development (expanded)
- Added new principles: Agentic-first design, Stateless server architecture, Safety and correctness in AI actions
- Technology stack updated to reflect AI-native system
- Added new sections: MCP Tool Standards, AI Operation Constraints, Conversation State Management
Removed sections: None
Added sections: Agentic-first design, MCP Tool Standards, AI Operation Constraints, Conversation State Management
Templates requiring updates:
  - .specify/templates/plan-template.md ⚠ pending
  - .specify/templates/spec-template.md ⚠ pending
  - .specify/templates/tasks-template.md ⚠ pending
  - .specify/templates/commands/sp.constitution.md ⚠ pending
Follow-up TODOs: None
-->

# Todo Full-Stack Web Application Constitution - AI-Native Conversational System

## Core Principles

### Spec-driven development
All features must be derived strictly from written specifications; No undocumented behavior allowed; Every implementation must map directly to a spec requirement; All AI behaviors must be defined before implementation

### Agentic-first design
AI agents operate the system via tools, not hardcoded logic; All AI actions must be executed exclusively through MCP tools; Deterministic mapping of natural language commands to defined tools; AI-driven actions must follow predefined tool interfaces

### Stateless server architecture with persistent memory
Backend must remain stateless across requests; Conversation state must be reconstructed from stored messages on every request; MCP tools must be stateless and persist all changes to the database; AI agents must not directly access the database

### Safety and correctness in AI-driven actions
Authentication and user isolation must be enforced on all AI operations; MCP tools must validate inputs and prevent unsafe operations; All AI operations must be auditable and traceable; Error handling must be robust for AI-generated requests

### Security-first architecture
Authentication and authorization must be enforced by design; JWT-based verification required; User data isolation is mandatory; Security considerations must be addressed at every layer; AI operations must respect user boundaries

### User data isolation
Each user can only view and modify their own tasks; No cross-user data leakage permitted; Backend must enforce user ownership at every data operation; Multi-user system required with no single-user assumptions; AI agents must respect user identity in all operations

### Reliability and correctness
API behavior must be predictable and testable; REST endpoints must follow standard HTTP semantics; Proper status codes and error handling required; All CRUD operations must work reliably with persistent storage; AI operations must have deterministic outcomes

### Modern full-stack best practices
Frontend and backend must be properly separated; Next.js 16+ with App Router for frontend; Python FastAPI for backend; SQLModel ORM for database operations; Neon Serverless PostgreSQL for storage; OpenAI ChatKit for conversational UI

## MCP Tool Standards
- All AI actions must be executed exclusively through MCP tools
- MCP tools must be stateless and persist all changes to the database
- AI agents must not directly access the database
- MCP tools must provide clear interfaces for AI operations
- MCP tools must validate all inputs and enforce security constraints

## AI Operation Constraints
- AI Framework: OpenAI Agents SDK
- Natural language commands must map deterministically to defined tools
- AI agents must follow defined workflows without improvisation
- All AI operations must be authenticated and authorized
- AI operations must respect user isolation and data privacy

## Conversation State Management
- Conversation state must be reconstructed from stored messages on every request
- Backend must remain stateless across requests
- Message history must be persisted in database
- Conversation context must be maintained through session identifiers
- AI agents must work with reconstructed conversation state only

## Technology Stack Constraints
- Frontend: OpenAI ChatKit
- Backend: Python FastAPI
- AI Framework: OpenAI Agents SDK
- ORM: SQLModel
- Database: Neon Serverless PostgreSQL
- Authentication: Better Auth with JWT
- Architecture: Frontend and backend as separate services
- Storage: Persistent database only (no in-memory task storage)
- Multi-user system required (single-user assumptions forbidden)
- MCP tools for AI operations

## Development Workflow
- All features must map directly to written specs (no undocumented behavior)
- REST API must follow standard HTTP semantics (status codes, methods)
- Backend must enforce user ownership at every data operation
- Database operations must use ORM (SQLModel) with schema consistency
- Frontend must consume API only through authenticated requests
- No hardcoded secrets (all secrets via environment variables)
- Unauthorized requests must return proper 401 responses
- MCP tools must be stateless and persist changes to database
- AI operations must be validated through tools, not direct access

## Governance
This constitution supersedes all other development practices; All implementations must comply with these principles; Amendments require proper documentation and approval; Every pull request must verify constitution compliance; AI operations must adhere to defined tool interfaces

**Version**: 2.0.0 | **Ratified**: 2026-01-08 | **Last Amended**: 2026-02-02
