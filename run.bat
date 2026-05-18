@echo off
echo ==============================
echo   ECOMMERCE PROJECT TEST
echo ==============================
echo.

echo 1. Starting backend service...
echo    Please check the new window.
echo.
start "Backend" cmd /k "cd /d %~dp0backend && node simple_server.js"

echo Waiting 3 seconds...
timeout /t 3 >nul

echo.
echo 2. Opening test page...
echo    Test page will open in browser.
echo.
start "" "%~dp0frontend\simple_test.html"

echo.
echo ==============================
echo   TEST INFORMATION
echo ==============================
echo.
echo Backend: http://localhost:3000
echo Test page: simple_test.html
echo.
echo Test accounts:
echo   admin / password123
echo   user1 / password123
echo.
echo Test steps in browser:
echo   1. Click "Check Health Status"
echo   2. Test login
echo   3. Test "Get Users" and "Get Products"
echo.
echo If all tests pass, project is OK.
echo.
echo Press any key to close...
pause >nul