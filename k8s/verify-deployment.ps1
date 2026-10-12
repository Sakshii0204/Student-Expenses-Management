<#
.SYNOPSIS
    Student Expenses Management - Complete Deployment & Integration Verification
.DESCRIPTION
    Executes automated end-to-end verification tests against the local Kubernetes cluster:
    tests nodes, pods, PVCs, MongoDB ping, backend health, frontend assets, and proxy routing.
.EXAMPLE
    .\k8s\verify-deployment.ps1
#>

[CmdletBinding()]
param(
    [string]$Namespace = 'student-expenses',
    [int]$Port = 8090
)

$ErrorActionPreference = 'Continue'
$tests = [System.Collections.Generic.List[PSCustomObject]]::new()

function Add-TestResult {
    param([string]$Name, [string]$Status, [string]$Evidence)
    $tests.Add([PSCustomObject]@{
        TestName = $Name
        Status   = $Status
        Evidence = $Evidence
    })
}

Write-Host ''
Write-Host '================================================================================' -ForegroundColor Cyan
Write-Host "   STUDENT EXPENSES MANAGEMENT - VERIFICATION RUNNER" -ForegroundColor Cyan
Write-Host "   Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | Target Namespace: $Namespace" -ForegroundColor Cyan
Write-Host '================================================================================' -ForegroundColor Cyan
Write-Host ''

# Test 1: Kubernetes Node Status
Write-Host '[Test 1] Checking Kubernetes Node Readiness...' -ForegroundColor Yellow
try {
    $nodeJson = kubectl get nodes -o json | ConvertFrom-Json
    $readyCondition = $nodeJson.items[0].status.conditions | Where-Object { $_.type -eq 'Ready' }
    $isReady = $readyCondition.status -eq 'True'
    if ($isReady) {
        Add-TestResult 'Cluster Node Readiness' 'PASS' 'Minikube node condition Ready is True'
        Write-Host '  [PASS] Node is Ready' -ForegroundColor Green
    } else {
        Add-TestResult 'Cluster Node Readiness' 'FAIL' "Node condition Ready is $($readyCondition.status)"
        Write-Host "  [FAIL] Node condition Ready is $($readyCondition.status)" -ForegroundColor Red
    }
} catch {
    Add-TestResult 'Cluster Node Readiness' 'FAIL' "$_"
    Write-Host "  [FAIL] Exception: $_" -ForegroundColor Red
}

# Test 2: MongoDB PVC Binding
Write-Host '[Test 2] Checking MongoDB PersistentVolumeClaim Binding...' -ForegroundColor Yellow
try {
    $pvcPhase = kubectl get pvc mongodb-data -n $Namespace -o jsonpath='{.status.phase}' 2>$null
    if ($pvcPhase -eq 'Bound') {
        Add-TestResult 'MongoDB PVC Binding' 'PASS' 'mongodb-data PVC is Bound'
        Write-Host '  [PASS] PVC mongodb-data is Bound' -ForegroundColor Green
    } else {
        Add-TestResult 'MongoDB PVC Binding' 'FAIL' "PVC phase is $pvcPhase"
        Write-Host "  [FAIL] PVC phase is $pvcPhase" -ForegroundColor Red
    }
} catch {
    Add-TestResult 'MongoDB PVC Binding' 'FAIL' "$_"
    Write-Host "  [FAIL] Exception: $_" -ForegroundColor Red
}

# Test 3: MongoDB Direct Ping
Write-Host '[Test 3] Executing MongoDB Ping inside Pod...' -ForegroundColor Yellow
try {
    $ping = kubectl exec -n $Namespace deployment/mongodb -- mongosh --quiet --eval "db.adminCommand('ping').ok" 2>$null
    if ($ping -match '1') {
        Add-TestResult 'MongoDB Database Ping' 'PASS' 'Admin command ping returned ok: 1'
        Write-Host '  [PASS] MongoDB ping returned { ok: 1 }' -ForegroundColor Green
    } else {
        Add-TestResult 'MongoDB Database Ping' 'FAIL' "Output: $ping"
        Write-Host "  [FAIL] Ping output unexpected: $ping" -ForegroundColor Red
    }
} catch {
    Add-TestResult 'MongoDB Database Ping' 'FAIL' "$_"
    Write-Host "  [FAIL] Exception: $_" -ForegroundColor Red
}

