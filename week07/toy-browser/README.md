``` shell
npm init
npm install
node server.js
node client.js
```

注意node 的版本不能高于 v10.x，否则 images 依赖会报错。

其他文件介绍：

1，`9css-layout.js` 是将 html 文本解析，形成 DOM 树。

2，`css-computing.js` 是将 css 属性应用到元素上。

3，`css-layout.js` 进行排版（只支持部分 flex 属性），确定元素的位置。

