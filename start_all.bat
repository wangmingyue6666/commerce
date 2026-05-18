@echo off
echo Ecommerce Project - Full Start
echo ================================
echo.

echo [1/3] Starting Backend Service...
echo Please check the new window for backend.
echo.
start "Ecommerce Backend" cmd /k "cd /d %~dp0backend && echo Backend starting on port 3000... && node simple_server.js"

echo Waiting 5 seconds for backend...
timeout /t 5 >nul

echo.
echo [2/3] Starting Frontend Service...
echo Please check the new window for frontend.
echo.
start "Ecommerce Frontend" cmd /k "cd /d %~dp0frontend && echo Installing dependencies if needed... && if not exist node_modules\ ( npm install ) && echo Starting frontend on port 8080... && npm run dev"

echo.
echo [3/3] Services Starting...
echo.
echo Backend: http://localhost:3000
echo Frontend: http://localhost:8080
echo.
echo Test accounts:
echo   admin / password123
echo   user1 / password123
echo.
echo Waiting 10 seconds for services to start...
timeout /t 10 >nul

echo.
echo ================================
echo    READY TO USE!
echo ================================
echo.
echo Opening frontend in browser...
start http://localhost:8080

echo.
echo If pages don't load automatically:
echo 1. Frontend: http://localhost:8080
echo 2. Backend API: http://localhost:3000
echo 3. Test page: %~dp0frontend\simple_test.html
echo.
echo Press any key to exit this window...
pause >nul