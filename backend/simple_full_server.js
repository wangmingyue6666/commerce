const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'ecommerce_secret_key_2026';

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 内存数据库
let users = [];
let products = [];
let cartItems = [];
let orders = [];

// 初始化数据
function initData() {
  // 初始化用户
  const hashedPassword = bcrypt.hashSync('password123', 10);
  users = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      avatar: '',
      phone: '13800138000',
      address: '北京市朝阳区',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      username: 'user1',
      email: 'user1@example.com',
      password: hashedPassword,
      role: 'user',
      avatar: '',
      phone: '13900139001',
      address: '上海市浦东新区',
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      username: 'user2',
      email: 'user2@example.com',
      password: hashedPassword,
      role: 'user',
      avatar: '',
      phone: '13700137002',
      address: '广州市天河区',
      created_at: new Date().toISOString()
    }
  ];

  // 初始化商品
  products = [
    {
      id: 1,
      name: 'iPhone 15 Pro Max',
      description: '苹果最新旗舰手机，A17 Pro芯片，钛金属边框',
      price: 9999,
      original_price: 10999,
      stock: 50,
      category: '手机数码',
      main_image: 'https://via.placeholder.com/300x300/007AFF/FFFFFF?text=iPhone+15',
      images: [
        'https://via.placeholder.com/300x300/007AFF/FFFFFF?text=iPhone+15+1',
        'https://via.placeholder.com/300x300/007AFF/FFFFFF?text=iPhone+15+2'
      ],
      tags: ['苹果', '旗舰', '5G', '智能手机'],
      is_hot: true,
      is_new: true,
      sales_count: 120,
      status: 'active',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'MacBook Pro 16英寸',
      description: '苹果专业级笔记本电脑，M3 Max芯片',
      price: 19999,
      original_price: 21999,
      stock: 30,
      category: '电脑办公',
      main_image: 'https://via.placeholder.com/300x300/000000/FFFFFF?text=MacBook+Pro',
      images: [
        'https://via.placeholder.com/300x300/000000/FFFFFF?text=MacBook+Pro+1',
        'https://via.placeholder.com/300x300/000000/FFFFFF?text=MacBook+Pro+2'
      ],
      tags: ['苹果', '笔记本电脑', '专业'],
      is_hot: true,
      is_new: true,
      sales_count: 85,
      status: 'active',
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      name: '夏季连衣裙',
      description: '女士夏季新款连衣裙，纯棉材质，多种颜色可选',
      price: 299,
      original_price: 399,
      stock: 200,
      category: '服装鞋包',
      main_image: 'https://via.placeholder.com/300x300/FF6B6B/FFFFFF?text=连衣裙',
      images: [
        'https://via.placeholder.com/300x300/FF6B6B/FFFFFF?text=连衣裙+1',
        'https://via.placeholder.com/300x300/FF6B6B/FFFFFF?text=连衣裙+2'
      ],
      tags: ['女装', '连衣裙', '夏季', '时尚'],
      is_hot: true,
      is_new: true,
      sales_count: 320,
      status: 'active',
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      name: '男士商务衬衫',
      description: '男士正装衬衫，免烫面料，多色可选',
      price: 199,
      original_price: 299,
      stock: 150,
      category: '服装鞋包',
      main_image: 'https://via.placeholder.com/300x300/4ECDC4/FFFFFF?text=衬衫',
      images: [
        'https://via.placeholder.com/300x300/4ECDC4/FFFFFF?text=衬衫+1',
        'https://via.placeholder.com/300x300/4ECDC4/FFFFFF?text=衬衫+2'
      ],
      tags: ['男装', '衬衫', '商务', '正装'],
      is_hot: true,
      is_new: false,
      sales_count: 210,
      status: 'active',
      created_at: new Date().toISOString()
    },
    {
      id: 5,
      name: '智能电视 65英寸',
      description: '4K超高清智能电视，支持HDR，语音控制',
      price: 3999,
      original_price: 4999,
      stock: 80,
      category: '家用电器',
      main_image: 'https://via.placeholder.com/300x300/45B7D1/FFFFFF?text=智能电视',
      images: [
        'https://via.placeholder.com/300x300/45B7D1/FFFFFF?text=智能电视+1',
        'https://via.placeholder.com/300x300/45B7D1/FFFFFF?text=智能电视+2'
      ],
      tags: ['电视', '智能', '4K', '家居'],
      is_hot: true,
      is_new: true,
      sales_count: 95,
      status: 'active',
      created_at: new Date().toISOString()
    },
    {
      id: 6,
      name: '无线蓝牙耳机',
      description: '主动降噪蓝牙耳机，续航30小时',
      price: 599,
      original_price: 799,
      stock: 300,
      category: '手机数码',
      main_image: 'https://via.placeholder.com/300x300/96CEB4/FFFFFF?text=蓝牙耳机',
      images: [
        'https://via.placeholder.com/300x300/96CEB4/FFFFFF?text=蓝牙耳机+1',
        'https://via.placeholder.com/300x300/96CEB4/FFFFFF?text=蓝牙耳机+2'
      ],
      tags: ['耳机', '蓝牙', '降噪', '无线'],
      is_hot: true,
      is_new: true,
      sales_count: 450,
      status: 'active',
      created_at: new Date().toISOString()
    }
  ];

  console.log('✅ 内存数据初始化完成');
}

