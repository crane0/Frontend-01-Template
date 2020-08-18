// 注意，下面引用组件，并没有直接用到，而是通过 babel 插件解析 jsx 后，会用到。
/* 
  以最原始的 Carousel 组件为基础，添加了 animation.js 自定义的动画 + 手势控制。
*/
import { createElement, Text, Wrapper } from './createElement'
import { TimeLine, Animation } from './animation'
import { ease } from './cubicBezier'

class Carousel {
  constructor() {
    this.childrens = []
  }

  setAttribute(name, value) {
    this[name] = value
  }

  appendChild(child) {
    this.childrens.push(child)
  }

  render() {
    let timeline = new TimeLine
    timeline.start()
    let position = 0

    let nextStopHandler = null
    // 要停止动画时，还要清理掉 nextStopHandler
   

    let childrens = this.data.map((url, currentPosition) => {
      let lastPosition = (currentPosition - 1 + this.data.length) % this.data.length
      let nextPosition = (currentPosition + 1) % this.data.length
      
      let offset = 0

      let onStart = () => {
        timeline.pause()
        clearTimeout(nextStopHandler)
        let currentElement = childrens[currentPosition]
        let currentTransformValue = Number(currentElement.style.transform.match(/translateX\(([\s\S]+)px\)/)[1])
        // 点击时，当前图片已经走的距离。（position 从 0 开始的）
        offset = currentTransformValue + 500 * currentPosition
      }

      let onPan = event => {
        let lastElement = childrens[lastPosition]
        let currentElement = childrens[currentPosition]
        let nextElement = childrens[nextPosition]

        // 鼠标拖动的距离
        let dx = event.detail.clientX - event.detail.startX;

        let lastTransformValue = -500 - 500 * lastPosition + offset + dx
        let currentTransformValue = -500 * currentPosition + offset + dx
        let nextTransformValue = 500 - 500 * nextPosition + offset + dx

        lastElement.style.transform = `translateX(${lastTransformValue}px)`
        currentElement.style.transform = `translateX(${currentTransformValue}px)`
        nextElement.style.transform = `translateX(${nextTransformValue}px)`
      }

      let onPanend = event => {
        // 用来标记左右
        let direction = 0
        // 鼠标拖动的距离
        let dx = event.detail.clientX - event.detail.startX;

        if (dx + offset > 250) {
          direction = 1
        } else if (dx + offset < -250) {
          direction = -1
        }
        // 清除之前所有动画，并重新开始
        timeline.reset()
        timeline.start()

        let lastElement = childrens[lastPosition]
        let currentElement = childrens[currentPosition]
        let nextElement = childrens[nextPosition]

        let lastAnimation = new Animation(
          lastElement.style, 
          'transform', 
          -500 - 500 * lastPosition + offset + dx,
          -500 - 500 * lastPosition + direction * 500,
          500,
          0,
          ease,
          v => `translateX(${v}px)`
        )
        let currentAnimation = new Animation(
          currentElement.style, 
          'transform', 
          - 500 * currentPosition + offset + dx,
          - 500 * currentPosition + direction * 500,
          500,
          0,
          ease,
          v => `translateX(${v}px)`
        )
        let nextAnimation = new Animation(
          nextElement.style, 
          'transform', 
          500 - 500 * nextPosition + offset + dx,
          500 - 500 * nextPosition + direction * 500,
          500,
          0,
          ease,
          v => `translateX(${v}px)`
        )

        timeline.add(lastAnimation)
        timeline.add(currentAnimation)
        timeline.add(nextAnimation)

        // 拖拽完成后，再次进入自动轮播时，计算正确的 position
        position = (position - direction + this.data.length) % this.data.length
        nextStopHandler = setTimeout(next, 2000)

      }
      // 点击图片停止动画。
      let element = <img src={url} onStart={onStart} onPan={onPan} onPanend={onPanend} enableGesture={true} />
      element.style.transform = 'translateX(0px)'
      element.addEventListener('dragstart', event => event.preventDefault())
      return element
    })

    let next = () => {
      let nextPosition = (position + 1) % this.data.length
      let currentPic = childrens[position]
      let nextPic = childrens[nextPosition]

      let currentAnimation = new Animation(
        currentPic.style, 
        'transform', 
        -100 * position,
        -100-100 * position,
        500,
        0,
        ease,
        v => `translateX(${5*v}px)`
      )

      let nextAnimation = new Animation(
        nextPic.style, 
        'transform', 
        100-100 * nextPosition,
        -100 * nextPosition,
        500,
        0,
        ease,
        v => `translateX(${5*v}px)`
      )

      timeline.add(currentAnimation)
      timeline.add(nextAnimation)
      position = nextPosition

      nextStopHandler = setTimeout(next, 2000)
    }
    // 一开始的延迟，保证第1个图片出现。
    nextStopHandler = setTimeout(next, 2000)

    return <div class="carousel">{ childrens }</div>
  }

  mountTo(parent) {
    this.render().mountTo(parent)
  }
}

let component = <Carousel data={[
  'https://static001.geekbang.org/resource/image/bb/21/bb38fb7c1073eaee1755f81131f11d21.jpg',
  'https://static001.geekbang.org/resource/image/1b/21/1b809d9a2bdf3ecc481322d7c9223c21.jpg',
  'https://static001.geekbang.org/resource/image/b6/4f/b6d65b2f12646a9fd6b8cb2b020d754f.jpg',
  'https://static001.geekbang.org/resource/image/73/e4/730ea9c393def7975deceb48b3eb6fe4.jpg',
]} />

component.mountTo(document.body)
