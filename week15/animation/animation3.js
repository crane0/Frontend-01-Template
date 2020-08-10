/* 
  对比 animation2.js，优化了 tick
  - 动画最后未正确进行到结束状态，存在一点误差
  - tick 一直在执行
*/
export class TimeLine {
  constructor() {
    this.animations = []
  }
  tick() {
    let t = Date.now() - this.startTime
    let animations = this.animations.filter(a => !a.finished)
    for (const animation of animations) {
      let { object, property, template, start, end, duration, delay, timingFunction } = animation

      let progression = timingFunction((t - delay) / duration) // 0-1的百分比
      if (t > animation.duration + animation.delay) {
        progression = 1
        animation.finished = true
      }
      let value = start + progression * (end - start)
      // template 的作用是因为，object[property] 通常是一个字符串，而计算出的结果一般都是数字。
      object[property] = template(value)
    }
    if (animations.length) {
      requestAnimationFrame(() => this.tick())
    }
  }

  start() {
    this.startTime = Date.now()
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