@echo off
chcp 65001 > nul
echo ========================================
echo       电商商城快速测试脚本
echo ========================================
echo.

echo [1/3] 启动后端服务...
cd backend
echo 正在启动后端模拟服务...
start "后端服务" cmd /k "node test_app.js"
cd ..

timeout /t 3 /nobreak > nul

echo [2/3] 启动前端测试页面...
cd frontend
echo 正在启动前端测试页面...
start "前端测试" cmd /k "npx serve -p 8080"
cd ..

echo [3/3] 等待服务启动...
timeout /t 5 /nobreak > nul

echo.
echo ========================================
echo         测试环境已就绪！
echo ========================================
echo.
echo 请访问以下地址：
echo.
echo 1. 前端测试页面：http://localhost:8080/test_index.html
echo 2. 后端API服务：http://localhost:3000
echo 3. 健康检查：http://localhost:3000/health
echo.
echo 测试账号：
echo   - admin / password123
echo   - user1 / password123
echo.
echo 按任意键打开测试页面...
pause > nul
start http://localhost:8080/test_index.html

echo.
echo 按任意键退出此窗口...
pause > nul