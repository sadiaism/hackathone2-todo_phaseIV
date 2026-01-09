# Todo Full-Stack Web Application Constitution

## Core Principles

### Spec-driven development
All features must be derived strictly from written specifications; No undocumented behavior allowed; Every implementation must map directly to a spec requirement

### Security-first architecture
Authentication and authorization must be enforced by design; JWT-based verification required; User data isolation is mandatory; Security considerations must be addressed at every layer

### User data isolation
Each user can only view and modify their own tasks; No cross-user data leakage permitted; Backend must enforce user ownership at every data operation; Multi-user system required with no single-user assumptions

### Reliability and correctness
API behavior must be predictable and testable; REST endpoints must follow standard HTTP semantics; Proper status codes and error handling required; All CRUD operations must work reliably with persistent storage

### Modern full-stack best practices
Frontend and backend must be properly separated; Next.js 16+ with App Router for frontend; Python FastAPI for backend; SQLModel ORM for database operations; Neon Serverless PostgreSQL for storage

### Authentication with JWT
Better Auth must be configured to issue JWT tokens; Frontend must include JWT in Authorization header for all API calls; Backend middleware must extract and verify JWT tokens; Authentication must be enforced on every protected route


## Technology Stack Constraints
- Frontend: Next.js 16+ using App Router
- Backend: Python FastAPI
- ORM: SQLModel
- Database: Neon Serverless PostgreSQL
- Authentication: Better Auth with JWT
- Architecture: Frontend and backend as separate services
- Storage: Persistent database only (no in-memory task storage)
- Multi-user system required (single-user assumptions forbidden)

## Development Workflow
- All features must map directly to written specs (no undocumented behavior)
- REST API must follow standard HTTP semantics (status codes, methods)
- Backend must enforce user ownership at every data operation
- Database operations must use ORM (SQLModel) with schema consistency
- Frontend must consume API only through authenticated requests
- No hardcoded secrets (all secrets via environment variables)
- Unauthorized requests must return proper 401 responses

## Governance
This constitution supersedes all other development practices; All implementations must comply with these principles; Amendments require proper documentation and approval; Every pull request must verify constitution compliance

**Version**: 1.0.0 | **Ratified**: 2026-01-08 | **Last Amended**: 2026-01-08
