/* 
  对比 animation3.js，增加了 pause 和 resume 的逻辑
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
      let { object, property, template, start, end, duration, delay, timingFunction } = animation

      let progression = timingFunction((t - delay) / duration) // 0-1的百分比
      if (t > duration + delay) {
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

  add(animation) {
    this.animations.push(animation)
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