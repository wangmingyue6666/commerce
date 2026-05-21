# 电商商城系统启动指南

## 一、环境要求

### 基础环境
- **Node.js**: >= 16.0.0
- **npm**: >= 8.0.0
- **MySQL**: >= 8.0

### 推荐工具
- **Git**: 版本控制
- **VS Code**: 代码编辑器
- **MySQL Workbench**: 数据库管理工具（可选）

---

## 二、项目结构

```
commerce/
├── backend/              # 后端服务
│   ├── src/              # 源代码
│   ├── dist/             # 编译后文件
│   ├── node_modules/     # 依赖包
│   ├── .env              # 环境配置
│   └── package.json      # 依赖配置
├── frontend/             # 前端应用
│   ├── src/              # 源代码
│   ├── dist/             # 构建后文件
│   ├── node_modules/     # 依赖包
│   └── package.json      # 依赖配置
├── database/             # 数据库脚本
│   └── init.sql          # 初始化脚本
└── README.md             # 项目说明
```

---

## 三、数据库配置与启动

### 3.1 安装MySQL（如果尚未安装）

**Windows系统**:
1. 下载MySQL Installer: https://dev.mysql.com/downloads/installer/
2. 安装过程中设置root密码（建议设置为空或简单密码如 `password`）
3. 确保MySQL服务启动（服务名称通常为 `MySQL80`）

**验证MySQL服务**:
```bash
# 检查MySQL服务状态
sc query MySQL80

# 启动MySQL服务（如果未启动）
net start MySQL80
```

### 3.2 创建数据库

使用MySQL客户端连接后执行：

```sql
-- 创建数据库
CREATE DATABASE IF NOT EXISTS `commerce` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE `commerce`;

-- 创建用户（可选，用于远程连接）
CREATE USER 'ecommerce'@'%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON commerce.* TO 'ecommerce'@'%';
FLUSH PRIVILEGES;
```

### 3.3 导入初始数据

执行 `database/init.sql` 文件：

```bash
# 方法1：使用mysql命令行
mysql -u root -p commerce < database/init.sql

# 方法2：使用MySQL Workbench导入
# 打开init.sql文件，执行运行
```

### 3.4 配置数据库连接

编辑 `backend/.env` 文件：

```env
# 数据库配置
DB_HOST=localhost       # 数据库主机（本地使用localhost，远程使用IP地址）
DB_PORT=3306           # MySQL默认端口
DB_NAME=commerce       # 数据库名称
DB_USER=root           # 数据库用户名
DB_PASSWORD=           # 数据库密码（根据实际设置填写）
```

---

## 四、后端服务启动

### 4.1 安装依赖

```bash
cd backend
npm install
```

### 4.2 编译TypeScript

```bash
npm run build
```

### 4.3 启动服务

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

### 4.4 验证后端服务

服务启动后，访问以下地址验证：

```bash
# 检查服务状态
curl http://localhost:3000/api/health

# 预期响应：
# {"success":true,"message":"Server is running"}

# 获取商品列表
curl http://localhost:3000/api/products/hot
```

### 4.5 后端服务配置说明

**端口配置**: 默认端口为 `3000`，可在 `.env` 中修改 `PORT` 参数

**日志查看**: 启动后控制台会输出服务状态和数据库连接信息

---

## 五、前端服务启动

### 5.1 安装依赖

```bash
cd frontend
npm install
```

### 5.2 开发模式启动

```bash
npm run dev
```

服务启动后访问：http://localhost:8080

### 5.3 生产构建与预览

```bash
# 构建项目
npm run build

# 预览构建结果
npm run preview -- --host 127.0.0.1 --port 8081
```

### 5.4 验证前端服务

打开浏览器访问：
- 开发环境：http://localhost:8080
- 预览环境：http://127.0.0.1:8081

### 5.5 前端配置说明

