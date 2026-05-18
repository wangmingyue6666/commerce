@echo off
echo Starting Vite development server...
echo.

REM 设置环境变量强制使用IPv4
set HOST=127.0.0.1
set PORT=8080

echo Host: %HOST%
echo Port: %PORT%
echo.

npx vite --host %HOST% --port %PORT%

pause