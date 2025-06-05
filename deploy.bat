@echo off
echo 🛡️ K3 AR Safety Application - Deployment Script
echo ================================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the project root.
    pause
    exit /b 1
)

REM Check for uncommitted changes
git status --porcelain > temp_status.txt
for /f %%i in ("temp_status.txt") do set size=%%~zi
del temp_status.txt

if %size% gtr 0 (
    echo ⚠️  Warning: You have uncommitted changes.
    set /p commit_choice="Do you want to commit them first? (y/n): "
    if /i "%commit_choice%"=="y" (
        echo 📝 Adding all changes...
        git add .
        set /p commit_message="Enter commit message: "
        git commit -m "%commit_message%"
    )
)

REM Build the application
echo 🔨 Building application for production...
call npm run build

if errorlevel 1 (
    echo ❌ Build failed! Please fix the errors and try again.
    pause
    exit /b 1
)

echo ✅ Build successful!

REM Push to GitHub
echo 📤 Pushing to GitHub...
git push origin main

if errorlevel 1 (
    echo ❌ Failed to push to GitHub!
    pause
    exit /b 1
)

echo ✅ Successfully pushed to GitHub!

REM Check if Netlify CLI is installed
netlify --version >nul 2>&1
if errorlevel 1 (
    echo 📋 Netlify CLI not found. Please deploy manually:
    echo    1. Go to https://app.netlify.com/
    echo    2. Select your site
    echo    3. Drag and drop the 'dist' folder
    echo    4. Or set up auto-deploy from GitHub
) else (
    echo 🚀 Deploying to Netlify...
    netlify deploy --prod --dir=dist
    
    if errorlevel 1 (
        echo ⚠️  Netlify deployment failed. Please deploy manually.
    ) else (
        echo ✅ Successfully deployed to Netlify!
    )
)

echo.
echo 🎉 Deployment process completed!
echo 📱 Your app should be available at: https://k3ar-safety.netlify.app
echo 📊 GitHub repository: https://github.com/nug31/K3-AR

pause
