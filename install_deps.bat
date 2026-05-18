@echo off
echo Installing dependencies for full ecommerce project...
echo ====================================================
echo.

echo Step 1: Installing backend dependencies...
cd backend
npm install express cors sqlite3 bcryptjs jsonwebtoken
if errorlevel 1 (
    echo Backend dependencies installation failed!
    pause
    exit /b 1
)

echo.
echo Step 2: Frontend dependencies are already installed ✓
echo.
echo Step 3: Creating startup script...
cd ..

echo @echo off > start_full.bat
echo echo Starting Full Ecommerce Project >> start_full.bat
echo echo ================================ >> start_full.bat
echo echo. >> start_full.bat
echo echo [1] Starting backend (full version)... >> start_full.bat
echo start "Ecommerce Backend" cmd /k "cd /d %%~dp0backend && node full_server.js" >> start_full.bat
echo echo Waiting 5 seconds... >> start_full.bat
echo timeout /t 5 /nobreak ^>nul >> start_full.bat
echo echo. >> start_full.bat
echo echo [2] Starting frontend... >> start_full.bat
echo start "Ecommerce Frontend" cmd /k "cd /d %%~dp0frontend && npm run dev" >> start_full.bat
echo echo. >> start_full.bat
echo echo [3] Opening browser... >> start_full.bat
echo echo Waiting 10 seconds for services to start... >> start_full.bat
echo timeout /t 10 /nobreak ^>nul >> start_full.bat
echo start "" "http://localhost:8080" >> start_full.bat
echo echo. >> start_full.bat
echo echo ================================ >> start_full.bat
echo echo   ACCESS LINKS >> start_full.bat
echo echo ================================ >> start_full.bat
echo echo. >> start_full.bat
echo echo Frontend: http://localhost:8080 (or 8081 if 8080 busy) >> start_full.bat
echo echo Backend:  http://localhost:3000 >> start_full.bat
echo echo. >> start_full.bat
echo echo Test accounts: >> start_full.bat
echo echo   admin / password123 (admin) >> start_full.bat
echo echo   user1 / password123 (user) >> start_full.bat
echo echo   user2 / password123 (user) >> start_full.bat
echo echo. >> start_full.bat
echo echo Press any key to exit... >> start_full.bat
echo pause ^>nul >> start_full.bat

echo.
echo ✅ Dependencies installed successfully!
echo.
echo To start the full project, run: start_full.bat
echo.
pause