const http = require('http');
const url = require('url');

const PORT = 3000;

// 模拟数据
const users = [
  { id: 1, username: 'admin', email: 'admin@example.com' },
  { id: 2, username: 'user1', email: 'user1@example.com' }
];

const products = [
  { id: 1, name: 'iPhone 15', price: 6999, stock: 50 },
  { id: 2, name: 'MacBook Pro', price: 12999, stock: 30 },
  { id: 3, name: '夏季连衣裙', price: 299, stock: 100 },
  { id: 4, name: '男士衬衫', price: 199, stock: 200 }
];

const server = http.createServer((req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理OPTIONS预检请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  // 设置响应头
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  // 路由处理
  if (pathname === '/health' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'ok',
      message: '电商商城后端服务运行正常',
      timestamp: new Date().toISOString()
    }));
    
  } else if (pathname === '/api/users' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      data: users,
      total: users.length
    }));
    
  } else if (pathname === '/api/products' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      data: products,
      total: products.length
    }));
    
  } else if (pathname.match(/^\/api\/products\/\d+$/) && req.method === 'GET') {
    const id = parseInt(pathname.split('/')[3]);
    const product = products.find(p => p.id === id);
    
    if (product) {
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: product
      }));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({
        success: false,
        message: '商品不存在'
      }));
    }
    
  } else if (pathname === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const { username, password } = JSON.parse(body);
        
        if (username === 'admin' && password === 'password123') {
          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            data: {
              token: 'test_jwt_token_123456',
              user: {
                id: 1,
                username: 'admin',
                email: 'admin@example.com'
              }
            }
          }));
        } else if (username === 'user1' && password === 'password123') {
          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            data: {
              token: 'test_jwt_token_789012',
              user: {
                id: 2,
                username: 'user1',
                email: 'user1@example.com'
              }
            }
          }));
        } else {
          res.writeHead(401);
          res.end(JSON.stringify({
            success: false,
            message: '用户名或密码错误'
          }));
        }
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({
          success: false,
          message: '请求格式错误'
        }));
      }
    });
    
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({
      success: false,
      message: 'API端点不存在',
      path: req.url
    }));
  }
});

server.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 电商商城后端服务已启动');
  console.log('='.repeat(50));
  console.log(`📡 服务地址: http://localhost:${PORT}`);
  console.log(`🔧 健康检查: http://localhost:${PORT}/health`);
  console.log('');
  console.log('📋 可用API:');
  console.log('  GET  /health            - 健康检查');
  console.log('  GET  /api/users         - 用户列表');
  console.log('  GET  /api/products      - 商品列表');
  console.log('  GET  /api/products/:id  - 商品详情');
  console.log('  POST /api/auth/login    - 用户登录');
  console.log('');
  console.log('👤 测试账号:');
  console.log('  admin / password123');
  console.log('  user1 / password123');
  console.log('');
  console.log('='.repeat(50));
  console.log('按 Ctrl+C 停止服务');
  console.log('='.repeat(50));
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n正在关闭服务...');
  server.close(() => {
    console.log('服务已关闭');
    process.exit(0);
  });
});