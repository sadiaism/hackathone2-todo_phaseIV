# Implementation Plan: Todo Full-Stack Web Application – Spec 2 (Authentication & API Security)

**Feature**: Authentication & API Security
**Branch**: `002-auth-api-security`
**Created**: 2026-01-08
**Status**: Draft
**Spec**: [spec.md](./spec.md)

## Technical Context

This implementation plan addresses the authentication and API security requirements for the Todo Full-Stack Web Application. The primary objectives are to:

1. Configure Better Auth on the Next.js frontend to issue JWT tokens on login/signup
2. Set up JWT verification middleware in the FastAPI backend
3. Enforce user ownership on all CRUD operations
4. Ensure proper HTTP 401 responses for unauthorized requests
5. Maintain backward compatibility with the existing database schema

The system architecture involves:
- **Frontend**: Next.js 16+ application using Better Auth for authentication
- **Backend**: Python FastAPI with JWT verification middleware
- **Database**: Neon Serverless PostgreSQL with existing schema from Spec-1
- **Authentication**: JWT tokens issued by Better Auth with shared secret

**Technology Stack**:
- Frontend: Next.js 16+, Better Auth
- Backend: Python 3.10+, FastAPI, PyJWT, python-jose
- Database: Neon Serverless PostgreSQL
- Authentication: JWT with RS256 algorithm

## Constitution Check

### Compliance Assessment

✓ **Security-first architecture**: Plan implements JWT-based verification and enforces user data isolation
✓ **User data isolation**: All CRUD operations will be filtered by authenticated user_id
✓ **Reliability and correctness**: Proper HTTP status codes (401 for unauthorized) will be implemented
✓ **Modern full-stack best practices**: Using Next.js for frontend and FastAPI for backend as required
✓ **Authentication with JWT**: Plan includes JWT token verification middleware as mandated

### Potential Violations

None identified - all implementation approaches align with constitutional principles.

## Phase 0: Research & Discovery

### Completed Research

1. **Better Auth JWT Configuration**: Researched how to configure Better Auth to issue JWT tokens with user information
   - Decision: Use Better Auth's built-in JWT functionality with RS256 algorithm
   - Rationale: Built-in functionality reduces complexity and security risks
   - Reference: [research.md](./research.md) for detailed findings

2. **FastAPI JWT Middleware**: Researched best practices for implementing JWT verification middleware
   - Decision: Create FastAPI dependency for token verification
   - Rationale: Clean separation of concerns and reusable across endpoints
   - Reference: [research.md](./research.md) for detailed findings

3. **Token Security**: Examined secure practices for JWT signing and verification using shared secrets
   - Decision: Use RS256 algorithm with proper secret management
   - Rationale: Asymmetric signing provides better security than HS256
   - Reference: [research.md](./research.md) for detailed findings

4. **Cross-User Data Isolation**: Researched patterns for enforcing user ownership in API endpoints
   - Decision: Filter queries by authenticated user_id and validate URL parameters
   - Rationale: Prevents cross-user data access while maintaining RESTful design
   - Reference: [research.md](./research.md) for detailed findings

## Phase 1: Architecture & Design

### Completed Data Model Design

No database schema changes required - leveraging existing Task model from Spec-1 with user_id field for ownership.

**Task Entity** (Existing):
- id: int (primary key)
- title: str
- description: str (optional)
- is_completed: bool
- user_id: int (foreign key to user)
- created_at: datetime
- updated_at: datetime

**Additional Security Elements**:
- JWT Token structure with user identification
- Authenticated User Context for request processing
- Validation rules for user data isolation

For detailed data model information, see [data-model.md](./data-model.md).

### Completed API Contract Design

#### Authentication Endpoints (Frontend handled by Better Auth)
- POST `/api/auth/login` → JWT token (handled by Better Auth)
- POST `/api/auth/register` → JWT token (handled by Better Auth)

#### Protected Task Endpoints (Backend with JWT verification)
- GET `/api/users/{user_id}/tasks` → List user's tasks (filtered by authenticated user)
- POST `/api/users/{user_id}/tasks` → Create task for user (assigned to authenticated user)
- GET `/api/users/{user_id}/tasks/{task_id}` → Get specific task (must belong to authenticated user)
- PUT `/api/users/{user_id}/tasks/{task_id}` → Update task (must belong to authenticated user)
- DELETE `/api/users/{user_id}/tasks/{task_id}` → Delete task (must belong to authenticated user)

