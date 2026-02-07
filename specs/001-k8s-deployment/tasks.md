# Tasks: Local Kubernetes Deployment (Cloud-Native Todo Chatbot)

**Input**: Design documents from `/specs/001-k8s-deployment/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are NOT explicitly requested in the specification, so test tasks are excluded.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing. Note: User stories are ordered by technical dependencies rather than priority labels, as containerization (US2) and Helm charts (US3) are prerequisites for deployment (US1).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/` (existing)
- **Frontend**: `frontend/` (existing)
- **Helm**: `helm/todo-chatbot/` (new)
- **Docs**: `specs/001-k8s-deployment/` (existing)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and prerequisite verification

- [ ] T001 Verify Phase III Todo Chatbot backend is working locally at http://localhost:8000
- [ ] T002 Verify Phase III Todo Chatbot frontend is working locally at http://localhost:3000
- [ ] T003 Verify Neon PostgreSQL database contains required tables (users, tasks, chat_sessions, chat_messages, agent_state)
- [ ] T004 [P] Install Docker Desktop and verify installation with `docker --version`
- [ ] T005 [P] Install Minikube and verify installation with `minikube version`
- [ ] T006 [P] Install kubectl and verify installation with `kubectl version --client`
- [ ] T007 [P] Install Helm 3.x and verify installation with `helm version`
- [ ] T008 [P] Install kubectl-ai plugin via krew (optional but recommended)
- [ ] T009 [P] Install kagent for AI-enhanced cluster management (optional but recommended)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before containerization and deployment

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T010 Start Minikube cluster with sufficient resources: `minikube start --cpus=2 --memory=4096 --driver=docker`
- [ ] T011 Verify Minikube cluster is running with `kubectl cluster-info`
- [ ] T012 [P] Enable Minikube metrics-server addon: `minikube addons enable metrics-server`
- [ ] T013 [P] Enable Minikube ingress addon (optional): `minikube addons enable ingress`
- [ ] T014 [P] Implement health check endpoint `/health` in backend/src/api/health.py
- [ ] T015 [P] Implement readiness check endpoint `/ready` in backend/src/api/health.py (checks database connection)
- [ ] T016 [P] Implement health check endpoint `/api/health` in frontend/src/app/api/health/route.ts
- [ ] T017 [P] Implement readiness check endpoint `/api/ready` in frontend/src/app/api/ready/route.ts (checks backend connectivity)
- [ ] T018 Test health endpoints locally: backend http://localhost:8000/health and frontend http://localhost:3000/api/health
- [ ] T019 Create Kubernetes secrets file template at specs/001-k8s-deployment/secrets-template.yaml (DO NOT commit actual secrets)

**Checkpoint**: Foundation ready - containerization can now begin

---

## Phase 3: User Story 2 - Containerize Application Using AI-Assisted Tools (Priority: P2)

**Goal**: Create optimized Docker images for frontend and backend services using AI-assisted tools

**Independent Test**: Docker images build successfully, pass security scans, and run properly in container runtime

**Technical Note**: This is P2 in spec but must be completed before US1 (deployment) due to technical dependencies

### Implementation for User Story 2

- [ ] T020 [P] [US2] Generate optimized Dockerfile for frontend using Docker AI Agent (Gordon) or Claude Code in frontend/Dockerfile
- [ ] T021 [P] [US2] Generate optimized Dockerfile for backend using Docker AI Agent (Gordon) or Claude Code in backend/Dockerfile
- [ ] T022 [US2] Build frontend Docker image: `docker build -t todo-chatbot-frontend:0.1.0 ./frontend`
- [ ] T023 [US2] Build backend Docker image: `docker build -t todo-chatbot-backend:0.1.0 ./backend`
- [ ] T024 [P] [US2] Run security scan on frontend image: `docker scan todo-chatbot-frontend:0.1.0` or use Trivy
- [ ] T025 [P] [US2] Run security scan on backend image: `docker scan todo-chatbot-backend:0.1.0` or use Trivy
- [ ] T026 [US2] Verify frontend image runs locally: `docker run -p 3000:3000 todo-chatbot-frontend:0.1.0`
- [ ] T027 [US2] Verify backend image runs locally: `docker run -p 8000:8000 -e DATABASE_URL=<test-url> todo-chatbot-backend:0.1.0`
- [ ] T028 [US2] Load frontend image into Minikube: `minikube image load todo-chatbot-frontend:0.1.0`
- [ ] T029 [US2] Load backend image into Minikube: `minikube image load todo-chatbot-backend:0.1.0`
- [ ] T030 [US2] Verify images are loaded in Minikube: `minikube image ls | grep todo-chatbot`

**Checkpoint**: Docker images are built, scanned, and loaded into Minikube - ready for Helm chart creation

---

