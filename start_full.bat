@echo off
echo ====================================
echo   Starting Full Ecommerce Project
echo ====================================
echo.

echo [1] Stopping any existing services...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo [2] Starting backend (full version)...
echo    Port: 3000
echo    Database: SQLite (in-memory)
echo.
start "Ecommerce Backend" cmd /k "cd /d %~dp0backend && node full_server.js"

echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo [3] Starting frontend...
echo    Port: 8080 (or 8081 if busy)
echo.
start "Ecommerce Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo [4] Opening browser...
echo Waiting 10 seconds for services to start...
timeout /t 10 /nobreak >nul
start "" "http://localhost:8080"

echo.
echo ====================================
echo   ACCESS LINKS
echo ====================================
echo.
echo Frontend: http://localhost:8080
echo Backend API: http://localhost:3000
echo.
echo If port 8080 is busy, frontend may use 8081.
echo Check the frontend window for actual port.
echo.
echo ====================================
echo   TEST ACCOUNTS
echo ====================================
echo.
echo Admin: admin / password123
echo User1: user1 / password123  
echo User2: user2 / password123
echo.
echo ====================================
echo   FULL FEATURES
echo ====================================
echo.
echo ✅ User registration & login
echo ✅ Product browsing & search
echo ✅ Shopping cart
echo ✅ Order creation & management
echo ✅ User profile management
echo ✅ Product categories
echo ✅ Home page with banners
echo.
echo Press any key to exit this window...
pause >nul