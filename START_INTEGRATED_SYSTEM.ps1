# Quick Integration Startup Script
# This script starts the Backend API and Frontend Server

Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   ParadeOps System Startup" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Get the script's directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start Backend
Write-Host "Starting Backend API Server..." -ForegroundColor Yellow
$backendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\backend'; npm start" -PassThru
Write-Host "✓ Backend started (PID: $($backendProcess.Id))" -ForegroundColor Green
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
$frontendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\frontend'; python -m http.server 8000" -PassThru
Write-Host "✓ Frontend started (PID: $($frontendProcess.Id))" -ForegroundColor Green
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Green
Write-Host "✓ All Services Started!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "Endpoints:" -ForegroundColor Cyan
Write-Host "  Backend API   : http://localhost:5000" -ForegroundColor White
Write-Host "  Frontend      : http://localhost:8000" -ForegroundColor White
Write-Host "  Login Page    : http://localhost:8000/frontend/login.html" -ForegroundColor White
Write-Host ""
Write-Host "Opening login page in browser..." -ForegroundColor Yellow
Start-Sleep -Seconds 1
Start-Process "http://localhost:8000/frontend/login.html"

Write-Host ""
Write-Host "Note: MongoDB must be running for the backend to work." -ForegroundColor Yellow
Write-Host "Make sure MongoDB service is started (Services → MongoDB Server)." -ForegroundColor Yellow
