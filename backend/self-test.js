const http = require('http');

console.log('Starting self-test...');

const server = http.createServer((req, res) => {
  console.log('Server received request:', req.method, req.url);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: true, message: 'Hello from server' }));
});

server.listen(3007, '127.0.0.1', () => {
  console.log('Server started on 127.0.0.1:3007');
  
  // 在同一进程中发送请求
  setTimeout(() => {
    console.log('Sending request to server...');
    const req = http.request({
      hostname: '127.0.0.1',
      port: 3007,
      path: '/test',
      method: 'GET'
    }, (res) => {
      console.log('Response status:', res.statusCode);
      res.on('data', (chunk) => {
        console.log('Response body:', chunk.toString());
      });
      res.on('end', () => {
        console.log('Test completed successfully!');
        server.close();
      });
    });
    
    req.on('error', (e) => {
      console.error('Request error:', e);
      server.close();
    });
    
    req.end();
  }, 1000);
});