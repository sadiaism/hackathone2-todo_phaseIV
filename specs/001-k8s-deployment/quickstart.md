# Quickstart: Deploy Todo Chatbot on Kubernetes

**Feature**: 001-k8s-deployment
**Date**: 2026-02-07
**Audience**: Developers, DevOps Engineers, Hackathon Reviewers

## Overview

This guide walks you through deploying the Todo Chatbot application (Next.js frontend + FastAPI backend) on a local Kubernetes cluster using Minikube, with AI-assisted DevOps tools.

## Prerequisites

### Required Tools

1. **Docker Desktop** (for containerization)
   - Version: 20.10+
   - Download: https://www.docker.com/products/docker-desktop

2. **Minikube** (for local Kubernetes cluster)
   - Version: 1.30+
   - Installation: https://minikube.sigs.k8s.io/docs/start/

3. **kubectl** (Kubernetes CLI)
   - Version: 1.27+
   - Installation: https://kubernetes.io/docs/tasks/tools/

4. **Helm** (Kubernetes package manager)
   - Version: 3.12+
   - Installation: https://helm.sh/docs/intro/install/

5. **kubectl-ai** (AI-assisted Kubernetes operations) - Optional but recommended
   - Installation: `kubectl krew install ai`

6. **kagent** (AI-enhanced cluster management) - Optional but recommended
   - Installation: Follow kagent documentation

7. **Docker AI Agent (Gordon)** - Optional but recommended
   - For AI-assisted Dockerfile generation

### System Requirements

- **CPU**: Minimum 4 cores (2 for Minikube, 2 for host)
- **Memory**: Minimum 8GB RAM (4GB for Minikube, 4GB for host)
- **Disk**: Minimum 20GB free space
- **OS**: Windows 10+, macOS 10.15+, or Linux

### Verify Prerequisites

```bash
# Check Docker
docker --version

# Check Minikube
minikube version

# Check kubectl
kubectl version --client

# Check Helm
helm version

# Check kubectl-ai (optional)
kubectl ai --version

# Check kagent (optional)
kagent --version
```

## Step 1: Verify Phase III Application

Before containerizing, ensure the Phase III Todo Chatbot works locally.

### Start Backend

```bash
cd backend
python -m uvicorn src.main:app --reload --port 8000
```

Verify: http://localhost:8000/docs

### Start Frontend

```bash
cd frontend
npm run dev
```

Verify: http://localhost:3000

### Test Chatbot Functionality

1. Sign up / Sign in
2. Create a todo task
3. Use chatbot to manage tasks
4. Verify database tables exist in Neon PostgreSQL

**Expected Tables**:
- users
- tasks
- chat_sessions
- chat_messages
- agent_state

## Step 2: Start Minikube Cluster

```bash
# Start Minikube with sufficient resources
minikube start --cpus=2 --memory=4096 --driver=docker

# Verify cluster is running
kubectl cluster-info

# Enable useful addons (optional)
minikube addons enable metrics-server
minikube addons enable ingress
```

## Step 3: Containerize Applications

### Option A: Using Docker AI Agent (Gordon) - Recommended

```bash
# Generate and build frontend Dockerfile
cd frontend
gordon generate dockerfile --optimize --security-scan
docker build -t todo-chatbot-frontend:0.1.0 .

# Generate and build backend Dockerfile
cd ../backend
gordon generate dockerfile --optimize --security-scan
docker build -t todo-chatbot-backend:0.1.0 .
```

### Option B: Using Claude Code Agent

```bash
# Ask Claude Code to generate Dockerfiles
# Claude will create optimized multi-stage Dockerfiles

# Build frontend
cd frontend
docker build -t todo-chatbot-frontend:0.1.0 .

# Build backend
cd ../backend
docker build -t todo-chatbot-backend:0.1.0 .
```

### Option C: Manual Dockerfile Creation (Fallback)

If AI tools are unavailable, create Dockerfiles manually following the multi-stage pattern documented in research.md.

### Load Images into Minikube

