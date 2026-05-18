@echo off
chcp 65001 > nul
echo ========================================
echo       电商商城项目测试启动脚本
echo ========================================
echo.

echo [1/3] 启动后端服务...
cd backend

REM 检查并安装依赖
if not exist "node_modules\" (
    echo 正在安装后端依赖...
    call npm install
    if errorlevel 1 (
        echo 后端依赖安装失败！
        pause
        exit /b 1
    )
)

echo 启动后端服务...
start "后端服务" cmd /k "npm run dev"
cd ..

timeout /t 5 /nobreak > nul

echo [2/3] 启动前端服务...
cd frontend

REM 检查并安装依赖
if not exist "node_modules\" (
    echo 正在安装前端依赖...
    call npm install
    if errorlevel 1 (
        echo 前端依赖安装失败！
        pause
        exit /b 1
    )
)

echo 启动前端服务...
start "前端服务" cmd /k "npm run dev"
cd ..

echo [3/3] 等待服务启动...
timeout /t 10 /nobreak > nul

echo.
echo ========================================
echo         服务启动完成！
echo ========================================
echo.
echo 请访问：
echo 1. 前端页面：http://localhost:8080
echo 2. 后端API：http://localhost:3000
echo 3. API文档：http://localhost:3000/api-docs
echo.
echo 注意：如果没有安装MySQL，数据库功能可能不可用
echo.
echo 按任意键打开前端页面...
pause > nul
start http://localhost:8080

echo.
echo 按任意键退出此窗口...
pause > nul