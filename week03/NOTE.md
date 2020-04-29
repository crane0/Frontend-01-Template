# 每周总结可以写在这里

# 1，Grammar 语句

- 简单语句
- 组合语句
- 声明

> Runtime 运行时

- Completion Record
- Lexical Environment

Completetion Record 包括
- [[type]]: normal, break，continue，return，throw
- [[value]]: Types
- [[target]]: label （和语句的 continue 和 break 有关）

> 其实只分 normal 和 非 normal 


## 1.1，简单语句

- Expression语句
- Empty语句（一个分号）
- Debugger语句（一个 debugger）
- Throw语句
- Continue语句
- Break语句
- Return语句

```
a = 1 + 2;
;
debugger;
throw a;
continue;
// 可以加个标签名
continue label1;
// 可以加个标签名
break;
break label2;
return;
```

## 1.2，复合语句

- Block语句
- If语句
- Switch语句
- Iteration语句
- With语句
- Labelled语句
- Try语句

### 1.2.1，Block 语句

下面的语句不会报错，但除了Block语句内部之外，其他地方都不能访问到 a。

```
{
    const a = 1;
}
{
    const a = 2;
    console.log(a)
}
```
而Block中如果某个语句产生的结果的 type 不是 normal ，后面的语句就不会再执行了。

`return` 和 `continue` 来改变语句的执行的顺序，就是基于此。

> 下面的代码中，因为 `throw 1` ，后面的语句都不会执行了。

```
{
  const a = 1
  throw 1
  let b = 2
  b = foo()
}
```

### 1.2.2 Iteration语句

循环语句

如果 Completetion Record 带着 label，那这个循环会根据自己的 label 消费这个语句。如果不匹配，就不消费。（这句话并没有懂什么意思）


对于 for 循环 + let 声明

```
for (let i = 0; i < 5; i++) {
  let i = 0
  console.log(i)
}
```

在 for 循环中，下面的代码不会报错：i 被重复定义，是因为
( ) 中的算是父作用域，{ } 中的算子作用域。 

类似下面 Block 的作用域：

```
{
  let i = 0
  {
    let i = 1
    console.log(i) // 1
  }
  console.log(i) // 0
}
```

而下面的代码会死循环！因为 var 不受块级作用域的影响

> 其实，var 不会产生块级作用域。也就没有父子作用域了。

```
for (var i = 0; i < 5; i++) {
  var i = 0
  console.log(i)
}
```

2，for-in 就是简单的取出对象的 key

3，for-of 一般用在数组和 Generator 对象

实际上，只要具有迭代属性的对象，都可以使用 for-of 循环。

[生成器函数](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/function*)

```
function *g() {
  yield 1;
  yield 2;
  yield 5;
}

const ret = g()
ret.next().value // 1
ret.next().value // 2
ret.next().value // 5
ret.next().value // undefined
```
生成器函数又迭代属性，所以可以使用 for-of 迭代。
```
function *g() {
  yield 1;
  yield 2;
  yield 5;
}

for (let p of g()) {
  console.log(p)
}
```

### 1.2.3，labelled 语句

什么是 label 语句？

> 任何语句前都可以加 `xxx:` 并且不影响正常执行。

```
function name() {
  public:
    this.a = 1
    this.b = 2
  private:
    var c = 3
    var d = 4
}

const ret = new name;
ret.a // 1
ret.b // 2
ret.c // undefined
```

上面的代码看起来实现了函数的私有和公有属性，其实 `public` 和 `private` 没有任何作用。换成任何字符或是不写都是一个意思。
```
function name() {
  this.a = 1
  this.b = 2
  var c = 3
  var d = 4
}
```

### 1.2.4，try语句

if() 后可以不写 { }，正常执行。

try 后必须写 { }，否则报错。

除了 `throw` 语句，还有其他可以产生 type:throw 的结果？

> Expression 语句就会产生，比如语法错误。。。

下面的代码会产生语法错误：Identifier 'e' has already been declared。

可以看到和 for + let 的结果不一致，并不会产生新的作用域。

```
try {
  throw 2
} catch (e) {
  let e;
  console.log(e)
}
```

当使用 `var` 时，其实 `var` 是声明到了作用域的顶层。

```
try {
  throw 2
} catch (e) {
  var e;
  console.log(e)
}

// 相当于
var e;
try {
  throw 2
} catch (e) {
  console.log(e)
}
```

下面的代码会输出 2，3，因为在 `catch` 中相当于做了一个 let 声明。

所以，**catch 的作用域只有{ }里面1个**

```
var e = 3
try {
  throw 2
} catch (e) {
  console.log(e)
}
console.log(e)
```
作用域，只源代码文件中的，变量能够产生作用的范围（文本区域）。

执行上下文，是指程序在js 的引擎中运行时所需的一块内存，用于存放变量的地方。


## 1.3，声明

- FunctionDeclaration
- Generator声明
- AsyncFunction声明
- AsyncGenerator声明
- VariableStatement
- Class声明
- Lexical声明（词法声明）

### 1.3.1，函数声明

```
// 函数声明
function foo() {
  
}
// 函数表达式，名字可有可无 
var a = function foo1() {
    
}
```

区别：
- 函数表达式，不能出现在语句的开头。？
- 函数声明，必须有名字。

### 1.3.2，Class 声明

和函数类似，声明式的名字不能省略。

表达式的名字可以省略。

```
class C {

}

var c = class {

}
```

- class 会强制声明在使用之前。

下面的代码会报错，`Uncaught ReferenceError: Cannot access 'cls1' before initialization`

