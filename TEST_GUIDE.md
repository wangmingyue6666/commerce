# 电商商城项目测试指南

## 简单测试方法

### 第一步：启动后端服务
1. 打开命令提示符（CMD）
2. 执行以下命令：
   ```
   cd /d D:\workspace\commerce\backend
   node simple_server.js
   ```
3. 你应该看到以下输出：
   ```
   ==================================================
   🚀 电商商城后端服务已启动
   ==================================================
   📡 服务地址: http://localhost:3000
   🔧 健康检查: http://localhost:3000/health
   ...
   ```

### 第二步：打开测试页面
1. 在文件资源管理器中打开：
   ```
   D:\workspace\commerce\frontend\simple_test.html
   ```
2. 或者直接在浏览器地址栏输入：
   ```
   file:///D:/workspace/commerce/frontend/simple_test.html
   ```

### 第三步：进行测试
在测试页面中：

1. **健康检查** - 点击"检查健康状态"按钮
   - 应该显示"后端服务运行正常"

2. **登录测试** - 使用以下账号测试：
   - `admin / password123`
   - `user1 / password123`
   - 应该返回JWT token和用户信息

3. **数据接口测试**：
   - 点击"获取用户列表" - 显示2个测试用户
   - 点击"获取商品列表" - 显示4个测试商品

## 完整项目结构说明

```
D:\workspace\commerce\
├── backend/                    # 后端项目
│   ├── simple_server.js       # 测试用后端服务器（无需安装依赖）
│   ├── test_app.js           # Express版本后端（需要安装依赖）
│   └── src/                  # 完整后端源码
├── frontend/                  # 前端项目
│   ├── simple_test.html      # 测试页面（直接打开可用）
│   ├── test_index.html       # 完整测试页面
│   └── src/                  # 完整前端源码
├── database/                  # 数据库脚本
├── docs/                     # 项目文档
└── 各种配置文件
```

## 常见问题解决

### 1. 端口被占用
如果3000端口被占用，可以修改 `simple_server.js` 中的端口号：
```javascript
const PORT = 3001; // 改为其他端口
```

### 2. 跨域问题
测试页面已经处理了CORS，如果遇到跨域问题，请确保：
- 后端服务正在运行
- 使用正确的URL访问

### 3. 测试失败
如果测试失败，请检查：
- 后端服务是否启动成功
- 防火墙是否阻止了3000端口
- 浏览器控制台是否有错误信息

## 测试通过标准

✅ 所有测试通过表示：
1. 前后端通信正常
2. API接口工作正常  
3. 项目基础架构完整
4. 可以继续开发完整功能

## 下一步
测试通过后，可以：
1. 安装MySQL数据库
2. 运行 `database/init.sql` 初始化数据库
3. 安装完整的前后端依赖
4. 启动完整项目

## 快速验证命令
打开新的命令提示符，依次执行：

```bash
# 1. 启动后端
cd /d D:\workspace\commerce\backend
node simple_server.js

# 2. 在另一个窗口测试API
curl http://localhost:3000/health
curl http://localhost:3000/api/products
```

如果看到JSON响应，说明后端工作正常。