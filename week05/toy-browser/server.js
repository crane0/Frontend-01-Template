
const http = require('http');

// 创建 HTTP 服务器。
const server = http.createServer((req, res) => {
  console.log('serve')
  // TCP 发送来的请求
  console.log(req.headers)
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('X-ss', 'adf')
  res.writeHead(200, { 'Content-Type': 'text/plain;charset=utf-8'});
  res.end('123456sdfsdaffdsf');
});

server.listen(8088);
