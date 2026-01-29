# Live Feed API Tests - PowerShell
# Tests POST, GET, and DELETE endpoints.
# Cleans up after itself using the DELETE endpoint.

$BaseUrl = if ($env:LIVE_FEED_URL) { $env:LIVE_FEED_URL } else { "https://live.segunakinyemi.com" }
$WorkshopKey = if ($env:WORKSHOP_KEY) { $env:WORKSHOP_KEY } else { "cinnamon-rolls-are-the-best-pastry-hands-down" }
$AdminKey = if ($env:ADMIN_KEY) { $env:ADMIN_KEY } else { "" }

# ADMIN_KEY is required for cleanup
if (-not $AdminKey) {
    Write-Host "ERROR: ADMIN_KEY environment variable is required for cleanup" -ForegroundColor Red
    exit 1
}

$PostUrl = "$BaseUrl/api/post"
$PostsUrl = "$BaseUrl/api/posts"
$DeleteUrl = "$BaseUrl/api/delete"

# Track test results
$script:TestsPassed = 0
$script:TestsFailed = 0
$script:CreatedPostId = $null

function Log-Test {
    param (
        [string]$Name,
        [bool]$Passed,
        [string]$Details = ""
    )
    
    if ($Passed) {
        $script:TestsPassed++
        Write-Host "  ✓ $Name" -ForegroundColor Green
    } else {
        $script:TestsFailed++
        Write-Host "  ✗ $Name" -ForegroundColor Red
        if ($Details) {
            Write-Host "    → $Details" -ForegroundColor Yellow
        }
    }
}

function Test-PostValid {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $data = @{
        Name        = "GitHub Actions (PowerShell)"
        Message     = "CI test at $timestamp"
        Workshop    = "CI Test"
        Tags        = "ci, automated, powershell"
        WorkshopKey = $WorkshopKey
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri $PostUrl -Method Post -Body $data -ContentType "application/json" -ErrorAction Stop
        
        if ($response.success -and $response.id) {
            $script:CreatedPostId = $response.id
            Log-Test "POST valid data → 200 + id" $true
            return $true
        } else {
            Log-Test "POST valid data → 200 + id" $false "Response: $($response | ConvertTo-Json -Compress)"
            return $false
        }
    }
    catch {
        Log-Test "POST valid data → 200 + id" $false $_.Exception.Message
        return $false
    }
}

function Test-PostInvalidKey {
    $data = @{
        Name        = "Test"
        Message     = "Should fail"
        Workshop    = "CI Test"
        WorkshopKey = "wrong-key"
    } | ConvertTo-Json

    try {
        $response = Invoke-WebRequest -Uri $PostUrl -Method Post -Body $data -ContentType "application/json" -ErrorAction Stop
        Log-Test "POST invalid key → 401" $false "Got $($response.StatusCode)"
        return $false
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 401) {
            Log-Test "POST invalid key → 401" $true
            return $true
        } else {
            Log-Test "POST invalid key → 401" $false "Got $($_.Exception.Response.StatusCode)"
            return $false
        }
    }
}

function Test-GetValidId {
    if (-not $script:CreatedPostId) {
        Log-Test "GET valid id → 200 + post" $false "No post id available"
        return $false
    }

    try {
        $url = "$PostsUrl`?id=$($script:CreatedPostId)&WorkshopKey=$WorkshopKey"
        $response = Invoke-RestMethod -Uri $url -Method Get -ErrorAction Stop
        
        if ($response.success -and $response.post -and $response.post.id -eq $script:CreatedPostId) {
            Log-Test "GET valid id → 200 + post" $true
            return $true
        } else {
            Log-Test "GET valid id → 200 + post" $false "Response: $($response | ConvertTo-Json -Compress)"
            return $false
        }
    }
    catch {
        Log-Test "GET valid id → 200 + post" $false $_.Exception.Message
        return $false
    }
}

function Test-GetInvalidId {
    try {
        $url = "$PostsUrl`?id=recINVALID123&WorkshopKey=$WorkshopKey"
        $response = Invoke-WebRequest -Uri $url -Method Get -ErrorAction Stop
        Log-Test "GET invalid id → 404" $false "Got $($response.StatusCode)"
        return $false
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 404) {
            Log-Test "GET invalid id → 404" $true
            return $true
        } else {
            Log-Test "GET invalid id → 404" $false "Got $($_.Exception.Response.StatusCode)"
            return $false
        }
    }
}

function Test-GetByTag {
    try {
        $url = "$PostsUrl`?tag=powershell&WorkshopKey=$WorkshopKey"
        $response = Invoke-RestMethod -Uri $url -Method Get -ErrorAction Stop
        
        if ($response.success -and $null -ne $response.posts -and $null -ne $response.count -and $null -ne $response.tag) {
            Log-Test "GET by tag → 200 + posts" $true
            return $true
        } else {
            Log-Test "GET by tag → 200 + posts" $false "Missing fields: $($response | ConvertTo-Json -Compress)"
            return $false
        }
    }
    catch {
        Log-Test "GET by tag → 200 + posts" $false $_.Exception.Message
        return $false
    }
}

function Test-DeleteCleanup {
    if (-not $script:CreatedPostId) {
        Log-Test "DELETE cleanup" $false "No post id to delete"
        return $false
    }

    try {
        $url = "$DeleteUrl`?id=$($script:CreatedPostId)&AdminKey=$AdminKey"
        $response = Invoke-RestMethod -Uri $url -Method Delete -ErrorAction Stop
        
        if ($response.success) {
            Log-Test "DELETE cleanup" $true
            return $true
        } else {
            Log-Test "DELETE cleanup" $false "Response: $($response | ConvertTo-Json -Compress)"
            return $false
        }
    }
    catch {
        Log-Test "DELETE cleanup" $false $_.Exception.Message
        return $false
    }
}

# Main
Write-Host ("=" * 50)
Write-Host "Live Feed API Tests - PowerShell"
Write-Host ("=" * 50)
Write-Host "Target: $BaseUrl"
Write-Host ""

Write-Host "[POST /api/post]"
Test-PostValid | Out-Null
Test-PostInvalidKey | Out-Null
Write-Host ""

Write-Host "[GET /api/posts]"
Test-GetValidId | Out-Null
Test-GetInvalidId | Out-Null
Test-GetByTag | Out-Null
Write-Host ""

Write-Host "[DELETE /api/delete]"
Test-DeleteCleanup | Out-Null

# Summary
Write-Host ""
Write-Host ("=" * 50)
$total = $script:TestsPassed + $script:TestsFailed
Write-Host "Results: $($script:TestsPassed)/$total tests passed"
Write-Host ("=" * 50)

if ($script:TestsFailed -gt 0) {
    exit 1
}
exit 0
