console.log('Node.js is working!');
console.log('Environment:');
console.log('- Node version:', process.version);
console.log('- Platform:', process.platform);
console.log('- Current directory:', process.cwd());

// Test basic HTTP server
const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Test server is working!');});

server.listen(3000, () => {
  console.log('Test server running at http://localhost:3000');
});
