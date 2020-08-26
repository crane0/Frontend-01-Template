# 每周总结可以写在这里

```
Server
    -- build: webapck, babel, jsx, vue
    -- watch: fsevents
    -- mock
    -- http: ws
Client
    -- debugger
    -- sourceMap (正好君哥今天做了分享)
```

Server --> Client，events

Client --> Server，methods

一般是通过 websocket 通讯。

1，安装 npm 包之后，下面的方式可以安装依赖，比如 `webpack`
```
const npm = require('npm')

let config = {
  "name": "my-component",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "npm": "^6.14.7"
  }
}


npm.load(config, (err) => {
  npm.install('webpack', (err) => {
    console.log(err)
  })
})
```

2，fsevents 监听文件的变化

https://github.com/fsevents/fsevents/

新建文件，重命名等等都会被监听。

build 之后，文件做了修改，再次 build 底层就是通过 fsevents 实现的。


3，vscode 为什么可以打断点调试

node 运行代码时，会启动一个 websocket，该 websocket 地址可以被 vscode 监听，他们之间有监听的协议。

node 启动了一个 debugger 的 Server，和V8在同一个进程中，所以它能够控制 V8

vscode 作为一个 Client，和 websocket 进行通讯，来传递打的断点，写 debugger 的这些命令。V8 执行这些被命令标记过的语句后，就会在 websocket 中发送对应的事件，在 vscode 就可以完成debugger 的一些操作。

所以，node 通过控制 V8 来实现——将 V8 的debugger功能通过 websocket 通讯传递给 vscode。


4，**单元测试**，解析HTML的 parseHTML.js ，

在写 case 时，发现了很多的问题。