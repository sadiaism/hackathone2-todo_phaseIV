# Research: Local Kubernetes Deployment (Cloud-Native Todo Chatbot)

**Feature**: 001-k8s-deployment
**Date**: 2026-02-07
**Phase**: Phase 0 - Research & Best Practices

## Overview

This document captures research findings for containerizing and deploying the Phase III Todo Chatbot application on Kubernetes using Minikube, with AI-assisted DevOps tools.

## 1. Docker Containerization Strategy

### Decision: Multi-stage builds for both frontend and backend

**Rationale**:
- Reduces final image size by separating build dependencies from runtime
- Improves security by minimizing attack surface
- Faster deployment and reduced storage costs

**Frontend (Next.js 16+) Containerization**:
- Use Node.js 18+ Alpine base image for minimal size
- Multi-stage build: build stage + production stage
- Build stage: Install dependencies, build Next.js app
- Production stage: Copy built artifacts, use `next start`
- Environment variables injected at runtime via ConfigMap/Secrets

**Backend (FastAPI) Containerization**:
- Use Python 3.11+ Alpine or slim base image
- Multi-stage build: dependencies stage + runtime stage
- Use `uv` or `pip` for dependency installation
- Run with `uvicorn` ASGI server
- Non-root user for security
- Health check endpoint for Kubernetes probes

**Alternatives Considered**:
- Single-stage builds: Rejected due to larger image sizes and security concerns
- Distroless images: Considered but Alpine provides better debugging capabilities for local development

### Decision: Docker AI Agent (Gordon) for Dockerfile generation

**Rationale**:
- Automated optimization and security best practices
- Reduces manual configuration errors
- Follows cloud-native patterns automatically

**Fallback**: If Gordon unavailable, use Claude Code to generate Dockerfiles following the same multi-stage pattern

## 2. Kubernetes Deployment Architecture

### Decision: Minikube for local Kubernetes cluster

**Rationale**:
- Lightweight and easy to set up on local machines
- Supports all core Kubernetes features needed for this deployment
- Good for development and testing before production deployment
- Cross-platform support (Windows, macOS, Linux)

**Configuration**:
- Minimum resources: 2 CPUs, 4GB RAM
- Enable addons: ingress, metrics-server (optional)
- Use Docker driver for container runtime

**Alternatives Considered**:
- Kind (Kubernetes in Docker): Rejected as Minikube has better local development tooling
- K3s: Rejected as Minikube is more standard for local development

### Decision: Separate Deployments for Frontend and Backend

**Rationale**:
- Independent scaling of frontend and backend
- Separate resource limits and health checks
- Follows microservices best practices
- Easier to debug and update independently

**Deployment Strategy**:
- Frontend Deployment: 2 replicas (for high availability testing)
- Backend Deployment: 2 replicas (for load balancing)
- Rolling update strategy for zero-downtime deployments
- Resource requests and limits defined for both

### Decision: Service types for local access

**Rationale**:
- Frontend: NodePort or LoadBalancer (Minikube tunnel) for browser access
- Backend: ClusterIP (internal only, accessed via frontend)
- Database: External service pointing to Neon PostgreSQL

**Alternatives Considered**:
- Ingress controller: Considered but NodePort simpler for local development
- Port forwarding: Rejected as less production-like

## 3. Helm Chart Structure

### Decision: Single Helm chart for entire application

**Rationale**:
- Unified deployment of frontend and backend
- Shared configuration and secrets management
- Easier version management
- Simpler for users to install/upgrade

**Chart Structure**:
```
helm/todo-chatbot/
├── Chart.yaml           # Chart metadata and version
├── values.yaml          # Default configuration values
├── templates/
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── configmap.yaml   # Non-sensitive config
│   ├── secrets.yaml     # Sensitive data (DB credentials, JWT secrets)
│   ├── _helpers.tpl     # Template helpers
│   └── NOTES.txt        # Post-install instructions
└── README.md
```

**Parameterization Strategy**:
- Image tags configurable via values.yaml
- Replica counts configurable
- Resource limits configurable
- Environment-specific overrides supported

**Alternatives Considered**:
- Separate charts for frontend/backend: Rejected as adds complexity for local deployment
- Umbrella chart with subcharts: Overkill for this use case

### Decision: Semantic versioning for Helm charts

**Rationale**:
- Standard practice for Helm charts
- Clear communication of breaking changes
- Aligns with constitution requirement

**Versioning Strategy**:
- Start at 0.1.0 for initial development
- Increment patch for bug fixes
- Increment minor for new features
- Increment major for breaking changes

## 4. AI-Assisted Kubernetes Operations

### Decision: kubectl-ai for natural language Kubernetes operations

**Rationale**:
- Simplifies complex kubectl commands
- Reduces learning curve for Kubernetes
- Demonstrates AI-assisted DevOps capabilities

**Use Cases**:
- Deploying resources: "Deploy the todo-chatbot application"
- Scaling: "Scale backend to 3 replicas"
- Debugging: "Show me why the frontend pod is failing"
- Resource inspection: "Get all services in the default namespace"

**Installation**: kubectl plugin via krew package manager

