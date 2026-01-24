@echo off
REM Simple Backend Startup
REM Run this file to start the backend server

cls
echo.
echo =====================================
echo  ParadeOps Backend Server Startup
echo =====================================
echo.

REM Kill any existing node processes
echo Cleaning up old processes...
taskkill /F /IM node.exe >nul 2>&1

echo Waiting...
timeout /t 2 /nobreak

REM Change to backend directory
cd /d "%~dp0backend"

echo.
echo Starting backend server...
echo Port: 5000
echo.

REM Start the server
node src/server.js

pause
