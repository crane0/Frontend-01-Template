1，是以 toy-browser 项目中 `7parserCombineText.js` 为基础，新增了处理 script 标签的逻辑。

> `scriptData` 的一系列函数。

因为在模仿 .vue 的 .view 文件的 script 标签中，还有可能出现 `<xx` 的字符。

所以新增的处理 script 标签的逻辑，将 script 标签中的 `<xx` 字符忽略。

[tokenization 中处理 script 标签的完备性](https://html.spec.whatwg.org/multipage/parsing.html#tokenization)
```
let s = '<html>'
```

2，loader 的编写

https://webpack.js.org/contribute/writing-a-loader/