### Decision: kagent for AI-enhanced cluster management

**Rationale**:
- Advanced AI capabilities for cluster operations
- Automated troubleshooting and optimization
- Complements kubectl-ai for complex scenarios

**Use Cases**:
- Resource optimization: "Optimize resource allocation for my pods"
- Troubleshooting: "Debug failing pod startup"
- Best practices: "Check my deployment for security issues"

**Fallback**: If AI tools unavailable, use standard kubectl commands with Claude Code assistance

## 5. Configuration and Secrets Management

### Decision: ConfigMaps for non-sensitive configuration

**Rationale**:
- Kubernetes-native configuration management
- Easy to update without rebuilding images
- Supports environment-specific overrides

**Configuration Items**:
- API endpoints
- Feature flags
- Non-sensitive environment variables

### Decision: Kubernetes Secrets for sensitive data

**Rationale**:
- Secure storage of credentials
- Base64 encoded (not encrypted by default in Minikube, acceptable for local dev)
- Mounted as environment variables or files

**Secret Items**:
- Database connection string (Neon PostgreSQL)
- JWT signing secret
- API keys (if any)

**Security Note**: For production, use external secret management (e.g., Sealed Secrets, External Secrets Operator)

## 6. Health Checks and Observability

### Decision: Implement readiness and liveness probes

**Rationale**:
- Kubernetes can automatically restart unhealthy pods
- Prevents traffic to pods that aren't ready
- Essential for rolling updates

**Probe Configuration**:
- Liveness probe: HTTP GET to `/health` endpoint
- Readiness probe: HTTP GET to `/ready` endpoint
- Initial delay: 10 seconds
- Period: 10 seconds
- Failure threshold: 3

**Backend Health Endpoints**:
- `/health`: Basic health check (returns 200 if service is up)
- `/ready`: Readiness check (returns 200 if database connection is healthy)

**Frontend Health Endpoints**:
- `/api/health`: Basic health check
- `/api/ready`: Readiness check (returns 200 if backend is reachable)

## 7. Database Connectivity

### Decision: External database service for Neon PostgreSQL

**Rationale**:
- Neon PostgreSQL is externally managed (not in Kubernetes)
- Use Kubernetes ExternalName service or direct connection
- Connection string stored in Kubernetes Secret

**Connection Strategy**:
- Backend pods connect to Neon PostgreSQL via connection string
- Connection pooling handled by SQLModel/SQLAlchemy
- Retry logic for transient connection failures

**Alternatives Considered**:
- Running PostgreSQL in Kubernetes: Rejected as Neon is already set up and managed
- Database proxy: Not needed for local development

## 8. Deployment Workflow

### Decision: AI-assisted deployment via Claude Code Agent

**Rationale**:
- Aligns with constitution requirement for reproducible deployments
- Demonstrates AI-assisted DevOps workflow
- Minimizes manual intervention

**Deployment Steps**:
1. Verify Phase III application works locally
2. Generate Dockerfiles using Docker AI Agent (Gordon)
3. Build and tag Docker images
4. Load images into Minikube (minikube image load)
5. Generate Helm chart using kubectl-ai or Claude Code
6. Install Helm chart: `helm install todo-chatbot ./helm/todo-chatbot`
7. Verify deployments: `kubectl get pods`
8. Access services: `minikube service frontend --url`
9. Test end-to-end functionality

**Success Criteria**: Deployment completes with max 3 human interventions

## 9. Security Best Practices

### Decision: Follow container and Kubernetes security best practices

**Container Security**:
- Run as non-root user
- Use minimal base images (Alpine)
- Scan images for vulnerabilities (95% compliance target)
- No hardcoded secrets in images

**Kubernetes Security**:
- Resource limits to prevent resource exhaustion
- Network policies (optional for local dev)
- RBAC for service accounts (default for local dev)
- Secrets for sensitive data

**Alternatives Considered**:
- Pod Security Policies: Deprecated in Kubernetes 1.25+
- Pod Security Standards: Considered but overkill for local development

## 10. Testing Strategy

### Decision: Multi-layer testing approach

**Container Testing**:
- Build images successfully
- Run containers locally to verify functionality
- Security scan with Docker scan or Trivy

**Kubernetes Testing**:
- Deploy to Minikube
- Verify pods are running and healthy
- Test service connectivity
- Verify health checks work

**End-to-End Testing**:
- Access frontend via browser
- Test chatbot functionality
- Verify database operations
- Test authentication flow

**Rollback Testing**:
- Test Helm rollback: `helm rollback todo-chatbot`
- Verify application returns to previous state

## Summary

This research establishes the technical foundation for containerizing and deploying the Todo Chatbot application on Kubernetes. Key decisions include:

1. Multi-stage Docker builds for optimized images
2. Minikube for local Kubernetes cluster
3. Single Helm chart for unified deployment
4. AI-assisted operations via kubectl-ai and kagent
5. Proper health checks and observability
6. Security best practices for containers and Kubernetes

All decisions align with the constitution requirements for cloud-native infrastructure automation, containerization standards, and AI-assisted DevOps workflows.