// JWT验证中间件
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: '需要身份验证' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: '令牌无效或已过期' });
    }
    req.user = user;
    next();
  });
}

// API路由

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '电商商城完整版后端服务运行正常（内存数据库）',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    stats: {
      users: users.length,
      products: products.length,
      cart_items: cartItems.length,
      orders: orders.length
    }
  });
});

// 用户登录
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: '请填写用户名和密码' });
  }

  const user = users.find(u => u.username === username || u.email === username);
  
  if (!user) {
    return res.status(401).json({ success: false, message: '用户名或密码错误' });
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(401).json({ success: false, message: '用户名或密码错误' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  // 移除密码字段
  const { password: _, ...userWithoutPassword } = user;

  res.json({
    success: true,
    data: {
      token,
      user: userWithoutPassword
    }
  });
});

// 获取商品列表
app.get('/api/products', (req, res) => {
  const { page = 1, limit = 10, category, keyword } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  let filteredProducts = products.filter(p => p.status === 'active');

  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }

  if (keyword) {
    const searchTerm = keyword.toLowerCase();
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(searchTerm) ||
      p.description.toLowerCase().includes(searchTerm) ||
      p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  // 分页
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: paginatedProducts,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: filteredProducts.length,
      total_pages: Math.ceil(filteredProducts.length / limitNum)
    }
  });
});

// 获取商品详情
app.get('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id && p.status === 'active');

  if (!product) {
    return res.status(404).json({ success: false, message: '商品不存在' });
  }

  res.json({ success: true, data: product });
});

// 获取热门商品
app.get('/api/products/hot', (req, res) => {
  const hotProducts = products
    .filter(p => p.is_hot && p.status === 'active')
    .sort((a, b) => b.sales_count - a.sales_count)
    .slice(0, 8)
    .map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      original_price: p.original_price,
      main_image: p.main_image
    }));

  res.json({ success: true, data: hotProducts });
});

// 获取新品
app.get('/api/products/new', (req, res) => {
  const newProducts = products
    .filter(p => p.is_new && p.status === 'active')
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 8)
    .map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      original_price: p.original_price,
      main_image: p.main_image
    }));

  res.json({ success: true, data: newProducts });
});

// 获取商品分类
app.get('/api/categories', (req, res) => {
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  res.json({ success: true, data: categories });
});

