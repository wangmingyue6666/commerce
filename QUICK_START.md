# 快速开始指南

## 5分钟快速启动

### 环境要求
- Node.js 16+ (推荐18+)
- MySQL 8.0+
- Git (可选)

### 步骤1：下载项目
```bash
# 如果使用Git
git clone https://github.com/yourusername/ecommerce.git
cd ecommerce

# 或者直接解压项目文件
```

### 步骤2：启动项目（最简单方式）

#### Windows用户：
1. 双击 `start.bat` 文件
2. 按照提示操作

#### macOS/Linux用户：
```bash
chmod +x start.sh
./start.sh
```

### 步骤3：访问应用
- 前端界面：http://localhost:8080
- 后端API：http://localhost:3000
- API文档：http://localhost:3000/api-docs

## 测试账号

项目已包含测试数据，可以使用以下账号登录：

### 普通用户
- 用户名：user1
- 密码：password123
- 邮箱：user1@example.com

### 管理员
- 用户名：admin
- 密码：password123
- 邮箱：admin@example.com

## 核心功能体验

### 1. 浏览商品
- 访问首页查看热门商品
- 点击分类浏览不同类别的商品
- 使用搜索功能查找商品

### 2. 购物流程
1. 登录账号（user1/password123）
2. 浏览商品并添加到购物车
3. 进入购物车调整商品数量
4. 结算创建订单
5. 查看订单状态

### 3. 用户管理
1. 登录后点击右上角用户头像
2. 进入个人中心
3. 管理收货地址
4. 查看订单历史

### 4. 后台管理（管理员）
1. 使用admin账号登录
2. 可以管理用户、商品、订单等
3. 查看数据统计

## 开发模式启动

### 手动启动（分步）

#### 1. 启动数据库
```bash
# 确保MySQL服务已启动
# Windows: 服务中启动MySQL80
# macOS: brew services start mysql
# Linux: sudo systemctl start mysql
```

#### 2. 初始化数据库
```bash
cd database
mysql -u root -p < init.sql
# 输入MySQL root密码
```

#### 3. 启动后端
```bash
cd backend
npm install
npm run dev
```

#### 4. 启动前端
```bash
cd frontend
npm install
npm run dev
```

## 常见问题

### Q1: MySQL连接失败
**问题**: 数据库初始化或连接失败
**解决**:
1. 检查MySQL服务是否运行
2. 修改backend/.env文件中的数据库配置
3. 使用正确的MySQL用户名和密码

### Q2: Node.js版本问题
**问题**: npm install 失败
**解决**:
```bash
# 检查Node.js版本
node --version

# 如果版本低于16，请升级
# 使用nvm管理Node.js版本
nvm install 18
nvm use 18
```

### Q3: 端口被占用
**问题**: 8080或3000端口已被占用
**解决**:
```bash
# 修改端口配置
# 后端: 修改backend/.env中的PORT
# 前端: 修改frontend/vite.config.ts中的server.port
```

### Q4: 前端无法访问后端API
**问题**: 跨域问题或代理配置
**解决**:
1. 检查frontend/vite.config.ts中的proxy配置
2. 确保后端服务已启动
3. 检查网络连接

## 项目结构速览

```
commerce/
├── frontend/          # 前端代码
│   ├── src/          # 源代码
│   ├── package.json  # 依赖配置
│   └── vite.config.ts # 构建配置
├── backend/          # 后端代码
│   ├── src/          # 源代码
│   ├── .env          # 环境配置
│   └── package.json  # 依赖配置
├── database/         # 数据库脚本
│   └── init.sql      # 初始化脚本
├── docs/            # 项目文档
├── start.bat        # Windows启动脚本
└── start.sh         # Linux/macOS启动脚本
```

## 下一步

### 学习项目
1. 阅读 `docs/` 目录下的详细文档
2. 查看 `PROJECT_SUMMARY.md` 了解项目全貌
3. 阅读代码了解实现细节

### 修改项目
1. 修改前端界面：编辑 `frontend/src/` 下的文件
2. 修改后端逻辑：编辑 `backend/src/` 下的文件
3. 修改数据库：编辑 `database/init.sql`

### 扩展功能
1. 添加新页面：在 `frontend/src/views/` 创建Vue组件
2. 添加新API：在 `backend/src/routes/` 创建路由
3. 添加新表：在 `database/init.sql` 添加SQL语句

## 获取帮助

- 查看详细文档：`docs/` 目录
- 查看API文档：http://localhost:3000/api-docs
- 查看控制台日志：启动脚本会打开终端窗口

## 生产部署

如需部署到生产环境，请参考：
- `docs/deployment.md` - 详细部署指南
- `docs/api.md` - API接口文档
- `docs/development.md` - 开发指南

---

**提示**: 首次启动可能需要5-10分钟下载依赖包，请耐心等待。