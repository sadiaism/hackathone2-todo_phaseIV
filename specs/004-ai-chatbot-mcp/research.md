# Research: Todo AI Chatbot — MCP Server, Agent Tooling & Frontend Integration

**Feature**: 004-ai-chatbot-mcp
**Date**: 2026-02-02

## Overview

This research document covers the technical investigation required to implement the AI-powered todo management system using MCP (Model Context Protocol) server and OpenAI Agents SDK. It addresses all technical unknowns identified in the initial planning phase.

## MCP Server Implementation

### Decision: Use Official MCP SDK for Python
**Rationale**: The Official MCP SDK provides standardized protocols for exposing tools to AI agents, ensuring interoperability and following established patterns for model context protocols.

**Alternatives considered**:
- Custom tool protocol: Would create vendor lock-in and reduce interoperability
- Third-party MCP libraries: Less stable and not officially supported

### Decision: Statelessness for MCP Tools
**Rationale**: Maintaining statelessness ensures scalability and reliability as required by the constitution. All state is managed through the database rather than in-memory or session-based storage.

**Alternatives considered**:
- Session-based state: Would violate stateless architecture requirements
- In-memory caching: Would complicate scaling and introduce reliability concerns

## OpenAI Agent Integration

### Decision: Use OpenAI Agents SDK for Intent Recognition
**Rationale**: The OpenAI Agents SDK provides sophisticated natural language understanding and tool selection capabilities, allowing the AI to interpret user intent and select appropriate MCP tools.

**Alternatives considered**:
- Custom NLP models: Higher complexity and maintenance overhead
- Rule-based parsing: Less flexible and unable to handle varied natural language input

### Decision: Tool Registration Pattern
**Rationale**: Registering MCP tools with the AI agent allows dynamic discovery and selection of appropriate tools based on user intent, providing flexibility for future tool additions.

**Alternatives considered**:
- Hardcoded tool selection: Less flexible and requires code changes for new capabilities
- Static tool mapping: Would limit the AI's ability to reason about tool usage

## Database Integration

### Decision: SQLModel ORM with Neon PostgreSQL
**Rationale**: Already established in the existing codebase, providing consistency and leveraging existing infrastructure. SQLModel provides type safety and integration with FastAPI.

**Alternatives considered**:
- Raw SQL queries: Would lose type safety and ORM benefits
- Different ORM: Would require significant refactoring of existing code

### Decision: User Scoping Through Authentication
**Rationale**: Leveraging Better Auth for user identification and scoping all operations to the authenticated user ensures data isolation as required by the constitution.

**Alternatives considered**:
- Client-side user identification: Would be insecure and allow data access violations
- Separate databases per user: Would be overly complex and resource-intensive

## Authentication & Security

### Decision: JWT-Based Authentication for Agent Requests
**Rationale**: Consistent with existing Better Auth implementation and provides secure, stateless authentication for API requests including those from the AI agent.

**Alternatives considered**:
- Session-based authentication: Would violate stateless architecture requirements
- API keys: Would require additional key management infrastructure

### Decision: Input Validation at MCP Tool Level
**Rationale**: Validates inputs at the MCP tool boundary to prevent unsafe operations and ensure data integrity before reaching the database layer.

**Alternatives considered**:
- Validation only at API layer: Would allow invalid data through direct tool usage
- No validation: Would create security vulnerabilities

## Frontend Integration

### Decision: Natural Language Command Interface
**Rationale**: Provides the natural, conversational experience required by the feature specification while maintaining separation from the AI logic.

**Alternatives considered**:
- Structured command interface: Would not provide the natural language experience required
- Direct database operations: Would bypass AI agent functionality

### Decision: Structured Response Rendering
**Rationale**: Ensures AI agent responses are properly formatted and integrated into the existing UI patterns for consistency.

**Alternatives considered**:
- Plain text responses: Would not integrate well with existing UI components
- Custom rendering per response: Would create inconsistent user experience