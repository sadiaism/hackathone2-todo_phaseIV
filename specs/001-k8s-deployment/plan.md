# Implementation Plan: Local Kubernetes Deployment (Cloud-Native Todo Chatbot)

**Branch**: `001-k8s-deployment` | **Date**: 2026-02-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-k8s-deployment/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Deploy the existing Phase III Todo Chatbot application (Next.js frontend + FastAPI backend) to a local Kubernetes cluster using Minikube. Containerize both services using Docker with AI-assisted tools (Gordon preferred), create Helm charts for declarative deployment, and leverage kubectl-ai and kagent for AI-assisted Kubernetes operations. The deployment must maintain all existing functionality including chatbot features, user authentication, and database connectivity to Neon PostgreSQL.

## Technical Context

**Language/Version**: Python 3.11+ (backend), Node.js 18+/TypeScript (frontend Next.js 16+)
**Primary Dependencies**: FastAPI, SQLModel, Next.js 16+ App Router, Docker, Kubernetes, Helm 3.x, kubectl-ai, kagent, Docker AI Agent (Gordon)
**Storage**: Neon Serverless PostgreSQL (external, existing database with user, task, chat_sessions, chat_messages, agent_state tables)
**Testing**: pytest (backend), Jest/React Testing Library (frontend), Kubernetes health checks, container security scans
**Target Platform**: Kubernetes via Minikube (local development cluster on Windows/Linux/macOS)
**Project Type**: Web application (containerized frontend + backend services)
**Performance Goals**: Services accessible within 5 minutes of Helm installation, response times under 1 second for standard operations, 95% security scan compliance for container images
**Constraints**: AI-assisted tools only (no manual YAML/Dockerfile creation), Minikube local deployment only, must preserve all Phase III functionality, deployment reproducible via Claude Code Agent prompts (max 3 human interventions)
**Scale/Scope**: Local development deployment, 2 containerized services (frontend + backend), single Minikube cluster, Helm-based package management

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Spec-driven development
- All infrastructure and deployment operations follow written spec
- AI-assisted DevOps adheres to agentic dev stack workflow (Write Spec → Generate Plan → Break into Tasks → Implement)
- No undocumented behavior allowed

### ✅ Cloud-native infrastructure automation
- All deployment and infrastructure automated through code
- Manual Kubernetes YAML creation prohibited (must use AI tools)
- Containerization follows cloud-native best practices
- Infrastructure as Code for all deployments
- Local Kubernetes deployment using Minikube

### ✅ Containerization standards
- Frontend and backend containerized using Docker
- Dockerfiles generated via Docker AI Agent (Gordon) or Claude Code
- Images optimized for size and security
- Container build process reproducible
- Separate containers for frontend and backend services

### ✅ Kubernetes deployment standards
- All deployments run on Minikube locally
- Kubernetes manifests generated via AI tools (kubectl-ai, kagent) or Helm Charts
- Raw YAML files not written manually unless AI-generated
- Services, deployments, and configurations follow Kubernetes best practices
- Multi-container orchestration for frontend and backend

### ✅ Helm chart governance
- Helm charts created for application packaging
- Frontend and backend have separate or combined Helm charts
- Chart templates parameterizable and reusable
- Versioning follows semantic versioning for charts
- Chart deployments idempotent

### ✅ Security-first architecture
- Container and Kubernetes security best practices followed
- No hardcoded secrets (all via environment variables)
- JWT-based authentication preserved from Phase III
- User data isolation maintained in Kubernetes deployment

### ✅ Reliability and correctness
- Kubernetes deployments reliable and recoverable
- Health checks implemented for readiness/liveness probes
- All CRUD operations work reliably with persistent storage

**Gate Status**: ✅ PASS - All constitution principles align with planned approach

## Project Structure

### Documentation (this feature)

