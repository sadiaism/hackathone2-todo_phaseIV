---
id: 1
title: Update Project Constitution
stage: constitution
date: 2026-01-08
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: main
user: user
command: sp.constitution
labels: ["constitution", "governance", "setup"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
tests:
---

## Prompt

```
Project: Todo Full-Stack Web Application (Phase-2 Hackathon)

Core principles:
- Spec-driven development (all features derived strictly from specs)
- Security-first architecture (authentication and authorization enforced by design)
- User data isolation (no cross-user data leakage)
- Reliability and correctness (API behavior predictable and testable)
- Modern full-stack best practices (frontend, backend, database separation)

Key standards:
- All features must map directly to written specs (no undocumented behavior)
- REST API must follow standard HTTP semantics (status codes, methods)
- Authentication must use JWT-based verification (Better Auth + shared secret)
- Backend must enforce user ownership at every data operation
- Database operations must use ORM (SQLModel) with schema consistency
- Frontend must consume API only through authenticated requests
- No hardcoded secrets (all secrets via environment variables)

Constraints:
- Frontend: Next.js 16+ using App Router
- Backend: Python FastAPI
- ORM: SQLModel
- Database: Neon Serverless PostgreSQL
- Authentication: Better Auth with JWT
- Architecture: Frontend and backend as separate services
- Storage: Persistent database only (no in-memory task storage)
- Multi-user system required (single-user assumptions forbidden)

Success criteria:
- All REST endpoints function according to spec
- JWT authentication enforced on every protected route
- Each user can only view and modify their own tasks
- CRUD operations work reliably with persistent storage
- Unauthorized requests return proper 401 responses
- Application runs end-to-end without security or data isolation flaws
- System is ready for further iteration via additional specs
```

## Response snapshot

Updated the constitution file with the project-specific principles and constraints for the Todo Full-Stack Web Application. The constitution now includes:

1. Core Principles:
   - Spec-driven development
   - Security-first architecture
   - User data isolation
   - Reliability and correctness
   - Modern full-stack best practices
   - Authentication with JWT

2. Technology Stack Constraints
3. Development Workflow requirements
4. Governance section

The constitution enforces the required technology stack (Next.js, FastAPI, SQLModel, Neon PostgreSQL, Better Auth) and mandates security-first practices with JWT authentication and user data isolation.

## Outcome

- ✅ Impact: Created foundational governance document for the project
- 🧪 Tests: N/A
- 📁 Files: Updated .specify/memory/constitution.md
- 🔁 Next prompts: Proceed with spec creation using /sp.specify
- 🧠 Reflection: Constitution now properly defines project constraints and principles

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Create feature specification