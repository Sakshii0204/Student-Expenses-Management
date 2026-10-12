<#
.SYNOPSIS
    Student Expenses Management - Real-Time Kubernetes Cluster and Application Monitoring

.DESCRIPTION
    Inspects Kubernetes nodes, pods, services, PVCs, live resource utilization
    (CPU/RAM), application /api/health status, and namespace event anomalies.

.EXAMPLE
    powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\k8s\monitor-health.ps1

.EXAMPLE
    powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\k8s\monitor-health.ps1 -Port 8090
#>

[CmdletBinding()]
param(
    [string]$Namespace = 'student-expenses',
    [ValidateRange(1, 65535)]
    [int]$Port = 8090
)

$ErrorActionPreference = 'Continue'

# Overall health flags
$allNodesHealthy = $false
$allPodsHealthy = $false
$allPvcsHealthy = $true
$allServicesHealthy = $false
$directProbeHealthy = $false
$metricsAvailable = $false

Write-Host ''
Write-Host '================================================================================' -ForegroundColor Cyan
Write-Host '   STUDENT EXPENSES MANAGEMENT - KUBERNETES MONITORING CONSOLE' -ForegroundColor Cyan
Write-Host "   Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | Namespace: $Namespace" -ForegroundColor Cyan
Write-Host '================================================================================' -ForegroundColor Cyan
Write-Host ''

# 1. Cluster and Node Health
Write-Host '[1/6] Inspecting Cluster Nodes...' -ForegroundColor Yellow

try {
    $nodeRaw = kubectl get nodes -o json 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "kubectl get nodes failed: $nodeRaw"
    }

    $nodes = ($nodeRaw | Out-String | ConvertFrom-Json)
    $nodeItems = @($nodes.items)

    if ($nodeItems.Count -eq 0) {
        throw 'No Kubernetes nodes were found.'
    }

    $allNodesHealthy = $true

    foreach ($node in $nodeItems) {
        $nodeName = $node.metadata.name
        $kubeletVersion = $node.status.nodeInfo.kubeletVersion
        $readyCondition = $node.status.conditions |
            Where-Object { $_.type -eq 'Ready' } |
            Select-Object -First 1

        $isReady = $readyCondition.status -eq 'True'
        $statusColor = if ($isReady) { 'Green' } else { 'Red' }

        if (-not $isReady) {
            $allNodesHealthy = $false
        }

        Write-Host "  -> Node: $nodeName | Ready: $isReady | Kubelet: $kubeletVersion" -ForegroundColor $statusColor
    }
}
catch {
    $allNodesHealthy = $false
    Write-Host "  [!] Failed to query nodes: $_" -ForegroundColor Red
}

# 2. Node Resource Utilization
Write-Host ''
Write-Host '[2/6] Inspecting Resource Utilization (Metrics API)...' -ForegroundColor Yellow

try {
    $topNode = kubectl top node --no-headers 2>&1
    $nodeMetricsExitCode = $LASTEXITCODE

    if ($nodeMetricsExitCode -eq 0) {
        Write-Host '  Node Utilization:' -ForegroundColor Cyan
        $topNode | ForEach-Object {
            Write-Host "     $_" -ForegroundColor Gray
        }
        $metricsAvailable = $true
    }
    else {
        Write-Host '  [i] Node metrics unavailable (metrics-server may be initializing or disabled).' -ForegroundColor DarkGray
    }

    $topPods = kubectl top pods -n $Namespace --no-headers 2>&1
    $podMetricsExitCode = $LASTEXITCODE

    if ($podMetricsExitCode -eq 0) {
        Write-Host '  Pod Resource Usage:' -ForegroundColor Cyan
        $topPods | ForEach-Object {
            Write-Host "     $_" -ForegroundColor Gray
        }
        $metricsAvailable = $true
    }
    else {
        Write-Host '  [i] Pod metrics unavailable.' -ForegroundColor DarkGray
    }
}
catch {
    Write-Host "  [!] Metrics collection failed: $_" -ForegroundColor DarkGray
}

# 3. Workload and Pod Readiness
Write-Host ''
Write-Host '[3/6] Inspecting Pod Readiness and Stability...' -ForegroundColor Yellow

