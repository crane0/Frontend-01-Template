var ttys = require('ttys');

var stdin = ttys.stdin
var stdout = ttys.stdout;

stdin.setRawMode(true)
stdin.resume()
stdin.setEncoding('utf8')


function getChar() {
  return new Promise(resolve => {
    stdin.once('data', function(key) {
      resolve(key)
    })
  })
}

// 上移 n 行
function up(n = 1) {
  stdout.write('\033['+ n +'A')
}

function down(n = 1) {
  stdout.write('\033['+ n +'B')
}

function right(n = 1) {
  stdout.write('\033['+ n +'C')
}

// 左移 n 字符
function left(n = 1) {
  stdout.write('\033['+ n +'D')
}

void async function() {
  stdout.write('选择一个框架\n')
  let answer = await select(['vue', 'react', 'uzi'])
  stdout.write(answer + '\n')
  process.exit()
}();

async function select(choices) {
  let selected = 0
  for (let i = 0; i < choices.length; i++) {
    let choice = choices[i]
    if (i === selected) {
      stdout.write('[x] ' + choice + '\n')
    } else {
      stdout.write('[ ] ' + choice + '\n')
    }
  }
  // 回到第一行
  up(choices.length)
  // 右移一个字符，[x] 字符从 [ 到 x
  right()

  while(true) {
    let char = await getChar()
    console.log(char)
    // ctrl + C
    if (char === '\u0003') {
      process.exit()
    }

    if (char === 'w' && selected > 0) {
      stdout.write(' ')
      left()
      selected--
      up()
      stdout.write('x')
      left()
    }

    if (char === 's' && selected < choices.length - 1) {
      // 在当前行，光标原先在 [x] 的 x，输入一个' '，此时 [x] => [ ]，光标在 ]
      stdout.write(' ')
      // 左移一个字符
      left()
      selected++
      // 下移一行
      down()
      // 和一开始的类似。
      stdout.write('x')
      left()
    }

    if (char === '\r') {
      down(choices.length - selected)
      left()
      return choices[selected]
    }
    // console.log(char.split('').map( c => c.charCodeAt(0)));
  }
}