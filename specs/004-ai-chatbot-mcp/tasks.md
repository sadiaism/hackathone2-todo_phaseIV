# Tasks: Todo AI Chatbot — MCP Server, Agent Tooling & Frontend Integration

**Feature**: 004-ai-chatbot-mcp
**Date**: 2026-02-02
**Spec**: [specs/004-ai-chatbot-mcp/spec.md](specs/004-ai-chatbot-mcp/spec.md)
**Plan**: [specs/004-ai-chatbot-mcp/plan.md](specs/004-ai-chatbot-mcp/plan.md)

## Phase 1: Setup

- [X] T001 Create backend directory structure for MCP server and agent components
- [X] T002 Install Official MCP SDK and OpenAI Agents SDK dependencies in backend
- [X] T003 Set up frontend directory structure for AI components
- [ ] T004 Install necessary frontend dependencies for AI agent integration

## Phase 2: Foundational

- [X] T005 [P] Create extended Todo model with AI-specific fields in backend/models/task.py
- [X] T006 [P] Create AI Agent Interaction Log model in backend/models/ai_log.py
- [X] T007 [P] Create User Session Context model in backend/models/session.py
- [ ] T008 [P] Set up database migration for new models in backend/database.py
- [X] T009 [P] Create TaskService in backend/services/task_service.py
- [X] T010 [P] Create AuthService in backend/services/auth_service.py
- [X] T011 [P] Create AILogService in backend/services/ai_log_service.py
- [X] T012 [P] Create configuration settings for MCP and agent in backend/config/settings.py

## Phase 3: User Story 1 - AI-Powered Todo Management (Priority: P1)

**Goal**: Enable AI agents to manage todos via MCP tools by interpreting natural language commands and executing appropriate todo operations.

**Independent Test**: The system can accept natural language input, the AI agent correctly selects the appropriate MCP tool, the tool executes the operation, and the changes are persisted to the database.

- [X] T013 [P] [US1] Create MCP server initialization in backend/mcp_server/server.py
- [X] T014 [P] [US1] Implement add_task MCP tool in backend/mcp_server/tools/task_tools.py
- [X] T015 [P] [US1] Implement list_tasks MCP tool in backend/mcp_server/tools/task_tools.py
- [X] T016 [P] [US1] Implement update_task MCP tool in backend/mcp_server/tools/task_tools.py
- [X] T017 [P] [US1] Implement complete_task MCP tool in backend/mcp_server/tools/task_tools.py
- [X] T018 [P] [US1] Implement delete_task MCP tool in backend/mcp_server/tools/task_tools.py
- [X] T019 [US1] Create input validators for MCP tools in backend/mcp_server/tools/validators.py
- [X] T020 [P] [US1] Configure OpenAI Agent with MCP tool registry in backend/agents/todo_agent.py
- [X] T021 [US1] Create agent execution service in backend/agents/executor.py
- [X] T022 [US1] Create basic agent endpoints in backend/api/agent_endpoints.py
- [X] T023 [US1] Add authentication dependencies for agent endpoints in backend/api/dependencies.py
- [ ] T024 [US1] Test basic AI command execution with add_task tool

## Phase 4: User Story 2 - Frontend Integration with AI Backend (Priority: P2)

**Goal**: Integrate frontend UI with AI-powered backend to send user commands to the AI agent, receive responses, and render them appropriately in the UI.

**Independent Test**: The frontend can send requests to the AI backend, receive responses, and display them properly.

- [X] T025 [P] [US2] Create AI agent service in frontend/src/services/ai-agent-service.ts
- [X] T026 [P] [US2] Create AICommandInput component in frontend/src/components/ai-todo-interface/AICommandInput.tsx
- [X] T027 [P] [US2] Create AITaskDisplay component in frontend/src/components/ai-todo-interface/AITaskDisplay.tsx
- [X] T028 [US2] Create AITaskManager component in frontend/src/components/ai-todo-interface/AITaskManager.tsx
- [ ] T029 [US2] Connect frontend AI components to backend agent API
- [ ] T030 [US2] Implement response rendering in frontend UI components
- [ ] T031 [US2] Test frontend-backend AI integration

## Phase 5: User Story 3 - Authenticated Operations via AI Agent (Priority: P3)

**Goal**: Ensure all AI agent operations are properly authenticated and scoped to the authenticated user's data.

**Independent Test**: User authentication is verified, AI agent operations are scoped to the authenticated user, and cross-user data leakage is prevented.

- [X] T032 [P] [US3] Enhance authentication middleware to work with AI agent requests in backend/middleware/auth.py
- [X] T033 [P] [US3] Implement user_id scoping validation in backend/mcp_server/tools/validators.py
- [X] T034 [US3] Add user authentication checks to all MCP tools in backend/mcp_server/tools/task_tools.py
- [X] T035 [US3] Update agent execution service to enforce user scoping in backend/agents/executor.py
- [X] T036 [US3] Add JWT token validation to agent endpoints in backend/api/agent_endpoints.py
- [X] T037 [US3] Implement audit logging for AI agent interactions in backend/services/ai_log_service.py
- [ ] T038 [US3] Test authenticated AI operations with proper user scoping
- [ ] T039 [US3] Verify no cross-user data access occurs

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T040 Add rate limiting to AI agent endpoints in backend/api/agent_endpoints.py
- [X] T041 Add comprehensive error handling for all MCP tools in backend/mcp_server/tools/task_tools.py
- [ ] T042 Add request/response logging for debugging in backend/main.py
- [X] T043 Create unit tests for MCP tools in backend/tests/unit/mcp_server/test_task_tools.py
- [X] T044 Create integration tests for agent functionality in backend/tests/integration/agent_integration_test.py
- [X] T045 Create contract tests for MCP tools in backend/tests/contract/mcp_tool_contract_test.py
- [X] T046 Add frontend error handling and user feedback in frontend/src/components/ai-todo-interface/AITaskManager.tsx
- [X] T047 Update documentation with usage examples in specs/004-ai-chatbot-mcp/quickstart.md

## Dependencies

User Story Completion Order:
1. User Story 1 (P1) - AI-Powered Todo Management - Must be completed first as it contains core functionality
2. User Story 2 (P2) - Frontend Integration - Depends on User Story 1 backend services
3. User Story 3 (P3) - Authenticated Operations - Can be developed in parallel with other stories but requires final integration testing

## Parallel Execution Examples

Per User Story:
- **US1**: T014-T018 (all MCP tools) can be developed in parallel
- **US2**: T026-T028 (all frontend components) can be developed in parallel
- **US3**: T032-T034 (authentication enhancements) can be developed in parallel

## Implementation Strategy

**MVP First**: Implement User Story 1 (core AI-powered todo management) as the minimum viable product with basic add_task and list_tasks functionality.

**Incremental Delivery**:
1. Phase 1-3: Core AI agent functionality with basic CRUD operations
2. Phase 4: Frontend integration
3. Phase 5: Authentication and security hardening
4. Phase 6: Polish and comprehensive testing