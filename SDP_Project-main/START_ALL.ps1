# ParadeOps All-in-One Startup Script (PowerShell)
# Run this to start both backend and frontend servers

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ParadeOps All-in-One Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"

# Check Node.js
Write-Host "[*] Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version
if ($?) {
    Write-Host "[✓] Node.js installed: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "[✗] Node.js not found. Please install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check npm
Write-Host "[*] Checking npm installation..." -ForegroundColor Yellow
$npmVersion = npm --version
if ($?) {
    Write-Host "[✓] npm installed: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "[✗] npm not found" -ForegroundColor Red
    exit 1
}

# Check MongoDB
Write-Host "[*] Checking MongoDB connection..." -ForegroundColor Yellow
try {
    $client = New-Object System.Net.Sockets.TcpClient
    $client.Connect("localhost", 27017)
    $client.Close()
    Write-Host "[✓] MongoDB is running on localhost:27017" -ForegroundColor Green
} catch {
    Write-Host "[!] MongoDB is NOT running locally" -ForegroundColor Yellow
    Write-Host "    Make sure MongoDB is started or configured in .env" -ForegroundColor Yellow
}

# Install backend dependencies
Write-Host ""
Write-Host "[*] Checking backend dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "backend/node_modules")) {
    Write-Host "[*] Installing backend dependencies..." -ForegroundColor Yellow
    Push-Location backend
    npm install
    Pop-Location
    Write-Host "[✓] Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "[✓] Dependencies already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting ParadeOps Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start backend
Write-Host "[*] Starting backend server..." -ForegroundColor Cyan
Write-Host "    Location: http://localhost:5000" -ForegroundColor White
Write-Host "    Health: http://localhost:5000/health" -ForegroundColor White
Write-Host ""

Push-Location backend
npm run dev
Pop-Location
