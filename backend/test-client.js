const http = require('http');

const options = {
  hostname: '127.0.0.1',
  port: 3004,
  path: '/test',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log('状态码:', res.statusCode);
  console.log('响应头:', res.headers);
  res.on('data', (chunk) => {
    console.log('响应体:', chunk.toString());
  });
  res.on('end', () => {
    console.log('响应结束');
  });
});

req.on('error', (e) => {
  console.error('请求错误:', e.message);
});

req.end();
console.log('请求已发送');