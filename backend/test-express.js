const express = require('express');
const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  console.log('收到健康检查请求');
  res.json({ status: 'ok' });
});

app.post('/api/auth/login', (req, res) => {
  console.log('收到登录请求:', req.body);
  res.json({ success: true, message: '登录成功' });
});

app.listen(3009, '127.0.0.1', () => {
  console.log('Express服务器运行在 127.0.0.1:3009');
});