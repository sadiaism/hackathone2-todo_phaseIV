# Data Model: Local Kubernetes Deployment Infrastructure

**Feature**: 001-k8s-deployment
**Date**: 2026-02-07
**Phase**: Phase 1 - Infrastructure Entities

## Overview

This document defines the infrastructure entities and their relationships for deploying the Todo Chatbot application on Kubernetes. Unlike traditional data models that focus on database schemas, this model describes the cloud-native infrastructure components.

## Infrastructure Entities

### 1. Docker Image

**Purpose**: Containerized application artifact ready for deployment

**Frontend Image**:
- **Name**: `todo-chatbot-frontend`
- **Base**: Node.js 18+ Alpine
- **Tag Format**: `{version}` (e.g., `0.1.0`, `latest`)
- **Size Target**: < 200MB
- **Build Strategy**: Multi-stage (build + production)
- **Exposed Port**: 3000
- **Health Check**: HTTP GET `/api/health`

**Backend Image**:
- **Name**: `todo-chatbot-backend`
- **Base**: Python 3.11+ Alpine/Slim
- **Tag Format**: `{version}` (e.g., `0.1.0`, `latest`)
- **Size Target**: < 150MB
- **Build Strategy**: Multi-stage (dependencies + runtime)
- **Exposed Port**: 8000
- **Health Check**: HTTP GET `/health`

**Relationships**:
- Images are loaded into Minikube registry
- Referenced by Kubernetes Deployments via image name and tag

**Validation Rules**:
- Must pass security scan (95% compliance)
- Must run as non-root user
- Must not contain hardcoded secrets

### 2. Kubernetes Deployment

**Purpose**: Manages pod replicas and rolling updates

**Frontend Deployment**:
- **Name**: `todo-chatbot-frontend`
- **Replicas**: 2 (configurable)
- **Image**: `todo-chatbot-frontend:{tag}`
- **Container Port**: 3000
- **Environment Variables**: Injected from ConfigMap and Secrets
- **Resource Requests**: CPU 100m, Memory 128Mi
- **Resource Limits**: CPU 500m, Memory 512Mi
- **Update Strategy**: RollingUpdate (maxSurge: 1, maxUnavailable: 0)
- **Liveness Probe**: HTTP GET `/api/health` (delay: 10s, period: 10s)
- **Readiness Probe**: HTTP GET `/api/ready` (delay: 5s, period: 5s)

**Backend Deployment**:
- **Name**: `todo-chatbot-backend`
- **Replicas**: 2 (configurable)
- **Image**: `todo-chatbot-backend:{tag}`
- **Container Port**: 8000
- **Environment Variables**: Injected from ConfigMap and Secrets
- **Resource Requests**: CPU 200m, Memory 256Mi
- **Resource Limits**: CPU 1000m, Memory 1Gi
- **Update Strategy**: RollingUpdate (maxSurge: 1, maxUnavailable: 0)
- **Liveness Probe**: HTTP GET `/health` (delay: 10s, period: 10s)
- **Readiness Probe**: HTTP GET `/ready` (delay: 5s, period: 5s)

**Relationships**:
- Deployment manages Pods
- Pods run Containers from Docker Images
- Pods mount ConfigMaps and Secrets as environment variables

**State Transitions**:
- Pending → Running → Ready (successful startup)
- Running → Failed → Restarting (health check failure)
- Running → Terminating → Terminated (during updates or deletion)

### 3. Kubernetes Service

**Purpose**: Provides stable network endpoint for pod access

**Frontend Service**:
- **Name**: `todo-chatbot-frontend`
- **Type**: NodePort or LoadBalancer (configurable)
- **Port**: 80 (external) → 3000 (container)
- **Selector**: `app: todo-chatbot-frontend`
- **Session Affinity**: None (stateless)

**Backend Service**:
- **Name**: `todo-chatbot-backend`
- **Type**: ClusterIP (internal only)
- **Port**: 8000 (internal) → 8000 (container)
- **Selector**: `app: todo-chatbot-backend`
- **Session Affinity**: None (stateless)

**Relationships**:
- Service routes traffic to Deployment Pods via label selectors
- Frontend Service is externally accessible
- Backend Service is internal, accessed by Frontend Pods

### 4. ConfigMap

**Purpose**: Non-sensitive configuration data

**Name**: `todo-chatbot-config`

**Configuration Items**:
- `BACKEND_URL`: Internal backend service URL (e.g., `http://todo-chatbot-backend:8000`)
- `FRONTEND_URL`: External frontend URL (e.g., `http://localhost:3000`)
- `LOG_LEVEL`: Logging level (e.g., `info`, `debug`)
- `NODE_ENV`: Environment (e.g., `production`)
- `PYTHON_ENV`: Environment (e.g., `production`)

**Relationships**:
- Mounted as environment variables in Frontend and Backend Deployments
- Can be updated independently of image rebuilds

**Validation Rules**:
- Must not contain sensitive data
- Values must be valid for their respective applications

### 5. Secret

**Purpose**: Sensitive configuration data

**Name**: `todo-chatbot-secrets`

**Secret Items**:
- `DATABASE_URL`: Neon PostgreSQL connection string
- `JWT_SECRET`: JWT token signing secret
- `BETTER_AUTH_SECRET`: Better Auth secret key
- `BETTER_AUTH_URL`: Better Auth URL

