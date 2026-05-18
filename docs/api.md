# API 文档

## 概述

电商商城后端API，基于RESTful设计原则，使用JSON格式进行数据交换。

### 基础信息
- **基础URL**: `https://api.yourdomain.com/api` 或 `http://localhost:3000/api`
- **内容类型**: `application/json`
- **认证方式**: Bearer Token (JWT)

### 状态码
| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 422 | 数据验证失败 |
| 500 | 服务器内部错误 |

### 通用响应格式
```json
{
  "success": true,
  "message": "操作成功",
  "data": {},
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

错误响应：
```json
{
  "success": false,
  "message": "错误信息",
  "errors": {
    "field": ["错误详情"]
  }
}
```

## 认证相关

### 用户注册
**POST** `/auth/register`

**请求体**:
```json
{
  "username": "user123",
  "password": "password123",
  "email": "user@example.com",
  "phone": "13800138000",
  "nickname": "用户昵称"
}
```

**响应**:
```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "user": {
      "id": 1,
      "username": "user123",
      "email": "user@example.com",
      "nickname": "用户昵称",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 用户登录
**POST** `/auth/login`

**请求体**:
```json
{
  "username": "user123",
  "password": "password123"
}
```

**响应**:
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "user123",
      "email": "user@example.com",
      "nickname": "用户昵称",
      "avatar": "https://example.com/avatar.jpg"
    }
  }
}
```

### 获取用户信息
**GET** `/auth/profile`

**Headers**:
```
Authorization: Bearer {token}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "user123",
    "email": "user@example.com",
    "phone": "13800138000",
    "avatar": "https://example.com/avatar.jpg",
    "nickname": "用户昵称",
    "gender": 1,
    "birthday": "1990-01-01",
    "status": 1,
    "last_login": "2024-01-01T10:00:00.000Z",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 更新用户信息
**PUT** `/auth/profile`

**Headers**:
```
Authorization: Bearer {token}
```

**请求体**:
```json
{
  "email": "newemail@example.com",
  "phone": "13800138001",
  "nickname": "新昵称",
  "gender": 2,
  "birthday": "1990-01-01"
}
```

### 修改密码
**POST** `/auth/change-password`

**Headers**:
```
Authorization: Bearer {token}
```

**请求体**:
```json
{
  "old_password": "oldpassword123",
  "new_password": "newpassword123"
}
```

### 退出登录
**POST** `/auth/logout`

**Headers**:
```
Authorization: Bearer {token}
```

## 用户相关

### 获取用户列表（管理员）
**GET** `/users`

**查询参数**:
- `page`: 页码，默认1
- `limit`: 每页数量，默认10
- `search`: 搜索关键词（用户名/邮箱/手机号）
- `status`: 状态过滤（0-禁用，1-正常）

**响应**:
```json
{
  "success": true,
  "data": {
    "users": [...],
    "meta": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "pages": 10
    }
  }
}
```

### 获取用户详情
**GET** `/users/:id`

### 更新用户状态（管理员）
**PATCH** `/users/:id/status`

**请求体**:
```json
{
  "status": 0
}
```

## 商品相关

### 获取商品列表
**GET** `/products`

**查询参数**:
- `page`: 页码，默认1
- `limit`: 每页数量，默认12
- `category_id`: 分类ID
- `brand`: 品牌
- `min_price`: 最低价格
- `max_price`: 最高价格
- `keyword`: 搜索关键词
- `sort_by`: 排序字段（price, sales, created_at）
- `sort_order`: 排序方向（asc, desc）
- `status`: 状态（0-下架，1-上架）

**响应**:
```json
{
  "success": true,
  "data": {
    "products": [...],
    "categories": [...],
    "meta": {
      "total": 100,
      "page": 1,
      "limit": 12,
      "pages": 9
    }
  }
}
```

### 获取商品详情
**GET** `/products/:id`

