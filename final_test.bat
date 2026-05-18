@echo off
chcp 65001 > nul
echo ========================================
echo       电商商城项目 - 最终测试
echo ========================================
echo.

echo 步骤1：启动后端服务
echo 正在启动后端服务（端口：3000）...
echo.
start cmd /k "cd /d D:\workspace\commerce\backend && title 电商商城后端 && node simple_server.js"

echo 等待3秒让后端服务启动...
timeout /t 3 /nobreak > nul

echo.
echo 步骤2：打开测试页面
echo 正在打开测试页面...
echo.
start "" "D:\workspace\commerce\frontend\simple_test.html"

echo ========================================
echo         测试环境已准备就绪！
echo ========================================
echo.
echo 请按以下步骤测试：
echo.
echo 1. 查看后端服务窗口，确认服务已启动
echo 2. 在浏览器测试页面中：
echo    - 点击"检查健康状态"
echo    - 测试登录功能
echo    - 测试数据接口
echo.
echo 测试账号：
echo   admin / password123
echo   user1 / password123
echo.
echo 按任意键查看详细测试说明...
pause > nul

echo.
echo ========================================
echo         详细测试步骤
echo ========================================
echo.
echo 1. 健康检查
echo    点击"检查健康状态"按钮
echo    应该显示"后端服务运行正常"
echo.
echo 2. 登录测试
echo    使用 admin / password123 登录
echo    应该返回JWT token和用户信息
echo.
echo 3. 数据接口测试
echo    点击"获取用户列表" - 显示2个测试用户
echo    点击"获取商品列表" - 显示4个测试商品
echo.
echo 4. 所有测试通过后
echo    表示项目基础架构正常
echo    可以继续开发完整功能
echo.
echo 按任意键退出...
pause > nul