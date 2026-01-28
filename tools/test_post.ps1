# Live Feed Test - PowerShell
# Tests posting to the Vercel serverless endpoint.

$URL = if ($env:LIVE_FEED_URL) { $env:LIVE_FEED_URL } else { "https://live.segunakinyemi.com/api/post" }
$WORKSHOP_KEY = if ($env:WORKSHOP_KEY) { $env:WORKSHOP_KEY } else { "cinnamon-rolls-are-the-best-pastry-hands-down" }

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

$data = @{
    Name        = "Test Script (PowerShell)"
    Message     = "Pre-workshop test at $timestamp"
    Workshop    = "Test Workshop"
    Tags        = "test, powershell, pre-workshop"
    WorkshopKey = $WORKSHOP_KEY
}

$body = $data | ConvertTo-Json

Write-Host "Posting to live feed..."
Write-Host "  URL: $URL"
Write-Host "  Name: $($data.Name)"
Write-Host "  Message: $($data.Message)"
Write-Host "  Workshop: $($data.Workshop)"
Write-Host "  Tags: $($data.Tags)"
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $URL -Method Post -Body $body -ContentType "application/json"
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json
    
    if ($response.success) {
        Write-Host "`nSUCCESS: Post submitted!" -ForegroundColor Green
        Write-Host "Check https://live.segunakinyemi.com to verify."
    } else {
        Write-Host "`nFAILED: $($response.error)" -ForegroundColor Red
    }
}
catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
}