# Test 4: Backend Pod Readiness and Database Connection
Write-Host '[Test 4] Checking Backend /api/health and Database State...' -ForegroundColor Yellow
try {
    $healthRaw = kubectl exec -n $Namespace deployment/backend -c backend -- node -e "fetch('http://127.0.0.1:5000/api/health').then(function(r){return r.text();}).then(function(t){console.log(t);})" 2>$null
    $health = $healthRaw | ConvertFrom-Json
    if ($health.status -eq 'healthy' -and $health.database.status -eq 'connected') {
        Add-TestResult 'Backend /api/health Probe' 'PASS' "Status: healthy, DB: connected, configured: $($health.database.configured)"
        Write-Host '  [PASS] Backend reports status healthy and DB connected' -ForegroundColor Green
    } else {
        Add-TestResult 'Backend /api/health Probe' 'FAIL' "Response: $healthRaw"
        Write-Host "  [FAIL] Backend response degraded: $healthRaw" -ForegroundColor Red
    }
} catch {
    Add-TestResult 'Backend /api/health Probe' 'FAIL' "$_"
    Write-Host "  [FAIL] Exception: $_" -ForegroundColor Red
}

# Test 5: Frontend HTTP 200 Root Response
Write-Host '[Test 5] Checking Frontend Root Page (Nginx React SPA)...' -ForegroundColor Yellow
try {
    $feHtml = kubectl exec -n $Namespace deployment/frontend -- wget -qO- http://127.0.0.1/ 2>$null
    if ($feHtml -match 'Student Expense Management' -and $feHtml -match '<div id="root">') {
        Add-TestResult 'Frontend SPA Root Route' 'PASS' 'Nginx serves React HTML with root container'
        Write-Host '  [PASS] Frontend served valid React SPA index.html' -ForegroundColor Green
    } else {
        Add-TestResult 'Frontend SPA Root Route' 'FAIL' 'React bundle root container missing'
        Write-Host '  [FAIL] Frontend did not return expected index.html' -ForegroundColor Red
    }
} catch {
    Add-TestResult 'Frontend SPA Root Route' 'FAIL' "$_"
    Write-Host "  [FAIL] Exception: $_" -ForegroundColor Red
}

# Test 6: Frontend-to-Backend Nginx Reverse Proxy
Write-Host '[Test 6] Checking Frontend /api Proxy to Backend Service...' -ForegroundColor Yellow
try {
    $proxyRaw = kubectl exec -n $Namespace deployment/frontend -- wget -qO- http://127.0.0.1/api/health 2>$null
    $proxyJson = $proxyRaw | ConvertFrom-Json
    if ($proxyJson.status -eq 'healthy' -and $proxyJson.database.status -eq 'connected') {
        Add-TestResult 'Nginx /api Reverse Proxy' 'PASS' 'Frontend proxies /api/health to backend successfully'
        Write-Host '  [PASS] Reverse proxy successfully forwarded /api/health to backend' -ForegroundColor Green
    } else {
        Add-TestResult 'Nginx /api Reverse Proxy' 'FAIL' "Proxy response: $proxyRaw"
        Write-Host "  [FAIL] Proxy returned unexpected payload: $proxyRaw" -ForegroundColor Red
    }
} catch {
    Add-TestResult 'Nginx /api Reverse Proxy' 'FAIL' "$_"
    Write-Host "  [FAIL] Exception: $_" -ForegroundColor Red
}

# Test 7: Metrics Server Integration (Native CPU/Memory)
Write-Host '[Test 7] Checking Metrics Server Resource Metrics...' -ForegroundColor Yellow
try {
    $podMetrics = kubectl top pods -n $Namespace --no-headers 2>$null
    if ($LASTEXITCODE -eq 0 -and $podMetrics) {
        Add-TestResult 'Resource Metrics Server' 'PASS' 'Pod CPU and Memory metrics collected successfully'
        Write-Host '  [PASS] Metrics Server actively collecting pod metrics' -ForegroundColor Green
    } else {
        Add-TestResult 'Resource Metrics Server' 'WARN' 'Metrics Server initializing or unavailable'
        Write-Host '  [WARN] Metrics not yet ready' -ForegroundColor Yellow
    }
} catch {
    Add-TestResult 'Resource Metrics Server' 'WARN' "$_"
    Write-Host "  [WARN] Exception: $_" -ForegroundColor Yellow
}

Write-Host ''
Write-Host '================================================================================' -ForegroundColor Cyan
Write-Host '   VERIFICATION SUMMARY MATRIX' -ForegroundColor Cyan
Write-Host '================================================================================' -ForegroundColor Cyan
$tests | Format-Table -AutoSize -Property TestName, Status, Evidence
Write-Host ''