**响应**:
```json
{
  "success": true,
  "data": {
    "product": {
      "id": 1,
      "name": "商品名称",
      "category_id": 1,
      "brand": "品牌",
      "price": 299.00,
      "market_price": 399.00,
      "stock": 100,
      "sales": 50,
      "main_image": "https://example.com/image.jpg",
      "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
      "description": "商品描述",
      "detail": "商品详情HTML",
      "status": 1,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "category": {
        "id": 1,
        "name": "分类名称"
      }
    },
    "related_products": [...],
    "reviews": [...],
    "review_stats": {
      "average_rating": 4.5,
      "total_reviews": 100,
      "rating_distribution": {
        "1": 5,
        "2": 10,
        "3": 20,
        "4": 30,
        "5": 35
      }
    }
  }
}
```

### 创建商品（管理员）
**POST** `/products`

**Headers**:
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**表单数据**:
- `name`: 商品名称（必填）
- `category_id`: 分类ID（必填）
- `brand`: 品牌
- `price`: 价格（必填）
- `market_price`: 市场价
- `stock`: 库存
- `description`: 描述
- `detail`: 详情
- `main_image`: 主图文件
- `images[]`: 多图文件数组

### 更新商品（管理员）
**PUT** `/products/:id`

### 删除商品（管理员）
**DELETE** `/products/:id`

### 搜索商品
**GET** `/products/search`

**查询参数**:
- `keyword`: 搜索关键词（必填）
- 其他参数同商品列表

### 获取热门商品
**GET** `/products/hot`

**查询参数**:
- `limit`: 数量，默认10

### 获取推荐商品
**GET** `/products/recommended`

**查询参数**:
- `limit`: 数量，默认10

### 获取新品
**GET** `/products/new`

**查询参数**:
- `limit`: 数量，默认10

## 分类相关

### 获取分类树
**GET** `/categories/tree`

