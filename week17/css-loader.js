let css = require('css')

module.exports = function(source, map) {
  let stylesheet = css.parse(source)
  // this.resourcePath 是文件的绝对路径。
  let name = this.resourcePath.match(/([^/]+).css$/)[1]
  for (const rule of stylesheet.stylesheet.rules) {
    rule.selectors = rule.selectors.map(selector => {
      /* 
        用 css 的文件名进行匹配，如果 css 选择器是以文件名开始的，那就不动，否则，为选择器添加文件名前缀。
        carousel.css
        {
          .carousel {
            color: samlon;
          }
          * {
            background-color: lightgreeen;
          }
        }
        会被替换为
        {
          .carousel {
            color: samlon;
          }
          .carousel * {
            background-color: lightgreeen;
          }
        }
      */
      return selector.match(new RegExp(`^.${name}`)) ? selector : `.${name} ${selector}`
    })
  }
  console.log('source', css.stringify(stylesheet))
  return `let style = document.createElement('style')
  style.innerHTML = ${JSON.stringify(css.stringify(stylesheet))}
  document.documentElement.appendChild(style)`
}