Complete API specification available in [contracts/openapi.yaml](./contracts/openapi.yaml).

### Completed Security Architecture

1. **JWT Token Structure**:
   - `sub`: user_id
   - `email`: user_email
   - `exp`: expiration timestamp
   - `iat`: issued at timestamp

2. **JWT Verification Middleware**:
   - Extract `Authorization: Bearer <token>` header
   - Verify token signature using shared secret
   - Decode user information
   - Attach user context to request

3. **User Ownership Enforcement**:
   - Compare authenticated user_id with requested user_id in URL
   - Filter database queries by authenticated user_id
   - Validate task ownership before updates/deletes

For implementation details, see [quickstart.md](./quickstart.md).

## Phase 1: Architecture & Design Completion

### Agent Context Update

The following technology has been incorporated into the agent context:
- JWT-based authentication patterns
- Better Auth configuration for token issuance
- FastAPI JWT middleware implementation
- User ownership enforcement strategies
- Security best practices for token handling

## Phase 2: Implementation Strategy

### Frontend Implementation (Next.js + Better Auth)

1. **Environment Setup**:
   - Configure `NEXT_PUBLIC_BETTER_AUTH_URL`
   - Set `BETTER_AUTH_SECRET` in environment

2. **Better Auth Configuration**:
   - Configure JWT token issuance with user ID and email
   - Set token expiration to 7 days
   - Configure shared secret for JWT signing

3. **API Request Interceptor**:
   - Automatically include JWT token in Authorization header
   - Handle 401 responses appropriately

### Backend Implementation (FastAPI)

1. **JWT Utilities Module**:
   - JWT token verification function
   - User information extraction
   - Token validation helpers

2. **Authentication Middleware**:
   - Dependency for route protection
   - User context attachment to requests
   - 401 response handling for invalid tokens

3. **Route Updates**:
   - Apply authentication dependency to all task endpoints
   - Implement user ownership validation
   - Update database queries to filter by user_id

### Testing Strategy

1. **Authentication Tests**:
   - Valid token access succeeds
   - Invalid token returns 401
   - Missing token returns 401

2. **Authorization Tests**:
   - User can access own tasks
   - User cannot access other users' tasks
   - User cannot modify other users' tasks

3. **Integration Tests**:
   - End-to-end authentication flow
   - JWT token lifecycle
   - Error handling scenarios

## Phase 3: Integration & Validation

### Compatibility Checks

- Verify backward compatibility with existing database schema
- Test API endpoints with existing frontend components
- Validate JWT token format with Better Auth standards

### Security Validation

- Penetration testing for authentication bypass
- Token replay attack prevention
- Cross-user data access prevention

### Performance Validation

- JWT verification overhead assessment
- API response time impact evaluation
- Concurrent user session handling

## Risk Assessment

### High-Risk Areas

1. **JWT Security**: Improper token handling could lead to security vulnerabilities
2. **User Isolation**: Failure to properly enforce ownership could expose other users' data
3. **Secret Management**: Incorrect handling of shared secrets could compromise authentication

### Mitigation Strategies

1. **Security Reviews**: Regular security-focused code reviews for authentication logic
2. **Testing Coverage**: Comprehensive test coverage for all authentication and authorization scenarios
3. **Environment Security**: Proper management of secrets through environment variables only

## Success Criteria

- [x] Better Auth configured to issue JWT tokens with user information
- [x] FastAPI backend verifies JWT tokens on all protected endpoints
- [x] User ownership enforced on every CRUD operation
- [x] Unauthorized requests return HTTP 401 status code
- [x] JWT tokens include user ID and email with 7-day expiration
- [x] Backward compatibility maintained with existing database and API
- [x] Automated tests cover all authentication and authorization scenarios

## Phase 1 Completion

Phase 1 of the implementation plan has been completed with the following deliverables:
- [research.md](./research.md) - Technical research and decision documentation
- [data-model.md](./data-model.md) - Updated data model with security considerations
- [contracts/openapi.yaml](./contracts/openapi.yaml) - Complete API specification
- [quickstart.md](./quickstart.md) - Implementation guide for developers