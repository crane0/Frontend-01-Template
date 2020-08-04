import { createElement, Text, Wrapper } from './createElement'

class Carousel {
  constructor() {
    this.children = []
  }

  setAttribute(name, value) {
    this[name] = value
  }

  appendChild(child) {
    this.children.push(child)
  }

  render() {
    let childrens = this.data.map(url => {
      let element =  <img src={url} />
      element.addEventListener('dragstart', event => event.preventDefault())
      return element
    })
    let root = <div class="carousel">{ childrens }</div>

    let position = 0
    let next = () => {
      let nextPosition = (position + 1) % this.data.length

      let currentPic = childrens[position] // 原来的 this.root 改为这里的 childrens
      let nextPic = childrens[nextPosition]

      currentPic.style.transition = 'ease 0s' // style 在 Wrapper 中直接get即可。
      nextPic.style.transition = 'ease 0s'
      currentPic.style.transform = `translateX(${-100 * position}%)`
      nextPic.style.transform = `translateX(${100-100 * nextPosition}%)`

      setTimeout(() => {
        currentPic.style.transition = '' // '' 表示用 css 控制
        nextPic.style.transition = ''
        currentPic.style.transform = `translateX(${-100-100 * position}%)`
        nextPic.style.transform = `translateX(${-100 * nextPosition}%)`
        position = nextPosition
      }, 16)
      setTimeout(next, 2000)
    }
    // 一开始的延迟，保证第1个图片出现。
    // setTimeout(next, 2000)

    root.addEventListener('mousedown', event => {
      let startX = event.clientX, startY = event.clientY
      
      let lastPosition = (position - 1 + this.data.length) % this.data.length // 这是一个技巧
      let nextPosition = (position + 1) % this.data.length

      let currentPic = childrens[position]
      let lastPic = childrens[lastPosition]
      let nextPic = childrens[nextPosition]

      currentPic.style.transition = 'ease 0s'
      lastPic.style.transition = 'ease 0s'
      nextPic.style.transition = 'ease 0s'

      currentPic.style.transform = `translateX(${- 500 * position}px)`
      lastPic.style.transform = `translateX(${-500 - 500 * lastPosition}px)`
      nextPic.style.transform = `translateX(${500 - 500 * nextPosition}px)`


      let move = event => {
        currentPic.style.transform = `translateX(${event.clientX - startX - 500 * position}px)`
        lastPic.style.transform = `translateX(${event.clientX - startX - 500 - 500 * lastPosition}px)`
        nextPic.style.transform = `translateX(${event.clientX - startX + 500 - 500 * nextPosition}px)`
      }

      let up = event => {
        let offset = 0
        if (event.clientX - startX > 250) {
          offset = 1
        } else if (event.clientX - startX < -250) { // 左滑
          offset = -1
        }

        currentPic.style.transform = `translateX(${500 * offset - 500 * position}px)`
        lastPic.style.transform = `translateX(${500 * offset - 500 - 500 * lastPosition}px)`
        nextPic.style.transform = `translateX(${500 * offset + 500 - 500 * nextPosition}px)`

        currentPic.style.transition = ''
        lastPic.style.transition = ''
        nextPic.style.transition = ''

        position = (position - offset + this.data.length) % this.data.length

        document.removeEventListener('mousemove', move)
        document.removeEventListener('mouseup', up)
      }

      document.addEventListener('mousemove', move)
      document.addEventListener('mouseup', up)
    })

    return root
  }

  mountTo(parent) {
    this.render().mountTo(parent)
  }
}

let component = <Carousel data={[
  'https://static001.geekbang.org/resource/image/bb/21/bb38fb7c1073eaee1755f81131f11d21.jpg',
  'https://static001.geekbang.org/resource/image/1b/21/1b809d9a2bdf3ecc481322d7c9223c21.jpg',
  'https://static001.geekbang.org/resource/image/b6/4f/b6d65b2f12646a9fd6b8cb2b020d754f.jpg',
  'https://static001.geekbang.org/resource/image/73/e4/730ea9c393def7975deceb48b3eb6fe4.jpg',
]} />

component.mountTo(document.body)
