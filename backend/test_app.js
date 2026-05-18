const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: '电商商城后端服务运行正常',
    timestamp: new Date().toISOString()
  });
});

// 模拟用户数据
const users = [
  { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin' },
  { id: 2, username: 'user1', email: 'user1@example.com', role: 'user' }
];

// 模拟商品数据
const products = [
  { id: 1, name: 'iPhone 15', price: 6999, stock: 50, sales: 100, market_price: 7999, main_image: 'https://example.com/iphone15.jpg', description: '最新款iPhone手机' },
  { id: 2, name: 'MacBook Pro', price: 12999, stock: 30, sales: 80, market_price: 14999, main_image: 'https://example.com/macbook.jpg', description: '专业级笔记本电脑' },
  { id: 3, name: '夏季连衣裙', price: 299, stock: 100, sales: 50, market_price: 399, main_image: 'https://example.com/dress1.jpg', description: '夏季新款连衣裙，舒适透气' },
  { id: 4, name: '男士衬衫', price: 199, stock: 200, sales: 30, market_price: 299, main_image: 'https://example.com/shirt1.jpg', description: '男士商务衬衫，经典款式' },
  { id: 5, name: '护肤品套装', price: 899, stock: 150, sales: 60, market_price: 1299, main_image: 'https://example.com/skincare.jpg', description: '护肤套装，保湿滋润' }
];

// 模拟购物车数据
const cartItems = [];

// 模拟订单数据
const orders = [];

// 模拟分类数据
const categories = ['手机数码', '电脑办公', '服装鞋包', '家用电器'];

// 验证token的中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: '未授权' });
  }
  
  // 简单验证token
  if (token === 'test_jwt_token_123456' || token === 'test_jwt_token_789012') {
    // 从token中提取用户信息
    const user = token === 'test_jwt_token_123456' ? users[0] : users[1];
    req.user = user;
    next();
  } else {
    res.status(403).json({ success: false, message: '无效的token' });
  }
};

// API路由
app.get('/api/users', (req, res) => {
  res.json({
    success: true,
    data: users,
    total: users.length
  });
});

// 获取商品列表
app.get('/api/products', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedProducts = products.slice(start, end);
  
  res.json({
    success: true,
    data: paginatedProducts,
    total: products.length,
    pagination: {
      page,
      limit,
      total: products.length,
      total_pages: Math.ceil(products.length / limit)
    }
  });
});

// 获取热门商品
app.get('/api/products/hot', (req, res) => {
  // 按销量排序，取前8个
  const hotProducts = [...products]
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 8);
  
  res.json({
    success: true,
    data: hotProducts
  });
});

// 获取商品详情
app.get('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);
  
  if (product) {
    res.json({
      success: true,
      data: product
    });
  } else {
    res.status(404).json({
      success: false,
      message: '商品不存在'
    });
  }
});

// 获取分类列表
app.get('/api/categories', (req, res) => {
  res.json({
    success: true,
    data: categories
  });
});

// 购物车相关API
app.get('/api/cart', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const userCartItems = cartItems.filter(item => item.userId === userId);
  
  // 关联商品信息
  const cartItemsWithProduct = userCartItems.map(item => {
    const product = products.find(p => p.id === item.productId);
    return {
      ...item,
      product
    };
  });
  
  res.json({
    success: true,
    data: cartItemsWithProduct
  });
});

app.post('/api/cart', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { productId, quantity = 1 } = req.body;
  
  if (!productId) {
    return res.status(400).json({ success: false, message: '请选择商品' });
  }
  
  const existingItem = cartItems.find(item => item.userId === userId && item.productId === productId);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    const newItem = {
      id: cartItems.length + 1,
      userId,
      productId,
      quantity
    };
    cartItems.push(newItem);
  }
  
  res.json({
    success: true,
    message: '商品已添加到购物车'
  });
});

// 订单相关API
app.get('/api/orders', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const userOrders = orders.filter(order => order.userId === userId);
  
  res.json({
    success: true,
    data: userOrders
  });
});

app.post('/api/orders', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { items, shipping_address, receiver, receiver_phone } = req.body;
  
  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: '订单商品不能为空' });
  }
  
  // 计算总金额
  let totalAmount = 0;
  const orderItems = [];
  
  for (const item of items) {
    const product = products.find(p => p.id === item.product_id);
    if (!product) {
      return res.status(400).json({ success: false, message: `商品ID ${item.product_id} 不存在` });
    }
    
    const subtotal = product.price * item.quantity;
    totalAmount += subtotal;
    
    orderItems.push({
      product_id: product.id,
      product_name: product.name,
      product_image: product.main_image,
      price: product.price,
      quantity: item.quantity,
      subtotal
    });
  }
  
  // 生成订单号
  const orderNo = 'ORD' + Date.now();
  
  // 创建订单
  const newOrder = {
    id: orders.length + 1,
    orderNo,
    userId,
    totalAmount,
    status: '待支付',
    shipping_address,
    receiver,
    receiver_phone,
    items: orderItems,
    createdAt: new Date().toISOString()
  };
  
  orders.push(newOrder);
  
  res.status(201).json({
    success: true,
    message: '订单创建成功',
    data: newOrder
  });
});

// 获取当前用户信息
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
});

// 登录接口
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'password123') {
    res.json({
      success: true,
      data: {
        token: 'test_jwt_token_123456',
        user: {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin'
        }
      }
    });
  } else if (username === 'user1' && password === 'password123') {
    res.json({
      success: true,
      data: {
        token: 'test_jwt_token_789012',
        user: {
          id: 2,
          username: 'user1',
          email: 'user1@example.com',
          role: 'user'
        }
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: '用户名或密码错误'
    });
  }
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API端点不存在',
    path: req.originalUrl
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 后端服务已启动`);
  console.log(`📡 地址: http://localhost:${PORT}`);
  console.log(`🔧 健康检查: http://localhost:${PORT}/health`);
  console.log(`👤 测试账号: admin / password123`);
  console.log(`👤 测试账号: user1 / password123`);
});