```text
specs/001-k8s-deployment/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (containerization & K8s research)
├── data-model.md        # Phase 1 output (infrastructure entities)
├── quickstart.md        # Phase 1 output (deployment guide)
├── contracts/           # Phase 1 output (Helm values schema, K8s resources)
│   ├── helm-values-schema.yaml
│   ├── frontend-deployment.yaml
│   └── backend-deployment.yaml
├── checklists/
│   └── requirements.md  # Specification quality checklist (completed)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/          # SQLModel database models
│   ├── services/        # Business logic services
│   ├── api/             # FastAPI routes
│   └── mcp/             # MCP tools for AI operations
├── tests/
└── Dockerfile           # Generated by Docker AI Agent (Gordon)

frontend/
├── src/
│   ├── app/             # Next.js 16+ App Router pages
│   ├── components/      # React components
│   └── lib/             # Utilities and API clients
├── public/
├── tests/
└── Dockerfile           # Generated by Docker AI Agent (Gordon)

helm/                    # NEW: Helm charts for Kubernetes deployment
├── todo-chatbot/        # Main chart
│   ├── Chart.yaml
│   ├── values.yaml
│   ├── templates/
│   │   ├── frontend-deployment.yaml
│   │   ├── frontend-service.yaml
│   │   ├── backend-deployment.yaml
│   │   ├── backend-service.yaml
│   │   ├── configmap.yaml
│   │   └── secrets.yaml
│   └── README.md
└── .helmignore

.github/
└── workflows/           # CI/CD for container builds (future)

specs/001-k8s-deployment/  # This feature's documentation
```

**Structure Decision**: This is a web application with separate frontend and backend services. The existing `backend/` and `frontend/` directories will be containerized. A new `helm/` directory will be created at the repository root to house Helm charts for Kubernetes deployment. The Helm chart will manage both frontend and backend deployments as a unified application package.

## Complexity Tracking

> **No constitution violations detected - this section is not applicable**

All planned approaches align with constitution principles. No complexity justifications needed.

## Constitution Check - Post-Design Re-evaluation

*Re-evaluated after Phase 1 design completion*

### ✅ Spec-driven development
- All infrastructure artifacts follow written spec ✓
- Research, data model, contracts, and quickstart align with requirements ✓
- AI-assisted DevOps workflow documented in quickstart ✓

### ✅ Cloud-native infrastructure automation
- Helm charts provide Infrastructure as Code ✓
- AI tools (kubectl-ai, kagent, Gordon) integrated in workflow ✓
- Manual YAML creation prohibited, only AI-generated templates ✓
- Minikube deployment strategy documented ✓

### ✅ Containerization standards
- Multi-stage Docker builds documented in research ✓
- Docker AI Agent (Gordon) as primary tool ✓
- Security and optimization requirements specified ✓
- Separate containers for frontend and backend ✓

### ✅ Kubernetes deployment standards
- Minikube-only deployment confirmed ✓
- Helm Charts for manifest generation ✓
- AI-assisted operations via kubectl-ai and kagent ✓
- Best practices followed in deployment contracts ✓

### ✅ Helm chart governance
- Chart structure defined in data model ✓
- Parameterizable values schema created ✓
- Semantic versioning specified ✓
- Idempotent deployments ensured ✓

### ✅ Security-first architecture
- Secrets management via Kubernetes Secrets ✓
- Non-root container execution specified ✓
- No hardcoded secrets in contracts ✓
- Security best practices documented ✓

### ✅ Reliability and correctness
- Health checks (liveness/readiness) specified ✓
- Rolling update strategy for zero-downtime ✓
- Resource limits prevent exhaustion ✓
- Rollback procedures documented ✓

**Final Gate Status**: ✅ PASS - All constitution principles satisfied by design artifacts

## Phase Completion Summary

### Phase 0: Research ✅ Complete
- **Output**: `research.md`
- **Content**: 10 key decisions with rationale and alternatives
- **Coverage**: Containerization, Kubernetes, Helm, AI tools, security, testing

### Phase 1: Design & Contracts ✅ Complete
- **Outputs**:
  - `data-model.md` - Infrastructure entities and relationships
  - `contracts/helm-values-schema.yaml` - Helm chart configuration schema
  - `contracts/frontend-deployment.yaml` - Frontend deployment contract
  - `contracts/backend-deployment.yaml` - Backend deployment contract
  - `quickstart.md` - Complete deployment guide
- **Agent Context**: Updated CLAUDE.md with new technology stack

### Next Phase
- **Phase 2**: Run `/sp.tasks` to generate actionable task breakdown
- **Implementation**: Execute tasks via Claude Code with specialized agents

## Architectural Decisions

📋 **Architectural decision detected**: Multi-stage Docker containerization with AI-assisted Dockerfile generation using Docker AI Agent (Gordon) for optimized, secure container images.

📋 **Architectural decision detected**: Helm-based Kubernetes deployment on Minikube with AI-assisted operations (kubectl-ai, kagent) for reproducible cloud-native infrastructure.

📋 **Architectural decision detected**: Single Helm chart packaging both frontend and backend services with parameterizable configuration for unified application deployment.

**Recommendation**: Document these architectural decisions with `/sp.adr` command to capture rationale, alternatives considered, and tradeoffs for future reference.
