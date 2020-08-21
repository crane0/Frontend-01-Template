import { createElement, Text, Wrapper } from './createElement'

class TabPanel {
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

  select(i) {
    for (const view of this.childViews) {
      view.style.display = 'none'
    }
    this.childViews[i].style.display = ''

    for (const view of this.titleViews) {
      view.classList.remove('selected')
    }
    this.titleViews[i].classList.add('selected')
  }

  render() {
    this.childViews = this.children.map(child => <div style="width: 320px;min-height: 100px;">{child}</div>);
    this.titleViews = this.children.map((child, i) => 
      <span onClick={() => this.select(i)} style="background-color: lightgreen; margin: 5px">{child.getAttribute('title')}</span>
    );

    setTimeout(() => this.select(0), 16)
    return <div class="tab-panel" style="width: 300px;">
      <h1 style="width: 300px;">{this.titleViews}</h1>
      <div style="border: 1px solid salmon;">{this.childViews}</div>
    </div>
  }

  mountTo(parent) {
    this.render().mountTo(parent)
  }
}

// 在父级上添加的 attribute ，可以直接 this 获取，children 上添加的，需要使用 get attribute() 获取。
let panel = <TabPanel title="123">
  <span title="title1">this is content1</span>
  <span title="title2">this is content2</span>
  <span title="title3">this is content3</span>
  <span title="title4">this is content4</span>
</TabPanel>


panel.mountTo(document.body)
