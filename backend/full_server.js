const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'ecommerce_secret_key_2026';

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 创建SQLite数据库
const db = new sqlite3.Database(':memory:'); // 内存数据库，重启后数据会丢失

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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 商品分类表
    db.run(`CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      parent_id INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
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
      category_id INTEGER,
      main_image TEXT,
      images TEXT, -- JSON数组
      tags TEXT, -- JSON数组
      specs TEXT, -- JSON对象
      is_hot BOOLEAN DEFAULT 0,
      is_new BOOLEAN DEFAULT 1,
      is_recommended BOOLEAN DEFAULT 0,
      sales_count INTEGER DEFAULT 0,
      view_count INTEGER DEFAULT 0,
      rating DECIMAL(3,2) DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )`);

    // 购物车表
    db.run(`CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER DEFAULT 1,
      selected BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id),
      UNIQUE(user_id, product_id)
    )`);

    // 订单表
    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_no TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL,
      total_amount DECIMAL(10,2) NOT NULL,
      discount_amount DECIMAL(10,2) DEFAULT 0,
      shipping_fee DECIMAL(10,2) DEFAULT 0,
      final_amount DECIMAL(10,2) NOT NULL,
      status TEXT DEFAULT 'pending', -- pending, paid, shipped, completed, cancelled
      payment_method TEXT,
      payment_status TEXT DEFAULT 'unpaid',
      shipping_address TEXT,
      receiver_name TEXT,
      receiver_phone TEXT,
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    // 订单商品表
    db.run(`CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      product_image TEXT,
      price DECIMAL(10,2) NOT NULL,
      quantity INTEGER NOT NULL,
      subtotal DECIMAL(10,2) NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )`);

    // 商品评论表
    db.run(`CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      order_id INTEGER,
      rating INTEGER CHECK(rating >= 1 AND rating <= 5),
      content TEXT,
      images TEXT, -- JSON数组
      is_anonymous BOOLEAN DEFAULT 0,
      status TEXT DEFAULT 'approved',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (order_id) REFERENCES orders(id)
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
    db.run(`INSERT OR IGNORE INTO users (username, email, password, role, phone, address) VALUES 
      ('admin', 'admin@example.com', ?, 'admin', '13800138000', '北京市朝阳区'),
      ('user1', 'user1@example.com', ?, 'user', '13900139001', '上海市浦东新区'),
      ('user2', 'user2@example.com', ?, 'user', '13700137002', '广州市天河区')`,
      [hashedPassword, hashedPassword, hashedPassword]
    );

    // 插入商品分类
    db.run(`INSERT OR IGNORE INTO categories (name, description, image_url) VALUES 
      ('手机数码', '智能手机、平板电脑、数码配件', '/images/category/electronics.jpg'),
      ('电脑办公', '笔记本电脑、台式机、办公设备', '/images/category/computers.jpg'),
      ('家用电器', '电视、冰箱、洗衣机、空调', '/images/category/appliances.jpg'),
      ('服装鞋包', '男装、女装、鞋类、箱包', '/images/category/clothing.jpg'),
      ('美妆个护', '护肤品、化妆品、个人护理', '/images/category/beauty.jpg'),
      ('食品饮料', '零食、饮料、生鲜食品', '/images/category/food.jpg')`
    );

    // 插入商品数据
    const products = [
      {
        name: 'iPhone 15 Pro Max',
        description: '苹果最新旗舰手机，A17 Pro芯片，钛金属边框',
        price: 9999,
        original_price: 10999,
        stock: 50,
        category_id: 1,
        main_image: '/images/products/iphone15.jpg',
        images: JSON.stringify(['/images/products/iphone15_1.jpg', '/images/products/iphone15_2.jpg']),
        tags: JSON.stringify(['苹果', '旗舰', '5G', '智能手机']),
        specs: JSON.stringify({
          '屏幕': '6.7英寸 Super Retina XDR',
          '处理器': 'A17 Pro',
          '内存': '8GB',
          '存储': '256GB',
          '摄像头': '4800万像素主摄',
          '电池': '4422mAh'
        }),
        is_hot: 1,
        is_new: 1,
        is_recommended: 1
      },
      {
        name: 'MacBook Pro 16英寸',
        description: '苹果专业级笔记本电脑，M3 Max芯片',
        price: 19999,
        original_price: 21999,
        stock: 30,
        category_id: 2,
        main_image: '/images/products/macbook.jpg',
        images: JSON.stringify(['/images/products/macbook_1.jpg', '/images/products/macbook_2.jpg']),
        tags: JSON.stringify(['苹果', '笔记本电脑', '专业', 'M3芯片']),
        specs: JSON.stringify({
          '屏幕': '16.2英寸 Liquid Retina XDR',
          '处理器': 'M3 Max',
          '内存': '36GB',
          '存储': '1TB SSD',
          '显卡': '40核 GPU',
          '电池': '100Wh'
        }),
        is_hot: 1,
        is_new: 1,
        is_recommended: 1
      },
      {
        name: '夏季连衣裙',
        description: '女士夏季新款连衣裙，纯棉材质，多种颜色可选',
        price: 299,
        original_price: 399,
        stock: 200,
        category_id: 4,
        main_image: '/images/products/dress.jpg',
        images: JSON.stringify(['/images/products/dress_1.jpg', '/images/products/dress_2.jpg']),
        tags: JSON.stringify(['女装', '连衣裙', '夏季', '时尚']),
        specs: JSON.stringify({
          '材质': '100%纯棉',
          '颜色': '白色/粉色/蓝色',
          '尺码': 'S/M/L/XL',
          '季节': '夏季',
          '风格': '休闲'
        }),
        is_hot: 1,
        is_new: 1,
        is_recommended: 1
      },
      {
        name: '男士商务衬衫',
        description: '男士正装衬衫，免烫面料，多色可选',
        price: 199,
        original_price: 299,
        stock: 150,
        category_id: 4,
        main_image: '/images/products/shirt.jpg',
        images: JSON.stringify(['/images/products/shirt_1.jpg', '/images/products/shirt_2.jpg']),
        tags: JSON.stringify(['男装', '衬衫', '商务', '正装']),
        specs: JSON.stringify({
          '材质': '棉混纺',
          '颜色': '白色/蓝色/灰色',
          '尺码': '39/40/41/42/43',
          '领型': '标准领',
          '袖长': '长袖'
        }),
        is_hot: 1,
        is_new: 0,
        is_recommended: 1
      },
      {
        name: '智能电视 65英寸',
        description: '4K超高清智能电视，支持HDR，语音控制',
        price: 3999,
        original_price: 4999,
        stock: 80,
        category_id: 3,
        main_image: '/images/products/tv.jpg',
        images: JSON.stringify(['/images/products/tv_1.jpg', '/images/products/tv_2.jpg']),
        tags: JSON.stringify(['电视', '智能', '4K', '家居']),
        specs: JSON.stringify({
          '屏幕尺寸': '65英寸',
          '分辨率': '4K UHD',
          'HDR': '支持',
          '智能系统': 'Android TV',
          '接口': 'HDMI×3, USB×2'
        }),
        is_hot: 1,
        is_new: 1,
        is_recommended: 1
      },
      {
        name: '无线蓝牙耳机',
        description: '主动降噪蓝牙耳机，续航30小时',
        price: 599,
        original_price: 799,
        stock: 300,
        category_id: 1,
        main_image: '/images/products/earphone.jpg',
        images: JSON.stringify(['/images/products/earphone_1.jpg', '/images/products/earphone_2.jpg']),
        tags: JSON.stringify(['耳机', '蓝牙', '降噪', '无线']),
        specs: JSON.stringify({
          '类型': '入耳式',
          '蓝牙版本': '5.3',
          '降噪': '主动降噪',
          '续航': '30小时',
          '防水': 'IPX4'
        }),
        is_hot: 1,
        is_new: 1,
        is_recommended: 1
      }
    ];

    products.forEach(product => {
      db.run(`INSERT OR IGNORE INTO products (
        name, description, price, original_price, stock, category_id, main_image, 
        images, tags, specs, is_hot, is_new, is_recommended
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          product.name, product.description, product.price, product.original_price,
          product.stock, product.category_id, product.main_image,
          product.images, product.tags, product.specs,
          product.is_hot, product.is_new, product.is_recommended
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
    message: '电商商城完整版后端服务运行正常',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 用户注册
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: '请填写所有必填字段' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ success: false, message: '用户名或邮箱已存在' });
          }
          return res.status(500).json({ success: false, message: '注册失败' });
        }

        const token = jwt.sign(
          { id: this.lastID, username, email, role: 'user' },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        res.json({
          success: true,
          data: {
            token,
            user: { id: this.lastID, username, email, role: 'user' }
          }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
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

// 获取商品列表
app.get('/api/products', (req, res) => {
  const { page = 1, limit = 10, category_id, keyword, sort_by = 'created_at', order = 'desc' } = req.query;
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM products WHERE 1=1';
  let params = [];

  if (category_id) {
    query += ' AND category_id = ?';
    params.push(category_id);
  }

  if (keyword) {
    query += ' AND (name LIKE ? OR description LIKE ? OR tags LIKE ?)';
    const likeKeyword = `%${keyword}%`;
    params.push(likeKeyword, likeKeyword, likeKeyword);
  }

  // 添加排序
  const validSortColumns = ['price', 'sales_count', 'rating', 'created_at', 'view_count'];
  const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'created_at';
  const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  query += ` ORDER BY ${sortColumn} ${sortOrder} LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), parseInt(offset));

  // 获取总数
  let countQuery = 'SELECT COUNT(*) as total FROM products WHERE 1=1';
  let countParams = [];
  
  if (category_id) {
    countQuery += ' AND category_id = ?';
    countParams.push(category_id);
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
        tags: product.tags ? JSON.parse(product.tags) : [],
        specs: product.specs ? JSON.parse(product.specs) : {}
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

    // 增加浏览量
    db.run('UPDATE products SET view_count = view_count + 1 WHERE id = ?', [id]);

    // 解析JSON字段
    const formattedProduct = {
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      tags: product.tags ? JSON.parse(product.tags) : [],
      specs: product.specs ? JSON.parse(product.specs) : {}
    };

    res.json({ success: true, data: formattedProduct });
  });
});

// 获取商品分类
app.get('/api/categories', (req, res) => {
  db.all('SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order', (err, categories) => {
    if (err) {
      return res.status(500).json({ success: false, message: '查询失败' });
    }
    res.json({ success: true, data: categories });
  });
});

// 获取热门商品
app.get('/api/products/hot', (req, res) => {
  db.all('SELECT * FROM products WHERE is_hot = 1 AND status = "active" ORDER BY sales_count DESC LIMIT 10', (err, products) => {
    if (err) {
      return res.status(500).json({ success: false, message: '查询失败' });
    }

    const formattedProducts = products.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      tags: product.tags ? JSON.parse(product.tags) : []
    }));

    res.json({ success: true, data: formattedProducts });
  });
});

// 获取推荐商品
app.get('/api/products/recommended', (req, res) => {
  db.all('SELECT * FROM products WHERE is_recommended = 1 AND status = "active" ORDER BY rating DESC LIMIT 10', (err, products) => {
    if (err) {
      return res.status(500).json({ success: false, message: '查询失败' });
    }

    const formattedProducts = products.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      tags: product.tags ? JSON.parse(product.tags) : []
    }));

    res.json({ success: true, data: formattedProducts });
  });
});

// 获取新品
app.get('/api/products/new', (req, res) => {
  db.all('SELECT * FROM products WHERE is_new = 1 AND status = "active" ORDER BY created_at DESC LIMIT 10', (err, products) => {
    if (err) {
      return res.status(500).json({ success: false, message: '查询失败' });
    }

    const formattedProducts = products.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      tags: product.tags ? JSON.parse(product.tags) : []
    }));

    res.json({ success: true, data: formattedProducts });
  });
});

// 购物车相关API

// 获取用户购物车
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
      let selectedAmount = 0;
      const formattedItems = cartItems.map(item => {
        const subtotal = item.price * item.quantity;
        totalAmount += subtotal;
        if (item.selected) {
          selectedAmount += subtotal;
        }
        return { ...item, subtotal };
      });

      res.json({
        success: true,
        data: {
          items: formattedItems,
          summary: {
            total_items: cartItems.length,
            total_amount: totalAmount,
            selected_amount: selectedAmount
          }
        }
      });
    }
  );
});

// 添加商品到购物车
app.post('/api/cart', authenticateToken, (req, res) => {
  const { product_id, quantity = 1 } = req.body;

  if (!product_id) {
    return res.status(400).json({ success: false, message: '请选择商品' });
  }

  // 检查商品是否存在
  db.get('SELECT * FROM products WHERE id = ? AND status = "active"', [product_id], (err, product) => {
    if (err || !product) {
      return res.status(404).json({ success: false, message: '商品不存在或已下架' });
    }

    // 检查库存
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: '库存不足' });
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
          if (product.stock < newQuantity) {
            return res.status(400).json({ success: false, message: '库存不足' });
          }

          db.run(
            'UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
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
  const { quantity, selected } = req.body;

  let updateFields = [];
  let params = [];

  if (quantity !== undefined) {
    updateFields.push('quantity = ?');
    params.push(quantity);
  }

  if (selected !== undefined) {
    updateFields.push('selected = ?');
    params.push(selected ? 1 : 0);
  }

  if (updateFields.length === 0) {
    return res.status(400).json({ success: false, message: '没有要更新的字段' });
  }

  updateFields.push('updated_at = CURRENT_TIMESTAMP');
  params.push(id, req.user.id);

  db.run(
    `UPDATE cart_items SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
    params,
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

// 清空购物车
app.delete('/api/cart', authenticateToken, (req, res) => {
  db.run(
    'DELETE FROM cart_items WHERE user_id = ?',
    [req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: '清空失败' });
      }

      res.json({ success: true, message: '购物车已清空' });
    }
  );
});

// 订单相关API

// 创建订单
app.post('/api/orders', authenticateToken, (req, res) => {
  const { cart_item_ids, shipping_address, receiver_name, receiver_phone, note } = req.body;

  if (!cart_item_ids || !Array.isArray(cart_item_ids) || cart_item_ids.length === 0) {
    return res.status(400).json({ success: false, message: '请选择要购买的商品' });
  }

  // 开始事务
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // 获取购物车商品
    const placeholders = cart_item_ids.map(() => '?').join(',');
    db.all(
      `SELECT ci.*, p.name, p.price, p.main_image, p.stock 
       FROM cart_items ci 
       JOIN products p ON ci.product_id = p.id 
       WHERE ci.id IN (${placeholders}) AND ci.user_id = ? AND ci.selected = 1`,
      [...cart_item_ids, req.user.id],
      (err, cartItems) => {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ success: false, message: '获取购物车失败' });
        }

        if (cartItems.length === 0) {
          db.run('ROLLBACK');
          return res.status(400).json({ success: false, message: '没有选中的商品' });
        }

        // 检查库存
        for (const item of cartItems) {
          if (item.stock < item.quantity) {
            db.run('ROLLBACK');
            return res.status(400).json({ 
              success: false, 
              message: `商品"${item.name}"库存不足，仅剩${item.stock}件` 
            });
          }
        }

        // 计算总金额
        let totalAmount = 0;
        const orderItems = cartItems.map(item => {
          const subtotal = item.price * item.quantity;
          totalAmount += subtotal;
          return {
            product_id: item.product_id,
            product_name: item.name,
            product_image: item.main_image,
            price: item.price,
            quantity: item.quantity,
            subtotal: subtotal
          };
        });

        // 生成订单号
        const orderNo = 'ORD' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase();
        const finalAmount = totalAmount; // 这里可以加上运费、优惠等

        // 创建订单
        db.run(
          `INSERT INTO orders (
            order_no, user_id, total_amount, final_amount, 
            shipping_address, receiver_name, receiver_phone, note
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orderNo, req.user.id, totalAmount, finalAmount,
            shipping_address, receiver_name, receiver_phone, note
          ],
          function(err) {
            if (err) {
              db.run('ROLLBACK');
              return res.status(500).json({ success: false, message: '创建订单失败' });
            }

            const orderId = this.lastID;

            // 插入订单商品
            const orderItemPromises = orderItems.map(item => {
              return new Promise((resolve, reject) => {
                db.run(
                  `INSERT INTO order_items (
                    order_id, product_id, product_name, product_image, 
                    price, quantity, subtotal
                  ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                  [
                    orderId, item.product_id, item.product_name, item.product_image,
                    item.price, item.quantity, item.subtotal
                  ],
                  function(err) {
                    if (err) {
                      reject(err);
                    } else {
                      // 减少商品库存
                      db.run(
                        'UPDATE products SET stock = stock - ?, sales_count = sales_count + ? WHERE id = ?',
                        [item.quantity, item.quantity, item.product_id],
                        function(err) {
                          if (err) {
                            reject(err);
                          } else {
                            resolve();
                          }
                        }
                      );
                    }
                  }
                );
              });
            });

            Promise.all(orderItemPromises)
              .then(() => {
                // 删除购物车中的商品
                db.run(
                  `DELETE FROM cart_items WHERE id IN (${placeholders}) AND user_id = ?`,
                  [...cart_item_ids, req.user.id],
                  function(err) {
                    if (err) {
                      db.run('ROLLBACK');
                      return res.status(500).json({ success: false, message: '清理购物车失败' });
                    }

                    db.run('COMMIT', (err) => {
                      if (err) {
                        db.run('ROLLBACK');
                        return res.status(500).json({ success: false, message: '提交订单失败' });
                      }

                      res.json({
                        success: true,
                        data: {
                          order_id: orderId,
                          order_no: orderNo,
                          total_amount: totalAmount,
                          final_amount: finalAmount
                        },
                        message: '订单创建成功'
                      });
                    });
                  }
                );
              })
              .catch(err => {
                db.run('ROLLBACK');
                res.status(500).json({ success: false, message: '处理订单商品失败' });
              });
          }
        );
      }
    );
  });
});

