import { createElement, Text, Wrapper } from './createElement'

class ListView {
  constructor() {
    this.children = []
    this.childViews = []
    this.titleViews = []
  }

  setAttribute(name, value) {
    this[name] = value
  }

  appendChild(child) {
    this.children.push(child)
  }

  render() {
    // this.children[0] 就是传入的函数，直接调用 map 就可以渲染了
    return <div class="list">
      {
        this.data.map(this.children[0])
      }
    </div>
  }

  mountTo(parent) {
    this.render().mountTo(parent)
  }
}


let data = [
  {title: '蓝猫', url: 'https://static001.geekbang.org/resource/image/bb/21/bb38fb7c1073eaee1755f81131f11d21.jpg'},
  {title: '橘猫白', url: 'https://static001.geekbang.org/resource/image/1b/21/1b809d9a2bdf3ecc481322d7c9223c21.jpg'},
  {title: '狸花猫', url: 'https://static001.geekbang.org/resource/image/b6/4f/b6d65b2f12646a9fd6b8cb2b020d754f.jpg'},
  {title: '狸花猫白', url: 'https://static001.geekbang.org/resource/image/73/e4/730ea9c393def7975deceb48b3eb6fe4.jpg'},
]
let listView = <ListView data={data}>
  { 
    record => <figure>
      <img src={record.url} />
      <figcaption>{record.title}</figcaption>
    </figure>
  }
</ListView>


listView.mountTo(document.body)
