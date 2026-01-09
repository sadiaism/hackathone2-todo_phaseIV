# Implementation Plan: Todo Full-Stack Web Application – Spec 1 (Backend API & Database)

**Feature**: Todo Full-Stack Web Application – Spec 1 (Backend API & Database)
**Branch**: 001-backend-api-db
**Created**: 2026-01-08
**Status**: Draft
**Input**: User requirements: "Initialize FastAPI project structure, Configure Neon PostgreSQL connection via environment variables, Define SQLModel Task schema, Create database session and migration-ready setup, Implement REST API routes, Scope all queries by user_id, Add basic error handling, Verify persistence with database read/write tests"

## Technical Context

- **Backend Framework**: Python FastAPI
- **ORM**: SQLModel
- **Database**: Neon Serverless PostgreSQL
- **API Style**: REST with JSON request/response
- **User Context**: user_id in route parameters (stubbed for now)
- **Authentication**: Not implemented yet (will be added in future spec)
- **Architecture**: Separate backend service

### Resolved Unknowns
- Environment variable names for Neon PostgreSQL connection: DATABASE_URL, NEON_DB_HOST, etc. (see research.md)
- Field types and constraints for the Task schema: Defined in data-model.md
- Error response format for API endpoints: Standard JSON format with detail field
- Test framework for database verification: pytest with specific configuration (see research.md)

## Constitution Check

- ✅ Spec-driven development: All implementation will map directly to spec requirements
- ✅ Security-first architecture: User data isolation will be enforced via user_id scoping
- ✅ User data isolation: All queries will be scoped by user_id parameter
- ✅ Reliability and correctness: REST endpoints will follow standard HTTP semantics
- ✅ Modern full-stack best practices: Using FastAPI, SQLModel, and Neon PostgreSQL
- ✅ Technology Stack Constraints: Following prescribed stack (FastAPI, SQLModel, Neon PG)

## Gates

- ✅ **Scope alignment**: Plan covers all 8 requirements from user input
- ✅ **Constitution compliance**: All architectural decisions align with constitution
- ✅ **Feasibility**: All requirements are technically achievable with the specified stack
- ✅ **Security**: User data isolation will be enforced via user_id scoping

---

## Phase 0: Outline & Research

### Research Tasks

1. **Environment Variables Configuration**
   - Research standard environment variable names for Neon PostgreSQL connections
   - Determine best practices for database URL format

2. **SQLModel Schema Design**
   - Research optimal field types for Task entity in SQLModel
   - Determine appropriate constraints and validations
   - Review timestamp field options

3. **FastAPI Best Practices**
   - Research standard FastAPI project structure
   - Best practices for dependency injection and database sessions
   - Recommended error handling patterns

4. **Migration Strategy**
   - Research Alembic integration with SQLModel for database migrations
   - Best practices for migration-ready setup

### Expected Outcomes

- Environment variable configuration documented
- Task schema design finalized with proper types and constraints
- FastAPI project structure established
- Migration strategy implemented

---

## Phase 1: Design & Contracts

### Data Model: data-model.md

#### Task Entity
- **id**: Integer (Primary Key, Auto-generated)
- **title**: String (Required, Max length: 255)
- **description**: String (Optional, Max length: 1000)
- **completed**: Boolean (Default: False)
- **user_id**: Integer (Foreign Key reference to User, Required for scoping)
- **created_at**: DateTime (Auto-generated timestamp)
- **updated_at**: DateTime (Auto-generated timestamp, updated on changes)

#### User Entity (Stubbed)
- **id**: Integer (Primary Key, Auto-generated)
- **Note**: Actual user authentication will be implemented in future spec

### API Contracts

#### Base Path: `/api/{user_id}`

**POST /api/{user_id}/tasks**
- Request Body: `{ "title": "string", "description": "string" }`
- Response: `201 Created` with Task object
- Error Responses: `400 Bad Request`, `500 Internal Server Error`

**GET /api/{user_id}/tasks**
- Response: `200 OK` with array of Task objects for the specified user
- Error Responses: `500 Internal Server Error`

**GET /api/{user_id}/tasks/{id}**
- Response: `200 OK` with specific Task object
- Error Responses: `404 Not Found`, `500 Internal Server Error`

**PUT /api/{user_id}/tasks/{id}**
- Request Body: `{ "title": "string", "description": "string", "completed": boolean }`
- Response: `200 OK` with updated Task object
- Error Responses: `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`

**DELETE /api/{user_id}/tasks/{id}**
- Response: `204 No Content`
- Error Responses: `404 Not Found`, `500 Internal Server Error`

**PATCH /api/{user_id}/tasks/{id}/complete**
- Request Body: `{ "completed": boolean }`
- Response: `200 OK` with updated Task object
- Error Responses: `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`

### Quickstart Guide: quickstart.md

1. Clone the repository
2. Install dependencies: `pip install fastapi sqlmodel python-dotenv uvicorn psycopg2-binary`
3. Set up environment variables for Neon PostgreSQL connection
4. Run database migrations (when implemented)
5. Start the server: `uvicorn main:app --reload`
6. Access API at `http://localhost:8000`

---

## Phase 2: Implementation Steps (High-Level)

1. **Initialize FastAPI project structure**
   - Create main application file
   - Set up configuration and dependencies

2. **Configure database connection**
   - Set up environment variables
   - Create database engine and session

3. **Define SQLModel schemas**
   - Create Task model with required fields
   - Set up proper relationships and constraints

4. **Implement database session management**
   - Create dependency for database sessions
   - Set up proper connection handling

5. **Create API routes**
   - Implement all 6 required endpoints
   - Add proper user_id scoping to all queries
   - Include error handling

6. **Add error handling**
   - Create custom exception handlers
   - Return appropriate HTTP status codes

7. **Implement testing**
   - Create database read/write tests
   - Verify persistence across restarts

8. **Documentation**
   - Generate API documentation with FastAPI's automatic docs