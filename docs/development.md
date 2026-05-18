# 开发指南

## 开发环境搭建

### 1. 环境准备

#### 系统要求
- **操作系统**: Windows 10+/macOS 10.15+/Ubuntu 20.04+
- **内存**: 8GB+ (推荐16GB)
- **存储**: 20GB+ 可用空间

#### 必需软件
- **Node.js**: 16.x 或 18.x
- **MySQL**: 8.0+
- **Git**: 2.20+
- **VS Code** (推荐) 或 WebStorm

#### 可选工具
- **Postman** 或 **Insomnia** (API测试)
- **Docker Desktop** (容器化开发)
- **Redis Desktop Manager** (Redis管理)
- **MySQL Workbench** (数据库管理)

### 2. 安装步骤

#### Windows 环境
```powershell
# 1. 安装 Node.js
# 下载地址: https://nodejs.org/
# 选择 LTS 版本

# 2. 安装 Git
# 下载地址: https://git-scm.com/

# 3. 安装 MySQL
# 下载地址: https://dev.mysql.com/downloads/installer/

# 4. 安装 VS Code
# 下载地址: https://code.visualstudio.com/

# 5. 验证安装
node --version
npm --version
git --version
mysql --version
```

#### macOS 环境
```bash
# 1. 安装 Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. 安装 Node.js
brew install node

# 3. 安装 Git
brew install git

# 4. 安装 MySQL
brew install mysql
brew services start mysql

# 5. 安装 VS Code
brew install --cask visual-studio-code
```

#### Linux (Ubuntu) 环境
```bash
# 1. 更新系统
sudo apt update && sudo apt upgrade -y

# 2. 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 3. 安装 Git
sudo apt install -y git

# 4. 安装 MySQL
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql

# 5. 安装 VS Code
sudo snap install --classic code
```

### 3. 项目初始化

```bash
# 1. 克隆项目
git clone https://github.com/yourusername/ecommerce.git
cd ecommerce

# 2. 初始化数据库
cd database
mysql -u root -p < init.sql

# 3. 启动后端
cd ../backend
npm install
cp .env.example .env
# 编辑 .env 文件，配置数据库连接等信息
npm run dev

# 4. 启动前端
cd ../frontend
npm install
npm run dev

# 5. 访问应用
# 前端: http://localhost:8080
# 后端API: http://localhost:3000
# API文档: http://localhost:3000/api-docs
```

## 项目结构说明

### 后端结构
```
backend/
├── src/
│   ├── app.ts                    # 应用入口
│   ├── config/                   # 配置文件
│   │   ├── database.ts           # 数据库配置
│   │   └── redis.ts              # Redis配置
│   ├── controllers/              # 控制器
│   │   ├── auth.controller.ts    # 认证控制器
│   │   ├── user.controller.ts    # 用户控制器
│   │   ├── product.controller.ts # 商品控制器
│   │   └── order.controller.ts   # 订单控制器
│   ├── models/                   # 数据模型
│   │   ├── user.model.ts         # 用户模型
│   │   ├── product.model.ts      # 商品模型
│   │   └── order.model.ts        # 订单模型
│   ├── services/                 # 业务服务
│   │   ├── auth.service.ts       # 认证服务
│   │   ├── user.service.ts       # 用户服务
│   │   └── product.service.ts    # 商品服务
│   ├── middlewares/              # 中间件
│   │   ├── auth.middleware.ts    # 认证中间件
│   │   ├── error.middleware.ts   # 错误处理中间件
│   │   └── validation.middleware.ts # 验证中间件
│   ├── routes/                   # 路由定义
│   │   ├── auth.routes.ts        # 认证路由
│   │   ├── user.routes.ts        # 用户路由
│   │   └── product.routes.ts     # 商品路由
│   ├── utils/                    # 工具函数
│   │   ├── logger.ts             # 日志工具
│   │   ├── jwt.ts                # JWT工具
│   │   └── validator.ts          # 验证工具
│   └── types/                    # TypeScript类型定义
│       ├── user.types.ts         # 用户类型
│       └── product.types.ts      # 商品类型
├── tests/                        # 测试文件
├── uploads/                      # 上传文件目录
├── docs/                         # 文档
├── .env.example                  # 环境变量示例
├── package.json                  # 依赖配置
├── tsconfig.json                 # TypeScript配置
└── README.md                     # 项目说明
```

