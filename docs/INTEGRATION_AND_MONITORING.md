# Student Expenses Management â€” Integration & Monitoring Architecture

This document details the end-to-end integration pipeline, monitoring architecture, health verification runbooks, and failure recovery protocols for the Student Expenses Management system across Docker, Jenkins CI, and Kubernetes (Minikube on Windows).

---

## 1. System Architecture & Responsibilities

```
                                  +-----------------------------------------------+
                                  |         Kubernetes Cluster (Minikube)         |
                                  |          Namespace: student-expenses          |
                                  |                                               |
[ User Browser ]                  |  +-----------------------------------------+  |
       |                          |  | Frontend Service (ClusterIP: Port 80)   |  |
       | :8090 (Port-Forward)     |  +--------------------+--------------------+  |
       v                          |                       |                       |
[ Nginx Reverse Proxy ] --------> |                       v                       |
   (React SPA static files)       |             [ Nginx Container (Alpine) ]      |
   (/api reverse proxy)           |              - Serves React dist bundle       |
       |                          |              - Proxies /api -> backend:5000   |
       |                          |                       |                       |
       |                          |                       v                       |
       |                          |  +-----------------------------------------+  |
       |                          |  | Backend Service (ClusterIP: Port 5000)  |  |
       |                          |  +--------------------+--------------------+  |
       |                          |                       |                       |
       v                          |                       v                       |
[ Express API Gateway ] --------> |            [ Node.js Backend Container ]      |
   - Port 5000                    |              - JWT Auth, Expenses, Budgets    |
   - /api/health probe            |              - initContainer (waits for DB)   |
       |                          |                       |                       |
       v                          |                       v                       |
[ MongoDB 7 Data Store ] -------> |  +-----------------------------------------+  |
   - ClusterIP: Port 27017        |  | MongoDB Service (ClusterIP: Port 27017) |  |
   - PersistentVolumeClaim        |  +--------------------+--------------------+  |
                                  |                       |                       |
                                  |                       v                       |
                                  |               [ MongoDB 7 Container ]         |
                                  |               Mount: /data/db                 |
                                  |               PVC: mongodb-data (1Gi Bound)   |
                                  |  +-----------------------------------------+  |
                                  +-----------------------------------------------+
```

### Component Responsibilities

| Component | Technology | Role | Port | Health / Probing Mechanism |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend** | React 18, Vite, Nginx Alpine | Serves production SPA assets; proxies `/api/*` to backend service | 80 (internal) / 8090 (host) | `readinessProbe` & `livenessProbe`: HTTP GET `/` |
| **Backend** | Node.js 20, Express 4.21, Mongoose | API gateway, JWT authentication, business logic, unified health | 5000 | `startupProbe` & `livenessProbe`: HTTP GET `/api/health`; `readinessProbe`: Node.js fetch checking `database.status == connected` |
| **Init Container**| Mongo 7 Alpine | Pre-startup synchronization | â€” | `mongosh --host mongodb --port 27017` ping loop before Express boots |
| **Database** | MongoDB 7.0 | Document store for users, expenses, budgets | 27017 | `startupProbe`, `readinessProbe`, `livenessProbe`: `mongosh db.adminCommand('ping')` with 8s timeout |
| **Persistent Storage** | Minikube hostpath SC | Preserves database records across pod lifecycles | â€” | PVC `mongodb-data` Bound to persistent volume |
| **Metrics Collector** | Kubernetes Metrics Server | Live CPU/Memory telemetry for nodes and pods | 4443 | `kubectl top nodes`, `kubectl top pods -n student-expenses` |

---

## 2. Integration Pipeline Workflow

The complete lifecycle moves deterministically across five stages:

```
[ GitHub Source ] â”€â”€> [ Jenkins CI Pipeline ] â”€â”€> [ Docker Images ] â”€â”€> [ Minikube K8s ] â”€â”€> [ Live Verification ]
  (Git Repository)     - Verify Tools               - backend:local        - Namespaces & PVC     - /api/health (200)
                       - npm ci                     - frontend:local       - ConfigMap & Secret   - React SPA Assets
                       - npm run build:client                              - Deployments & Svcs   - MongoDB Connected
                       - Validate K8s Manifests                            - Rolling Updates      - Metrics Telemetry
                       - npm test (65+ tests)
```

### CI/CD Capabilities & Identified Gaps

