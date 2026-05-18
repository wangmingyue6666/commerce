@echo off
chcp 65001 > nul
echo ========================================
echo       电商商城项目启动脚本
echo ========================================
echo.

REM 检查Node.js
echo [1/5] 检查Node.js版本...
node --version > nul 2>&1
if errorlevel 1 (
    echo ❌ 未找到Node.js，请先安装Node.js 16+
    pause
    exit /b 1
)

REM 检查MySQL
echo [2/5] 检查MySQL服务...
sc query MySQL80 > nul 2>&1
if errorlevel 1 (
    echo ⚠️  MySQL服务未运行，请确保MySQL已安装并启动
    echo     如果未安装MySQL，请先安装MySQL 8.0+
    echo.
)

REM 初始化数据库
echo [3/5] 初始化数据库...
cd database
mysql -u root -p < init.sql 2>nul
if errorlevel 1 (
    echo ⚠️  数据库初始化失败，请手动执行：
    echo     mysql -u root -p < init.sql
    echo     或者使用其他MySQL用户
)
cd ..

REM 启动后端
echo [4/5] 启动后端服务...
start "电商商城后端" cmd /k "cd backend && npm install && npm run dev"

REM 等待后端启动
timeout /t 5 /nobreak > nul

REM 启动前端
echo [5/5] 启动前端服务...
start "电商商城前端" cmd /k "cd frontend && npm install && npm run dev"

echo.
echo ========================================
echo        启动完成！
echo ========================================
echo.
echo 访问地址：
echo 前端：http://localhost:8080
echo 后端API：http://localhost:3000
echo API文档：http://localhost:3000/api-docs
echo.
echo 按任意键打开浏览器访问前端...
pause > nul
start http://localhost:8080

echo.
echo 按任意键退出...
pause > nul