**端口配置**: 默认端口为 `8080`，可在 `vite.config.ts` 中修改

**API代理**: 前端已配置代理，`/api` 请求会自动转发到 `http://localhost:3000`

---

## 六、完整启动流程（推荐）

### 方式一：手动启动

```bash
# 1. 启动MySQL服务
net start MySQL80

# 2. 启动后端服务（新开终端）
cd backend
npm start

# 3. 启动前端服务（新开终端）
cd frontend
npm run dev
```

### 方式二：使用脚本启动

创建启动脚本 `start_all.bat`（Windows）：

```batch
@echo off
echo 启动MySQL服务...
net start MySQL80

echo 启动后端服务...
start cmd /k "cd backend && npm start"

echo 等待后端启动...
timeout /t 5 /nobreak >nul

echo 启动前端服务...
start cmd /k "cd frontend && npm run dev"

echo 服务启动完成！
echo 前端地址: http://localhost:8080
echo 后端地址: http://localhost:3000
```

---

## 七、功能测试

### 7.1 用户登录

**测试账号**:
- 管理员: `admin` / `password123`
- 普通用户: `user1` / `password123`
- 普通用户: `user2` / `password123`

### 7.2 购物车功能测试

1. 访问首页，浏览商品
2. 点击"加入购物车"
3. 点击右上角购物车图标查看
4. 测试修改数量、删除商品、清空购物车

### 7.3 订单功能测试

1. 登录后添加商品到购物车
2. 点击"去结算"创建订单
3. 查看订单列表和详情
4. 测试订单编辑、取消功能

### 7.4 管理后台测试

1. 使用管理员账号登录
2. 点击"管理后台"进入
3. 测试商品管理、订单管理、分类管理

---

## 八、常见问题排查

### 8.1 数据库连接失败

**问题**: `Unable to connect to the database`

**解决方案**:
1. 确认MySQL服务已启动
2. 检查 `.env` 中的数据库配置是否正确
3. 确认数据库用户有权限访问（特别是远程连接时）
4. 尝试使用空密码或正确的密码

### 8.2 端口占用

**问题**: `Port 3000 is already in use` 或 `Port 8080 is already in use`

**解决方案**:
```bash
# 查找占用端口的进程
netstat -ano | findstr ":3000"

# 终止进程（替换PID为实际进程ID）
taskkill /F /PID [进程ID]
```

### 8.3 前端无法访问后端API

**问题**: 前端请求API时出现跨域错误或404

**解决方案**:
1. 确认后端服务已启动
2. 检查 `vite.config.ts` 中的代理配置
3. 确认后端CORS配置允许前端访问

### 8.4 前端开发模式404

**问题**: 访问 http://localhost:8080 返回404

**解决方案**:
- 使用预览模式代替开发模式：`npm run preview`
- 或检查 `vite.config.ts` 中的 `appType: 'spa'` 配置

### 8.5 构建失败

**问题**: Vue-tsc编译错误

**解决方案**:
```bash
# 升级vue-tsc
npm install vue-tsc@latest -D

# 删除旧的编译文件
Get-ChildItem -Path "src" -Recurse -Include "*.vue.js", "*.vue.d.ts" | Remove-Item -ErrorAction SilentlyContinue

# 重新构建
npm run build
```

---

## 九、服务访问地址汇总

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端开发 | http://localhost:8080 | 开发模式，支持热更新 |
| 前端预览 | http://127.0.0.1:8081 | 构建后预览 |
| 后端API | http://localhost:3000 | RESTful API服务 |
| 数据库 | localhost:3306 | MySQL数据库 |

---

## 十、技术支持

如遇问题，请检查：
1. Node.js版本是否符合要求
2. 所有依赖是否已正确安装
3. 数据库服务是否正常运行
4. 端口是否被占用
5. 网络连接是否正常

---

**文档版本**: v1.0  
**最后更新**: 2024年  
**适用项目**: 电商商城系统