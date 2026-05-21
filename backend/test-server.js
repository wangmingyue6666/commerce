const http = require('http');

const server = http.createServer((req, res) => {
  console.log('收到请求:', req.method, req.url);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: true, message: '测试成功' }));
});

server.listen(3002, () => {
  console.log('测试服务器运行在端口 3002');
});