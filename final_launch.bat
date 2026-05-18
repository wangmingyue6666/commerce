@echo off
echo ====================================
echo   FINAL LAUNCH - Full Ecommerce
echo ====================================
echo.

echo [1] Cleaning up...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo [2] Starting backend (port 5000)...
echo    Memory database, no SQLite needed
echo.
start "Ecommerce Backend" cmd /k "cd /d %~dp0backend && node simple_full_server.js"

echo Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak >nul

echo.
echo [3] Testing backend...
powershell -Command "try { $r = Invoke-RestMethod -Uri 'http://localhost:5000/health' -ErrorAction Stop; Write-Host 'Backend: OK - ' $r.message } catch { Write-Host 'Backend: Failed to start' }"

echo.
echo [4] Starting frontend...
echo    Vue.js development server
echo.
start "Ecommerce Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo [5] Opening browser...
echo Waiting 8 seconds for frontend to start...
timeout /t 8 /nobreak >nul
start "" "http://localhost:8080"

echo.
echo ====================================
echo   🎉 PROJECT LAUNCHED!
echo ====================================
echo.
echo 🌐 Backend API: http://localhost:5000
echo 🖥️  Frontend: http://localhost:8080
echo.
echo ====================================
echo   📋 TEST ACCOUNTS
echo ====================================
echo.
echo 👑 Admin: admin / password123
echo 👤 User1: user1 / password123  
echo 👤 User2: user2 / password123
echo.
echo ====================================
echo   🛍️  FULL FEATURES
echo ====================================
echo.
echo ✅ User login & authentication
echo ✅ Product browsing & categories
echo ✅ Product search
echo ✅ Shopping cart
echo ✅ Order creation
echo ✅ Order history
echo ✅ Home page with banners
echo ✅ Responsive design
echo.
echo ====================================
echo   🚀 QUICK START
echo ====================================
echo.
echo 1. Open http://localhost:8080
echo 2. Login with test account
echo 3. Browse products
echo 4. Add items to cart
echo 5. Checkout and create order
echo.
echo ====================================
echo   📁 PROJECT LOCATION
echo ====================================
echo.
echo All files are in: %~dp0
echo.
echo Press any key to exit this window...
pause >nul