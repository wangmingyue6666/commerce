const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000; // 使用5000端口避免冲突
const JWT_SECRET = 'ecommerce_secret_key_2026';

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 创建SQLite数据库
const db = new sqlite3.Database(':memory:');

// 初始化数据库表
function initDatabase() {
  return new Promise((resolve, reject) => {
    // 用户表
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      avatar TEXT,
      phone TEXT,
      address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 商品表
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      original_price DECIMAL(10,2),
      stock INTEGER DEFAULT 0,
      category TEXT,
      main_image TEXT,
      images TEXT,
      tags TEXT,
      is_hot BOOLEAN DEFAULT 0,
      is_new BOOLEAN DEFAULT 1,
      sales_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 购物车表
    db.run(`CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, product_id)
    )`);

    // 订单表
    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_no TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL,
      total_amount DECIMAL(10,2) NOT NULL,
      status TEXT DEFAULT 'pending',
      shipping_address TEXT,
      receiver_name TEXT,
      receiver_phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    console.log('✅ 数据库表创建完成');
    resolve();
  });
}

// 插入测试数据
function insertTestData() {
  return new Promise((resolve, reject) => {
    // 插入测试用户
    const hashedPassword = bcrypt.hashSync('password123', 10);
    db.run(`INSERT OR IGNORE INTO users (username, email, password, role) VALUES 
      ('admin', 'admin@example.com', ?, 'admin'),
      ('user1', 'user1@example.com', ?, 'user'),
      ('user2', 'user2@example.com', ?, 'user')`,
      [hashedPassword, hashedPassword, hashedPassword]
    );

    // 插入商品数据
    const products = [
      {
        name: 'iPhone 15 Pro Max',
        description: '苹果最新旗舰手机，A17 Pro芯片',
        price: 9999,
        original_price: 10999,
        stock: 50,
        category: '手机数码',
        main_image: 'https://via.placeholder.com/300x300/007AFF/FFFFFF?text=iPhone+15',
        images: '["https://via.placeholder.com/300x300/007AFF/FFFFFF?text=iPhone+15+1", "https://via.placeholder.com/300x300/007AFF/FFFFFF?text=iPhone+15+2"]',
        tags: '["苹果", "旗舰", "5G", "智能手机"]',
        is_hot: 1,
        is_new: 1
      },
      {
        name: 'MacBook Pro 16英寸',
        description: '苹果专业级笔记本电脑，M3 Max芯片',
        price: 19999,
        original_price: 21999,
        stock: 30,
        category: '电脑办公',
        main_image: 'https://via.placeholder.com/300x300/000000/FFFFFF?text=MacBook+Pro',
        images: '["https://via.placeholder.com/300x300/000000/FFFFFF?text=MacBook+Pro+1", "https://via.placeholder.com/300x300/000000/FFFFFF?text=MacBook+Pro+2"]',
        tags: '["苹果", "笔记本电脑", "专业"]',
        is_hot: 1,
        is_new: 1
      },
      {
        name: '夏季连衣裙',
        description: '女士夏季新款连衣裙，纯棉材质',
        price: 299,
        original_price: 399,
        stock: 200,
        category: '服装鞋包',
        main_image: 'https://via.placeholder.com/300x300/FF6B6B/FFFFFF?text=连衣裙',
        images: '["https://via.placeholder.com/300x300/FF6B6B/FFFFFF?text=连衣裙+1", "https://via.placeholder.com/300x300/FF6B6B/FFFFFF?text=连衣裙+2"]',
        tags: '["女装", "连衣裙", "夏季"]',
        is_hot: 1,
        is_new: 1
      },
      {
        name: '男士商务衬衫',
        description: '男士正装衬衫，免烫面料',
        price: 199,
        original_price: 299,
        stock: 150,
        category: '服装鞋包',
        main_image: 'https://via.placeholder.com/300x300/4ECDC4/FFFFFF?text=衬衫',
        images: '["https://via.placeholder.com/300x300/4ECDC4/FFFFFF?text=衬衫+1", "https://via.placeholder.com/300x300/4ECDC4/FFFFFF?text=衬衫+2"]',
        tags: '["男装", "衬衫", "商务"]',
        is_hot: 1,
        is_new: 0
      },
      {
        name: '智能电视 65英寸',
        description: '4K超高清智能电视，支持HDR',
        price: 3999,
        original_price: 4999,
        stock: 80,
        category: '家用电器',
        main_image: 'https://via.placeholder.com/300x300/45B7D1/FFFFFF?text=智能电视',
        images: '["https://via.placeholder.com/300x300/45B7D1/FFFFFF?text=智能电视+1", "https://via.placeholder.com/300x300/45B7D1/FFFFFF?text=智能电视+2"]',
        tags: '["电视", "智能", "4K"]',
        is_hot: 1,
        is_new: 1
      },
      {
        name: '无线蓝牙耳机',
        description: '主动降噪蓝牙耳机，续航30小时',
        price: 599,
        original_price: 799,
        stock: 300,
        category: '手机数码',
        main_image: 'https://via.placeholder.com/300x300/96CEB4/FFFFFF?text=蓝牙耳机',
        images: '["https://via.placeholder.com/300x300/96CEB4/FFFFFF?text=蓝牙耳机+1", "https://via.placeholder.com/300x300/96CEB4/FFFFFF?text=蓝牙耳机+2"]',
        tags: '["耳机", "蓝牙", "降噪"]',
        is_hot: 1,
        is_new: 1
      }
    ];

    products.forEach(product => {
      db.run(`INSERT OR IGNORE INTO products (
        name, description, price, original_price, stock, category, main_image, 
        images, tags, is_hot, is_new
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          product.name, product.description, product.price, product.original_price,
          product.stock, product.category, product.main_image,
          product.images, product.tags, product.is_hot, product.is_new
        ]
      );
    });

    console.log('✅ 测试数据插入完成');
    resolve();
  });
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
    message: '电商商城完整版后端服务运行正常（端口5000）',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 用户登录
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: '请填写用户名和密码' });
  }

  db.get(
    'SELECT * FROM users WHERE username = ? OR email = ?',
    [username, username],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ success: false, message: '服务器错误' });
      }

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
    }
  );
});

// 获取商品列表
app.get('/api/products', (req, res) => {
  const { page = 1, limit = 10, category, keyword } = req.query;
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM products WHERE status = "active"';
  let params = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  if (keyword) {
    query += ' AND (name LIKE ? OR description LIKE ? OR tags LIKE ?)';
    const likeKeyword = `%${keyword}%`;
    params.push(likeKeyword, likeKeyword, likeKeyword);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  // 获取总数
  let countQuery = 'SELECT COUNT(*) as total FROM products WHERE status = "active"';
  let countParams = [];
  
  if (category) {
    countQuery += ' AND category = ?';
    countParams.push(category);
  }

  if (keyword) {
    countQuery += ' AND (name LIKE ? OR description LIKE ? OR tags LIKE ?)';
    const likeKeyword = `%${keyword}%`;
    countParams.push(likeKeyword, likeKeyword, likeKeyword);
  }

  db.get(countQuery, countParams, (err, countResult) => {
    if (err) {
      return res.status(500).json({ success: false, message: '查询失败' });
    }

    db.all(query, params, (err, products) => {
      if (err) {
        return res.status(500).json({ success: false, message: '查询失败' });
      }

      // 解析JSON字段
      const formattedProducts = products.map(product => ({
        ...product,
        images: product.images ? JSON.parse(product.images) : [],
        tags: product.tags ? JSON.parse(product.tags) : []
      }));

      res.json({
        success: true,
        data: formattedProducts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult.total,
          total_pages: Math.ceil(countResult.total / limit)
        }
      });
    });
  });
});

// 获取商品详情
app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM products WHERE id = ?', [id], (err, product) => {
    if (err) {
      return res.status(500).json({ success: false, message: '查询失败' });
    }

    if (!product) {
      return res.status(404).json({ success: false, message: '商品不存在' });
    }

    // 解析JSON字段
    const formattedProduct = {
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      tags: product.tags ? JSON.parse(product.tags) : []
    };

    res.json({ success: true, data: formattedProduct });
  });
});

// 获取热门商品
app.get('/api/products/hot', (req, res) => {
  db.all('SELECT id, name, price, original_price, main_image FROM products WHERE is_hot = 1 AND status = "active" ORDER BY sales_count DESC LIMIT 8', (err, products) => {
    if (err) {
      return res.status(500).json({ success: false, message: '查询失败' });
    }
    res.json({ success: true, data: products });
  });
});

// 获取新品
app.get('/api/products/new', (req, res) => {
  db.all('SELECT id, name, price, original_price, main_image FROM products WHERE is_new = 1 AND status = "active" ORDER BY created_at DESC LIMIT 8', (err, products) => {
    if (err) {
      return res.status(500).json({ success: false, message: '查询失败' });
    }
    res.json({ success: true, data: products });
  });
});

// 获取商品分类
app.get('/api/categories', (req, res) => {
  db.all('SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != ""', (err, categories) => {
    if (err) {
      return res.status(500).json({ success: false, message: '查询失败' });
    }
    res.json({ success: true, data: categories.map(c => c.category) });
  });
});

// 首页数据
app.get('/api/home', (req, res) => {
  // 并行获取数据
  Promise.all([
    new Promise((resolve) => {
      db.all('SELECT id, name, price, main_image FROM products WHERE is_hot = 1 AND status = "active" ORDER BY sales_count DESC LIMIT 5', (err, result) => {
        resolve(err ? [] : result);
      });
    }),
    new Promise((resolve) => {
      db.all('SELECT id, name, price, main_image FROM products WHERE is_new = 1 AND status = "active" ORDER BY created_at DESC LIMIT 8', (err, result) => {
        resolve(err ? [] : result);
      });
    }),
    new Promise((resolve) => {
      db.all('SELECT DISTINCT category FROM products WHERE category IS NOT NULL LIMIT 6', (err, result) => {
        resolve(err ? [] : result.map(c => c.category));
      });
    })
  ]).then(([banners, newProducts, categories]) => {
    res.json({
      success: true,
      data: {
        banners,
        new_products: newProducts,
        categories,
        announcements: [
          { id: 1, title: '新用户注册送优惠券', type: 'promotion' },
          { id: 2, title: '全场满299元包邮', type: 'notice' },
          { id: 3, title: '新品上市', type: 'new' }
        ]
      }
    });
  }).catch(err => {
    res.status(500).json({ success: false, message: '获取首页数据失败' });
  });
});

// 购物车API
app.get('/api/cart', authenticateToken, (req, res) => {
  db.all(
    `SELECT ci.*, p.name, p.price, p.main_image, p.stock 
     FROM cart_items ci 
     JOIN products p ON ci.product_id = p.id 
     WHERE ci.user_id = ?`,
    [req.user.id],
    (err, cartItems) => {
      if (err) {
        return res.status(500).json({ success: false, message: '查询失败' });
      }

      // 计算总金额
      let totalAmount = 0;
      const formattedItems = cartItems.map(item => {
        const subtotal = item.price * item.quantity;
        totalAmount += subtotal;
        return { ...item, subtotal };
      });

      res.json({
        success: true,
        data: {
          items: formattedItems,
          summary: {
            total_items: cartItems.length,
            total_amount: totalAmount
          }
        }
      });
    }
  );
});

// 添加到购物车
app.post('/api/cart', authenticateToken, (req, res) => {
  const { product_id, quantity = 1 } = req.body;

  if (!product_id) {
    return res.status(400).json({ success: false, message: '请选择商品' });
  }

  // 检查商品是否存在
  db.get('SELECT * FROM products WHERE id = ?', [product_id], (err, product) => {
    if (err || !product) {
      return res.status(404).json({ success: false, message: '商品不存在' });
    }

    // 检查是否已在购物车
    db.get(
      'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
      [req.user.id, product_id],
      (err, existingItem) => {
        if (err) {
          return res.status(500).json({ success: false, message: '操作失败' });
        }

        if (existingItem) {
          // 更新数量
          const newQuantity = existingItem.quantity + quantity;
          db.run(
            'UPDATE cart_items SET quantity = ? WHERE id = ?',
            [newQuantity, existingItem.id],
            function(err) {
              if (err) {
                return res.status(500).json({ success: false, message: '更新失败' });
              }
              res.json({ success: true, message: '购物车已更新' });
            }
          );
        } else {
          // 新增商品
          db.run(
            'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
            [req.user.id, product_id, quantity],
            function(err) {
              if (err) {
                return res.status(500).json({ success: false, message: '添加失败' });
              }
              res.json({ success: true, message: '商品已添加到购物车' });
            }
          );
        }
      }
    );
  });
});

// 更新购物车商品数量
app.put('/api/cart/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (quantity === undefined) {
    return res.status(400).json({ success: false, message: '请提供数量' });
  }

  db.run(
    'UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?',
    [quantity, id, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: '更新失败' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ success: false, message: '购物车商品不存在' });
      }

      res.json({ success: true, message: '更新成功' });
    }
  );
});

// 删除购物车商品
app.delete('/api/cart/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run(
    'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
    [id, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: '删除失败' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ success: false, message: '购物车商品不存在' });
      }

      res.json({ success: true, message: '删除成功' });
    }
  );
});

// 创建订单
app.post('/api/orders', authenticateToken, (req, res) => {
  const { cart_item_ids, shipping_address, receiver_name, receiver_phone } = req.body;

  if (!cart_item_ids || !Array.isArray(cart_item_ids) || cart_item_ids.length === 0) {
    return res.status(400).json({ success: false, message: '请选择要购买的商品' });
  }

  // 获取购物车商品
  const placeholders = cart_item_ids.map(() => '?').join(',');
  db.all(
    `SELECT ci.*, p.name, p.price 
     FROM cart_items ci 
     JOIN products p ON ci.product_id = p.id 
     WHERE ci.id IN (${placeholders}) AND ci.user_id = ?`,
    [...cart_item_ids, req.user.id],
    (err, cartItems) => {
      if (err) {
        return res.status(500).json({ success: false, message: '获取购物车失败' });
      }

      if (cartItems.length === 0) {
        return res.status(400).json({ success: false, message: '没有选中的商品' });
      }

      // 计算总金额
      let totalAmount = 0;
      cartItems.forEach(item => {
        totalAmount += item.price * item.quantity;
      });

      // 生成订单号
      const orderNo = 'ORD' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase();

      // 创建订单
      db.run(
        `INSERT INTO orders (order_no, user_id, total_amount, shipping_address, receiver_name, receiver_phone) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderNo, req.user.id, totalAmount, shipping_address, receiver_name, receiver_phone],
        function(err) {
          if (err) {
            return res.status(500).json({ success: false, message: '创建订单失败' });
          }

          const orderId = this.lastID;

          // 删除购物车中的商品
          db.run(
            `DELETE FROM cart_items WHERE id IN (${placeholders}) AND user_id = ?`,
            [...cart_item_ids, req.user.id]
          );

          res.json({
            success: true,
            data: {
              order_id: orderId,
              order_no: orderNo,
              total_amount: totalAmount
            },
            message: '订单创建成功'
          });
        }
      );
    }
  );
});

