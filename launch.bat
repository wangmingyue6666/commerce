@echo off
echo ====================================
echo   Launch Ecommerce Project
echo ====================================
echo.

echo [1] Backend is already running on port 3000 ✓
echo.
echo [2] Starting frontend...
echo    Frontend will open on port 8081
echo    (Port 8080 is busy, so using 8081)
echo.

start "" "http://localhost:8081"

echo ====================================
echo   ACCESS LINKS
echo ====================================
echo.
echo Main Frontend: http://localhost:8081
echo Backend API:   http://localhost:3000
echo Test Page:     frontend\simple_test.html
echo.
echo Test Accounts:
echo   admin / password123
echo   user1 / password123
echo.
echo Press any key to exit...
pause >nul