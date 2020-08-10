# 每周总结可以写在这里

# 1，SFC

1，`require.resolve`的使用说明
```
{
    test: /\.view$/,
    exclude: /node_modules/,
    use: {
      loader: require.resolve('./sfc/my-loader.js')
    }
}
```

二者相等，并且使用 `require.resolve` 时，还会检查文件是否存在，不存在会报路径错误。
```
path.join(__dirname, './assets/some-file.txt')

require.resolve('./assets/some-file.txt')
```

2，loader 的编写

https://webpack.js.org/contribute/writing-a-loader/


# 2，动画

1，在动画运动的过程中，设置 `transtion = 'none'` 时，元素的动画会瞬间结束，状态就是原本动画应该结束的状态。

并不会停留在设置 `transtion = 'none'` 时的状态。

2，时间线

多个 animation 排在时间线中，每个时间线可以暂停或者继续。

而 animation 的 delay 就是 startTime。

> 就像 PPT 动画，有一个控制所有动画的时间线。

3，在 script 标签中，使用 es6 import 语法

```
<script type="module">
  import { TimeLine } from './animation.js'
  let tl = new TimeLine
  // tl.start()
</script>
```
- type="module"
- .js 不能省略
- 该 html 文件用本地服务打开

满足上面3个，才能正常运行。

4，transform 不会触发重排。

5，timingFunction 应该是以 time 为入参，Progress 为出参的一个值。

```
let progression = timingFunction((t - delay - addTime) / duration) // 0-1的百分比
if (t > duration + delay + addTime) {
    progression = 1
    animation.finished = true
}
let value = animation.valueProgression(progression)
object[property] = template(value)
```