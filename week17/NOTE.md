# 每周总结可以写在这里

# 1，tab 组件使用了直接传入子组件的方式

```
let panel = <TabPanel title="123">
  <span title="title1">this is content1</span>
  <span title="title2">this is content2</span>
  <span title="title3">this is content3</span>
  <span title="title4">this is content4</span>
</TabPanel>
```

2，list 组件使用了传入函数的方式

```
let listView = <ListView data={data}>
  { 
    record => <figure>
      <img src={record.url} />
      <figcaption>{record.title}</figcaption>
    </figure>
  }
</ListView>
```

3，处理CSS

在 carousel 组件中，css 是写在 `index.html` 中的，

其实可以写在 `main.js`（carousel 组件）中，以下面的方式
```
// 配置了 css-loader，引入才不会报错
import css from './index.css'

// 可以简单的将导入的 css 添加。
let style = document.createElement('style')
style.innerHTML = css[0][1]
document.documentElement.appendChild(style)
```

如果用自定义的 loader 
```
let css = require('css')

module.exports = function(source, map) {
  let stylesheet = css.parse(source)
  // this.resourcePath 是文件的绝对路径。
  let name = this.resourcePath.match(/([^/]+).css$/)[1]
  for (const rule of stylesheet.stylesheet.rules) {
    rule.selectors = rule.selectors.map(selector => {
      /* 
        用 css 的文件名进行匹配，如果 css 选择器是以文件名开始的，那就不动，否则，为选择器添加文件名前缀。
        carousel.css
        {
          .carousel {
            color: samlon;
          }
          * {
            background-color: lightgreeen;
          }
        }
        会被替换为
        {
          .carousel {
            color: samlon;
          }
          .carousel * {
            background-color: lightgreeen;
          }
        }
      */
      return selector.match(new RegExp(`^.${name}`)) ? selector : `.${name} ${selector}`
    })
  }
  console.log('source', css.stringify(stylesheet))
  return `let style = document.createElement('style')
  style.innerHTML = ${JSON.stringify(css.stringify(stylesheet))}
  document.documentElement.appendChild(style)`
}
```

# 2，使用 yeoman

[官方参考](https://yeoman.io/authoring/index.html)

[其他参考](https://segmentfault.com/a/1190000005827971)

[掘金收藏](https://juejin.im/post/6844903661844299790)

## 1.1，示例

项目目录
```
-- package.json
-- generators
    -- app
        index.js
    -- router
        index.js
```
package.json

注意点，name 必须是这种格式 `generator-xxx`，之后全局安装 `yo` 之后，`yo xxx` （**xxx 必须对应上**）才能正确运行。
```
{
  "name": "generator-name",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC",
  "devDependencies": {},
  "dependencies": {
    "yeoman-generator": "^4.11.0"
  }
}
```

app/index.js，示例代码如下
```
var Generator = require('yeoman-generator');

module.exports = class extends Generator {
  // The name `constructor` is important here
  constructor(args, opts) {
    // Calling the super constructor is important so our generator is correctly set up
    super(args, opts);

    // Next, add your custom code
    this.option('babel'); // This method adds support for a `--babel` flag
  }
  method1() {
    this.log('method 1 just ran');
  }

  method2() {
    this.log('method 2 just ran');
  }
};
```

在该项目根目录下，执行 `npm link`

之后，在任意目录运行 `yo xxx` 之后，会发现 method1 和 method2 执行了。

> 原理是：在 `generator-xxx` 项目中执行 `npm link`后，会将该项目（package.json 中 name 就是该项目名称）创建一个软连接到全局，之后运行 `yo xxx` 时，可以直接在全局中找 `generator-xxx`。

以上，yeoman 跑起来了。

更多的配置[参考](https://yeoman.io/authoring/index.html)，页面右侧链接。

# 3，手动实现光标移动

## 3.1，`console.log` 和 `stdout.write` 的区别是啥？

[答案](https://stackoverflow.com/questions/4976466/difference-between-process-stdout-write-and-console-log-in-node-js)
```
Console.prototype.log = function() {
  this._stdout.write(util.format.apply(this, arguments) + '\n');
};
```

## 3.2，实现原理

https://stackoverflow.com/questions/10585683/how-do-you-edit-existing-text-and-move-the-cursor-around-in-the-terminal/10830168

被采纳的答案中，有不同字符对应不同的光标移动。



