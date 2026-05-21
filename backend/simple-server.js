const http = require('http');

console.log('Starting server...');

const server = http.createServer((req, res) => {
  console.log('Received request:', req.method, req.url);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: true, message: 'Hello from server' }));
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

server.listen(3004, () => {
  console.log('Server is listening on port 3004');
});

console.log('Server setup complete');