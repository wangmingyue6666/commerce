const http = require('http');

console.log('[DEBUG] Starting server...');

const server = http.createServer((req, res) => {
  console.log('[DEBUG] Received request:', req.method, req.url);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: true, message: 'Hello from server' }));
});

server.on('error', (err) => {
  console.error('[DEBUG] Server error:', err);
});

server.on('listening', () => {
  console.log('[DEBUG] Server is now listening');
  const addr = server.address();
  console.log('[DEBUG] Server address:', addr);
});

server.listen(3005, '127.0.0.1', () => {
  console.log('[DEBUG] Listen callback called');
  const addr = server.address();
  console.log('[DEBUG] Listening on:', addr);
});

console.log('[DEBUG] Server setup complete, waiting for listen...');