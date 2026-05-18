@echo off
echo ====================================
echo   Launch Full Ecommerce Project
echo ====================================
echo.

echo [1] Stopping any existing services...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo [2] Starting backend (port 5000)...
echo    Full features with SQLite database
echo.
start "Ecommerce Backend" cmd /k "cd /d %~dp0backend && node full_server_5000.js"

echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo [3] Starting frontend...
echo    Vue.js development server
echo.
start "Ecommerce Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo [4] Opening browser...
echo Waiting 10 seconds for services to start...
timeout /t 10 /nobreak >nul
start "" "http://localhost:8080"

echo.
echo ====================================
echo   PROJECT READY!
echo ====================================
echo.
echo ✅ Backend: http://localhost:5000
echo ✅ Frontend: http://localhost:8080 (or 8081)
echo.
echo ====================================
echo   TEST ACCOUNTS
echo ====================================
echo.
echo 👑 Admin: admin / password123
echo 👤 User1: user1 / password123  
echo 👤 User2: user2 / password123
echo.
echo ====================================
echo   FULL FEATURES
echo ====================================
echo.
echo 🛍️  Product browsing & search
echo 🛒 Shopping cart
echo 📦 Order creation
echo 👤 User authentication
echo 🏠 Home page with banners
echo 📱 Responsive design
echo.
echo ====================================
echo   QUICK TEST
echo ====================================
echo.
echo 1. Open http://localhost:8080
echo 2. Login with test account
echo 3. Browse products
echo 4. Add to cart
echo 5. Create order
echo.
echo Press any key to exit this window...
pause >nul