**Relationships**:
- Mounted as environment variables in Backend Deployment
- Base64 encoded (Kubernetes default)

**Validation Rules**:
- Must be created before deployment
- Must not be committed to version control
- Values must be valid connection strings/secrets

**Security Considerations**:
- Stored in Kubernetes etcd (not encrypted by default in Minikube)
- For production, use external secret management

### 6. Helm Chart

**Purpose**: Package and version the entire application deployment

**Chart Metadata**:
- **Name**: `todo-chatbot`
- **Version**: `0.1.0` (semantic versioning)
- **App Version**: `1.0.0` (application version)
- **Description**: "Todo Chatbot application with Next.js frontend and FastAPI backend"
- **Type**: `application`

**Chart Structure**:
```
helm/todo-chatbot/
├── Chart.yaml           # Metadata
├── values.yaml          # Default values
├── templates/           # Kubernetes resource templates
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── configmap.yaml
│   ├── secrets.yaml
│   ├── _helpers.tpl
│   └── NOTES.txt
└── README.md
```

**Configurable Values** (values.yaml):
- Image tags for frontend and backend
- Replica counts
- Resource limits
- Service types
- Environment-specific configuration

**Relationships**:
- Chart templates generate all Kubernetes resources
- Values can be overridden during installation
- Chart version tracks deployment version

**State Transitions**:
- Not Installed → Installing → Deployed (successful install)
- Deployed → Upgrading → Deployed (successful upgrade)
- Deployed → Rolling Back → Deployed (successful rollback)
- Deployed → Uninstalling → Not Installed (deletion)

## Entity Relationships Diagram

```
┌─────────────────┐
│   Helm Chart    │
│  (todo-chatbot) │
└────────┬────────┘
         │ manages
         ▼
┌────────────────────────────────────────────────┐
│                                                │
│  ┌──────────────┐      ┌──────────────┐      │
│  │  ConfigMap   │      │    Secret    │      │
│  └──────┬───────┘      └──────┬───────┘      │
│         │                     │               │
│         │ provides config     │ provides      │
│         │                     │ secrets       │
│         ▼                     ▼               │
│  ┌──────────────────────────────────────┐    │
│  │     Frontend Deployment              │    │
│  │  ┌────────────────────────────────┐  │    │
│  │  │  Pods (replicas: 2)            │  │    │
│  │  │  ┌──────────────────────────┐  │  │    │
│  │  │  │ Container                │  │  │    │
│  │  │  │ (frontend image)         │  │  │    │
│  │  │  └──────────────────────────┘  │  │    │
│  │  └────────────────────────────────┘  │    │
│  └──────────────┬───────────────────────┘    │
│                 │                             │
│                 │ selected by                 │
│                 ▼                             │
│  ┌──────────────────────────┐                │
│  │  Frontend Service        │                │
│  │  (NodePort/LoadBalancer) │                │
│  └──────────────────────────┘                │
│                                                │
│  ┌──────────────────────────────────────┐    │
│  │     Backend Deployment               │    │
│  │  ┌────────────────────────────────┐  │    │
│  │  │  Pods (replicas: 2)            │  │    │
│  │  │  ┌──────────────────────────┐  │  │    │
│  │  │  │ Container                │  │  │    │
│  │  │  │ (backend image)          │  │  │    │
│  │  │  └──────────────────────────┘  │  │    │
│  │  └────────────────────────────────┘  │    │
│  └──────────────┬───────────────────────┘    │
│                 │                             │
│                 │ selected by                 │
│                 ▼                             │
│  ┌──────────────────────────┐                │
│  │  Backend Service         │                │
│  │  (ClusterIP - internal)  │                │
│  └──────────────────────────┘                │
│                                                │
└────────────────────────────────────────────────┘
                 │
                 │ connects to
                 ▼
┌────────────────────────────────┐
│  External Database             │
│  (Neon PostgreSQL)             │
│  - users table                 │
│  - tasks table                 │
│  - chat_sessions table         │
│  - chat_messages table         │
│  - agent_state table           │
└────────────────────────────────┘
```

## Infrastructure Validation Rules

### Image Validation
- Images must be built successfully
- Images must pass security scans (95% compliance)
- Images must be loadable into Minikube
- Images must start without errors

### Deployment Validation
- Pods must reach Running state within 2 minutes
- Health checks must pass within 30 seconds
- Resource requests must not exceed node capacity
- Environment variables must be properly injected

### Service Validation
- Services must route traffic to healthy pods
- Frontend service must be externally accessible
- Backend service must be reachable from frontend pods
- Service endpoints must be populated

### Configuration Validation
- ConfigMap must contain all required keys
- Secret must contain all required keys
- Values must be valid for their respective applications
- No sensitive data in ConfigMap

### Helm Chart Validation
- Chart must pass `helm lint`
- Chart must install without errors
- Chart must be upgradeable
- Chart must be rollback-able

## Summary

This infrastructure data model defines six core entities (Docker Images, Deployments, Services, ConfigMaps, Secrets, Helm Chart) and their relationships for deploying the Todo Chatbot application on Kubernetes. All entities follow cloud-native best practices and align with the constitution requirements for containerization and Kubernetes deployment standards.
