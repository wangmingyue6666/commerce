# 电商商城项目

![Project Status](https://img.shields.io/badge/status-active-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-green.svg)

这是一个前后端分离的电商商城项目，参考淘宝设计，提供完整的电商购物体验。

## 📋 项目简介

本项目是一个功能完整的电商商城系统，包含用户端和后台管理系统，支持商品浏览、购物车、订单管理等核心功能。

## 📁 项目结构

```
commerce/
├── frontend/          # 前端项目 (Vue.js 3 + TypeScript)
├── backend/           # 后端项目 (Node.js + Express)
├── database/          # 数据库初始化脚本
└── docs/             # 项目文档
```

## ✨ 功能模块

### 1. 用户模块
- 用户注册/登录（支持手机号验证）
- 个人信息管理
- 收货地址管理
- 密码找回

### 2. 商品模块
- 商品分类展示
- 商品搜索与筛选
- 商品详情页
- 商品评价与评分

### 3. 购物车模块
- 添加商品到购物车
- 修改商品数量
- 删除商品
- 批量结算

### 4. 订单模块
- 创建订单
- 订单列表（待付款/待发货/待收货/已完成）
- 订单详情
- 订单支付（模拟支付）
- 订单取消与退款

### 5. 后台管理系统
- 商品管理（增删改查）
- 订单管理
- 用户管理
- 数据统计与报表

## 🛠️ 技术栈

### 前端
| 技术 | 版本 | 说明 |
|------|------|------|
| Vue.js | 3.3+ | 前端框架 |
| TypeScript | 5.2+ | 类型安全 |
| Vue Router | 4.2+ | 路由管理 |
| Pinia | 2.1+ | 状态管理 |
| Element Plus | 2.3+ | UI组件库 |
| Vant | 4.6+ | 移动端组件库 |
| Axios | 1.5+ | HTTP客户端 |

### 后端
| 技术 | 版本 | 说明 |
|------|------|------|
| Node.js | 18.x | 运行环境 |
| Express | 4.18+ | Web框架 |
| TypeScript | 5.2+ | 类型安全 |
| MySQL | 8.0+ | 数据库 |
| Sequelize | 6.32+ | ORM框架 |
| JWT | 9.0+ | 身份验证 |
| Winston | 3.10+ | 日志管理 |

### 开发工具
- Git 版本控制
- Postman API测试
- VSCode 开发环境
- ESLint 代码规范
- Prettier 代码格式化

## 🚀 快速开始

### 1. 环境准备
```bash
# 检查环境
node --version  # >= 16.0.0
npm --version   # >= 8.0.0
mysql --version # >= 8.0.0
```

### 2. 克隆项目
```bash
git clone https://github.com/wangmingyue6666/commerce.git
cd commerce
```

### 3. 数据库初始化
```bash
cd database
mysql -u root -p < init.sql
```

### 4. 后端启动
```bash
cd backend
npm install
npm run dev
# 服务运行在 http://localhost:3000
```

### 5. 前端启动
```bash
cd frontend
npm install
npm run dev
# 服务运行在 http://localhost:5173
```

## 📖 API文档

详细API文档请查看 `docs/api.md`

## 📦 部署说明

生产环境部署说明请查看 `docs/deployment.md`

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

如有问题或建议，欢迎提交 Issue 或联系开发团队。

---

**ClawShop** - 打造优质电商体验
