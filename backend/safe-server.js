const http = require('http');

process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[FATAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log('[SAFE] Starting server...');

const server = http.createServer((req, res) => {
  try {
    console.log('[SAFE] Received request:', req.method, req.url);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Hello from server' }));
    console.log('[SAFE] Response sent');
  } catch (err) {
    console.error('[SAFE] Request handler error:', err);
  }
});

server.on('error', (err) => {
  console.error('[SAFE] Server error:', err);
});

server.on('listening', () => {
  console.log('[SAFE] Server is listening');
});

server.on('connection', (socket) => {
  console.log('[SAFE] New connection');
  socket.on('error', (err) => {
    console.error('[SAFE] Socket error:', err);
  });
});

server.listen(3006, '127.0.0.1', () => {
  console.log('[SAFE] Server started on 127.0.0.1:3006');
});