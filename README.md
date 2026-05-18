# 电商商城项目

这是一个前后端分离的电商商城项目，参考淘宝设计，包含以下主要模块：

## 项目结构

```
commerce/
├── frontend/          # 前端项目 (Vue.js)
├── backend/           # 后端项目 (Node.js + Express)
├── database/          # 数据库脚本和配置
└── docs/             # 项目文档
```

## 功能模块

### 1. 用户模块
- 用户注册/登录
- 个人信息管理
- 收货地址管理

### 2. 商品模块
- 商品分类展示
- 商品搜索
- 商品详情
- 商品评价

### 3. 购物车模块
- 添加商品到购物车
- 修改商品数量
- 删除商品
- 结算

### 4. 订单模块
- 创建订单
- 订单列表
- 订单详情
- 订单状态跟踪
- 订单支付

### 5. 后台管理系统
- 商品管理
- 订单管理
- 用户管理
- 数据统计

## 技术栈

### 前端
- Vue.js 3 + TypeScript
- Vue Router
- Pinia (状态管理)
- Element Plus (UI组件库)
- Axios (HTTP客户端)

### 后端
- Node.js + Express
- TypeScript
- MySQL数据库
- JWT身份验证
- Sequelize ORM

### 开发工具
- Git版本控制
- Postman API测试
- VSCode开发环境

## 快速开始

### 1. 环境准备
- Node.js 16+
- MySQL 8+
- Git

### 2. 数据库初始化
```bash
cd database
mysql -u root -p < init.sql
```

### 3. 后端启动
```bash
cd backend
npm install
npm run dev
```

### 4. 前端启动
```bash
cd frontend
npm install
npm run dev
```

## API文档

详细API文档请查看 `docs/api.md`

## 部署说明

生产环境部署说明请查看 `docs/deployment.md`