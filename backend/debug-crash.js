const http = require('http');
const net = require('net');

console.log('=== 启动调试服务器 ===');

const server = http.createServer((req, res) => {
  console.log(`[${new Date().toISOString()}] 收到请求: ${req.method} ${req.url}`);
  
  try {
    // 模拟认证中间件
    const authHeader = req.headers.authorization;
    console.log(`Authorization头: ${authHeader ? '存在' : '不存在'}`);
    
    // 模拟解析请求体
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
      console.log(`接收到数据: ${chunk.length}字节`);
    });
    
    req.on('end', () => {
      console.log(`请求体: ${body.slice(0, 500)}...`);
      
      try {
        // 模拟登录逻辑
        if (req.url === '/api/auth/login' && req.method === 'POST') {
          const data = JSON.parse(body);
          console.log(`用户名: ${data.username}, 密码长度: ${data.password?.length || 0}`);
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, message: '登录成功' }));
          console.log('响应已发送');
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Not found' }));
        }
      } catch (parseError) {
        console.error('解析请求体错误:', parseError);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: '请求体格式错误' }));
      }
    });
    
    req.on('error', (err) => {
      console.error('请求错误:', err);
    });
    
  } catch (err) {
    console.error('请求处理错误:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: '服务器内部错误' }));
  }
});

server.on('error', (err) => {
  console.error('服务器错误:', err);
});

server.on('connection', (socket) => {
  console.log(`新连接: ${socket.remoteAddress}:${socket.remotePort}`);
  socket.on('error', (err) => {
    console.error('Socket错误:', err);
  });
  socket.on('close', (hadError) => {
    console.log(`连接关闭，是否有错误: ${hadError}`);
  });
});

server.listen(3008, '127.0.0.1', () => {
  console.log('服务器运行在 127.0.0.1:3008');
});

process.on('uncaughtException', (err) => {
  console.error('=== 未捕获异常 ===');
  console.error('错误:', err);
  console.error('堆栈:', err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('=== 未处理的Promise拒绝 ===');
  console.error('原因:', reason);
  console.error('Promise:', promise);
});

console.log('服务器初始化完成');