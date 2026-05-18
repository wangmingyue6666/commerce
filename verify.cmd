@echo off
echo 验证电商商城后端服务
echo ========================
echo.

echo 正在启动后端服务...
echo 请查看新打开的窗口...
echo.

start cmd /k "cd /d D:\workspace\commerce\backend && echo 正在启动后端服务... && node simple_server.js"

echo.
echo 等待5秒让服务启动...
timeout /t 5 /nobreak > nul

echo.
echo 正在测试服务是否正常...
curl http://localhost:3000/health

echo.
echo 如果看到JSON响应，说明后端服务正常。
echo.
echo 按任意键打开测试页面...
pause > nul

start "" "D:\workspace\commerce\frontend\simple_test.html"

echo.
echo 测试页面已打开！
echo 在页面中点击按钮进行测试。
echo.
echo 按任意键退出...
pause > nul