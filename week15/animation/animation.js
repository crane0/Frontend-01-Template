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
      let { object, property, template, start, end, delay, timingFunction } = animation
      object[property] = template(timingFunction(start, end)(t - delay))
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
    this.duration = duration || 0
    this.delay = delay || 0
    this.timingFunction = timingFunction || ((start, end) => {
      return (t) => start + (t/duration) * (end - start)
    })
  }
}