1. **Jenkins Capabilities**:
   - Automated testing on commit/PR via Node.js native test runner (`node --test tests/run_all_tests.js`).
   - Secure credential injection for `JWT_SECRET` via Jenkins Credentials binding.
   - Deterministic client build verification (`npm run build:client`).
   - Non-breaking Kubernetes manifest dry-run validation (`kubectl apply --dry-run=client -f k8s/`).

2. **Integration Gaps & Resolutions**:
   - *Previous Gap*: CI tested unit and persistence layers on host MongoDB but omitted `/api/health` integration validation and Kubernetes manifest syntax checks.
   - *Resolution*: Implemented `tests/08_system_health_integration.test.js` covering health endpoints, CORS, and 404 responses; integrated conditional Kubernetes manifest dry-run stage in `Jenkinsfile`.
   - *Deployment Boundary*: Automated deployment from CI into Minikube is deliberately omitted to prevent exposing cluster credentials in build environments. Deployments remain declarative through verified manifests.

---

## 3. Monitoring System & Resource Telemetry

### Monitoring Architecture Strategy
- **Native Kubernetes Metrics Server**: Activated via `minikube addons enable metrics-server`. Lightweight, zero-overhead telemetry providing exact CPU/Memory utilization per pod and node without deploying heavy Prometheus/Grafana infrastructure into local development.
- **Unified Health Endpoint (`/api/health`)**: Exposes JSON telemetry with system timestamp, environment, database status (`connected`, `disconnected`, `connecting`), and domain route registrations.
- **Automated PowerShell Console (`k8s/monitor-health.ps1`)**: Single-command monitoring tool providing visual indicators of cluster state, resource metrics, pod stability, storage bindings, and API availability.

### Executing the Monitoring Console

Run from repository root in Windows PowerShell:

```powershell
.\k8s\monitor-health.ps1
```

For custom port-forwarding ports:
```powershell
.\k8s\monitor-health.ps1 -Port 8090
```

### Healthy Output Signature

```
================================================================================
   STUDENT EXPENSES MANAGEMENT - KUBERNETES MONITORING CONSOLE
   Timestamp: 2026-10-13 04:13:31 | Namespace: student-expenses
================================================================================

[1/6] Inspecting Cluster Nodes...
  -> Node: minikube | Ready: True | Kubelet: v1.37.0

[2/6] Inspecting Resource Utilization (Metrics API)...
  Node Utilization:
     minikube   516m   6%    1607Mi   20%
  Pod Resource Usage:
     backend-7c648dd564-v7fn2    67m    110Mi
     frontend-5fdf679748-xspt2   1m     9Mi
     mongodb-5468d8ccb8-62jnw    155m   182Mi

[3/6] Inspecting Pod Readiness and Stability...
  -> Pod: backend-7c648dd564-v7fn2 | Phase: Running | Ready: True | Restarts: 0
  -> Pod: frontend-5fdf679748-xspt2 | Phase: Running | Ready: True | Restarts: 0
  -> Pod: mongodb-5468d8ccb8-62jnw | Phase: Running | Ready: True | Restarts: 0

[4/6] Inspecting Persistent Storage...
  -> PVC: mongodb-data | Status: Bound | Capacity: 1Gi

[5/6] Inspecting Service Endpoints...
  -> Service: backend | Active Endpoints: 1
  -> Service: frontend | Active Endpoints: 1
  -> Service: mongodb | Active Endpoints: 1

[6/6] Probing Application /api/health Endpoint...
  -> [PORT-FORWARD 8090] API Status: healthy | DB Status: connected

================================================================================
   SYSTEM STATUS: HEALTHY AND OPERATIONAL (ALL PROBES PASS)
================================================================================
```

---

## 4. Verification & Reliability Procedures

### Running the End-to-End Verification Suite

Run from repository root in Windows PowerShell:

```powershell
.\k8s\verify-deployment.ps1
```

### Verification Matrix & Actual Results

| Test ID | Verification Target | Command / Probe | Result | Observed Evidence |
| :--- | :--- | :--- | :--- | :--- |
| **VER-01** | Kubernetes Node Health | `kubectl get nodes` | **PASS** | Minikube node condition `Ready == True` |
| **VER-02** | Persistent Volume Claim | `kubectl get pvc mongodb-data` | **PASS** | `mongodb-data` is `Bound` to volume `pvc-8b4fd...` |
| **VER-03** | MongoDB Engine Ping | `mongosh --eval "db.adminCommand('ping')"` | **PASS** | Database engine returned `{ ok: 1 }` |
| **VER-04** | Backend API & DB Link | `GET /api/health` | **PASS** | HTTP 200, `database.status == connected` |
| **VER-05** | Frontend React SPA | `GET /` | **PASS** | Nginx served HTML containing React root element |
| **VER-06** | Reverse Proxy Routing | `GET /api/health` via Nginx | **PASS** | Request proxied to backend; returns identical health JSON |
| **VER-07** | Metrics Server Integration | `kubectl top pods -n student-expenses` | **PASS** | Live CPU cores & memory bytes returned for all 3 pods |
| **VER-08** | Pod Replacement Resilience | `kubectl rollout restart deployment/backend` | **PASS** | New pod booted, initContainer waited, reconnected to DB with 0 errors |

