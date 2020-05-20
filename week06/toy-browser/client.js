/*
TCP层 和 HTTP层通信时，TCP相当于客户端，HTTP 相当于服务器端。
TCP层的 net 向HTTP层发送的请求报文格式
注意点1，Content-Length 要有，并且等于 body 的长度
注意点2，client.write 的参数，也就是请求内容，不能有缩进等不必要的字符，
				这也是上面的代码中，有的地方顶头写的原因。
注意点3，header 的 key-value 形式，key 的冒号后，还有一个空格，虽然没有也不会报错，但还是按照规范来。
*/

const net = require('net')
const ResponseParser = require('./responseParser')
// const parser = require('./parser')
const parser = require('./8css-computing')

class Request {
  constructor(options) {
    this.method = options.method || 'GET'
    this.host = options.host
    this.port = options.port || 80
    this.path = options.path || '/'
    this.body = options.body || {}
    this.headers = options.headers || {}
    if (!this.headers['Content-Type']) {
      this.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    }

    if (this.headers['Content-Type'] === 'application/json') {
      this.bodyText = JSON.stringify(this.body)
    } else if (this.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
      this.bodyText = Object.keys(this.body).map(key => `${key}=${encodeURIComponent(this.body[key])}`).join('&')
    }

    this.headers['Content-Length'] = this.bodyText.length
  }

  toString() {
    return `${this.method} ${this.path} HTTP/1.1\r
${Object.keys(this.headers).map(key => `${key}: ${encodeURIComponent(this.headers[key])}`).join('\r\n')}
\r
${this.bodyText}\r`
	}

	send(connection) {
		return new Promise((resolve, reject) => {
			const responseParser = new ResponseParser()
			if (connection) {
				connection.write(this.toString())
			} else {
				connection = net.createConnection({
					host: this.host,
					port: this.port
				}, () => {
					// 'connect' 监听器
					console.log('已连接到服务器');
					connection.write(this.toString())
				});
			}
			// 可能会多次收到服务器返回的数据
			connection.on('data', (data) => {
				responseParser.receive(data.toString())
				// console.log(data.toString())
				if (responseParser.isFinished) {
					resolve(responseParser.response);
				}
				connection.end();
			});

			connection.on('error', (err) => {
				reject(err)
				connection.end();
			});
		})
	}
}

void async function() {
	const request = new Request({
		method: 'POST',
		host: '127.0.0.1',
		port: '8088',
		path: '/',
		headers: {
			'cr-a': 'crvalue'
		},
		body: {
			name: 'crane0'
		}
	})
	const response = await request.send()
	// console.log(response)

	let dom = parser.parseHTML(response.body)
	console.log(dom)
	console.log(1)
}()


// const client = net.createConnection({ 
//   host: '127.0.0.1',
//   port: 8088 
// }, () => {
//   // 'connect' 监听器
//   console.log('已连接到服务器');
   
//   let request = new Request({
//     method: 'POST',
//     host: '127.0.0.1',
//     port: '8088',
// 		path: '/',
// 		headers: {
// 			'cr-a': 'crvalue'
// 		},
//     body: {
//       name: 'crane0'
//     }
//   })
//   client.write(request.toString())

// //   client.write(`POST / HTTP/1.1\r
// // Content-Type:application/x-www-form-urlencoded\r
// // Content-Length: 11\r
// // \r
// // name=crane0`) 
// });
// client.on('data', (data) => {
//   console.log(data.toString());
//   client.end();
// });
// client.on('end', () => {
//   console.log('已从服务器断开');
//   client.end();
// });
// client.on('error', (err) => {
//   console.log(err)
//   client.end();
// });