## Phase 4: User Story 3 - Implement Helm-Based Deployment (Priority: P3)

**Goal**: Create Helm charts for declarative, reproducible Kubernetes deployment

**Independent Test**: Helm chart installs cleanly on fresh Minikube instance and all resources are created correctly

**Technical Note**: This is P3 in spec but must be completed before US1 (deployment) due to technical dependencies

### Implementation for User Story 3

- [ ] T031 [US3] Create Helm chart directory structure: `mkdir -p helm/todo-chatbot/templates`
- [ ] T032 [P] [US3] Create Chart.yaml with metadata (name: todo-chatbot, version: 0.1.0, appVersion: 1.0.0) in helm/todo-chatbot/Chart.yaml
- [ ] T033 [P] [US3] Create values.yaml with default configuration based on contracts/helm-values-schema.yaml in helm/todo-chatbot/values.yaml
- [ ] T034 [P] [US3] Create _helpers.tpl with template helpers in helm/todo-chatbot/templates/_helpers.tpl
- [ ] T035 [P] [US3] Create frontend-deployment.yaml template based on contracts/frontend-deployment.yaml in helm/todo-chatbot/templates/frontend-deployment.yaml
- [ ] T036 [P] [US3] Create frontend-service.yaml template in helm/todo-chatbot/templates/frontend-service.yaml
- [ ] T037 [P] [US3] Create backend-deployment.yaml template based on contracts/backend-deployment.yaml in helm/todo-chatbot/templates/backend-deployment.yaml
- [ ] T038 [P] [US3] Create backend-service.yaml template in helm/todo-chatbot/templates/backend-service.yaml
- [ ] T039 [P] [US3] Create configmap.yaml template for non-sensitive configuration in helm/todo-chatbot/templates/configmap.yaml
- [ ] T040 [P] [US3] Create secrets.yaml template for sensitive data in helm/todo-chatbot/templates/secrets.yaml
- [ ] T041 [P] [US3] Create NOTES.txt with post-install instructions in helm/todo-chatbot/templates/NOTES.txt
- [ ] T042 [P] [US3] Create README.md with chart documentation in helm/todo-chatbot/README.md
- [ ] T043 [P] [US3] Create .helmignore file in helm/.helmignore
- [ ] T044 [US3] Validate Helm chart with `helm lint ./helm/todo-chatbot`
- [ ] T045 [US3] Perform dry-run installation: `helm install todo-chatbot ./helm/todo-chatbot --dry-run --debug`
- [ ] T046 [US3] Fix any validation errors or warnings from lint and dry-run

**Checkpoint**: Helm chart is created, validated, and ready for deployment

---

## Phase 5: User Story 1 - Deploy Containerized Todo Chatbot on Minikube (Priority: P1) 🎯 MVP

**Goal**: Successfully deploy the complete Todo Chatbot application on Kubernetes and verify all functionality

**Independent Test**: Application is running in Kubernetes pods, accessible via services, and all Phase III functionality works identically

**Technical Note**: This is P1 (highest priority) and represents the core deliverable - bringing together containerization and Helm deployment

### Implementation for User Story 1

- [ ] T047 [US1] Create Kubernetes secrets from environment variables: `kubectl create secret generic todo-chatbot-secrets --from-literal=DATABASE_URL=<value> --from-literal=JWT_SECRET=<value> --from-literal=BETTER_AUTH_SECRET=<value> --from-literal=BETTER_AUTH_URL=<value>`
- [ ] T048 [US1] Verify secrets are created: `kubectl get secrets todo-chatbot-secrets`
- [ ] T049 [US1] Install Helm chart: `helm install todo-chatbot ./helm/todo-chatbot --set image.frontend.tag=0.1.0 --set image.backend.tag=0.1.0`
- [ ] T050 [US1] Watch pod creation: `kubectl get pods -w` (wait for all pods to reach Running state)
- [ ] T051 [US1] Verify frontend deployment: `kubectl get deployment todo-chatbot-frontend`
- [ ] T052 [US1] Verify backend deployment: `kubectl get deployment todo-chatbot-backend`
- [ ] T053 [US1] Verify frontend service: `kubectl get service todo-chatbot-frontend`
- [ ] T054 [US1] Verify backend service: `kubectl get service todo-chatbot-backend`
- [ ] T055 [US1] Check frontend pod logs: `kubectl logs -l app=todo-chatbot-frontend --tail=50`
- [ ] T056 [US1] Check backend pod logs: `kubectl logs -l app=todo-chatbot-backend --tail=50`
- [ ] T057 [US1] Verify health checks are passing: `kubectl describe pod <frontend-pod-name>` and check liveness/readiness probes
- [ ] T058 [US1] Get frontend service URL: `minikube service todo-chatbot-frontend --url`
- [ ] T059 [US1] Access frontend in browser and verify application loads
- [ ] T060 [US1] Test user authentication (sign in with existing credentials)
- [ ] T061 [US1] Test todo task creation via chatbot
- [ ] T062 [US1] Test todo task listing via chatbot
- [ ] T063 [US1] Test todo task update via chatbot
- [ ] T064 [US1] Test todo task deletion via chatbot
- [ ] T065 [US1] Verify database operations are working (check Neon PostgreSQL for new data)
- [ ] T066 [US1] Test Helm upgrade: `helm upgrade todo-chatbot ./helm/todo-chatbot --set replicaCount.backend=3`
- [ ] T067 [US1] Verify rolling update completed successfully: `kubectl rollout status deployment/todo-chatbot-backend`
- [ ] T068 [US1] Test Helm rollback: `helm rollback todo-chatbot`
- [ ] T069 [US1] Verify rollback completed successfully and application still works
- [ ] T070 [US1] Document deployment process in specs/001-k8s-deployment/deployment-log.md

