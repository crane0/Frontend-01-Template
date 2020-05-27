const css = require('css')

/* 
  03，解析css，新加一个函数，将 css 的规则暂存到一个数组中，
  就是 style 标签中的内容
*/
let rules = []
function addCSSRules(text) {
  const ast = css.parse(text)
  console.log(JSON.stringify(ast), null, '    ')
  rules.push(...ast.stylesheet.rules) // 参考 https://www.npmjs.com/package/css
} 

function match(element, selector) {
  if (!selector || !element.attributes) {
    return false
  }

  // 3种选择器
  if (selector.charAt(0) == '#') {
    let attr = element.attributes.filter(attr => attr.name == 'id')[0]
    if (attr && attr.value === selector.replace('#', '')) {
      return true
    }
    // 这里如果是多个class，会有空格分隔，需要使用循环。
  } else if (selector.charAt(0) == '.') {
    let attr = element.attributes.filter(attr => attr.name == 'class')[0]
    if (attr && attr.value === selector.replace('.', '')) {
      return true
    }
  } else {
    if (element.tagName === selector) {
      return true
    }
  }
  return false
}

/* 
  计算选择器优先级，这里不支持复合的选择器
  该实现中，高位实现在了左边（浏览器中是在右边）
*/
function specificity(selector) {
  let p = [0, 0, 0, 0]
  let selectorParts = selector.split(" ")
  for (const part of selectorParts) {
    if (part.charAt(0) == '#') {
      p[1] += 1
    } else if (part.charAt(0) == '.') {
      p[2] += 1
    } else {
      p[3] += 1
    }
  }
  return p
}

/* 
  如果高位能比出来，低位就不算了。
*/
function compare(sp1, sp2) {
  if (sp1[0] - sp2[0]) {
    return sp1[0] - sp2[0]
  }
  if (sp1[1] - sp2[1]) {
    return sp1[1] - sp2[1]
  }
  if (sp1[2] - sp2[2]) {
    return sp1[2] - sp2[2]
  }
  return sp1[3] - sp2[3]
}

/* 
  获取 element 所有的父元素，
  拆分选择器
  选择器匹配后，将 rule 中的属性声明加到元素的 computedStyle 上。
  （真是浏览器也是类似的（不一定是个对象的形式），所以通过 js 代码获取元素后，也就可以获取其 css）
*/
function computeCSS(element, stack) {
  /* 
    在调用该方法时，还未进入 endTag 判断出栈，所以 stack 中有 element 所有的父元素。
    reverse 是因为 body div img {} 这样的选择器，应该从右往左找，对 stack 来说，就是从里往外。
    elements 就是所有的父元素
  */
  const elements = stack.slice().reverse()
  if (!element.computedStyle) {
    element.computedStyle = {}
  }
  /* 
    以 body div img {} 举例
  */
  for (let rule of rules) {
    // [img, div, body]
    const selectorParts = rule.selectors[0].split(" ").reverse()
    if (!match(element, selectorParts[0])) {
      continue
    }
    let matched = false
    let j = 1
    for (let i = 0; i < elements.length; i++) {
      if (match(elements[i], selectorParts[j])) {
        j++
      }
    }
    // 说明 selectorParts 和 stack 中的父元素都对应上了
    if (j >= selectorParts.length) {
      matched = true
    }
    if (matched) {
      // // 如果匹配到，将 rule 中的属性声明加到 computedStyle 上。
      // let computedStyle = element.computedStyle
      // for (const declaration of rule.declarations) {
      //   if (!computedStyle[declaration.property]) {
      //     computedStyle[declaration.property] = {}
      //   }
      //   // 不这样写，是预留了一个存优先级的地方
      //   // computedStyle[declaration.property] = declaration.value
      //   computedStyle[declaration.property].value = declaration.value
      // }
      // console.log(element.computedStyle)
      // 如果匹配到，将 rule 中的属性声明加到 computedStyle 上。

      // 上面的代码是未加优先级的代码
      let sp = specificity(rule.selectors[0])
      let computedStyle = element.computedStyle
      for (const declaration of rule.declarations) {
        if (!computedStyle[declaration.property]) {
          computedStyle[declaration.property] = {}
        }
        // 属性不冲突（2个选择器中有不同的属性），将 specificity 标记到属性上。
        if (!computedStyle[declaration.property].specificity) {
          computedStyle[declaration.property].value = declaration.value
          computedStyle[declaration.property].specificity = sp
        // 属性冲突时，进行 compare，如果原来的优先级低，就用优先级高的选择器中新的属性值覆盖
        } else if (compare(computedStyle[declaration.property].specificity, sp) < 0) {
          computedStyle[declaration.property].value = declaration.value
          computedStyle[declaration.property].specificity = sp
        }
        // 不这样写，是预留了一个存优先级的地方
        // computedStyle[declaration.property] = declaration.value
        computedStyle[declaration.property].value = declaration.value
      }
      console.log(element.computedStyle)
    }
  }
}

module.exports = {
  addCSSRules,
  computeCSS
}