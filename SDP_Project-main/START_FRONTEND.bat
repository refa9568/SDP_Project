@echo off
REM Frontend Server Startup Script for Windows

echo.
echo ============================================
echo     ParadeOps Frontend Server
echo ============================================
echo.

cd frontend

echo [OK] Starting frontend server on port 8000
echo.
echo Frontend will be available at: http://localhost:8000
echo Login page: http://localhost:8000/login.html
echo.
echo Press Ctrl+C to stop the server
echo.

python -m http.server 8000

if errorlevel 1 (
    echo.
    echo [INFO] Python HTTP server failed. Trying Node.js http-server...
    echo Installing http-server globally if needed...
    npm install -g http-server
    http-server -p 8000
)

pause
