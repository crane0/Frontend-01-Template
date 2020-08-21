export function createElement(Cls, attributes, ...children) {
  /* 
    ƒ Child() {_classCallCheck(this, Child);} null []
    ƒ Child() {_classCallCheck(this, Child);} null []
    ƒ Parent() {_classCallCheck(this, Parent);} {id: "a", class: "b"} [Child, Child]
    
    注意，在组件没有属性时，attributes 是 null
    并且有第3个参数，可以看到 jsx 中，父子树的构建关系，先子后父。
  */
  // console.log(Cls, attributes, children)
  let o
  if (typeof Cls === 'string') {
    o = new Wrapper(Cls)
  } else {
    o = new Cls
  }
  for (const name in attributes) {
    o.setAttribute(name, attributes[name])
  }

  let visit = (children) => {
    for (const child of children) {
      if (typeof child === 'string') {
        child = new Text(child)
      }
      if (typeof child === 'object' && child instanceof Array) {
        visit(child)
        continue
      }
      o.appendChild(child)
    }
  }

  visit(children)
  
  return o
}

export class Text {
  constructor(text) {
    this.children = [] 
    this.root = document.createTextNode(text)
  }

  mountTo(parent) {
    parent.appendChild(this.root)
  }
}

export class Wrapper {
  constructor(type) {
    this.children = []
    this.root = document.createElement(type)
  }

  setAttribute(name, value) { // attribute
    this.root.setAttribute(name, value)

    // 元素添加的事件
    if (name.match(/^on([\s\S]+)$/)) {
      let eventName = RegExp.$1.replace(/^[\s\S]/, c => c.toLowerCase())
      this.addEventListener(eventName, value)
    }
  }

  // 用户获取 children 的 attribute
  // eg: 在组件中，this.children.map(child => console.log(child.getAttribute('title')));
  getAttribute(name) {
    return this.root.getAttribute(name)
  }

  appendChild(child) { // children
    this.children.push(child)
  }

  addEventListener() {
    this.root.addEventListener(...arguments)
  }

  get style() {
    return this.root.style
  }

  get classList() {
    return this.root.classList
  }

  mountTo(parent) {
    parent.appendChild(this.root)
    // child 等 parent 挂载后，延迟挂载。
    for (const child of this.children) {
      child.mountTo(this.root)
    }
  }
}
