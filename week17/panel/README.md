这里对 `createElement.js` 文件新增了
- `get classList()`
- `getAttribute(name)`

并在 `tabPanel` 中用到了。

`tabPanel` 和 `listView` 文件中，都直接 mount 到了 body 上，所以每次运行时，只需要修改 webpack 的入口文件即可。

根目录下的 `indexPanel.html` 不用变化，因为引用的都是 dist 中打包后的 `main.js`