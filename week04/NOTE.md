# 每周总结可以写在这里

# 1，宏任务和微任务

1，setTimeout 是js宿主浏览器提供的，所以是宏任务。Promise 是 js 自带的，所以是微任务。

2，微任务是为 then 这个机制设计的，但并不是说有 then 才有微任务。有 then 可以产生一个宏任务中有多个微任务的情况。

> 每一个 then 中会产生一个微任务，

3，一个宏任务可以包含多个微任务。js代码本身就是由微任务构成的（在微任务中执行），就看那几个微任务构成一个宏任务。

4，一个宏任务中，只有一个微任务队列。当前宏任务执行完成后，才会执行下一个宏任务。

## 1.1，举例

下面的代码：

宏任务1
- 0 4 5 同步
- 1 异步

宏任务2
- 2 异步
- 3 异步

```
new Promise(resolve => (console.log(0), resolve()))
  .then(() => console.log(1))

setTimeout(() => {
  console.log(2)
  new Promise(resolve => resolve())
    .then(() => console.log(3))
}, 0)

console.log(4)
console.log(5)
```

下面的代码：

在宏任务1中，执行同步微任务 0 后，异步微任务 1 入队，继续执行同步微任务 4，5，再执行同步微任务 -1，异步微任务 -2 入队。

再执行异步微任务 1，同时异步微任务 -1.5 入队。

再执行异步微任务 -2。

再执行异步微任务 -1.5。


宏任务2
- 2 异步
- 3 异步


```
async function foo() {
  console.log(-1)
  await new Promise(resolve => resolve())
  console.log(-2)
}

new Promise(resolve => (console.log(0), resolve()))
  .then(() => (
    console.log(1),
    new Promise(resolve => resolve())
      .then(() => console.log(-1.5))
  ))

setTimeout(() => {
  console.log(2)
  new Promise(resolve => resolve())
    .then(() => console.log(3))
}, 0)

console.log(4)
console.log(5)
foo()
```


# 2，逗号表达式

[MDN，逗号表达式](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Comma_Operator)

会返回最后一个表达式，并且前面的表达式会执行。

```
var a = 1
void function() {
  a++
}(), function() {
  a++
}
console.log(a++) // 2
```

```
function foo () {
  var x = 0;

  return (x += 1, x); // 相当于 ++x;
}
```