// 首页数据
app.get('/api/home', (req, res) => {
  const banners = products
    .filter(p => p.is_hot && p.status === 'active')
    .slice(0, 5)
    .map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      main_image: p.main_image
    }));

  const newProducts = products
    .filter(p => p.is_new && p.status === 'active')
    .slice(0, 8)
    .map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      main_image: p.main_image
    }));

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))].slice(0, 6);

  res.json({
    success: true,
    data: {
      banners,
      new_products: newProducts,
      categories,
      announcements: [
        { id: 1, title: '新用户注册送100元优惠券', type: 'promotion' },
        { id: 2, title: '全场满299元包邮', type: 'notice' },
        { id: 3, title: 'iPhone 15系列新品上市', type: 'new' }
      ]
    }
  });
});

// 购物车API
app.get('/api/cart', authenticateToken, (req, res) => {
  const userCartItems = cartItems.filter(item => item.user_id === req.user.id);
  
  const itemsWithDetails = userCartItems.map(item => {
    const product = products.find(p => p.id === item.product_id);
    if (!product) return null;
    
    const subtotal = product.price * item.quantity;
    return {
      ...item,
      name: product.name,
      price: product.price,
      main_image: product.main_image,
      stock: product.stock,
      subtotal
    };
  }).filter(Boolean);

  const totalAmount = itemsWithDetails.reduce((sum, item) => sum + item.subtotal, 0);

  res.json({
    success: true,
    data: {
      items: itemsWithDetails,
      summary: {
        total_items: itemsWithDetails.length,
        total_amount: totalAmount
      }
    }
  });
});

// 添加到购物车
app.post('/api/cart', authenticateToken, (req, res) => {
  const { product_id, quantity = 1 } = req.body;

  if (!product_id) {
    return res.status(400).json({ success: false, message: '请选择商品' });
  }

  const product = products.find(p => p.id === product_id && p.status === 'active');
  if (!product) {
    return res.status(404).json({ success: false, message: '商品不存在' });
  }

  const existingItemIndex = cartItems.findIndex(
    item => item.user_id === req.user.id && item.product_id === product_id
  );

  if (existingItemIndex !== -1) {
    // 更新数量
    cartItems[existingItemIndex].quantity += quantity;
  } else {
    // 新增商品
    const newItem = {
      id: cartItems.length + 1,
      user_id: req.user.id,
      product_id,
      quantity,
      created_at: new Date().toISOString()
    };
    cartItems.push(newItem);
  }

  res.json({ success: true, message: '商品已添加到购物车' });
});

// 更新购物车商品数量
app.put('/api/cart/:id', authenticateToken, (req, res) => {
  const id = parseInt(req.params.id);
  const { quantity } = req.body;

  if (quantity === undefined) {
    return res.status(400).json({ success: false, message: '请提供数量' });
  }

  const itemIndex = cartItems.findIndex(item => item.id === id && item.user_id === req.user.id);
  
  if (itemIndex === -1) {
    return res.status(404).json({ success: false, message: '购物车商品不存在' });
  }

  cartItems[itemIndex].quantity = quantity;
  res.json({ success: true, message: '更新成功' });
});

// 删除购物车商品
app.delete('/api/cart/:id', authenticateToken, (req, res) => {
  const id = parseInt(req.params.id);
  const initialLength = cartItems.length;
  
  cartItems = cartItems.filter(item => !(item.id === id && item.user_id === req.user.id));
  
  if (cartItems.length === initialLength) {
    return res.status(404).json({ success: false, message: '购物车商品不存在' });
  }

  res.json({ success: true, message: '删除成功' });
});

