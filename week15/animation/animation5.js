/* 
  对比 animation4.js，修改了 add 和 tick 方法的逻辑，
  可以指定第2个动画距第1个动画的延迟时间。
*/
export class TimeLine {
  constructor() {
    this.animations = []
    this.requestID = null
    this.state = 'init'
    this.startTime = null
    this.pauseTime = null
  }
  tick() {
    let t = Date.now() - this.startTime
    let animations = this.animations.filter(a => !a.finished)
    for (const animation of animations) {
      let { object, property, template, start, end, duration, delay, timingFunction, addTime } = animation

      let progression = timingFunction((t - delay - addTime) / duration) // 0-1的百分比
      if (t > duration + delay + addTime) {
        progression = 1
        animation.finished = true
      }
      let value = start + progression * (end - start)
      // template 的作用是因为，object[property] 通常是一个字符串，而计算出的结果一般都是数字。
      object[property] = template(value)
    }
    if (animations.length) {
      this.requestID = requestAnimationFrame(() => this.tick())
    }
  }

  start() {
    if (this.state !== 'init') {
      return
    }
    this.state = 'start'
    this.startTime = Date.now()
    this.tick()
  }

  // 开一个新的 requestID
  restart() {
    this.pause()
    this.animations = []
    this.requestID = null
    this.state = 'start'
    this.startTime = Date.now()
    this.pauseTime = null
    this.tick()
  }

  pause() {
    if (this.state !== 'start') {
      return
    }
    this.state = 'pause'
    this.pauseTime = Date.now()
    if (this.requestID !== null) {
      cancelAnimationFrame(this.requestID)
    }
  }

  resume() {
    // 如果不加状态管理，多次resume，就会有问题
    if (this.state !== 'pause') {
      return
    }
    this.state = 'start'
    this.startTime += Date.now() - this.pauseTime
    this.tick()
  }

  /* 
    逻辑梳理
    在 index5.html 中，点击 el2-start 按钮，执行 add 方法后，
    1，第2个动画被 push
    2，设置了第2个动画的 addTime
    3，因为在第一个动画结束前， tick 方法一直在循环的执行，所以当第二次执行 tick 时，第2个动画也会被触发。

    如果在 add 指定 animation.addTime = 0，就会在第2个动画执行的瞬间，追上第一个动画的位置。
    因为在 tick 中计算的 progression 是一样的。

    addTime 始终都是指，和第1个动画的延迟时间，
    因此，如果2个动画，开始结束位置相同，持续时间也相同，addTime 是2s 时，
    如果在第1个动画刚开始运动，就立刻让第2个也开始，则第2个动画会反向运动，再正向运动，就是为了保证和第1个差2s 的时间到达终点。
  */
  add(animation, addTime) {
    this.animations.push(animation)
    if (this.state === 'start') {
      animation.addTime = addTime !== void 0 ? addTime : Date.now() - this.startTime
    } else {
      animation.addTime = addTime !== void 0 ? addTime : 0
    }
  }
}

export class Animation {
  constructor(object, property, template, start, end, duration, delay, timingFunction) {
    this.object = object
    this.property = property
    this.template = template
    this.start = start
    this.end = end
    this.duration = duration
    this.delay = delay || 0
    this.timingFunction = timingFunction
  }
}