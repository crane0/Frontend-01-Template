function layout(element) {
  if (!element.computedStyle) {
    return
  }
  
  // 有 computedStyle ，对其做一些预处理
  let elementStyle = getStyle(element)
  // 这里只对 flex 做处理。
  if (elementStyle.display !== 'flex') {
    return
  }

  // 不处理文本节点
  let items = element.children && element.children.filter(e => e.type === 'element')
  items.sort((a, b) => {
    return (a.order || 0) - (b.order || 0)
  })

  let style = elementStyle;

  ['width', 'height'].forEach(size => {
    if (style[size] === 'auto' || style[size] === '') {
      style[size] === null
    }
  })

  if (!style.flexDirection || style.flexDirection === 'auto') {
    style.flexDirection = 'row'
  }
  if (!style.alignItems || style.alignItems === 'auto') {
    style.alignItems = 'stretch'
  }
  if (!style.justifyContent || style.justifyContent === 'auto') {
    style.justifyContent = 'flex-start'
  }
  if (!style.flexWrap || style.flexWrap === 'auto') {
    style.flexWrap = 'nowrap'
  }
  if (!style.alignContent || style.alignContent === 'auto') {
    style.alignContent = 'stretch'
  }
  /* 
    main 是主轴方向，cross 是交叉轴方向
    mainBase 是主轴排版起点，左-->右，0，右-->左，width
    mainSign 排版方向，左-->右，+1，右-->左，-1 , -+1 只是区别方向而已。
  */
  var mainSize, mainStart, mainEnd, mainSign, mainBase,
    crossSize, crossStart, crossEnd, crossSign, crossBase;
  
  if (style.flexDirection == 'row') {
    mainSize = 'width'
    mainStart = 'left'
    mainEnd = 'right'
    mainSign = +1
    mainBase = 0

    crossSize = 'height'
    crossStart = 'top'
    crossEnd = 'bottom'
  }

  if (style.flexDirection == 'row-reverse') {
    mainSize = 'width'
    mainStart = 'right'
    mainEnd = 'left'
    mainSign = -1
    mainBase = style.width

    crossSize = 'height'
    crossStart = 'top'
    crossEnd = 'bottom'
  }

  if (style.flexDirection == 'column') {
    mainSize = 'height'
    mainStart = 'top'
    mainEnd = 'bottom'
    mainSign = +1
    mainBase = 0

    crossSize = 'width'
    crossStart = 'left'
    crossEnd = 'right'
  }

  if (style.flexDirection == 'column-reverse') {
    mainSize = 'height'
    mainStart = 'bottom'
    mainEnd = 'top'
    mainSign = -1
    mainBase = style.height

    crossSize = 'width'
    crossStart = 'left'
    crossEnd = 'right'
  }

  if (style.flexWrap == 'wrap-reverse') {
    let temp = crossStart
    crossStart = crossEnd
    crossEnd  = temp
    crossSign = -1
  } else {
    crossSign = +1
    crossBase = 0
  }

  // 上面的 if 都是处理各种属性。下面的处理一些特例
  /* 
    如果容器元素没有设置 mainSize，则累加子元素（item）的 mainSize
    简单理解为：主轴宽度就是所有子元素宽度之和。
  */
  let isAutoMainSize = false
  if (!style[mainSize]) {
    elementStyle[mainSize] = 0
    // items 是过滤了文本节点后，剩下的元素节点
    for (let i = 0; i < items.length; i++) {
      let item = items[i]
      let itemStyle = getStyle(item)
      if (itemStyle[mainSize] !== null || itemStyle[mainSize] !== (void 0)) {
        elementStyle[mainSize] = elementStyle[mainSize] + itemStyle[mainSize]
      }
    }
    isAutoMainSize = true
  }



  // 2，开始分行
  let flexLine = []
  let flexLines = [flexLine]
  // 主轴剩余空间
  let mainSpace = elementStyle[mainSize]
  let crossSpace = 0

  for (let i = 0; i < items.length; i++) {
    let item = items[i]
    let itemStyle = getStyle(item)
    // item 没有主轴尺寸，设为0，方便计算。
    if (itemStyle[mainSize] === null) {
      itemStyle[mainSize] = 0
    }

    // 如果有 item 有 flex 属性（就是那个简写合并的属性），说明可伸缩
    if (itemStyle.flex) {
      flexLine.push(item)
    } else if (style.flexWrap === 'nowrap' && isAutoMainSize) {
      mainSpace -= itemStyle[mainSize]
      if (itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) {
        // 交叉轴的剩余空间是 item 的最大值?
        crossSpace = Math.max(crossSpace, itemStyle[crossSize])
      }
      flexLine.push(item)
    } else {
      // item 的宽度比容器的还宽
      if (itemStyle[mainSize] > style[mainSize]) {
        itemStyle[mainSize] = style[mainSize]
      }
      // 剩余空间放不下了 item 了，那就有剩余空间了
      if (mainSpace < itemStyle[mainSize]) {
        flexLine.mainSpace = mainSpace
        flexLine.crossSpace = crossSpace
        // 创建新行。相当于 flexLine = []; flexLine.push(item)
        flexLine = [item]
        flexLines.push(flexLine)
        // 重置
        mainSpace = style[mainSize]
        crossSpace = 0
      } else {
        flexLine.push(item)
      }
      if (itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) {
        crossSpace = Math.max(crossSpace, itemStyle[crossSize])
      }
      mainSpace -= itemStyle[mainSize]
    }
  }
  flexLine.mainSpace = mainSpace
  // console.log(items)

  if (style.flexWrap === 'nowrap' || isAutoMainSize) {
    flexLine.crossSpace = style[crossSize] ? style[crossSize] : crossSpace
  } else {
    flexLine.crossSpace = crossSpace
  }




  // 3，计算主轴尺寸
  if (mainSpace < 0) {
    let scale = style[mainSize] / (style[mainSize] - mainSpace)
    // mainBase 是起点，循环计算每个 item 的 mainSize 并累加，就可以得到下一个 item 的 start
    let currentMain = mainBase
    for (let i = 0; i < items.length; i++) {
      let item = items[i]
      let itemStyle = getStyle(item)

      if (itemStyle.flex) {
        itemStyle[mainSize] = 0
      }
      itemStyle[mainSize] = itemStyle[mainSize] * scale
      itemStyle[mainStart] = currentMain
      itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize]
      currentMain = itemStyle[mainEnd]
    }
  // 多行的情况
  } else {
    flexLines.forEach(items => {
      let mainSpace = items.mainSpace
      let flexTotal = 0
      // 计算 flex 的总值
      for (let i = 0; i < items.length; i++) {
        let item = items[i]
        let itemStyle = getStyle(item)

        if (itemStyle.flex !== null && itemStyle.flex !== (void 0)) {
          flexTotal += itemStyle.flex
          continue
        }
      }

      // 说明有 item 设置了 flex 属性
      if (flexTotal > 0) {
        let currentMain = mainBase
        for (let i = 0; i < items.length; i++) {
          let item = items[i]
          let itemStyle = getStyle(item)

          // 平均分配剩余空间，并计算主轴每个元素的尺寸。
          if (itemStyle.flex) {
            itemStyle[mainSize] = (mainSpace / flexTotal) * itemStyle.flex
          }
          // 下面这3行当时写到了 if 里面，就出错了。
          itemStyle[mainStart] = currentMain
          itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize]
          currentMain = itemStyle[mainEnd]
        }
        // 没有 item 设置 flex 属性，就看 justifyContent
      } else {
        let currentMain = mainBase
        // item 间距
        let step = 0
        // 默认值
        if (style.justifyContent === 'flex-start') {}
        if (style.justifyContent === 'flex-end') {
          currentMain = mainSpace * mainSign + mainBase
        }
        if (style.justifyContent === 'center') {
          currentMain = mainSpace / 2 * mainSign + mainBase
        }
        if (style.justifyContent === 'space-between') {
          step = mainSpace / (items.length - 1) * mainSign
        }
        if (style.justifyContent === 'space-around') {
          step = mainSpace / items.length * mainSign
          currentMain = step / 2 + mainBase
        }
        for (let i = 0; i < items.length; i++) {
          let item = items[i]
          let itemStyle = getStyle(item)

          itemStyle[mainStart] = currentMain
          itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize]
          currentMain = itemStyle[mainEnd] + step
        }
      }
    })
  }




  if (!style[crossSize]) {
    crossSpace = 0
    elementStyle[crossSize] = 0
    for (let i = 0; i < flexLines.length; i++) {
      elementStyle[crossSize] = elementStyle[crossSize] + flexLines[i].crossSpace
    }
  } else {
    crossSpace = style[crossSize]
    for (let i = 0; i < flexLines.length; i++) {
      crossSpace -= flexLines[i].crossSpace
    }
  }

  if (style.flexWrap === 'wrap-reverse') {
    crossBase = style[crossSize]
  } else {
    crossBase = 0
  }

  let lineSize = style[crossSize] / flexLines.length
  let step

  if (style.alignContent === 'flex-start') {
    crossBase += 0
    step = 0
  }
  if (style.alignContent === 'flex-end') {
    crossBase += crossSign * crossSpace
    step = 0
  }
  if (style.alignContent === 'center') {
    crossBase += crossSign * crossSpace / 2
    step = 0
  }
  if (style.alignContent === 'space-between') {
    crossBase += 0
    step = crossSpace / (flexLines.length - 1)
  }
  if (style.alignContent === 'space-around') {
    step = crossSpace / flexLines.length
    crossBase += crossSign * step / 2
  }
  if (style.alignContent === 'stretch') {
    crossBase += 0
    step = 0
  }

  flexLines.forEach(items => {
    let lineCrossSize = style.alignContent === 'stretch' ?
      items.crossSpace + crossSpace / flexLines.length :
      items.crossSpace
    
    for (let i = 0; i < items.length; i++) {
      let item = items[i]
      let itemStyle = getStyle(item)

      let align = itemStyle.alignSelf || style.alignItems
      if (itemStyle[crossSize] === null) {
        itemStyle[crossSize] = (align === 'stretch') ? lineCrossSize : 0
      }
      if (align === 'flex-start') {
        itemStyle[crossStart] = crossBase
        itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize]
      }
      if (align === 'flex-end') {
        itemStyle[crossEnd] = crossBase + crossSign * lineCrossSize
        itemStyle[crossStart] = itemStyle[crossEnd] - crossSign * itemStyle[crossSize]
      }
      if (align === 'center') {
        itemStyle[crossStart] = crossBase + crossSign * (lineCrossSize - itemStyle[crossSize])
        itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize]
      }
      if (align === 'stretch') {
        itemStyle[crossStart] = crossBase
        itemStyle[crossEnd] = crossBase + crossSign * ((itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) ? itemStyle[crossSize] : lineCrossSize)
        itemStyle[crossSize] = crossSign * (itemStyle[crossEnd] - itemStyle[crossStart])
      }
    }

    crossBase += crossSign * (lineCrossSize + step)
  })
  // console.log(1, items)
}

// 预处理
function getStyle(element) {
  if (!element.style) {
    element.style = {}
  }
  /* 
    eg:
    computedStyle = {
      'background-color': {
        value: '#dddddd',
        specificity: []
      },
      width: {
        value: '30px',
        specificity: []
      }
    }
    下面的代码，想将上面的结构处理成
    style = {
      'background-color': '#dddddd',
      width: '30px'
    }
  */
  for (const prop in element.computedStyle) {
    let p = element.computedStyle.value
    element.style[prop] = element.computedStyle[prop].value

    if (element.style[prop].toString().match(/px$/)) {
      // parseInt('30px') 返回30
      element.style[prop] = parseInt(element.style[prop])
    }
    // 简易处理，如果是数字，直接转换为整数，参与之后的运算。
    if (element.style[prop].toString().match(/^[0-9\.]+$/)) {
      element.style[prop] = parseInt(element.style[prop])
    }
  }

  return element.style
}

module.exports = layout