// 获取用户订单列表
app.get('/api/orders', authenticateToken, (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM orders WHERE user_id = ?';
  let params = [req.user.id];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  // 获取总数
  let countQuery = 'SELECT COUNT(*) as total FROM orders WHERE user_id = ?';
  let countParams = [req.user.id];

  if (status) {
    countQuery += ' AND status = ?';
    countParams.push(status);
  }

  db.get(countQuery, countParams, (err, countResult) => {
    if (err) {
      return res.status(500).json({ success: false, message: '查询失败' });
    }

    db.all(query, params, (err, orders) => {
      if (err) {
        return res.status(500).json({ success: false, message: '查询失败' });
      }

      // 获取每个订单的商品
      const ordersWithItems = [];
      let processed = 0;

      if (orders.length === 0) {
        return res.json({
          success: true,
          data: [],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: countResult.total,
            total_pages: Math.ceil(countResult.total / limit)
          }
        });
      }

      orders.forEach(order => {
        db.all(
          'SELECT * FROM order_items WHERE order_id = ?',
          [order.id],
          (err, orderItems) => {
            if (err) {
              // 即使获取商品失败，也返回订单基本信息
              ordersWithItems.push({ ...order, items: [] });
            } else {
              ordersWithItems.push({ ...order, items: orderItems });
            }

            processed++;
            if (processed === orders.length) {
              // 按创建时间排序
              ordersWithItems.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

              res.json({
                success: true,
                data: ordersWithItems,
                pagination: {
                  page: parseInt(page),
                  limit: parseInt(limit),
                  total: countResult.total,
                  total_pages: Math.ceil(countResult.total / limit)
                }
              });
            }
          }
        );
      });
    });
  });
});

