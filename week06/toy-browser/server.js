
const http = require('http');

// 创建 HTTP 服务器。
const server = http.createServer((req, res) => {
  console.log('serve')
  // TCP 发送来的请求
  console.log(req.headers)
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('X-ss', 'adf')
  res.writeHead(200, { 'Content-Type': 'text/plain;charset=utf-8'});
  // res.end('adfafdsfds123456780');
  res.end(
`<html maaa=a >
<head>
    <style>
body div #myid{
    width:100px;
    background-color: #ff5000;
}
body div img{
    width:30px;
    background-color: #ff1111;
}
    </style>
</head>
<body>
    <div>
        <img id="myid"/>
        <img />
    </div>
</body>
</html>`
)
});

server.listen(8088);