```
var cls1 = 0
function foo() {
  cls1 = 2
  class cls1 {}
}
foo()
```
很想是因为 TDZ 造成的死区: `Uncaught ReferenceError: Cannot access 'i' before initialization`
```
function foo() {
    console.log(i)
    let i = 2
}
foo()
```

而下面代码报错: `Uncaught SyntaxError: Identifier 'cls1' has already been declared`
```
var cls1 = 0
function foo() {
  let cls1 = 2
  class cls1 {}
}
foo()
```

- 不允许重复声明

报错 `Uncaught SyntaxError: Identifier 'cls2' has already been declared`
```
function foo() {
  class cls2 {}
  class cls2 {}
}
foo()
```

可以看出，class 的行为和 let 和 const 很类似。

### 1.3.3，Generator 声明

生成器函数，可以简单的理解为：可以分步多次返回的函数。

和普通函数相比，写法就多了个 `*`，并且也有表达式版本。

生成器函数中，如果死循环中如果是 yield，并不会死机，因为只有当调用 next() 方法时，才会执行一次 yield。
```
function* foo() {
  yield 1;
  var i
  while (true) {
    yield i++
  }
}
```

**Generator 和异步编程没有任何关系，和 async 也没有关系。**

### 1.3.4，async

```
function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time))
}

async function foo() {
  var i = 0
  while (true) {
    console.log(i++)
    await sleep(1000)
  }
}
foo()

// 或者直接调用
void async function() {
  var i = 0
  while (true) {
    console.log(i++)
    await sleep(1000)
  }
}()
```

### 1.3.5，async Generator

这2个可以一起使用

```
async function* foo() {
  var i = 0
  while (true) {
    yield i++
  }
}
const g = foo()
g.next() // 返回 Promise 对象
```

下面会每隔 1s 打印一次。

```
function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time))
}

async function* foo() {
  var i = 0
  while (true) {
    yield i++
    await sleep(1000)
  }
}

const g = foo()
console.log(await g.next())
console.log(await g.next())
console.log(await g.next())
console.log(await g.next())
console.log(await g.next())
```

[for-await...of](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/for-await...of)

上面代码中，有多次的调用 `await` 时，可以使用。

```
for await (let a of g) {
  console.log(a)
}
```

### 1.3.6，变量声明

- 如果有 var，不建议写在任何子结构（比如 if）中。建议写在该变量第一次出现的地方。
- 不要在 block 中写 var

```
var x = 0
function foo() {
  var o = {x: 5}
  x = 2
  with(o) {
    var x = 3
  }
  console.log(x)
  console.log(o)
}
foo()
console.log(x)
```
输出如下，可以看出 with 中的 `var` 影响的是 `x = 2`，而 `x = 3` 影响的是对象 o

> 因为最后一行输入的是0，说明 `x = 2`应该是 `var x = 2`

```
2
{x: 3}
0
```

而如果将 with 中的 var 去掉，

```
var x = 0
function foo() {
  var o = {x: 5}
  x = 2
  with(o) {
    x = 3
  }
  console.log(x)
  console.log(o)
}
foo()
console.log(x)
```
输出如下，说明 with 语句没有影响到 x

```
2
{x: 3}
2
```

# 2，对象。

- 唯一性
- 状态（描述对象）
- 行为（状态的改变）

## 2.1，类

基于类的面向对象
- 归类
- 分类

对于分类来说，某个对象只会属于某个类，如果又想和其他的类发生交集，就出现了 interface 接口来实现。

如果2个类有共性，又因为没有在一起，所以出现了 mixin。

## 2.2，原型

基于原型的描述，是找一个典型的对象描述清楚，当遇到和它类似的对象时，就可以说比它高矮胖瘦之类的。

## 2.3，练习

例：狗咬人，如果用面向对象的思维，“咬”这个行为属于哪个对象。

```
class Dog {
    bite(human){
        //...
    }
}
```
我们不应该受到语言描述的干扰，在设计对象的状态和行为时，要遵循「行为改变自身状态」的原则。

也就是说，狗咬人，是让人的状态改变了，所以应该给人定义一个状态。

对狗来说，咬是一个状态，会有一个行为（比如急了）来改变咬这个状态。

```
class Human {
    hurt(damage) {
        //...
    }
}
```

## 2.4，JavaScript中的对象

都属于运行时。

- 属性
- 原型（不是对象，虽然浏览器提供了API可以获取这个原型）

属性分为
- 数据属性 Date Property
    - [[value]] 值
    - writable 可写
    - enumerable 可被 for-in枚举
    - configurable 上面2个和自己是否可被改变，所以只有一次就会，一旦被置为 false，就回不来了。
- 访问器属性 Accessor Property
    - get 和 set 不一定对应
    - set
    - enumerable
    - configurable

## 2.5，API

> 适用原型思想去抽象和定义问题

- {} . [] Object.defineProperty
- Object.create / Object.setPropertyOf / Object.getPropertyOf

> 适用基于类的面型对象

- new / class / extends

> 乱乱的机制

- new / function / prototype

## 2.6，Function 对象

带了 [[call]] 这个行为，就是 Function

带了 constructor，就是构造器。

js 原生的 Function 语法定义出来的，二者都是。

```
// new 和不 new行为不一致。
Number() // 0
new Number() // Number{0}

Date() // "Wed Apr 29 2020 23:10:27 GMT+0800 (中国标准时间)"
new Date() // Wed Apr 29 2020 23:10:47 GMT+0800 (中国标准时间)
```

而 `function` 创建出来的是一致的。