**Checkpoint**: Todo Chatbot is fully deployed on Kubernetes and all Phase III functionality is verified

---

## Phase 6: User Story 4 - Integrate AI-Assisted Kubernetes Operations (Priority: P4)

**Goal**: Demonstrate AI-assisted Kubernetes operations using kubectl-ai and kagent

**Independent Test**: AI tools successfully execute Kubernetes operations with natural language commands

**Technical Note**: This is P4 (enhancement) and can be completed after core deployment is working

### Implementation for User Story 4

- [ ] T071 [P] [US4] Test kubectl-ai for deployment inspection: `kubectl ai "Show me the status of all pods"`
- [ ] T072 [P] [US4] Test kubectl-ai for scaling: `kubectl ai "Scale the backend deployment to 3 replicas"`
- [ ] T073 [P] [US4] Test kubectl-ai for debugging: `kubectl ai "Why is the frontend pod failing?"` (if any issues)
- [ ] T074 [P] [US4] Test kubectl-ai for resource inspection: `kubectl ai "Get all services in the default namespace"`
- [ ] T075 [P] [US4] Test kagent for resource optimization: `kagent optimize resources` (if available)
- [ ] T076 [P] [US4] Test kagent for troubleshooting: `kagent diagnose --pod <pod-name>` (if available)
- [ ] T077 [P] [US4] Test kagent for security scan: `kagent security-scan --deployment todo-chatbot-backend` (if available)
- [ ] T078 [US4] Document AI-assisted operations examples in specs/001-k8s-deployment/ai-operations-examples.md
- [ ] T079 [US4] Create fallback kubectl commands for each AI operation in case AI tools are unavailable
- [ ] T080 [US4] Verify at least 80% of required Kubernetes operations can be executed via AI tools

**Checkpoint**: AI-assisted operations are demonstrated and documented

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and documentation

- [ ] T081 [P] Update quickstart.md with actual deployment experience and any corrections
- [ ] T082 [P] Create troubleshooting guide in specs/001-k8s-deployment/troubleshooting.md
- [ ] T083 [P] Document edge cases and their resolutions in specs/001-k8s-deployment/edge-cases.md
- [ ] T084 [P] Verify all success criteria from spec.md are met
- [ ] T085 [P] Run security scan on deployed pods: `kubectl exec <pod-name> -- <security-scan-command>`
- [ ] T086 [P] Verify resource limits are appropriate: `kubectl top pods`
- [ ] T087 [P] Test deployment reproducibility by uninstalling and reinstalling: `helm uninstall todo-chatbot && helm install todo-chatbot ./helm/todo-chatbot`
- [ ] T088 [P] Count human interventions during deployment (must be ≤ 3 per success criteria)
- [ ] T089 [P] Measure deployment time (must be ≤ 5 minutes per success criteria)
- [ ] T090 [P] Measure response times (must be < 1 second per success criteria)
- [ ] T091 Create final deployment report in specs/001-k8s-deployment/deployment-report.md
- [ ] T092 Clean up test resources if needed: `minikube delete` (optional, for fresh start)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **US2 Containerization (Phase 3)**: Depends on Foundational completion - BLOCKS US3 and US1
- **US3 Helm Charts (Phase 4)**: Depends on US2 completion - BLOCKS US1
- **US1 Deployment (Phase 5)**: Depends on US2 and US3 completion - Core deliverable
- **US4 AI Operations (Phase 6)**: Depends on US1 completion - Enhancement
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 2 (P2 - Containerization)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P3 - Helm Charts)**: Depends on US2 (needs container images) - Independent of US1 and US4
- **User Story 1 (P1 - Deployment)**: Depends on US2 and US3 (needs images and Helm chart) - Core deliverable
- **User Story 4 (P4 - AI Operations)**: Depends on US1 (needs deployed cluster) - Enhancement

### Within Each User Story