try {
    $podRaw = kubectl get pods -n $Namespace -o json 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "kubectl get pods failed: $podRaw"
    }

    $pods = ($podRaw | Out-String | ConvertFrom-Json)
    $podItems = @($pods.items)

    if ($podItems.Count -eq 0) {
        throw "No pods were found in namespace '$Namespace'."
    }

    $allPodsHealthy = $true

    foreach ($pod in $podItems) {
        $pName = $pod.metadata.name
        $phase = $pod.status.phase
        $containerStatuses = @($pod.status.containerStatuses)

        $restarts = 0
        if ($containerStatuses.Count -gt 0) {
            $restartSum = ($containerStatuses |
                Measure-Object -Property restartCount -Sum).Sum

            if ($null -ne $restartSum) {
                $restarts = [int]$restartSum
            }
        }

        $allContainersReady = (
            $containerStatuses.Count -gt 0 -and
            @($containerStatuses | Where-Object { $_.ready -ne $true }).Count -eq 0
        )

        $podHealthy = ($phase -eq 'Running' -and $allContainersReady)
        $statusColor = if ($podHealthy) { 'Green' } else { 'Red' }

        if (-not $podHealthy) {
            $allPodsHealthy = $false
        }

        Write-Host "  -> Pod: $pName | Phase: $phase | Ready: $allContainersReady | Restarts: $restarts" -ForegroundColor $statusColor
    }
}
catch {
    $allPodsHealthy = $false
    Write-Host "  [!] Failed to inspect pods: $_" -ForegroundColor Red
}

# 4. Storage and PVC Binding
Write-Host ''
Write-Host '[4/6] Inspecting Persistent Storage...' -ForegroundColor Yellow

try {
    $pvcRaw = kubectl get pvc -n $Namespace -o json 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "kubectl get pvc failed: $pvcRaw"
    }

    $pvcs = ($pvcRaw | Out-String | ConvertFrom-Json)
    $pvcItems = @($pvcs.items)

    if ($pvcItems.Count -eq 0) {
        $allPvcsHealthy = $false
        Write-Host "  [!] No PVCs found in namespace '$Namespace'." -ForegroundColor Red
    }
    else {
        foreach ($pvc in $pvcItems) {
            $pvcName = $pvc.metadata.name
            $phase = $pvc.status.phase
            $capacity = $pvc.status.capacity.storage

            if ([string]::IsNullOrWhiteSpace($capacity)) {
                $capacity = 'Not assigned'
            }

            $pvcHealthy = $phase -eq 'Bound'
            $color = if ($pvcHealthy) { 'Green' } else { 'Red' }

            if (-not $pvcHealthy) {
                $allPvcsHealthy = $false
            }

            Write-Host "  -> PVC: $pvcName | Status: $phase | Capacity: $capacity" -ForegroundColor $color
        }
    }
}
catch {
    $allPvcsHealthy = $false
    Write-Host "  [!] Failed to inspect PVCs: $_" -ForegroundColor Red
}

# 5. Service Endpoints - use modern EndpointSlice API
Write-Host ''
Write-Host '[5/6] Inspecting Service Endpoints...' -ForegroundColor Yellow

try {
    $sliceRaw = kubectl get endpointslices.discovery.k8s.io -n $Namespace -o json 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "kubectl get EndpointSlices failed: $sliceRaw"
    }

    $sliceList = ($sliceRaw | Out-String | ConvertFrom-Json)
    $serviceNames = @('backend', 'frontend', 'mongodb')
    $allServicesHealthy = $true

    foreach ($svcName in $serviceNames) {
        $serviceSlices = @(
            $sliceList.items | Where-Object {
                $_.metadata.labels.'kubernetes.io/service-name' -eq $svcName
            }
        )

        $readyAddresses = @(
            foreach ($slice in $serviceSlices) {
                foreach ($endpoint in @($slice.endpoints)) {
                    $isEndpointReady = (
                        $null -eq $endpoint.conditions.ready -or
                        $endpoint.conditions.ready -eq $true
                    )

                    if ($isEndpointReady -and @($endpoint.addresses).Count -gt 0) {
                        foreach ($address in $endpoint.addresses) {
                            $address
                        }
                    }
                }
            }
        )

        $endpointCount = $readyAddresses.Count
        $serviceHealthy = $endpointCount -gt 0
        $color = if ($serviceHealthy) { 'Green' } else { 'Red' }

        if (-not $serviceHealthy) {
            $allServicesHealthy = $false
        }

        Write-Host "  -> Service: $svcName | Ready Endpoints: $endpointCount" -ForegroundColor $color

        if ($endpointCount -gt 0) {
            Write-Host "     Addresses: $($readyAddresses -join ', ')" -ForegroundColor DarkGray
        }
    }
}
catch {
    $allServicesHealthy = $false
    Write-Host "  [!] Failed to inspect EndpointSlices: $_" -ForegroundColor Red
}

