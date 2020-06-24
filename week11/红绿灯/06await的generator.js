function* g() {
  yield 1
  yield 2
  yield 3
}

// 正常的遍历 generator
for (const iterator of g()) {
  console.log(iterator)
}



function sleep(time) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time)
  })
}

// 异步的 generator
async function* g2() {
  let i = 0
  while (true) {
    await sleep(1000)
    yield i++
  }
}

for await(const iterator of g2()) {
  console.log(iterator)
}