// 获取订单详情
app.get('/api/orders/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.get(
    'SELECT * FROM orders WHERE id = ? AND user_id = ?',
    [id, req.user.id],
    (err, order) => {
      if (err) {
        return res.status(500).json({ success: false, message: '查询失败' });
      }

      if (!order) {
        return res.status(404).json({ success: false, message: '订单不存在' });
      }

      db.all(
        'SELECT * FROM order_items WHERE order_id = ?',
        [id],
        (err, orderItems) => {
          if (err) {
            return res.status(500).json({ success: false, message: '查询失败' });
          }

          res.json({
            success: true,
            data: {
              ...order,
              items: orderItems
            }
          });
        }
      );
    }
  );
});

// 取消订单
app.put('/api/orders/:id/cancel', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.get(
    'SELECT * FROM orders WHERE id = ? AND user_id = ?',
    [id, req.user.id],
    (err, order) => {
      if (err) {
        return res.status(500).json({ success: false, message: '查询失败' });
      }

      if (!order) {
        return res.status(404).json({ success: false, message: '订单不存在' });
      }

      // 只有待支付状态的订单可以取消
      if (order.status !== 'pending') {
        return res.status(400).json({ 
          success: false, 
          message: `订单状态为"${order.status}"，无法取消` 
        });
      }

      db.run(
        'UPDATE orders SET status = "cancelled", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id],
        function(err) {
          if (err) {
            return res.status(500).json({ success: false, message: '取消订单失败' });
          }

          // 恢复库存
          db.all(
            'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
            [id],
            (err, orderItems) => {
              if (!err && orderItems) {
                orderItems.forEach(item => {
                  db.run(
                    'UPDATE products SET stock = stock + ? WHERE id = ?',
                    [item.quantity, item.product_id]
                  );
                });
              }
            }
          );

          res.json({ success: true, message: '订单已取消' });
        }
      );
    }
  );
});