# 6. Live API Health and Frontend Connectivity
Write-Host ''
Write-Host '[6/6] Probing Application /api/health Endpoint...' -ForegroundColor Yellow

$healthUrl = "http://localhost:$Port/api/health"

try {
    $response = Invoke-RestMethod -Uri $healthUrl -TimeoutSec 3 -ErrorAction Stop

    if ($response.status -eq 'healthy' -and $response.database.status -eq 'connected') {
        Write-Host "  -> [LOCAL PORT $Port] API Status: $($response.status) | DB Status: $($response.database.status)" -ForegroundColor Green
        $directProbeHealthy = $true
    }
    else {
        Write-Host "  -> [LOCAL PORT $Port] API or database health check failed." -ForegroundColor Red
        Write-Host "     Response: $($response | ConvertTo-Json -Depth 5 -Compress)" -ForegroundColor DarkGray
    }
}
catch {
    Write-Host "  [i] localhost:$Port is not responding. Probing backend from inside the cluster..." -ForegroundColor DarkGray

    try {
        $inPodRaw = kubectl exec -n $Namespace deployment/backend -c backend -- node -e "fetch('http://127.0.0.1:5000/api/health').then(async function(r){console.log(await r.text());if(!r.ok)process.exitCode=1;}).catch(function(e){console.error(e.message);process.exitCode=1;})" 2>&1
        $inPodExitCode = $LASTEXITCODE

        if ($inPodExitCode -ne 0) {
            throw "In-cluster health command failed: $inPodRaw"
        }

        $inPod = ($inPodRaw | Out-String | ConvertFrom-Json)

        if ($inPod.status -eq 'healthy' -and $inPod.database.status -eq 'connected') {
            Write-Host "  -> [IN-CLUSTER PROBE] Backend healthy | DB Status: $($inPod.database.status)" -ForegroundColor Green
            $directProbeHealthy = $true
        }
        else {
            Write-Host "  -> [IN-CLUSTER PROBE] Backend or database unhealthy." -ForegroundColor Red
            Write-Host "     Response: $($inPod | ConvertTo-Json -Depth 5 -Compress)" -ForegroundColor DarkGray
        }
    }
    catch {
        Write-Host "  [!] In-cluster health probe failed: $_" -ForegroundColor Red
    }
}

# Final Summary
Write-Host ''
Write-Host '================================================================================' -ForegroundColor Cyan
Write-Host '   HEALTH SUMMARY' -ForegroundColor Cyan
Write-Host '================================================================================' -ForegroundColor Cyan

$checks = @(
    @{ Name = 'Kubernetes nodes'; Healthy = $allNodesHealthy },
    @{ Name = 'Application pods'; Healthy = $allPodsHealthy },
    @{ Name = 'Persistent storage'; Healthy = $allPvcsHealthy },
    @{ Name = 'Service endpoints'; Healthy = $allServicesHealthy },
    @{ Name = 'Application API and database'; Healthy = $directProbeHealthy }
)

foreach ($check in $checks) {
    $statusText = if ($check.Healthy) { 'PASS' } else { 'FAIL' }
    $statusColor = if ($check.Healthy) { 'Green' } else { 'Red' }

    Write-Host ("  {0,-30} {1}" -f $check.Name, $statusText) -ForegroundColor $statusColor
}

if ($metricsAvailable) {
    Write-Host '  Resource metrics               AVAILABLE' -ForegroundColor Green
}
else {
    Write-Host '  Resource metrics               UNAVAILABLE (non-blocking)' -ForegroundColor DarkYellow
}

$systemHealthy = (
    $allNodesHealthy -and
    $allPodsHealthy -and
    $allPvcsHealthy -and
    $allServicesHealthy -and
    $directProbeHealthy
)

Write-Host '================================================================================' -ForegroundColor Cyan

if ($systemHealthy) {
    Write-Host '   SYSTEM STATUS: HEALTHY AND OPERATIONAL' -ForegroundColor Green
    Write-Host '================================================================================' -ForegroundColor Cyan
    Write-Host ''
    exit 0
}
else {
    Write-Host '   SYSTEM STATUS: WARNING / DEGRADED - ATTENTION REQUIRED' -ForegroundColor Red
    Write-Host '================================================================================' -ForegroundColor Cyan
    Write-Host ''
    exit 1
}