**响应**:
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "服装服饰",
        "parent_id": 0,
        "level": 1,
        "sort": 1,
        "icon": "👕",
        "children": [
          {
            "id": 2,
            "name": "女装",
            "parent_id": 1,
            "level": 2,
            "sort": 1,
            "icon": "👚"
          }
        ]
      }
    ]
  }
}
```

### 获取分类详情
**GET** `/categories/:id`

### 获取分类商品
**GET** `/categories/:id/products`

**查询参数**: 同商品列表

### 创建分类（管理员）
**POST** `/categories`

**请求体**:
```json
{
  "name": "新分类",
  "parent_id": 0,
  "sort": 1,
  "icon": "📱"
}
```

## 购物车相关

### 获取购物车
**GET** `/cart`

**Headers**:
```
Authorization: Bearer {token}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "user_id": 1,
        "product_id": 1,
        "quantity": 2,
        "selected": true,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z",
        "product": {
          "id": 1,
          "name": "商品名称",
          "price": 299.00,
          "main_image": "https://example.com/image.jpg",
          "stock": 100
        }
      }
    ],
    "total_items": 2,
    "total_price": 598.00
  }
}
```

### 添加到购物车
**POST** `/cart`

**Headers**:
```
Authorization: Bearer {token}
```

**请求体**:
```json
{
  "product_id": 1,
  "quantity": 1
}
```

### 更新购物车项
**PUT** `/cart/items/:id`

**Headers**:
```
Authorization: Bearer {token}
```

**请求体**:
```json
{
  "quantity": 3,
  "selected": false
}
```

### 删除购物车项
**DELETE** `/cart/items/:id`

**Headers**:
```
Authorization: Bearer {token}
```

### 清空购物车
**DELETE** `/cart`

**Headers**:
```
Authorization: Bearer {token}
```

## 订单相关

### 创建订单
**POST** `/orders`

**Headers**:
```
Authorization: Bearer {token}
```

**请求体**:
```json
{
  "address_id": 1,
  "cart_item_ids": [1, 2, 3],
  "remark": "请尽快发货"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "order": {
      "id": 1,
      "order_no": "202401010001",
      "user_id": 1,
      "address_id": 1,
      "total_amount": 598.00,
      "discount_amount": 0,
      "shipping_amount": 0,
      "pay_amount": 598.00,
      "status": 0,
      "remark": "请尽快发货",
      "created_at": "2024-01-01T00:00:00.000Z",
      "items": [
        {
          "id": 1,
          "product_id": 1,
          "product_name": "商品名称",
          "product_image": "https://example.com/image.jpg",
          "price": 299.00,
          "quantity": 2,
          "total_price": 598.00
        }
      ],
      "address": {
        "id": 1,
        "receiver": "张三",
        "phone": "13800138000",
        "province": "北京市",
        "city": "北京市",
        "district": "朝阳区",
        "detail": "建国门外大街1号"
      }
    }
  }
}
```

### 获取订单列表
**GET** `/orders`

**Headers**:
```
Authorization: Bearer {token}
```

**查询参数**:
- `page`: 页码，默认1
- `limit`: 每页数量，默认10
- `status`: 状态过滤
- `start_date`: 开始日期
- `end_date`: 结束日期

### 获取订单详情
**GET** `/orders/:id`

**Headers**:
```
Authorization: Bearer {token}
```

### 取消订单
**POST** `/orders/:id/cancel`

**Headers**:
```
Authorization: Bearer {token}
```

### 确认收货
**POST** `/orders/:id/confirm`

**Headers**:
```
Authorization: Bearer {token}
```

### 删除订单
**DELETE** `/orders/:id`

**Headers**:
```
Authorization: Bearer {token}
```

## 收货地址相关

### 获取地址列表
**GET** `/addresses`

**Headers**:
```
Authorization: Bearer {token}
```

### 创建地址
**POST** `/addresses`

**Headers**:
```
Authorization: Bearer {token}
```

**请求体**:
```json
{
  "receiver": "李四",
  "phone": "13800138001",
  "province": "上海市",
  "city": "上海市",
  "district": "浦东新区",
  "detail": "陆家嘴环路100号",
  "is_default": true
}
```

### 更新地址
**PUT** `/addresses/:id`

**Headers**:
```
Authorization: Bearer {token}
```

### 删除地址
**DELETE** `/addresses/:id`

**Headers**:
```
Authorization: Bearer {token}
```

### 设置默认地址
**POST** `/addresses/:id/set-default`

**Headers**:
```
Authorization: Bearer {token}
```

## 评价相关

### 获取商品评价
**GET** `/products/:id/reviews`

**查询参数**:
- `page`: 页码，默认1
- `limit`: 每页数量，默认10
- `rating`: 评分过滤（1-5）

### 添加评价
**POST** `/products/:id/reviews`

**Headers**:
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**表单数据**:
- `rating`: 评分（1-5，必填）
- `content`: 评价内容
- `is_anonymous`: 是否匿名
- `images[]`: 图片文件数组

## 文件上传

### 上传文件
**POST** `/upload`

**Headers**:
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**表单数据**:
- `file`: 文件（支持图片、文档等）

**响应**:
```json
{
  "success": true,
  "data": {
    "url": "https://example.com/uploads/filename.jpg",
    "filename": "filename.jpg",
    "size": 102400,
    "mimetype": "image/jpeg"
  }
}
```

## 搜索相关

### 搜索建议
**GET** `/search/suggestions`

**查询参数**:
- `keyword`: 搜索关键词
- `limit`: 建议数量，默认5

**响应**:
```json
{
  "success": true,
  "data": {
    "suggestions": ["手机", "手机壳", "手机支架"],
    "products": [...]
  }
}
```

## 统计相关

### 获取销售统计（管理员）
**GET** `/stats/sales`

**Headers**:
```
Authorization: Bearer {token}
```

**查询参数**:
- `start_date`: 开始日期
- `end_date`: 结束日期
- `group_by`: 分组方式（day, week, month）

### 获取商品统计（管理员）
**GET** `/stats/products`

**Headers**:
```
Authorization: Bearer {token}
```

## WebSocket 实时通知

### 连接地址
```
ws://api.yourdomain.com/ws
```

### 事件类型
1. **订单状态更新**
   ```json
   {
     "type": "order_updated",
     "data": {
       "order_id": 1,
       "status": 2,
       "message": "订单已发货"
     }
   }
   ```

2. **库存预警**
   ```json
   {
     "type": "stock_warning",
     "data": {
       "product_id": 1,
       "product_name": "商品名称",
       "current_stock": 5
     }
   }
   ```

3. **系统通知**
   ```json
   {
     "type": "system_notification",
     "data": {
       "title": "系统维护通知",
       "content": "系统将于今晚进行维护",
       "level": "info"
     }
   }
   ```

## 限流策略

### 接口限流
- 公共接口：100次/15分钟/IP
- 认证接口：50次/15分钟/IP
- 管理接口：20次/15分钟/IP