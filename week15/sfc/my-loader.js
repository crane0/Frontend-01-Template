var parse = require('./parseHTML')
/* 
  source 就是 carousel.view 中的内容
*/
module.exports = function(source, map) {
  // console.log(3, source, 3)
  let tree = parse.parseHTML(source)
  // console.log(tree)
  console.log(tree.children[0])
  // script 标签内所有内容
  // console.log(tree.children[2].children[0].content)
  // console.log(this.resourcePath) // source 的绝对路径

  let template = null
  let script = null
  for (const node of tree.children) {
    if (node.tagName === 'template') {
      // template = node
      template = node.children.filter(t => t.type !== 'text')[0]
    }
    if (node.tagName === 'script') {
      script = node
    }
  }

  // console.log('2222222222', template)

  let createCode = ''
  let visit = (node) => {
    if (node.type === 'text') {
      return JSON.stringify(node.content)
    }
    let attrs = {}
    for (const attribute of node.attributes) {
      attrs[attribute.name] = attribute.value
    }

    let children = node.children.map(node => visit(node))
    return `createElement('${node.tagName}', ${JSON.stringify(attrs)}, ${children})`
  }

  let r = `
import { createElement, Text, Wrapper } from './createElement'
export default class Carousel {
  setAttribute(name, value) {
    this[name] = value
  }

  render() {
    return ${visit(template)}
  }

  mountTo(parent) {
    this.render().mountTo(parent)
  }
}`
  console.log(r)
  return r
}