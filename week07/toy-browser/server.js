
const http = require('http');

// 创建 HTTP 服务器。
const server = http.createServer((req, res) => {
    console.log('serve')
    // TCP 发送来的请求
    console.log(req.headers)
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('X-ss', 'adf')
    res.writeHead(200, { 'Content-Type': 'text/plain;charset=utf-8' });
    // res.end('adfafdsfds123456780');
    res.end(
        `<html maaa=a >
<head>
    <style>
#container {
    width: 500px;
    height: 300px;
    display: flex;
    background-color: rgb(255,255,200);
}
#container #myid{
    width:200px;
    height: 100px;
    background-color: rgb(255,0,0);
}
#container .c1{
    flex: 1;
    background-color: rgb(0,255,0);
}
    </style>
</head>
<body>
    <div id="container">
        <div id="myid"></div>
        <div class="c1"></div>
    </div>
</body>
</html>`
    )
});

server.listen(8088);
