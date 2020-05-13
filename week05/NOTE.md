# 每周总结可以写在这里

# 结构化二
## 1，js context

就是执行上下文，存了 global 中所有的东西，对应 global 的 object ，

在标准的第 18 章，是 global 对象。

## 2，函数调用

execution context stack 执行上下文栈

栈顶的称为 running execution context

execution context 中包括 7 项内容，重要的有 3种，

都是链表的类型

- lexicalEnvironment
    - this（es5不包括）
    - new.target
    - super
    - 变量
- variableEnvironment
    - 历史遗留，仅仅用于处理 var 声明 
- realm

在 js 中，函数表达式和对象直接量均会创建对象， `var x= {}`

使用 `.` 做隐式转换也会创建对象。

这些对象也是由原型的，如果我们没有 Realm，就不知道它们的原型是什么。

Realm 中有一套完整的 js 内置对象。

## 浏览器工作原理

主要实现了 TCP 和 HTTP 之间的通信。

收获
- 知道了状态机，在正则无法使用时，如何匹配目标内容。