```bash
# Load frontend image
minikube image load todo-chatbot-frontend:0.1.0

# Load backend image
minikube image load todo-chatbot-backend:0.1.0

# Verify images are loaded
minikube image ls | grep todo-chatbot
```

## Step 4: Create Kubernetes Secrets

Create a secrets file with your Neon PostgreSQL credentials and auth secrets.

```bash
# Create secrets.yaml (DO NOT COMMIT THIS FILE)
cat > secrets.yaml <<EOF
DATABASE_URL: "postgresql://user:password@host/database?sslmode=require"
JWT_SECRET: "your-jwt-secret-min-32-characters"
BETTER_AUTH_SECRET: "your-better-auth-secret"
BETTER_AUTH_URL: "http://localhost:3000"
EOF

# Base64 encode secrets for Kubernetes
kubectl create secret generic todo-chatbot-secrets \
  --from-literal=DATABASE_URL="$(cat secrets.yaml | grep DATABASE_URL | cut -d'"' -f2)" \
  --from-literal=JWT_SECRET="$(cat secrets.yaml | grep JWT_SECRET | cut -d'"' -f2)" \
  --from-literal=BETTER_AUTH_SECRET="$(cat secrets.yaml | grep BETTER_AUTH_SECRET | cut -d'"' -f2)" \
  --from-literal=BETTER_AUTH_URL="$(cat secrets.yaml | grep BETTER_AUTH_URL | cut -d'"' -f2)" \
  --dry-run=client -o yaml | kubectl apply -f -

# Clean up secrets file
rm secrets.yaml
```

## Step 5: Create Helm Chart

### Option A: Using kubectl-ai or kagent - Recommended

```bash
# Use kubectl-ai to generate Helm chart
kubectl ai "Create a Helm chart for todo-chatbot with frontend and backend deployments"

# Or use kagent
kagent generate helm-chart --name todo-chatbot --services frontend,backend
```

### Option B: Using Claude Code Agent

Ask Claude Code to generate the Helm chart structure based on the contracts in `specs/001-k8s-deployment/contracts/`.

### Option C: Manual Creation (Fallback)

Create the Helm chart structure manually:

```bash
mkdir -p helm/todo-chatbot/templates
cd helm/todo-chatbot

# Create Chart.yaml, values.yaml, and templates
# Follow the structure defined in contracts/helm-values-schema.yaml
```

## Step 6: Install Helm Chart

```bash
# Navigate to repository root
cd /path/to/phase_IV

# Install the Helm chart
helm install todo-chatbot ./helm/todo-chatbot \
  --set image.frontend.tag=0.1.0 \
  --set image.backend.tag=0.1.0

# Watch deployment progress
kubectl get pods -w

# Wait for all pods to be Running and Ready
# This should take less than 5 minutes
```

## Step 7: Verify Deployment

### Check Pod Status

```bash
# Get all pods
kubectl get pods

# Expected output:
# NAME                                      READY   STATUS    RESTARTS   AGE
# todo-chatbot-frontend-xxxxxxxxxx-xxxxx    1/1     Running   0          2m
# todo-chatbot-frontend-xxxxxxxxxx-xxxxx    1/1     Running   0          2m
# todo-chatbot-backend-xxxxxxxxxx-xxxxx     1/1     Running   0          2m
# todo-chatbot-backend-xxxxxxxxxx-xxxxx     1/1     Running   0          2m
```

### Check Services

```bash
# Get all services
kubectl get services

# Expected output:
# NAME                    TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
# todo-chatbot-frontend   NodePort    10.96.xxx.xxx   <none>        80:xxxxx/TCP   2m
# todo-chatbot-backend    ClusterIP   10.96.xxx.xxx   <none>        8000/TCP       2m
```

### Check Logs

```bash
# Frontend logs
kubectl logs -l app=todo-chatbot-frontend --tail=50

# Backend logs
kubectl logs -l app=todo-chatbot-backend --tail=50
```

## Step 8: Access the Application

### Get Frontend URL

```bash
# Get the frontend service URL
minikube service todo-chatbot-frontend --url

# Example output: http://192.168.49.2:30080
```

