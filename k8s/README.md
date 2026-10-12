# Kubernetes deployment (Windows and Minikube)

These manifests run the production React build, Express API, and MongoDB in the
`student-expenses` namespace. Services are cluster-internal (`ClusterIP`); the
frontend is reached locally with `kubectl port-forward`. The manifests use the
existing application Dockerfiles and build images directly into Minikube.

> This is a local learning/development setup, not a production hardening guide.
> MongoDB has no authentication, matching the existing Compose configuration.
> Keep the cluster local and do not expose the MongoDB service outside it.

## 1. Check Docker Desktop, Minikube, and kubectl

Start Docker Desktop, then in PowerShell from the repository root:

```powershell
docker info
minikube status
kubectl config current-context
kubectl get nodes -o wide
```

Minikube should report its control plane and kubelet as `Running`, the context
should be `minikube`, and the node should be `Ready`. If the context is
different, switch only if you intend to deploy to Minikube:

```powershell
kubectl config use-context minikube
```

## 2. Build the application images in Minikube

Run these from the repository root. The Vite API base is baked into the frontend
at build time; `/api` keeps browser requests on the same origin and lets Nginx
forward them to the in-cluster backend Service.

```powershell
minikube image build -t student-expenses-backend:local .\integration\server
minikube image build -t student-expenses-frontend:local .\integration\client
```

Kubernetes uses these exact image names with `imagePullPolicy: IfNotPresent`;
neither image is pushed to a registry. Rebuild both images after changing the
corresponding app code, Dockerfile, frontend Nginx configuration, or Vite
build-time settings.

## 3. Create or update the JWT Secret locally

The Secret is intentionally not stored in this repository. Generate a new
32-byte secret in the current PowerShell session and send it directly to the
Kubernetes API (no credential file is created):

```powershell
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$jwtSecret = [Convert]::ToBase64String($bytes)

kubectl create secret generic student-expenses-secrets `
  --namespace student-expenses `
  --from-literal="JWT_SECRET=$jwtSecret" `
  --dry-run=client -o yaml | kubectl apply -f -

$jwtSecret = $null
$rng.Dispose()
[Array]::Clear($bytes, 0, $bytes.Length)
```

Run this again to rotate/update the value. Kubernetes Secrets are base64
encoded, not encrypted by that encoding; anyone with sufficient cluster access
can read them. Do not paste a real secret into a tracked manifest, source file,
or shared terminal transcript. The namespace must exist first.

## 4. Apply resources in dependency order

From the repository root:

```powershell
kubectl apply -f .\k8s\00-namespace.yaml
kubectl apply -f .\k8s\01-configmap.yaml
```

Create the Secret using section 3, then apply the database before the API and
the API before the frontend:

```powershell
kubectl apply -f .\k8s\02-mongodb.yaml
kubectl apply -f .\k8s\03-backend.yaml
kubectl apply -f .\k8s\04-frontend.yaml
```

The backend init container waits for MongoDB to answer a ping before the
application starts. MongoDB readiness/liveness probes also check a ping. The
backend health route always returns HTTP 200 and reports database state in its
JSON; therefore readiness additionally checks that state is `connected`, while
liveness checks only that the HTTP process responds. This avoids restarting
the API just because MongoDB is temporarily unavailable.

## 5. Wait for workloads and inspect them

```powershell
kubectl get pods,services,pvc -n student-expenses
kubectl rollout status deployment/mongodb -n student-expenses --timeout=180s
kubectl rollout status deployment/backend -n student-expenses --timeout=180s
kubectl rollout status deployment/frontend -n student-expenses --timeout=180s
```

All three pods should show `1/1` in `READY`, and the PVC should show `Bound`.
If a rollout does not complete, use the diagnostics in section 8.

## 6. Open the frontend and check API/database connectivity

Keep this command running in one PowerShell window. Port 8090 was verified on the development machine; if it is unavailable on another machine, choose a free local port:

```powershell
kubectl port-forward service/frontend 8090:80 -n student-expenses
```

To stop the port-forward at any time, press `Ctrl + C` in that PowerShell window.

Open `http://localhost:8090` in a browser, or verify the SPA response from another PowerShell window:

```powershell
(Invoke-WebRequest http://localhost:8090/).StatusCode
```

Nginx serves the React app, falls back to `index.html` for client-side routes, and proxies `/api/...` to `backend.student-expenses.svc.cluster.local:5000`.
Check the API through the same frontend origin:

```powershell
$health = Invoke-RestMethod http://localhost:8090/api/health
$health | ConvertTo-Json -Depth 5
```

Expect `status` to be `healthy` and `database.status` to be `connected`. The browser client also uses `/api`; it does not need or receive a Kubernetes-only hostname. Confirm MongoDB responds directly inside its pod:

```powershell
kubectl exec -n student-expenses deployment/mongodb -- mongosh --quiet --eval "db.adminCommand('ping')"
```

## 7. Rebuild and roll out code changes

Rebuild the changed image using the commands in section 2. Then restart its
Deployment so Kubernetes creates pods from the newly built local image:

```powershell
kubectl rollout restart deployment/backend -n student-expenses
kubectl rollout status deployment/backend -n student-expenses --timeout=180s
```

For frontend changes, use `deployment/frontend` instead. If both changed,
restart and wait for both Deployments. Do not change the image tag unless you
also update the matching manifest.

## 8. Logs and troubleshooting

```powershell
kubectl get pods -n student-expenses -o wide
kubectl describe pods -n student-expenses
kubectl logs deployment/backend -n student-expenses
kubectl logs deployment/mongodb -n student-expenses
kubectl logs deployment/frontend -n student-expenses
kubectl logs deployment/backend -n student-expenses --previous
kubectl get events -n student-expenses --sort-by=.lastTimestamp
```

`--previous` is useful after a container restart. For `ImagePullBackOff`, check
the image name and that the image was built into the current Minikube profile.
For a pending PVC, check `kubectl describe pvc mongodb-data -n student-expenses`
and the Minikube storage provisioner. Backend readiness remains false until
MongoDB is connected; check both workloads' logs and the health JSON.

## 9. Remove the deployment

To remove the app, database Deployment/Service, ConfigMap, and Secret while
retaining the PVC and its data:

```powershell
kubectl delete -f .\k8s\04-frontend.yaml
kubectl delete -f .\k8s\03-backend.yaml
kubectl delete deployment/mongodb service/mongodb -n student-expenses
kubectl delete configmap student-expenses-config -n student-expenses
kubectl delete secret student-expenses-secrets -n student-expenses
```

The PVC is not deleted by the above commands. **Deleting the PVC or the
PersistentVolume/data it refers to can permanently destroy MongoDB data.**
Only when you intentionally want to discard that data, remove the PVC:

```powershell
kubectl delete pvc mongodb-data -n student-expenses
```

To remove the namespace and all remaining namespaced resources (including the
PVC and Secret), after confirming you accept the data loss:

```powershell
kubectl delete namespace student-expenses
```


