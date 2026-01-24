@echo off
REM ParadeOps Complete Startup Script for Windows

echo.
echo ============================================
echo     ParadeOps System Startup
echo ============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Please install Node.js first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js is installed
echo.

REM Check if MongoDB service is running
sc query MongoDB >nul 2>&1
if errorlevel 1 (
    echo [WARNING] MongoDB service is not running as a service.
    echo.
    echo Make sure MongoDB is running:
    echo   - Check MongoDB installation folder
    echo   - Or start manually: mongod --dbpath "C:\data\db"
    echo.
) else (
    echo [OK] MongoDB service is running
)

echo.
echo Starting ParadeOps Backend Server...
cd backend

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

REM Check if dev dependencies are installed
if not exist "node_modules\nodemon" (
    echo Installing dev dependencies...
    call npm install --save-dev nodemon
)

echo.
echo [OK] Starting backend on port 5000
echo.
echo Backend will be available at: http://localhost:5000
echo Health check: http://localhost:5000/health
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev

pause
