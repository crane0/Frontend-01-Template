# 每周总结可以写在这里

# 2，寻路问题

## 2.1，绘制地图

- 1，创建指定大小的数组，并用指定内容填充
 
[Array.prototype.fill()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/fill)
 
```
new Array(5).join(0).split('') // ["0","0","0","0"]
 
new Array(5).fill(0) // [0, 0, 0, 0, 0]
```
 
- 2，localstorage
 
[localstorage mdn](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/localStorage)

官方给出的 API

```
localStorage.setItem('myCat', 'Tom');
let cat = localStorage.getItem('myCat');
localStorage.removeItem('myCat');
// 移除所有
localStorage.clear();
```

因为 localstorage 是 window 的对象，所以

> 下面的方式，不能再空白页（about:blank）使用，因为没有域名

```
// 设置
localStorage.myCat = 'Tom'
// 读取
let cat = localStorage.myCat

delete localStorage.myCat
```

- 3，fetch

http 请求可以传输很大的内容，几个G，

这种情况，会先拿到 response 的头部，再处理 body（可能是 chunk的，需要一段段处理），比如图片是先看到一部分，再看到完整的。

不过因为 fetch 的兼容性不太好，所以还是不推荐使用。

在有 await 的情况下，已经不需再使用 then 了。

- 4，async 和 await

async 和 await 在运行时，都是使用 promise 的。只是语法的问题。

- 5，鼠标事件

非标准的（但所有浏览器都实现了），e.which === 3 鼠标右键

推荐使用 [标准的 button](https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/button)，e.button === 2 鼠标右键

## 2.2，寻路算法

- 广度优先搜索
> 一层层的搜索。

- 深度优先搜索
> 一条线走到黑，看终点在哪里。适用于找最佳路径。