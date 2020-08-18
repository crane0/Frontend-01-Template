let element = document.body

element.addEventListener('mousedown', event => {
  start(event)
  let move = event => {
    move(event)
    console.log(event.clientX, event.clientY)
  }

  let up = event => {
    end(event)
    element.removeEventListener('mousemove', move)
    element.removeEventListener('mouseup', up)
  }

  element.addEventListener('mousemove', move)
  element.addEventListener('mouseup', up)
})


// touchcancel，会在当处于点击状态时，弹出一个对话框或被系统事件等，打断了原本点击的那个元素。
// touchend，手主动不在点击。



element.addEventListener('touchstart', event => {
  for (const touch of event.changedTouches) {
    start(touch)
  }
})

element.addEventListener('touchmove', event => {
  for (const touch of event.changedTouches) {
    move(touch)
  } 
})

element.addEventListener('touchend', event => {
  for (const touch of event.changedTouches) {
    end(touch)
  }
})

element.addEventListener('touchcancel', event => {
  for (const touch of event.changedTouches) {
    cancel(touch)
  }
})

let start = (event) => {
  console.log('start', event.clientX, event.clientY)
}

let move = (event) => {
  console.log('move', event.clientX, event.clientY)
}

let end = (event) => {
  console.log('end', event.clientX, event.clientY)
}

let cancel = () => {
  console.log('cancel')
}

// pointevent，新的监听事件，可以整合 mouse 和 touch