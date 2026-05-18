#!/bin/bash

echo "========================================"
echo "       电商商城项目启动脚本"
echo "========================================"
echo

# 检查Node.js
echo "[1/5] 检查Node.js版本..."
if ! command -v node &> /dev/null; then
    echo "❌ 未找到Node.js，请先安装Node.js 16+"
    exit 1
fi

# 检查MySQL
echo "[2/5] 检查MySQL服务..."
if ! command -v mysql &> /dev/null; then
    echo "⚠️  未找到MySQL，请确保MySQL已安装"
    echo "   如果未安装MySQL，请先安装MySQL 8.0+"
    echo
fi

# 初始化数据库
echo "[3/5] 初始化数据库..."
cd database
mysql -u root -p < init.sql 2>/dev/null
if [ $? -ne 0 ]; then
    echo "⚠️  数据库初始化失败，请手动执行："
    echo "   mysql -u root -p < init.sql"
    echo "   或者使用其他MySQL用户"
fi
cd ..

# 启动后端
echo "[4/5] 启动后端服务..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ 后端依赖安装失败"
    exit 1
fi

# 在新终端中启动后端
osascript -e 'tell app "Terminal" to do script "cd \"'$(pwd)'\" && npm run dev"' > /dev/null 2>&1 &

# 等待后端启动
sleep 5

# 启动前端
echo "[5/5] 启动前端服务..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ 前端依赖安装失败"
    exit 1
fi

# 在新终端中启动前端
osascript -e 'tell app "Terminal" to do script "cd \"'$(pwd)'\" && npm run dev"' > /dev/null 2>&1 &

echo
echo "========================================"
echo "        启动完成！"
echo "========================================"
echo
echo "访问地址："
echo "前端：http://localhost:8080"
echo "后端API：http://localhost:3000"
echo "API文档：http://localhost:3000/api-docs"
echo
read -p "按回车键打开浏览器访问前端..."
open http://localhost:8080

echo
read -p "按回车键退出..."
exit 0