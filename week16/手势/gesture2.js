let element = document.body

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
    console.log('panstart')
  }
  if (context.isPan) {
    console.log('pan')
  }
}

let end = (point, context) => {
  if (context.isTap) {
    console.log('tap')
  }
  if (context.isPan) {
    console.log('panend')
  }
  if (context.isPress) {
    console.log('pressend')
  }
  clearTimeout(context.timeoutHandler)
}

let cancel = (point, context) => {
  console.log('cancel')
  clearTimeout(context.timeoutHandler)
}

// pointevent，新的监听事件，可以整合 mouse 和 touch