### 前端结构
```
frontend/
├── src/
│   ├── main.ts                   # 应用入口
│   ├── App.vue                   # 根组件
│   ├── router/                   # 路由配置
│   │   └── index.ts              # 路由定义
│   ├── store/                    # Pinia状态管理
│   │   ├── auth.ts               # 认证状态
│   │   ├── cart.ts               # 购物车状态
│   │   └── product.ts            # 商品状态
│   ├── views/                    # 页面组件
│   │   ├── Home.vue              # 首页
│   │   ├── auth/                 # 认证页面
│   │   │   ├── Login.vue         # 登录页
│   │   │   └── Register.vue      # 注册页
│   │   ├── product/              # 商品页面
│   │   │   ├── ProductList.vue   # 商品列表
│   │   │   └── ProductDetail.vue # 商品详情
│   │   ├── cart/                 # 购物车页面
│   │   │   └── Cart.vue          # 购物车
│   │   ├── order/                # 订单页面
│   │   │   ├── OrderList.vue     # 订单列表
│   │   │   └── OrderDetail.vue   # 订单详情
│   │   └── user/                 # 用户页面
│   │       ├── Profile.vue       # 个人中心
│   │       └── Address.vue       # 收货地址
│   ├── components/               # 公共组件
│   │   ├── ProductCard.vue       # 商品卡片
│   │   ├── Header.vue            # 头部组件
│   │   └── Footer.vue            # 底部组件
│   ├── api/                      # API接口
│   │   ├── axios.ts              # Axios配置
│   │   ├── auth.ts               # 认证API
│   │   ├── product.ts            # 商品API
│   │   └── cart.ts               # 购物车API
│   ├── utils/                    # 工具函数
│   │   ├── auth.ts               # 认证工具
│   │   ├── formatter.ts          # 格式化工具
│   │   └── validator.ts          # 验证工具
│   ├── types/                    # TypeScript类型
│   │   ├── user.ts               # 用户类型
│   │   ├── product.ts            # 商品类型
│   │   └── order.ts              # 订单类型
│   ├── assets/                   # 静态资源
│   │   ├── images/               # 图片
│   │   └── styles/               # 样式文件
│   └── plugins/                  # Vue插件
├── public/                       # 公共资源
├── .env.example                  # 环境变量示例
├── package.json                  # 依赖配置
├── vite.config.ts                # Vite配置
├── tsconfig.json                 # TypeScript配置
└── README.md                     # 项目说明
```

## 开发规范

### 代码规范

#### TypeScript 规范
```typescript
// 使用接口定义类型
interface User {
  id: number;
  username: string;
  email?: string;
}

// 使用类型别名
type UserRole = 'admin' | 'user' | 'guest';

// 使用枚举
enum OrderStatus {
  PENDING = 0,
  PAID = 1,
  SHIPPED = 2,
  COMPLETED = 3,
  CANCELLED = 4
}

// 函数定义
function getUserById(id: number): Promise<User> {
  // 函数实现
}

// 箭头函数
const formatPrice = (price: number): string => {
  return `¥${price.toFixed(2)}`;
};
```

#### Vue 3 规范
```vue
<template>
  <!-- 使用kebab-case命名事件 -->
  <ProductCard @add-to-cart="handleAddToCart" />
  
  <!-- 使用v-model进行双向绑定 -->
  <el-input v-model="searchKeyword" />
  
  <!-- 使用:key进行列表渲染 -->
  <div v-for="product in products" :key="product.id">
    {{ product.name }}
  </div>
</template>

<script setup lang="ts">
// 使用Composition API
import { ref, computed, onMounted } from 'vue'

// 响应式数据
const count = ref(0)
const user = ref<User | null>(null)

// 计算属性
const doubleCount = computed(() => count.value * 2)

// 方法
const increment = () => {
  count.value++
}

// 生命周期
onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="scss">
// 使用scoped样式
.container {
  padding: 20px;
  
  .title {
    font-size: 24px;
    color: #333;
  }
}
</style>
```

#### CSS/SCSS 规范
```scss
// BEM命名规范
.product-card {
  &__image {
    // ...
  }
  
  &__title {
    // ...
    
    &--highlight {
      // ...
    }
  }
}

// 变量定义
$primary-color: #409eff;
$danger-color: #ff6b6b;
$border-radius: 8px;

// Mixin
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

// 使用
.container {
  @include flex-center;
  color: $primary-color;
  border-radius: $border-radius;
}
```

### Git 工作流

#### 分支策略
- `main`: 主分支，用于生产环境
- `develop`: 开发分支，用于集成测试
- `feature/*`: 功能分支，开发新功能
- `bugfix/*`: 修复分支，修复bug
- `hotfix/*`: 热修复分支，紧急修复生产问题

#### 提交规范
```
类型(范围): 描述

feat: 新增功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具变动
```

示例：
```
feat(user): 添加用户注册功能
fix(product): 修复商品价格显示问题
docs: 更新API文档
```

### 测试规范

