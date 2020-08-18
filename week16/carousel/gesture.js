/* 
  相比于 gesture3.js 添加了派发事件的逻辑
  之前只是各种手势的判断，现在对他们进行事件的分发（在end中），则元素可以绑定该事件。
  自定义事件： https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events
*/
export function getGesture(element) {
  let contexts = Object.create(null)
  let MOUSE_SYMBOL = Symbol('mouse')

  // 判断是否 PC，PC 端是 undefined，移动端是 null
  if (document.ontouchstart !== null) {
    element.addEventListener('mousedown', event => {
      contexts[MOUSE_SYMBOL] = Object.create(null)
      start(event, contexts[MOUSE_SYMBOL])
      let mousemove = event => {
        move(event, contexts[MOUSE_SYMBOL])
      }
    
      let mouseup = event => {
        end(event, contexts[MOUSE_SYMBOL])
        element.removeEventListener('mousemove', mousemove)
        element.removeEventListener('mouseup', mouseup)
      }
    
      element.addEventListener('mousemove', mousemove)
      element.addEventListener('mouseup', mouseup)
    })
  }


  // touchcancel，会在当处于点击状态时，弹出一个对话框或被系统事件等，打断了原本点击的那个元素。
  // touchend，手主动不在点击。



  element.addEventListener('touchstart', event => {
    for (const touch of event.changedTouches) {
      contexts[touch.identifier] = Object.create(null)
      start(touch, contexts[touch.identifier])
    }
  })

  element.addEventListener('touchmove', event => {
    for (const touch of event.changedTouches) {
      move(touch, contexts[touch.identifier])
    } 
  })

  element.addEventListener('touchend', event => {
    for (const touch of event.changedTouches) {
      end(touch, contexts[touch.identifier])
      delete contexts[touch.identifier]
    }
  })

  element.addEventListener('touchcancel', event => {
    for (const touch of event.changedTouches) {
      cancel(touch, contexts[touch.identifier])
      delete contexts[touch.identifier]
    }
  })



  let start = (point, context) => {
    context.startX = point.clientX
    context.startY = point.clientY

    context.isTap = true
    context.isPan = false
    context.isPress = false
    context.moves = []
    // 如果都用下面的方式，在使用时，可以直接从 event 对象上取属性。
    // 也可以设置到 detail 属性上，之后从 event.detail 对象上取属性。
    // let e = new CustomEvent('start')
    // Object.assign(e, {
    //   startX: point.clientX,
    //   startY: point.clientY,
    //   clientX: point.clientX,
    //   clientY: point.clientY,
    // })
    // element.dispatchEvent(e)
    element.dispatchEvent(new CustomEvent('start', {
      detail: {
        startX: point.clientX,
        startY: point.clientY,
        clientX: point.clientX,
        clientY: point.clientY,
      }
    }))

    // 这里虽然定义了 setTimeout，但在 end 中会清理，
    // 所以，如果是 tap，也不用担心会变为 press
    context.timeoutHandler = setTimeout(() => {
      // 如果已经是 pan，就不会再变为 press
      if (context.isPan) {
        return
      }
      context.isTap = false
      context.isPan = false
      context.isPress = true
      element.dispatchEvent(new CustomEvent('pressstart', { }))
      console.log('pressstart')
    }, 500)
  }

  let move = (point, context) => {
    let dx = point.clientX - context.startX
    let dy = point.clientY - context.startY
    // console.log('move', dx, dy)
    // 如果已经是 pan 了，就不在需要重复设置了。
    if (dx ** 2 + dy ** 2 > 100 && !context.isPan) {
      context.isTap = false
      context.isPan = true
      context.isPress = false
      element.dispatchEvent(new CustomEvent('panstart', {
        detail: {
          startX: context.startX,
          startY: context.startY,
          clientX: point.clientX,
          clientY: point.clientY,
        }
      }))
      console.log('panstart')
    }
    if (context.isPan) {
      context.moves.push({
        dx,
        dy,
        t: Date.now()
      })
      // 只留下离开前 300ms 的
      context.moves = context.moves.filter(record => Date.now() - record.t < 300)
      console.log('pan')
      element.dispatchEvent(new CustomEvent('pan', {
        detail: {
          startX: context.startX,
          startY: context.startY,
          clientX: point.clientX,
          clientY: point.clientY,
        }
      }))
    }
  }

  let end = (point, context) => {
    if (context.isTap) {
      element.dispatchEvent(new CustomEvent('tap', { }))
      console.log('tap')
    }
    if (context.isPan) {
      console.log('panend')
      let dx = point.clientX - context.startX
      let dy = point.clientY - context.startY
      // 第一个就是 300ms 之前的那个
      let record = context.moves[0]
      // move 300ms 之前的那个点 到 end 2点之间的距离
      let speed = Math.sqrt((record.dx - dx) ** 2 + (record.dy - dy) ** 2) / (Date.now() - record.t)
      // 2.5是大致测出来的。
      let isFlick = speed > 2.5

      element.dispatchEvent(new CustomEvent('panend', {
        detail: {
          startX: context.startX,
          startY: context.startY,
          clientX: point.clientX,
          clientY: point.clientY,
          speed,
          isFlick
        }
      }))
      if (isFlick) {
        element.dispatchEvent(new CustomEvent('flick', {
          detail: {
            startX: context.startX,
            startY: context.startY,
            clientX: point.clientX,
            clientY: point.clientY,
            speed,
          }
        }))
        console.log('flick')
      }
    }
    if (context.isPress) {
      element.dispatchEvent(new CustomEvent('pressend', { }))
      console.log('pressend')
    }
    clearTimeout(context.timeoutHandler)
  }

  let cancel = (point, context) => {
    element.dispatchEvent(new CustomEvent('cancel', { }))
    console.log('cancel')
    clearTimeout(context.timeoutHandler)
  }
}

// pointevent，新的监听事件，可以整合 mouse 和 touch