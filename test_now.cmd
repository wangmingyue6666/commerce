@echo off
chcp 65001 > nul
title 电商商城项目测试

echo.
echo ╔══════════════════════════════════════════╗
echo ║          电商商城项目测试                ║
echo ╚══════════════════════════════════════════╝
echo.

echo 步骤1：启动后端服务
echo 正在启动后端服务（端口3000）...
echo.

REM 启动后端服务
start "电商商城后端" cmd /c "cd /d "%~dp0backend" && node simple_server.js && pause"

echo 等待服务启动（5秒）...
timeout /t 5 /nobreak > nul

echo.
echo 步骤2：测试后端API
echo 正在测试后端服务是否正常...
echo.

REM 测试健康检查
powershell -Command "try { $response = Invoke-RestMethod -Uri 'http://localhost:3000/health' -Method Get; Write-Host '✅ 健康检查通过：' $response.message } catch { Write-Host '❌ 健康检查失败：' $_.Exception.Message }"

REM 测试商品API
powershell -Command "try { $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/products' -Method Get; Write-Host '✅ 商品API通过：获取到' $response.data.Count '个商品' } catch { Write-Host '❌ 商品API失败：' $_.Exception.Message }"

echo.
echo 步骤3：打开测试页面
echo 正在打开测试页面...
echo.

start "" "%~dp0frontend\simple_test.html"

echo.
echo ╔══════════════════════════════════════════╗
echo ║          测试环境已就绪！                ║
echo ╚══════════════════════════════════════════╝
echo.
echo 📍 测试页面已自动打开
echo 📍 后端服务正在运行（端口3000）
echo.
echo 🔧 测试账号：
echo   管理员：admin / password123
echo   普通用户：user1 / password123
echo.
echo 📋 测试步骤：
echo   1. 在测试页面点击"检查健康状态"
echo   2. 测试登录功能
echo   3. 测试数据接口
echo.
echo ⚠️  注意：不要关闭后端服务窗口！
echo.
echo 按任意键查看详细说明...
pause > nul

echo.
echo ╔══════════════════════════════════════════╗
echo ║          详细测试说明                    ║
echo ╚══════════════════════════════════════════╝
echo.
echo ✅ 如果看到以下结果，说明测试通过：
echo   1. 健康检查显示"后端服务运行正常"
echo   2. 登录成功返回JWT token
echo   3. 用户列表显示2个用户
echo   4. 商品列表显示4个商品
echo.
echo 📁 项目位置：%~dp0
echo 🌐 后端API：http://localhost:3000
echo 🖥️  前端测试：simple_test.html
echo.
echo 按任意键退出此窗口...
echo （后端服务窗口需要手动关闭）
pause > nul