// 用户相关API

// 更新用户信息
app.put('/api/users/profile', authenticateToken, (req, res) => {
  const { email, phone, address, avatar } = req.body;

  let updateFields = [];
  let params = [];

  if (email !== undefined) {
    updateFields.push('email = ?');
    params.push(email);
  }

  if (phone !== undefined) {
    updateFields.push('phone = ?');
    params.push(phone);
  }

  if (address !== undefined) {
    updateFields.push('address = ?');
    params.push(address);
  }

  if (avatar !== undefined) {
    updateFields.push('avatar = ?');
    params.push(avatar);
  }

  if (updateFields.length === 0) {
    return res.status(400).json({ success: false, message: '没有要更新的字段' });
  }

  updateFields.push('updated_at = CURRENT_TIMESTAMP');
  params.push(req.user.id);

  db.run(
    `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
    params,
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ success: false, message: '邮箱已存在' });
        }
        return res.status(500).json({ success: false, message: '更新失败' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ success: false, message: '用户不存在' });
      }

      // 获取更新后的用户信息
      db.get(
        'SELECT id, username, email, role, avatar, phone, address, created_at FROM users WHERE id = ?',
        [req.user.id],
        (err, user) => {
          if (err) {
            return res.status(500).json({ success: false, message: '获取用户信息失败' });
          }

          res.json({ success: true, data: user, message: '个人信息更新成功' });
        }
      );
    }
  );
});

// 修改密码
app.put('/api/users/password', authenticateToken, (req, res) => {
  const { old_password, new_password } = req.body;

  if (!old_password || !new_password) {
    return res.status(400).json({ success: false, message: '请填写原密码和新密码' });
  }

  if (new_password.length < 6) {
    return res.status(400).json({ success: false, message: '新密码至少6位' });
  }

  // 获取用户当前密码
  db.get(
    'SELECT password FROM users WHERE id = ?',
    [req.user.id],
    async (err, user) => {
      if (err || !user) {
        return res.status(404).json({ success: false, message: '用户不存在' });
      }

      // 验证原密码
      const isValidPassword = await bcrypt.compare(old_password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ success: false, message: '原密码错误' });
      }

      // 加密新密码
      const hashedPassword = await bcrypt.hash(new_password, 10);

      db.run(
        'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [hashedPassword, req.user.id],
        function(err) {
          if (err) {
            return res.status(500).json({ success: false, message: '修改密码失败' });
          }

          res.json({ success: true, message: '密码修改成功' });
        }
      );
    }
  );
});

// 搜索商品
app.get('/api/search', (req, res) => {
  const { q, page = 1, limit = 20 } = req.query;
  
  if (!q || q.trim() === '') {
    return res.status(400).json({ success: false, message: '请输入搜索关键词' });
  }

  const keyword = `%${q.trim()}%`;
  const offset = (page - 1) * limit;

  db.all(
    `SELECT * FROM products 
     WHERE (name LIKE ? OR description LIKE ? OR tags LIKE ?) 
     AND status = 'active'
     ORDER BY 
       CASE WHEN name LIKE ? THEN 1 
            WHEN description LIKE ? THEN 2 
            ELSE 3 END,
       sales_count DESC
     LIMIT ? OFFSET ?`,
    [keyword, keyword, keyword, keyword, keyword, parseInt(limit), parseInt(offset)],
    (err, products) => {
      if (err) {
        return res.status(500).json({ success: false, message: '搜索失败' });
      }

      // 获取总数
      db.get(
        `SELECT COUNT(*) as total FROM products 
         WHERE (name LIKE ? OR description LIKE ? OR tags LIKE ?) 
         AND status = 'active'`,
        [keyword, keyword, keyword],
        (err, countResult) => {
          if (err) {
            return res.status(500).json({ success: false, message: '搜索失败' });
          }

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
        }
      );
    }
  );
});

// 首页数据
app.get('/api/home', (req, res) => {
  // 并行获取首页所需的所有数据
  Promise.all([
    // 获取轮播图商品（热门商品）
    new Promise((resolve) => {
      db.all('SELECT id, name, price, main_image FROM products WHERE is_hot = 1 AND status = "active" ORDER BY sales_count DESC LIMIT 5', (err, result) => {
        resolve(err ? [] : result);
      });
    }),
    // 获取推荐商品
    new Promise((resolve) => {
      db.all('SELECT id, name, price, original_price, main_image FROM products WHERE is_recommended = 1 AND status = "active" ORDER BY rating DESC LIMIT 8', (err, result) => {
        resolve(err ? [] : result);
      });
    }),
    // 获取新品
    new Promise((resolve) => {
      db.all('SELECT id, name, price, main_image FROM products WHERE is_new = 1 AND status = "active" ORDER BY created_at DESC LIMIT 8', (err, result) => {
        resolve(err ? [] : result);
      });
    }),
    // 获取分类
    new Promise((resolve) => {
      db.all('SELECT id, name, image_url FROM categories WHERE is_active = 1 ORDER BY sort_order LIMIT 8', (err, result) => {
        resolve(err ? [] : result);
      });
    })
  ]).then(([banners, recommended, newProducts, categories]) => {
    res.json({
      success: true,
      data: {
        banners,
        recommended,
        new_products: newProducts,
        categories,
        announcements: [
          { id: 1, title: '新用户注册送100元优惠券', type: 'promotion' },
          { id: 2, title: '全场满299元包邮', type: 'notice' },
          { id: 3, title: 'iPhone 15系列新品上市', type: 'new' }
        ]
      }
    });
  }).catch(err => {
    res.status(500).json({ success: false, message: '获取首页数据失败' });
  });
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
      console.log('  POST /api/auth/register  - 用户注册');
      console.log('  GET  /api/cart          - 购物车');
      console.log('  POST /api/orders        - 创建订单');
      console.log('');
      console.log('👤 测试账号:');
      console.log('  admin / password123 (管理员)');
      console.log('  user1 / password123 (普通用户)');
      console.log('  user2 / password123 (普通用户)');
      console.log('');
      console.log('💾 数据库: SQLite (内存数据库，重启后数据会丢失)');
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

// 检查依赖
try {
  require('express');
  require('cors');
  require('sqlite3');
  require('bcryptjs');
  require('jsonwebtoken');
} catch (error) {
  console.error('缺少依赖包，请先安装:');
  console.error('npm install express cors sqlite3 bcryptjs jsonwebtoken');
  process.exit(1);
}

// 启动服务器
startServer();