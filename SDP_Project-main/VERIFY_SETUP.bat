@echo off
REM Integration Verification Script for ParadeOps

echo.
echo ============================================
echo ParadeOps Integration Verification
echo ============================================
echo.

setlocal enabledelayedexpansion

REM Colors and formatting
set "PASS=[PASS]"
set "FAIL=[FAIL]"
set "INFO=[INFO]"
set "WARN=[WARN]"

REM Counter for checks
set "passed=0"
set "failed=0"
set "warnings=0"

echo %INFO% Checking system requirements...
echo.

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo %FAIL% Node.js is NOT installed
    set /a failed+=1
) else (
    for /f "tokens=*" %%i in ('node --version') do set nodever=%%i
    echo %PASS% Node.js installed: !nodever!
    set /a passed+=1
)

REM Check npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo %FAIL% npm is NOT installed
    set /a failed+=1
) else (
    for /f "tokens=*" %%i in ('npm --version') do set npmver=%%i
    echo %PASS% npm installed: !npmver!
    set /a passed+=1
)

REM Check MongoDB connection
echo.
echo %INFO% Checking MongoDB connection...

REM Try to connect to MongoDB locally
powershell -Command "try { [System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }; $client = New-Object System.Net.Sockets.TcpClient; $client.Connect('localhost', 27017); $client.Close(); exit 0 } catch { exit 1 }" >nul 2>&1

if errorlevel 1 (
    echo %WARN% MongoDB is NOT running locally on port 27017
    echo %INFO% Make sure to start MongoDB or configure MongoDB Atlas in .env
    set /a warnings+=1
) else (
    echo %PASS% MongoDB is running on localhost:27017
    set /a passed+=1
)

REM Check Backend files
echo.
echo %INFO% Checking backend files...

if exist "backend\package.json" (
    echo %PASS% backend/package.json found
    set /a passed+=1
) else (
    echo %FAIL% backend/package.json NOT found
    set /a failed+=1
)

if exist "backend\.env" (
    echo %PASS% backend/.env found
    set /a passed+=1
) else (
    echo %FAIL% backend/.env NOT found
    set /a failed+=1
)

if exist "backend\src\server.js" (
    echo %PASS% backend/src/server.js found
    set /a passed+=1
) else (
    echo %FAIL% backend/src/server.js NOT found
    set /a failed+=1
)

REM Check Frontend files
echo.
echo %INFO% Checking frontend files...

if exist "frontend\login.html" (
    echo %PASS% frontend/login.html found
    set /a passed+=1
) else (
    echo %FAIL% frontend/login.html NOT found
    set /a failed+=1
)

if exist "login.html" (
    echo %PASS% login.html found (root)
    set /a passed+=1
) else (
    echo %WARN% login.html NOT found in root
    set /a warnings+=1
)

REM Check backend node_modules
echo.
echo %INFO% Checking backend dependencies...

if exist "backend\node_modules" (
    echo %PASS% backend/node_modules exists
    set /a passed+=1
) else (
    echo %WARN% backend/node_modules NOT found - will be installed on first run
    set /a warnings+=1
)

REM Check environment configuration
echo.
echo %INFO% Checking environment configuration...

for /f "delims=" %%i in ('findstr "MONGODB_URI" backend\.env') do (
    echo %PASS% MONGODB_URI configured in .env
    set /a passed+=1
    goto skip_db_check
)
echo %WARN% MONGODB_URI not clearly configured
set /a warnings+=1
:skip_db_check

for /f "delims=" %%i in ('findstr "PORT=5000" backend\.env') do (
    echo %PASS% Backend PORT configured as 5000
    set /a passed+=1
    goto skip_port_check
)
echo %WARN% Backend PORT not configured as 5000
set /a warnings+=1
:skip_port_check

for /f "delims=" %%i in ('findstr "CORS_ORIGIN" backend\.env') do (
    echo %PASS% CORS_ORIGIN configured
    set /a passed+=1
    goto skip_cors_check
)
echo %WARN% CORS_ORIGIN not configured
set /a warnings+=1
:skip_cors_check

REM Summary
echo.
echo ============================================
echo              SUMMARY
echo ============================================
echo %PASS% Checks Passed: !passed!
if %warnings% gtr 0 echo %WARN% Warnings: !warnings!
if %failed% gtr 0 echo %FAIL% Checks Failed: !failed!
echo.

if %failed% gtr 0 (
    echo.
    echo [ACTION REQUIRED]
    echo Please resolve the failed checks above.
    echo See SETUP_GUIDE.md for detailed instructions.
    echo.
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Integration checks complete!
echo.
echo Next steps:
echo 1. Run: START_BACKEND.bat (in new terminal)
echo 2. Run: START_FRONTEND.bat (in another new terminal)
echo 3. Open: http://localhost:8000/login.html
echo.
pause