- **US2**: Image generation → Build → Scan → Test → Load into Minikube
- **US3**: Chart structure → Templates → Validation → Dry-run
- **US1**: Secrets → Install → Verify → Test functionality → Upgrade/Rollback
- **US4**: Test AI tools → Document → Create fallbacks

### Parallel Opportunities

- **Phase 1**: T004-T009 (all tool installations) can run in parallel
- **Phase 2**: T012-T013 (Minikube addons), T014-T017 (health endpoints) can run in parallel
- **Phase 3 (US2)**: T020-T021 (Dockerfile generation), T024-T025 (security scans) can run in parallel
- **Phase 4 (US3)**: T032-T043 (all Helm template files) can run in parallel
- **Phase 6 (US4)**: T071-T077 (all AI tool tests) can run in parallel
- **Phase 7**: T081-T090 (all documentation and verification tasks) can run in parallel

---

## Parallel Example: User Story 2 (Containerization)

```bash
# Launch Dockerfile generation in parallel:
Task: "Generate optimized Dockerfile for frontend using Docker AI Agent (Gordon) in frontend/Dockerfile"
Task: "Generate optimized Dockerfile for backend using Docker AI Agent (Gordon) in backend/Dockerfile"

# After images are built, run security scans in parallel:
Task: "Run security scan on frontend image: docker scan todo-chatbot-frontend:0.1.0"
Task: "Run security scan on backend image: docker scan todo-chatbot-backend:0.1.0"
```

## Parallel Example: User Story 3 (Helm Charts)

```bash
# Launch all Helm template creation in parallel:
Task: "Create Chart.yaml in helm/todo-chatbot/Chart.yaml"
Task: "Create values.yaml in helm/todo-chatbot/values.yaml"
Task: "Create _helpers.tpl in helm/todo-chatbot/templates/_helpers.tpl"
Task: "Create frontend-deployment.yaml in helm/todo-chatbot/templates/frontend-deployment.yaml"
Task: "Create frontend-service.yaml in helm/todo-chatbot/templates/frontend-service.yaml"
Task: "Create backend-deployment.yaml in helm/todo-chatbot/templates/backend-deployment.yaml"
Task: "Create backend-service.yaml in helm/todo-chatbot/templates/backend-service.yaml"
Task: "Create configmap.yaml in helm/todo-chatbot/templates/configmap.yaml"
Task: "Create secrets.yaml in helm/todo-chatbot/templates/secrets.yaml"
Task: "Create NOTES.txt in helm/todo-chatbot/templates/NOTES.txt"
Task: "Create README.md in helm/todo-chatbot/README.md"
Task: "Create .helmignore in helm/.helmignore"
```

---

## Implementation Strategy

### MVP First (Core Deployment)

1. Complete Phase 1: Setup (verify prerequisites)
2. Complete Phase 2: Foundational (Minikube + health endpoints)
3. Complete Phase 3: US2 - Containerization
4. Complete Phase 4: US3 - Helm Charts
5. Complete Phase 5: US1 - Deployment (MVP!)
6. **STOP and VALIDATE**: Test full deployment independently
7. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add US2 (Containerization) → Test images independently
3. Add US3 (Helm Charts) → Validate chart independently
4. Add US1 (Deployment) → Test full deployment → Deploy/Demo (MVP!)
5. Add US4 (AI Operations) → Test AI tools → Deploy/Demo (Enhanced!)
6. Add Polish → Final validation → Production-ready

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: US2 (Containerization)
   - Developer B: US3 (Helm Charts) - starts after US2 images are ready
   - Developer C: Documentation and preparation
3. Once US2 and US3 complete:
   - Developer A: US1 (Deployment)
   - Developer B: US4 (AI Operations) - starts after US1 deployment is ready
   - Developer C: Polish and validation

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- User stories are ordered by technical dependencies, not priority labels
- US1 (P1) is the core deliverable but depends on US2 and US3
- Each user story should be independently testable at its checkpoint
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- AI-assisted tools (Gordon, kubectl-ai, kagent) are preferred but fallbacks exist
- Maximum 3 human interventions allowed per constitution requirement
- Deployment must complete within 5 minutes per success criteria
- Security scan compliance must be 95% or higher

---

## Task Count Summary

- **Total Tasks**: 92
- **Phase 1 (Setup)**: 9 tasks
- **Phase 2 (Foundational)**: 10 tasks
- **Phase 3 (US2 - Containerization)**: 11 tasks
- **Phase 4 (US3 - Helm Charts)**: 16 tasks
- **Phase 5 (US1 - Deployment)**: 24 tasks
- **Phase 6 (US4 - AI Operations)**: 10 tasks
- **Phase 7 (Polish)**: 12 tasks

**Parallel Opportunities**: 45 tasks marked [P] can run in parallel within their phases
