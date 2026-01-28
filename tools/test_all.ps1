# Test All Languages
# Runs Python, JavaScript, and PowerShell test scripts in sequence.

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Live Feed Test - All Languages" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

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
Write-Host "You should see 3 test posts." -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
