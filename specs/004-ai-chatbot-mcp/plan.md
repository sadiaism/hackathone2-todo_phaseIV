# Implementation Plan: Todo AI Chatbot — Spec 4 (MCP Server, Agent Tooling & Frontend Integration)

**Branch**: `004-ai-chatbot-mcp` | **Date**: 2026-02-02 | **Spec**: [specs/004-ai-chatbot-mcp/spec.md](specs/004-ai-chatbot-mcp/spec.md)
**Input**: Feature specification from `/specs/004-ai-chatbot-mcp/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implementation of an AI-powered todo management system using MCP (Model Context Protocol) server and OpenAI Agents SDK. The system will expose todo operations as stateless MCP tools that the AI agent can use to manage user tasks based on natural language commands. The backend will provide a service layer for agent execution with proper authentication and user scoping, while the frontend will render responses appropriately.

## Technical Context

**Language/Version**: Python 3.11, TypeScript/JavaScript for frontend
**Primary Dependencies**: FastAPI, OpenAI Agents SDK, Official MCP SDK, SQLModel, Neon PostgreSQL, Better Auth
**Storage**: Neon Serverless PostgreSQL with SQLModel ORM
**Testing**: pytest for backend, Jest/Vitest for frontend
**Target Platform**: Web application with Next.js frontend and Python FastAPI backend
**Project Type**: Web application (frontend + backend)
**Performance Goals**: <5 second response time for 95% of AI agent operations, 90% accuracy in tool selection
**Constraints**: MCP tools must be stateless, no direct database access by AI agent, user data isolation required
**Scale/Scope**: Multi-user system supporting authenticated operations with proper data scoping

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

1. **Agentic-first design**: All AI actions must be executed exclusively through MCP tools - COMPLIANT
2. **Stateless server architecture**: Backend must remain stateless across requests, MCP tools must be stateless - COMPLIANT
3. **Safety and correctness**: MCP tools must validate inputs and prevent unsafe operations - COMPLIANT
4. **Security-first architecture**: JWT-based verification required, user data isolation mandatory - COMPLIANT
5. **User data isolation**: Each user can only view/modify their own tasks, backend enforces user ownership - COMPLIANT
6. **MCP Tool Standards**: Tools must be stateless, persist changes to DB, validate inputs, enforce security - COMPLIANT
7. **AI Operation Constraints**: Natural language commands map deterministically to tools, operations authenticated - COMPLIANT
8. **Development Workflow**: All operations scoped to authenticated user, MCP tools persist changes to database - COMPLIANT

## Project Structure

### Documentation (this feature)

```text
specs/004-ai-chatbot-mcp/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── mcp_server/
│   │   ├── __init__.py
│   │   ├── server.py                 # MCP server initialization
│   │   └── tools/
│   │       ├── __init__.py
│   │       ├── task_tools.py         # MCP tools for task operations
│   │       └── validators.py         # Input validation for tools
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── todo_agent.py            # OpenAI Agent configuration
│   │   └── executor.py              # Agent execution service
│   ├── api/
│   │   ├── __init__.py
│   │   ├── agent_endpoints.py       # Endpoints for agent execution
│   │   └── dependencies.py          # Auth dependencies for agent endpoints
│   ├── models/
│   │   ├── __init__.py
│   │   └── task.py                  # Task model extending from existing models
│   ├── services/
│   │   ├── __init__.py
│   │   ├── task_service.py          # Business logic for task operations
│   │   └── auth_service.py          # Authentication service integration
│   └── config/
│       ├── __init__.py
│       └── settings.py              # Configuration for MCP and agent
└── tests/
    ├── unit/
    │   ├── mcp_server/
    │   ├── agents/
    │   └── services/
    ├── integration/
    │   ├── agent_integration_test.py
    │   └── mcp_integration_test.py
    └── contract/
        └── mcp_tool_contract_test.py

frontend/
├── src/
│   ├── components/
│   │   ├── ai-todo-interface/
│   │   │   ├── AICommandInput.tsx    # Component for natural language input
│   │   │   ├── AITaskDisplay.tsx     # Component for AI response rendering
│   │   │   └── AITaskManager.tsx     # Main component orchestrating AI interactions
│   │   └── ...
│   ├── services/
│   │   ├── ai-agent-service.ts      # Service to communicate with AI agent backend
│   │   └── ...
│   └── utils/
│       └── ...
└── tests/
    ├── unit/
    └── integration/
```

**Structure Decision**: Selected web application structure with separate backend and frontend. Backend implements MCP server and AI agent functionality, while frontend provides interface for natural language commands and response rendering. This maintains clear separation of concerns as required by the constitution.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Multiple service layers | MCP server, AI agent, and API endpoints needed for proper separation | Direct AI-to-database access would violate stateless architecture and security requirements |