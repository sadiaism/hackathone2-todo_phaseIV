---
id: 1
title: Update Constitution AI Native
stage: constitution
date_iso: 2026-02-02
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: main
user: user
command: /sp.constitution
labels:
  - constitution
  - ai-native
  - update
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests: []
---

# Prompt

```text
/sp.constitution

Project: Todo Full-Stack Web Application — Phase III (AI-Native Conversational System)

Core principles:
- Agentic-first design (AI agents operate the system via tools, not hardcoded logic)
- Stateless server architecture with persistent memory
- Clear separation of concerns (UI, agent logic, tools, data)
- Safety and correctness in AI-driven actions
- Spec-driven development (all behavior defined before implementation)

Key standards:
- All AI actions must be executed exclusively through MCP tools
- MCP tools must be stateless and persist all changes to the database
- AI agents must not directly access the database
- Conversation state must be reconstructed from stored messages on every request
- Backend must remain stateless across requests
- Authentication and user isolation must be enforced on all AI operations
- Natural language commands must map deterministically to defined tools

Constraints:
- Frontend: OpenAI ChatKit
- Backend: Python FastAPI
- AI Framework: OpenAI Agents SDK
- MC
```

# Response

The constitution file at `.specify/memory/constitution.md` has been updated from version 1.0.0 to 2.0.0 to incorporate the AI-Native Conversational System principles. The key changes include:

## Major Updates:
1. **Version Bump**: From 1.0.0 to 2.0.0 (MAJOR version increment due to addition of AI-specific principles)
2. **New Core Principles Added**:
   - Agentic-first design
   - Stateless server architecture with persistent memory
   - Safety and correctness in AI-driven actions

3. **New Sections Added**:
   - MCP Tool Standards
   - AI Operation Constraints
   - Conversation State Management

4. **Technology Stack Updated**:
   - Frontend: Changed to OpenAI ChatKit
   - Added AI Framework: OpenAI Agents SDK
   - Enhanced with MCP tools for AI operations

5. **Workflow Updates**:
   - Added MCP tool requirements
   - Enhanced AI operation validation requirements

## Sync Impact Report:
- Version change: 1.0.0 → 2.0.0
- Added new principles: Agentic-first design, Stateless server architecture, Safety and correctness in AI actions
- Added new sections: MCP Tool Standards, AI Operation Constraints, Conversation State Management
- Templates requiring updates: .specify/templates/plan-template.md, .specify/templates/spec-template.md, .specify/templates/tasks-template.md, .specify/templates/commands/sp.constitution.md

The constitution now properly reflects the AI-Native Conversational System architecture while maintaining all previous requirements for the Todo Full-Stack Web Application.