### Open in Browser

```bash
# Open frontend in default browser
minikube service todo-chatbot-frontend
```

### Test Application

1. Navigate to the frontend URL
2. Sign in with existing credentials
3. Test chatbot functionality
4. Create/update/delete tasks
5. Verify all features work as expected

## Step 9: AI-Assisted Operations (Optional)

### Using kubectl-ai

```bash
# Scale backend replicas
kubectl ai "Scale the backend deployment to 3 replicas"

# Check pod status
kubectl ai "Show me the status of all pods"

# Debug failing pods
kubectl ai "Why is the frontend pod failing?"

# Get resource usage
kubectl ai "Show resource usage for all pods"
```

### Using kagent

```bash
# Optimize resource allocation
kagent optimize resources

# Troubleshoot issues
kagent diagnose --pod todo-chatbot-backend-xxx

# Security scan
kagent security-scan --deployment todo-chatbot-backend
```

## Step 10: Upgrade and Rollback

### Upgrade Deployment

```bash
# Update image tag
helm upgrade todo-chatbot ./helm/todo-chatbot \
  --set image.frontend.tag=0.2.0 \
  --set image.backend.tag=0.2.0

# Watch rolling update
kubectl rollout status deployment/todo-chatbot-frontend
kubectl rollout status deployment/todo-chatbot-backend
```

### Rollback if Needed

```bash
# Rollback to previous version
helm rollback todo-chatbot

# Or rollback to specific revision
helm rollback todo-chatbot 1
```

## Troubleshooting

### Pods Not Starting

```bash
# Describe pod to see events
kubectl describe pod <pod-name>

# Check logs
kubectl logs <pod-name>

# Common issues:
# - ImagePullBackOff: Image not loaded into Minikube
# - CrashLoopBackOff: Application error, check logs
# - Pending: Insufficient resources
```

### Database Connection Failures

```bash
# Verify secrets are created
kubectl get secrets

# Check secret values (base64 encoded)
kubectl get secret todo-chatbot-secrets -o yaml

# Test database connection from backend pod
kubectl exec -it <backend-pod-name> -- python -c "import psycopg2; print('Connection test')"
```

### Service Not Accessible

```bash
# Check service endpoints
kubectl get endpoints

# Verify pods are ready
kubectl get pods

# Check Minikube tunnel (if using LoadBalancer)
minikube tunnel
```

### Health Checks Failing

```bash
# Check health endpoint directly
kubectl port-forward <pod-name> 8000:8000
curl http://localhost:8000/health

# Verify health check configuration
kubectl describe deployment todo-chatbot-backend
```

## Cleanup

### Uninstall Application

```bash
# Uninstall Helm release
helm uninstall todo-chatbot

# Delete secrets
kubectl delete secret todo-chatbot-secrets

# Verify cleanup
kubectl get all
```

### Stop Minikube

```bash
# Stop Minikube cluster
minikube stop

# Delete Minikube cluster (if needed)
minikube delete
```

## Success Criteria Verification

- ✅ Frontend and backend containerized with no manual Dockerfile creation
- ✅ Application deploys cleanly on Minikube with zero configuration errors
- ✅ Services accessible locally within 5 minutes
- ✅ Response times under 1 second for standard operations
- ✅ Chatbot functionality works identically to Phase III
- ✅ AI-assisted DevOps tools execute 80%+ of operations
- ✅ Deployment reproducible with max 3 human interventions
- ✅ Database tables properly integrated
- ✅ Helm charts allow easy configuration and upgrades

## Next Steps

1. **Production Deployment**: Adapt for cloud Kubernetes (EKS, GKE, AKS)
2. **CI/CD Pipeline**: Automate build and deployment
3. **Monitoring**: Add Prometheus and Grafana
4. **Logging**: Centralize logs with ELK or Loki
5. **Security**: Implement network policies and pod security standards

## Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Helm Documentation](https://helm.sh/docs/)
- [Minikube Documentation](https://minikube.sigs.k8s.io/docs/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [kubectl-ai Documentation](https://github.com/sozercan/kubectl-ai)
