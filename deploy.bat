@echo off
echo ========================================
echo  Cloud Deployment Helper
echo ========================================
echo.
echo This script will help you deploy to the cloud.
echo.
echo Choose your deployment platform:
echo.
echo 1. Railway + Vercel (Recommended - Easiest)
echo 2. Render (All-in-one)
echo 3. Manual setup (I'll do it myself)
echo 4. Exit
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto railway_vercel
if "%choice%"=="2" goto render
if "%choice%"=="3" goto manual
if "%choice%"=="4" goto end

echo Invalid choice!
pause
exit /b 1

:railway_vercel
echo.
echo ========================================
echo  Railway + Vercel Deployment
echo ========================================
echo.
echo Step 1: Database Setup (Neon)
echo ------------------------------
echo 1. Go to https://neon.tech
echo 2. Sign up with GitHub
echo 3. Create new project: "inventory-system"
echo 4. Copy the connection string
echo.
set /p db_url="Paste your Neon DATABASE_URL: "
echo.

echo Step 2: Get Gemini API Key
echo ---------------------------
echo 1. Go to https://makersuite.google.com/app/apikey
echo 2. Create API Key
echo.
set /p gemini_key="Paste your GEMINI_API_KEY: "
echo.

echo Step 3: Generate JWT Secret
echo ---------------------------
set jwt_secret=%RANDOM%%RANDOM%%RANDOM%%RANDOM%
echo Generated JWT_SECRET: %jwt_secret%
echo.

echo Step 4: Deploy Backend to Railway
echo ----------------------------------
echo.
echo Checking Railway CLI...
call railway --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Railway CLI not found. Installing...
    call npm install -g @railway/cli
)

echo.
echo Logging into Railway...
call railway login

echo.
echo Creating Railway project...
cd backend
call railway init
echo.
echo Setting environment variables...
call railway variables set DATABASE_URL="%db_url%"
call railway variables set GEMINI_API_KEY="%gemini_key%"
call railway variables set JWT_SECRET="%jwt_secret%"
call railway variables set NODE_ENV="production"
call railway variables set PORT="5000"
call railway variables set FRONTEND_URL="https://your-app.vercel.app"

echo.
echo Deploying backend...
call railway up

echo.
echo Getting backend URL...
call railway domain
echo.
set /p backend_url="Copy your Railway backend URL (e.g., https://xxx.up.railway.app): "
cd ..

echo.
echo Step 5: Deploy Frontend to Vercel
echo ----------------------------------
echo.
echo Checking Vercel CLI...
call vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Vercel CLI not found. Installing...
    call npm install -g vercel
)

echo.
echo Logging into Vercel...
cd frontend
call vercel login

echo.
echo Deploying frontend...
call vercel --prod

echo.
echo Setting environment variable...
call vercel env add VITE_API_URL production
echo Enter: %backend_url%/api

cd ..

echo.
echo Step 6: Update Backend FRONTEND_URL
echo ------------------------------------
echo.
set /p frontend_url="Enter your Vercel frontend URL: "
cd backend
call railway variables set FRONTEND_URL="%frontend_url%"
call railway up
cd ..

echo.
echo ========================================
echo  Deployment Complete!
echo ========================================
echo.
echo Your application is now live:
echo Frontend: %frontend_url%
echo Backend:  %backend_url%
echo.
echo Test your backend: %backend_url%/api/health
echo.
goto end

:render
echo.
echo ========================================
echo  Render Deployment
echo ========================================
echo.
echo 1. Go to https://render.com
echo 2. Sign up with GitHub
echo 3. Create PostgreSQL database
echo 4. Create Web Service for backend (root: backend)
echo 5. Create Static Site for frontend (root: frontend)
echo.
echo Environment variables needed:
echo.
echo Backend:
echo   DATABASE_URL=your_render_db_url
echo   GEMINI_API_KEY=your_gemini_key
echo   JWT_SECRET=random_secret
echo   NODE_ENV=production
echo   FRONTEND_URL=your_frontend_url
echo.
echo Frontend:
echo   VITE_API_URL=your_backend_url/api
echo.
echo See DEPLOYMENT.md for detailed instructions.
echo.
goto end

:manual
echo.
echo ========================================
echo  Manual Deployment
echo ========================================
echo.
echo Please follow the detailed guide in DEPLOYMENT.md
echo.
echo Quick links:
echo - Neon (Database): https://neon.tech
echo - Railway (Backend): https://railway.app
echo - Vercel (Frontend): https://vercel.com
echo - Render (All-in-one): https://render.com
echo.
echo You'll need:
echo 1. PostgreSQL database (Neon/Render/AWS RDS)
echo 2. Backend hosting (Railway/Render/AWS)
echo 3. Frontend hosting (Vercel/Netlify/Render)
echo 4. Gemini API key
echo.
goto end

:end
echo.
echo For detailed instructions, see DEPLOYMENT.md
echo.
pause
