# 每周总结可以写在这里

# 1，Range API

也属于 DOM API。经常和 fragment 配合使用。

使用场景
- 海量数据操作
- 精确操作元素内容

```
// 2 种创建 range 的方法
var range = new Range()
range.setStart(element, 9)
range.setEnd(element, 4)

var range2 = document.getSelection().getRangeAt(0)

range.setStartBefore
range.setEndBefore
range.setStartAfter
range.setEndAfter
range.selectNode
range.selectNodeContents

// 获取就是一个 fragment
var fragment = range.extractContents()
range.insertNode(document.createTextNode('aaa'))
```

## 1.1，例子

### 1.1.1，上节课中提到，如何将一个元素中的搜索 children 反向？
```
let element = document.getElementById('box')

function reverseElement(element) {
  let children = Array.from(element.childNodes)
  children.reverse()

  // 下面注释的代码比较低级。
  // for (const child of children) {
  //   element.removeChild(child)
  // }
  // for (let i = 0; i < children.length; i++) {
  //   element.appendChild(child[i])
  // }

  element.innerHTML = ''
  for (const child of children) {
    element.appendChild(child)
  }
}

reverseElement(element)
```

再高级一点的：
```
let element = document.getElementById('box')
function reverseElement(element) {
  let l = element.childNodes.length
  while (l--) {
    element.appendChild(element.childNodes[l])
  }
}
reverseElement(element)
```

上面的代码虽然看起来更简练一点，但还有个问题是重排的次数，如果有 1w 个子节点，那就需要 1w 次操作。

使用 range API 可以再次优化。**取出和插入都是一次操作。**
> 下面的代码，可以打端点调试，实时看到父元素的子节点内容变化。

```
let element = document.getElementById('box')
function reverseElement(element) {
  let range = new Range()
  // 选中 element 中所有的子节点
  range.selectNodeContents(element)
  // 取出 element 中所有的子节点，就是一个 fragment
  let fragment = range.extractContents()

  let l = fragment.childNodes.length
  while (l--) {
    fragment.appendChild(fragment.childNodes[l])
  }
  element.appendChild(fragment)
}
reverseElement(element)
```

### 1.1.2，精确操作文本节点1

```
<!-- 精确操作文本节点 -->
<div id="box">123456789</div>
<script>
  let element = document.getElementById('box').childNodes[0]
  let range = new Range()
  range.setStart(element, 3)
  range.setEnd(element, 6)

  // 当调用下面的方法时，就会将 456 取出。
  range.extractContents()
</script>
```

### 1.1.3，精确操作文本节2

注意，标签之间不能有空格，否则换行符和空格都算作是 text 节点的内容，这样计算位置时也会算进去。

```
<!-- 精确操作文本节点 -->
<div id="box">123<span style="background-color: pink;">456789</span>abcdefgh</div>
<script>
  let range = new Range()
  range.setStart(document.getElementById('box').childNodes[1].childNodes[0], 3)
  range.setEnd(document.getElementById('box').childNodes[2], 3)

  // 当调用下面的方法时
  // range.extractContents()
</script>
```
取出内容如下：

> span 标签并没有在 DOM 树中删除，还是存在的。

![image](http://note.youdao.com/yws/res/78423/67DAA9A09C904EA6970FECCAE9558157)

如果也想将 span 在 DOM 树中切除，`setStart` 的参数如下：
```
range.setStart(document.getElementById('box').childNodes[0], 3)
```

# 2，CSSOM

都离不开下面这个 API，

```
document.styleSheets
```
只有下面的 2 种方式，才能添加进 `styleSheets` 中。

- style 标签
- link 标签


link 标签，可以在所有需要独立文件的地方使用，并且使用 data 协议会很方便，有的字符需要转义。
```
<link rel="stylesheet" href="data:text/css, p%7Bcolor:blue%7D">
```

1，data:url 协议

在地址栏输入，可以直接渲染出 span 标签，并且在 network 中可以看到响应头 `Content-Type: text/html`
```
data:text/html, <span>xxx</span>
```

包括，data:url + base64 编码的图片可以一样的。

还有就是 link 标签 href。


## 2.1，Rules

可以在指定位置插入 css，因为 css 的顺序会影响最终的显示效果，所以插入的位置要注意。否则可能会没有效果。

> 只会插入到指定的 cssRules 中，之前的 style 标签或 link 标签中并不会显示。但是添加的 css 会生效。

insert 的第一个参数只能是字符串格式。

```
document.styleSheets[0].cssRules
document.styleSheets[0].insertRule("p{color:pink;}", 0)
document.styleSheets[0].removeRule(0)
```

批量操作元素属性，可以使用 CSSOM 操作，下面的修改也会实时生效。

> 为什么是批量的，因为下面修改的是 style 标签中的某个 css 的属性值。

```
document.styleSheets[0].cssRules[0].style.color = 'blue'
```

## 2.2，getComputedStyle

可以取到伪元素。

```
window.getComputedStyle(elt, pseudoElt)
```
- elt 想要获取的元素。
- pseudoElt 可选，伪元素。

# 3，CSSOM view API

## 3.1，window 窗口 API

```
// 打开新 tab 页
let childrenWindow = window.open('about:blank', "_blank")

// 打开新 tab 页，并指定大小和位置
let childrenWindow = window.open('about:blank', "_blank", "width=100, height=100, top=100, left=100")

// 改变位置（基于原来的位置）
childrenWindow.moveBy(-100, -100)

// 改变大小
childrenWindow.resizeBy(300, 300)
```

## 3.2，滚动 API

```
window.X

window.Y

// 绝对值
window.scroll(0, 30)

// 相对上一位置处的值
window.scrollBy(0, 50)
```

元素上的表现不太一致
```
element.scrollTop
element.scrollLeft
element.scrollBy(0, 50)
element.scrollTo(0, 30)

// 元素可滚动区域的大小
element.scrollHeight
```

## 3.3，位置API

```
element.getClientRects()[0]
```
为什么是一个数组？

因为一个元素，可能会产生多个行盒。比如在一个 inline 元素中写很多内容，页面展示会换行，有几行就 `getClientRects()`获取的数组的元素就有几个。

```
element.getBoundingClientRect()
```
这个 API 就不是数组了，因为只有一个元素，就是包裹所以行盒的“容器”的位置属性了。