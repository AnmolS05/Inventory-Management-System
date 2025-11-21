@echo off
echo ========================================
echo  Inventory Management System Setup
echo ========================================
echo.

REM Check if Node.js is installed
echo [1/6] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js 18+ from: https://nodejs.org/
    pause
    exit /b 1
)
node --version
echo [OK] Node.js is installed
echo.

REM Check if PostgreSQL is installed
echo [2/6] Checking PostgreSQL installation...
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] PostgreSQL is not installed or not in PATH!
    echo.
    echo You have two options:
    echo   1. Install PostgreSQL manually from: https://www.postgresql.org/download/windows/
    echo   2. Use Docker: docker-compose up -d postgres
    echo.
    echo If you just installed PostgreSQL, you may need to:
    echo   - Add PostgreSQL bin directory to PATH
    echo   - Restart this terminal
    echo.
    set /p continue="Continue anyway? (y/n): "
    if /i not "%continue%"=="y" exit /b 1
) else (
    psql --version
    echo [OK] PostgreSQL is installed
)
echo.

REM Install root dependencies
echo [3/6] Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install root dependencies
    pause
    exit /b 1
)
echo [OK] Root dependencies installed
echo.

REM Install backend dependencies
echo [4/6] Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install backend dependencies
    cd ..
    pause
    exit /b 1
)
cd ..
echo [OK] Backend dependencies installed
echo.

REM Install frontend dependencies
echo [5/6] Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install frontend dependencies
    cd ..
    pause
    exit /b 1
)
cd ..
echo [OK] Frontend dependencies installed
echo.

REM Setup environment files
echo [6/6] Setting up environment files...
if not exist backend\.env (
    copy backend\.env.example backend\.env
    echo [OK] Created backend\.env
) else (
    echo [INFO] backend\.env already exists, skipping...
)

if not exist frontend\.env (
    copy frontend\.env.example frontend\.env
    echo [OK] Created frontend\.env
) else (
    echo [INFO] frontend\.env already exists, skipping...
)
echo.

echo ========================================
echo  Setup Complete!
echo ========================================
echo.
echo WHAT'S NEXT?
echo.
echo Option 1: DEPLOY TO CLOUD (Recommended)
echo ----------------------------------------
echo Get your app online in 15 minutes!
echo   - Free hosting (Neon + Railway + Vercel)
echo   - Accessible from anywhere
echo   - No server maintenance
echo.
echo Run: deploy.bat
echo Or read: START_HERE.md
echo.
echo Option 2: RUN LOCALLY (For Development)
echo ----------------------------------------
echo 1. Setup PostgreSQL:
echo    - Install from: https://www.postgresql.org/download/windows/
echo    - Create database: CREATE DATABASE inventory_db;
echo    - Update backend\.env with credentials
echo.
echo 2. Configure API Keys (backend\.env):
echo    - GEMINI_API_KEY: https://makersuite.google.com/app/apikey
echo    - DATABASE_URL: Your PostgreSQL connection
echo    - JWT_SECRET: Change to random string
echo.
echo 3. Start development:
echo    npm run dev
echo.
echo 4. Access locally:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:5000
echo.
echo ========================================
echo  Quick Links
echo ========================================
echo.
echo Deploy to Cloud: deploy.bat
echo Quick Start: START_HERE.md
echo Full Guide: DEPLOYMENT.md
echo.
pause