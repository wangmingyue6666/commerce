const express = require('express');
const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  console.log('[SERVER] 收到健康检查请求');
  res.json({ status: 'ok' });
});

app.post('/api/auth/login', (req, res) => {
  console.log('[SERVER] 收到登录请求');
  console.log('[SERVER] 请求体:', JSON.stringify(req.body));
  res.json({ success: true, message: '登录成功' });
  console.log('[SERVER] 响应已发送');
});

const server = app.listen(3010, '127.0.0.1', () => {
  console.log('[SERVER] Express服务器运行在 127.0.0.1:3010');
  
  // 使用fetch在同一进程中测试
  fetch('http://127.0.0.1:3010/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'test' })
  })
  .then(response => response.json())
  .then(data => console.log('[CLIENT] 响应:', data))
  .catch(err => console.error('[CLIENT] 错误:', err));
});

server.on('error', (err) => {
  console.error('[SERVER] 服务器错误:', err);
});