#### 单元测试
```typescript
// 使用Jest进行测试
describe('UserService', () => {
  describe('getUserById', () => {
    it('should return user when user exists', async () => {
      // 准备
      const userId = 1
      const mockUser = { id: 1, username: 'test' }
      
      // 执行
      const result = await userService.getUserById(userId)
      
      // 断言
      expect(result).toEqual(mockUser)
    })
    
    it('should throw error when user not found', async () => {
      // 准备
      const userId = 999
      
      // 执行 & 断言
      await expect(userService.getUserById(userId))
        .rejects
        .toThrow('User not found')
    })
  })
})
```

#### E2E测试
```typescript
// 使用Cypress进行E2E测试
describe('购物流程', () => {
  it('用户登录后可以购买商品', () => {
    // 登录
    cy.visit('/login')
    cy.get('[data-test="username"]').type('testuser')
    cy.get('[data-test="password"]').type('password123')
    cy.get('[data-test="login-button"]').click()
    
    // 浏览商品
    cy.get('[data-test="product-card"]').first().click()
    
    // 添加到购物车
    cy.get('[data-test="add-to-cart"]').click()
    
    // 结算
    cy.visit('/cart')
    cy.get('[data-test="checkout-button"]').click()
    
    // 确认订单
    cy.get('[data-test="confirm-order"]').click()
    
    // 验证订单创建成功
    cy.url().should('include', '/orders/')
    cy.contains('订单创建成功')
  })
})
```

## 开发流程

### 1. 功能开发

```bash
# 1. 从develop分支创建功能分支
git checkout develop
git pull origin develop
git checkout -b feature/user-registration

# 2. 开发功能
# 编写代码、测试、文档

# 3. 提交代码
git add .
git commit -m "feat(user): 添加用户注册功能"
git push origin feature/user-registration

# 4. 创建Pull Request
# 在GitHub/GitLab上创建PR，请求合并到develop分支
```

### 2. 代码审查

审查要点：
- 代码是否符合规范
- 功能是否完整
- 测试是否覆盖
- 文档是否更新
- 性能是否优化

### 3. 测试流程

```bash
# 1. 运行单元测试
cd backend
npm test

cd ../frontend
npm test

# 2. 运行集成测试
cd backend
npm run test:integration

# 3. 运行E2E测试
cd frontend
npm run test:e2e

# 4. 代码覆盖率检查
npm run coverage
```

### 4. 部署流程

```bash
# 1. 合并到develop分支
git checkout develop
git merge feature/user-registration
git push origin develop

# 2. 运行CI/CD流水线
# 自动构建、测试、部署到测试环境

# 3. 测试环境验证
# 在测试环境验证功能

# 4. 发布到生产环境
git checkout main
git merge develop
git tag v1.2.0
git push origin main --tags
```

## 调试技巧

### 后端调试

```typescript
// 使用debugger语句
async function getUser(id: number) {
  debugger // 在这里设置断点
  const user = await User.findByPk(id)
  console.log('User:', user)
  return user
}

// 使用日志
import { logger } from './utils/logger'

logger.info('User login', { userId: 1, username: 'test' })
logger.error('Database connection failed', { error: err.message })
```

### 前端调试

```javascript
// Vue Devtools
// 安装Vue Devtools浏览器扩展

// 控制台调试
console.log('State:', store.state)
console.table(products.value)

// 性能分析
console.time('loadProducts')
await loadProducts()
console.timeEnd('loadProducts')

// 错误边界
onErrorCaptured((err, instance, info) => {
  console.error('Vue error:', err)
  console.error('Component:', instance)
  console.error('Info:', info)
  return false // 阻止错误继续向上传播
})
```

### 网络调试

```javascript
// 使用浏览器开发者工具
// 1. Network面板查看请求
// 2. Console面板查看日志
// 3. Sources面板调试代码
// 4. Application面板查看存储

// 使用代理工具
// Charles / Fiddler / mitmproxy
```

## 性能优化

### 后端优化

```typescript
// 1. 数据库查询优化
// 使用索引
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' })

// 分页查询
const users = await User.findAll({
  limit: 10,
  offset: (page - 1) * limit,
  order: [['created_at', 'DESC']]
})

// 2. 缓存优化
import redis from './config/redis'

async function getProduct(id: number) {
  const cacheKey = `product:${id}`
  const cached = await redis.get(cacheKey)
  
  if (cached) {
    return JSON.parse(cached)
  }
  
  const product = await Product.findByPk(id)
  await redis.setex(cacheKey, 3600, JSON.stringify(product))
  return product
}

// 3. 异步处理
import { Queue } from 'bull'

const emailQueue = new Queue('email', {
  redis: { host: