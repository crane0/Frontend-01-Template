function convertS2N(string, x) {
  // 默认 10 进制
  if (arguments.length < 2) {
    x = 10
  }
  var chars = string.split('')
  var number = 0

  var i = 0
  while (i < chars.length && chars[i] != '.') {
    number = number * x
    number += chars[i].codePointAt(0) - '0'.codePointAt(0)
    i++
  }

  if (chars[i] === '.') {
    i++
  }

  var xiaoshu = 1
  while (i < chars.length) {
    xiaoshu = xiaoshu / x
    number += (chars[i].codePointAt(0) - '0'.codePointAt(0)) * xiaoshu
    i++
  }
  return number
}

// console.log(convertS2N('10.0234'))


function convertN2S(number, x) {
  // 默认 10 进制
  if (arguments.length < 2) {
    x = 10
  }

  var integer = Math.floor(number)
  var xiaoshu = number - integer
  
  var string = ''
  while (integer > 0) {
    // 取余进制，得到个位
    string = String(integer % x) + string
    integer = Math.floor(integer / x)
  }
  return string
}

console.log(convertN2S(103))