// 获取用户订单列表
app.get('/api/orders', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.id],
    (err, orders) => {
      if (err) {
        return res.status(500).json({ success: false, message: '查询失败' });
      }
      res.json({ success: true, data: orders });
    }
  );
});

// 获取当前用户信息
app.get('/api/auth/me', authenticateToken, (req, res) => {
  db.get(
    'SELECT id, username, email, role, avatar, phone, address, created_at FROM users WHERE id = ?',
    [req.user.id],
    (err, user) => {
      if (err || !user) {
        return res.status(404).json({ success: false, message: '用户不存在' });
      }
      res.json({ success: true, data: user });
    }
  );
});

// 搜索商品
app.get('/api/search', (req, res) => {
  const { q } = req.query;
  
  if (!q || q.trim() === '') {
    return res.status(400).json({ success: false, message: '请输入搜索关键词' });
  }

  const keyword = `%${q.trim()}%`;

  db.all(
    `SELECT id, name, price, main_image FROM products 
     WHERE (name LIKE ? OR description LIKE ? OR tags LIKE ?) 
     AND status = 'active'
     LIMIT 20`,
    [keyword, keyword, keyword],
    (err, products) => {
      if (err) {
        return res.status(500).json({ success: false, message: '搜索失败' });
      }
      res.json({ success: true, data: products });
    }
  );
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
async function startServer() {
  try {
    await initDatabase();
    await insertTestData();
    
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
      console.log('💾 数据库: SQLite (内存数据库)');
      console.log('');
      console.log('='.repeat(60));
      console.log('按 Ctrl+C 停止服务');
      console.log('='.repeat(60));
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
}

// 启动服务器
startServer();