---

## 5. Probes & Health Check Design Philosophy

### Liveness vs Readiness Separation
1. **Liveness Probe**:
   - `backend`: Queries HTTP GET `/api/health`. Express always returns HTTP 200 even if MongoDB is temporarily connecting or disconnected. **Prevents the backend from being crash-looped simply because the database is restarting.**
   - `mongodb`: Queries `mongosh db.adminCommand('ping')` with a generous **8-second timeout** and 15-second period.
2. **Readiness Probe**:
   - `backend`: Executes a Node.js script that checks `response.database.status === 'connected'`. If the database is disconnected, the container exits with code 1. **Prevents incoming user requests from reaching the pod until database queries can succeed.**
   - `frontend`: Queries HTTP GET `/`. Ensures Nginx has started and the React bundle is mounted before receiving traffic.
3. **Startup Probe**:
   - `mongodb`: Increased timeout from 3s to **8s** with `failureThreshold: 24`. On Windows container storage, `mongosh` invocation can take 3.5s under cold start; the 8s threshold eliminates spurious kubelet kills.
   - `backend`: `initContainers: wait-for-mongodb` polls MongoDB ping until exit code 0 before Express starts up.

---

## 6. Troubleshooting Runbook

### Issue A: Port-Forward Fails with "bind: An attempt was made to access a socket in a way forbidden"
- **Root Cause**: Windows Hyper-V dynamic port exclusions reserve certain port ranges (commonly including port 8080).
- **Fix**: Use port `8090` (or `8085`):
  ```powershell
  kubectl port-forward service/frontend 8090:80 -n student-expenses
  ```

### Issue B: MongoDB Pod Keeps Restarting (`Startup probe failed`)
- **Root Cause**: `mongosh` process took longer than probe timeout to initialize.
- **Fix**: Ensure `k8s/02-mongodb.yaml` has `timeoutSeconds: 8` or higher. Check logs:
  ```powershell
  kubectl logs deployment/mongodb -n student-expenses --previous
  ```

### Issue C: Backend Pod Reports `0/1 READY`
- **Root Cause**: Express is running, but database connection pool has not reached `connected` state.
- **Fix**: Check initContainer status and MongoDB endpoint:
  ```powershell
  kubectl describe pod -l app.kubernetes.io/name=backend -n student-expenses
  kubectl logs -l app.kubernetes.io/name=backend -n student-expenses -c wait-for-mongodb
  ```

### Issue D: Metrics Server Returns `Metrics API not available`
- **Root Cause**: Addon not enabled or still scraping first cycle (takes 30-60 seconds after enable).
- **Fix**:
  ```powershell
  minikube addons enable metrics-server
  kubectl get pods -n kube-system -l k8s-app=metrics-server
  ```

---

## 7. Evaluator Demonstration Walkthrough

Follow this sequence to demonstrate the integrated system:

1. **Verify Cluster Health & Workloads**:
   ```powershell
   kubectl get pods,services,pvc -n student-expenses -o wide
   ```
   *Expected*: All 3 pods `1/1 Running`, PVC `Bound`, ClusterIP services active.

2. **Run Real-Time Monitoring Console**:
   ```powershell
   .\k8s\monitor-health.ps1
   ```
   *Expected*: Green status across nodes, pods, PVCs, endpoints, and live CPU/RAM metrics.

3. **Run Automated End-to-End Verification**:
   ```powershell
   .\k8s\verify-deployment.ps1
   ```
   *Expected*: 7/7 tests reported as `PASS` in the summary matrix.

4. **Start Application Port-Forward**:
   ```powershell
   kubectl port-forward service/frontend 8090:80 -n student-expenses
   ```

5. **Interact in Web Browser**:
   - Navigate to `http://localhost:8090`
   - Observe React SPA loads with assets.
   - Navigate to `http://localhost:8090/api/health`
   - Observe JSON response confirming `status: healthy` and `database.status: connected`.
