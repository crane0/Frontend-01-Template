const { addCSSRules, computeCSS } = require('./css-computing')
const layout = require('./css-layout')
let currentToken = null
let currentAttribute = null // 属性节点
let currentTextNode = null // 文本节点

// 处理标签构建DOM树，需要用到栈
// 标准实现的根元素也是一个 document 元素：document.getElementsByTagName('html')[0].parentNode
let stack = [{type: 'document', children: []}]


// 标签结束状态提交标签的 token
function emit(token) {
  let top = stack[stack.length - 1] // 取栈顶的元素
  if (token.type === 'startTag') {
    let element = {
      type: 'element',
      children: [],
      attributes: []
    }

    element.tagName = token.tagName

    for (const p in token) {
      if (p !== 'type' && p !== 'tagName') {
        element.attributes.push({
          name: p,
          value: token[p]
        })
      }
    }

    /* 
      每有一个 element 创建，就对应一个 computeCSS，
      如果在解析 style 时在进行计算，已经有点晚了，有些逻辑的计算是依赖父元素的。
      比如，一个很大的 div，要等到它里面所有的内容都加载完成后（pop时），在计算它的 css 就有问题了。
    */
    computeCSS(element, stack)

    top.children.push(element)
    element.parent = top

    // 不是自封闭标签，入栈
    if (!token.isSelfClosing) {
      stack.push(element)
    }

    currentTextNode = null
  } else if (token.type === 'endTag') {
    if (top.tagName !== token.tagName) {
      throw new Error('Tag start end doesn"t match!')
    } else {
      /* 
        +++ 遇到 style 标签时，执行添加 css 规则的操作 +++
        不在 push 时执行，因为那时 style 的文本节点还没有挂载到对应的标签上。
      */
      if (top.tagName === 'style') {
        addCSSRules(top.children[0].content)
      }
      /* 
        必须拿到子元素，才能进行 layout
      */
      layout(top)
      stack.pop()
    }
    currentTextNode = null
    // 处理文本节点，不会入栈
  } else if (token.type === 'text') {
    if (currentTextNode == null) {
      currentTextNode = {
        type: "text",
        content: ''
      }
      top.children.push(currentTextNode)
    }
    currentTextNode.content += token.content
  }
  
}

const EOF = Symbol('EOF') // End Of File

function data(c) {
  if (c === '<') {
    return tagOpen;
  } else if (c == EOF) {
    emit({
      type: 'EOF'
    })
    return ;
  } else {
    emit({
      type: 'text',
      content: c
    })
    return data
  }
}


function tagOpen(c) {
  if (c === '/') {
    return endTagOpen
  } else if (c.match(/^[a-zA-Z]$/)) {
    currentToken = {
      type: 'startTag',
      tagName: ''
    }
    return tagName(c)
  } else {
    return ;
  }
}

function tagName(c) {
  // 各种空白
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName
  } else if (c === '/') {
    return selfClosingStartTag
  } else if (c.match(/^[a-zA-Z]$/)) {
    currentToken.tagName += c
    return tagName
  } else if (c === '>') {
    emit(currentToken)
    return data
  } else {
    return tagName
  }
}

// 准备进入属性key
function beforeAttributeName(c) {
  // 如果是空白，就一直等待属性
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName
  } else if (c === '/' || c === '>' || c == EOF) {
    return afterAttributeName(c)
  } else if (c === '=') {

  } else {
    currentAttribute = {
      name: '',
      value: ''
    }
    return attributeName(c)
  }
}

// 拼接属性key
function attributeName(c) {
  // 在 beforeAttributeName 已经判断了空格，拼接属性key时还是遇到，说明当前 key 结束了
  if (c.match(/^[\t\n\f ]$/) || c === '/' || c === '>' || c == EOF) {
    return afterAttributeName(c)
  } else if (c === '=') {
    // 准备进入属性value
    return beforeAttributeValue
  } else if (c === '\u0000') {
  
  } else if (c === "\"" || c == "'" || c == "<") {

  } else {
    // 如果不是上面的特殊字符，就 += 给 name
    currentAttribute.name += c
    return attributeName
  }
}


function afterAttributeName(c) {
  // metta  =这里的空格忽略掉
  if (c.match(/^[\t\n\f ]$/)) {
    return afterAttributeName
  } else if (c == '/') {
    return selfClosingStartTag
  } else if (c == '=') {
    // 准备进入属性value
    return beforeAttributeValue
  } else if (c == '>') {
    currentToken[currentAttribute.name] = currentAttribute.value
    emit(currentToken)
    return data
  } else if (c == EOF) {

  } else {
    currentToken[currentAttribute.name] = currentAttribute.value
    currentAttribute = {
      name: '',
      value: ''
    }
    return attributeName(c)
  }
}

// 准备进入属性value，value 可能由单双引号包裹。
function beforeAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/) || c === '/' || c === '>' || c == EOF) {
    return beforeAttributeValue
  } else if (c === "\"") {
    return doubleQuotedAttributeValue
  } else if (c === "\'") {
    return singleQuotedAttributeValue
  } else if (c === '>') {

  } else {
    // 拼接属性value
    return unquotedAttributeValue(c)
  }
}


// 拼接属性值，遇到空格或是 / > 就结束了。将当前完整属性的 key-value 给 token
function unquotedAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    currentToken[currentAttribute.name] = currentAttribute.value
    // 进入空格后，可能会进入下个属性，也可能就是一个空格，空面就是 >
    // <html maaa=a >
    return beforeAttributeName
  } else if (c === '/') {
    currentToken[currentAttribute.name] = currentAttribute.value
    return selfClosingStartTag
  } else if (c === '>') {
    currentToken[currentAttribute.name] = currentAttribute.value
    emit(currentToken)
    return data
  } else if (c === '\u0000') {

  } else if (c === "\"" || c === "'" || c === '<' || c === '=' || c === '`') {

  } else if (c === EOF) {

  } else {
    // 不是上面的字符，就拼接属性值
    currentAttribute.value += c
    return unquotedAttributeValue
  }
}


function selfClosingStartTag(c) {
  if (c === '>') {
    currentToken.isSelfClosing = true
    /* 
      这行代码，老师并没加，加上后才可以将自闭合标签正确添加到 DOM 树中。
      这里 emit 后，在 emit 方法中，自闭合标签不会入栈，也不会出栈。相当于入栈后立即出栈。
    */
    emit(currentToken)
    return data
  } else if (c == 'EOF') {
    return ;
  } else {
    return;
  }
}


function endTagOpen(c) {
  if (c.match(/^[a-zA-Z]$/)) {
    currentToken = {
      type: 'endTag',
      tagName: ''
    }
    return tagName(c)
  } else if (c === '>') {
    return 
  } else {
    return 
  }
}


// 属性值双引号解析
function doubleQuotedAttributeValue(c) {
  // 再次遇到引号，代表 value 拼接结束。
  if (c === "\"") {
    currentToken[currentAttribute.name] = currentAttribute.value
    return afterQuotedAttributeValue
  } else if (c == '\u0000') {
  
  } else if (c == EOF) {
  
  } else {
    currentAttribute.value += c
    return doubleQuotedAttributeValue
  }
  
}

// 属性值单引号
function singleQuotedAttributeValue(c) {
  // 再次遇到引号，代表 value 拼接结束。
  if (c === "\'") {
    currentToken[currentAttribute.name] = currentAttribute.value
    return afterQuotedAttributeValue
  } else if (c == '\u0000') {

  } else if (c == EOF) {

  } else {
    currentAttribute.value += c
    return singleQuotedAttributeValue
  }
}

function afterQuotedAttributeValue(c) {
  // value 拼接完成后，再次遇到空格，代表进入下个属性的解析
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName
  } else if (c === '/') {
    return selfClosingStartTag
  } else if (c === '>') {
    currentToken[currentAttribute.name] = currentAttribute.value
    emit(currentToken)
    return data
  } else if (c === EOF) {

  } else {
    currentAttribute.value += c
    return afterQuotedAttributeValue
  }
}



// 将 HTML 文本作为参数，返回一个DOM树
module.exports.parseHTML = function parseHTML(html) {
  let state = data
  for (const c of html) {
    state = state(c)
    // console.log(c)
  }
  state = state(EOF)
  // console.log(stack[0])
  // 给下面这行代码打断点，就可以看到 stack[0] 是什么了
  return stack[0]
}