export class TimeLine {
  constructor() {
    this.animations = []
  }
  tick() {
    let t = Date.now() - this.startTime
    for (const animation of this.animations) {
      if (t > animation.duration + animation.delay) {
        continue
      }
      let { object, property, template, start, end, duration, delay, timingFunction } = animation

      let progression = timingFunction((t - delay) / duration) // 0-1的百分比
      let value = start + progression * (end - start)
      // template 的作用是因为，object[property] 通常是一个字符串，而计算出的结果一般都是数字。
      object[property] = template(value)
    }
    requestAnimationFrame(() => this.tick())
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