# Test All Languages
# Runs Python, JavaScript, and PowerShell test scripts in sequence.

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptDir

# Load .env file from repo root if it exists
$envFile = Join-Path $repoRoot ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            [System.Environment]::SetEnvironmentVariable($Matches[1].Trim(), $Matches[2].Trim(), 'Process')
        }
    }
}

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Live Feed Test - All Languages" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Python
Write-Host "--- Python ---" -ForegroundColor Yellow
python "$scriptDir\test_post.py"
Write-Host ""

# JavaScript
Write-Host "--- JavaScript ---" -ForegroundColor Yellow
node "$scriptDir\test_post.js"
Write-Host ""

# PowerShell
Write-Host "--- PowerShell ---" -ForegroundColor Yellow
& "$scriptDir\test_post.ps1"
Write-Host ""

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Done! Check https://live.segunakinyemi.com" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