// 创建订单
app.post('/api/orders', authenticateToken, (req, res) => {
  const { cart_item_ids, shipping_address, receiver_name, receiver_phone } = req.body;

  if (!cart_item_ids || !Array.isArray(cart_item_ids) || cart_item_ids.length === 0) {
    return res.status(400).json({ success: false, message: '请选择要购买的商品' });
  }

  // 获取购物车商品
  const selectedItems = cartItems.filter(
    item => cart_item_ids.includes(item.id) && item.user_id === req.user.id
  );

  if (selectedItems.length === 0) {
    return res.status(400).json({ success: false, message: '没有选中的商品' });
  }

  // 计算总金额
  let totalAmount = 0;
  const orderItems = [];

  for (const item of selectedItems) {
    const product = products.find(p => p.id === item.product_id);
    if (!product) continue;

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
  const orderNo = 'ORD' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase();

  // 创建订单
  const newOrder = {
    id: orders.length + 1,
    order_no: orderNo,
    user_id: req.user.id,
    total_amount: totalAmount,
    status: 'pending',
    shipping_address: shipping_address || '',
    receiver_name: receiver_name || '',
    receiver_phone: receiver_phone || '',
    created_at: new Date().toISOString(),
    items: orderItems
  };

  orders.push(newOrder);

  // 从购物车中移除已购买的商品
  cartItems = cartItems.filter(item => !cart_item_ids.includes(item.id));

  res.json({
    success: true,
    data: {
      order_id: newOrder.id,
      order_no: orderNo,
      total_amount: totalAmount
    },
    message: '订单创建成功'
  });
});

// 获取用户订单列表
app.get('/api/orders', authenticateToken, (req, res) => {
  const userOrders = orders
    .filter(order => order.user_id === req.user.id)
    .map(order => ({
      id: order.id,
      order_no: order.order_no,
      total_amount: order.total_amount,
      status: order.status,
      created_at: order.created_at
    }))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  res.json({ success: true, data: userOrders });
});

// 获取订单详情
app.get('/api/orders/:id', authenticateToken, (req, res) => {
  const id = parseInt(req.params.id);
  const order = orders.find(o => o.id === id && o.user_id === req.user.id);

  if (!order) {
    return res.status(404).json({ success: false, message: '订单不存在' });
  }

  res.json({ success: true, data: order });
});

// 获取当前用户信息
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: '用户不存在' });
  }

  const { password, ...userWithoutPassword } = user;
  res.json({ success: true, data: userWithoutPassword });
});

// 搜索商品
app.get('/api/search', (req, res) => {
  const { q } = req.query;
  
  if (!q || q.trim() === '') {
    return res.status(400).json({ success: false, message: '请输入搜索关键词' });
  }

  const searchTerm = q.trim().toLowerCase();
  const searchResults = products
    .filter(p => 
      p.status === 'active' && (
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      )
    )
    .slice(0, 20)
    .map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      main_image: p.main_image
    }));

  res.json({ success: true, data: searchResults });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API端点不存在' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ success: false, message: '服务器内部错误' });
});

// 初始化并启动服务器
function startServer() {
  initData();
  
  app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('🚀 电商商城完整版后端服务已启动');
    console.log('='.repeat(60));
    console.log(`📡 服务地址: http://localhost:${PORT}`);
    console.log(`🔧 健康检查: http://localhost:${PORT}/health`);
    console.log('');
    console.log('📋 主要功能API:');
    console.log('  GET  /api/home           - 首页数据');
    console.log('  GET  /api/products       - 商品列表');
    console.log('  GET  /api/products/:id   - 商品详情');
    console.log('  GET  /api/categories     - 商品分类');
    console.log('  GET  /api/search?q=关键词 - 商品搜索');
    console.log('  POST /api/auth/login     - 用户登录');
    console.log('  GET  /api/cart          - 购物车');
    console.log('  POST /api/orders        - 创建订单');
    console.log('');
    console.log('👤 测试账号:');
    console.log('  admin / password123 (管理员)');
    console.log('  user1 / password123 (普通用户)');
    console.log('  user2 / password123 (普通用户)');
    console.log('');
    console.log('💾 数据库: 内存数据库 (重启后数据会丢失)');
    console.log('');
    console.log('='.repeat(60));
    console.log('按 Ctrl+C 停止服务');
    console.log('='.repeat(60));
  });
}

// 检查依赖
try {
  require('express');
  require('cors');
  require('bcryptjs');
  require('jsonwebtoken');
} catch (error) {
  console.error('缺少依赖包，请先安装:');
  console.error('npm install express cors bcryptjs jsonwebtoken');
  process.exit(1);
}

// 启动服务器
startServer();
