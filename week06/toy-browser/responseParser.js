/* 
解析相应报文，所以不能用正则。
因为是流式传输，如果内容过大，可能会导致多次触发 connection.data 事件，将内容分几段传输。
所以只能用 **状态机** 做。

connection.data 中的 data 是一个流，所以会分步传给 ResponseParser,
ResponseParser 收集完后这个 request，就吐出来一个 response。
*/

/* 
如何查看可能出现的空格，换页符，回车等？
1，char.charCodeAt(0).toString(16)
2, JSON.stringify(char)
*/

/*  
响应报文的行尾其实都有\r\n

HTTP/1.1 200 OK\r\n
Content-Type: text/plain;charset=utf-8\r\n
X-ss:'adf'\r\n
Date: Wed, 13 May 2020 11:16:45 GMT\r\n
Connection: keep-alive\r\n
Transfer-Encoding: chunked\r\n
\r\n
3\r\n
123\r\n
0\r\n
\r\n
*/

class ResponseParser {
	constructor() {
		this.WAITING_STATUS_LINE = 0
		this.WAITING_STATUS_LINE_END = 1 // end 是为了吞掉 \n
		this.WAITING_HEADER_NAME = 2
		this.WAITING_HEADER_SPACE = 3
		this.WAITING_HEADER_VALUE = 4
		this.WAITING_HEADER_LINE_END = 5
		this.WAITING_HEADER_BLOCK_END = 6
		this.WAITING_BODY = 7

		this.current = this.WAITING_STATUS_LINE
		this.statusLine = ''
		this.headers = {}
		this.headersName = ''
		this.headersValue = ''
		this.bodyParser = null
	}

	get isFinished() {
		return this.bodyParser && this.bodyParser.isFinished
	}

	get response() {
		// \s\S 任意字符
		this.statusLine.match(/HTTP\/1.1 (\d+) ([\s\S]+)/)
		return {
			statusCode: RegExp.$1,
			statusText: RegExp.$2,
			headers: this.headers,
			body: this.bodyParser.content.join('')
		}
	}

	receive(string) {
		for (let index = 0; index < string.length; index++) {
			this.receiveChar(string.charAt(index))
		}
	}

	receiveChar(char) {
		// console.log(char, char.charCodeAt(0).toString(16))
		if (this.current === this.WAITING_STATUS_LINE) {
			if (char === '\r') {
				this.current = this.WAITING_STATUS_LINE_END
			} else {
				this.statusLine += char
			}
		} else if (this.current === this.WAITING_STATUS_LINE_END) {
			if (char === '\n') {
				this.current = this.WAITING_HEADER_NAME
			}
		} else if (this.current === this.WAITING_HEADER_NAME) {
			if (char === ':') {
				this.current = this.WAITING_HEADER_SPACE
			} else if (char === '\r') {
				// header 结束
				this.current = this.WAITING_HEADER_BLOCK_END
				if (this.headers['Transfer-Encoding'] === 'chunked') {
					this.bodyParser = new TrunkedBodyParser()
				}
			} else {
				this.headersName += char
			}
		} else if (this.current === this.WAITING_HEADER_SPACE) {
			if (char === ' ') {
				this.current = this.WAITING_HEADER_VALUE
			}
		} else if (this.current === this.WAITING_HEADER_VALUE) {
			if (char === '\r') {
				this.current = this.WAITING_HEADER_LINE_END
				this.headers[this.headersName] = this.headersValue
				this.headersName = ''
				this.headersValue = ''
			} else {
				this.headersValue += char
			}
		} else if (this.current === this.WAITING_HEADER_LINE_END) {
			if (char === '\n') {
				this.current = this.WAITING_HEADER_NAME
			}
			// 上面的代码循环获取 header，最后跳出时进入下面
		} else if (this.current === this.WAITING_HEADER_BLOCK_END) {
			if (char === '\n') {
				this.current = this.WAITING_BODY
			}
		} else if (this.current === this.WAITING_BODY) {
			this.bodyParser && this.bodyParser.receiveChar(char)
		}
	}
}

// 字符串做加法，性能比较差，所以用数组
class TrunkedBodyParser {
	constructor() {
		this.WAITING_LENGTH = 0
		this.WAITING_LENGTH_LINE_END = 1
		this.READING_THUNK = 2
		this.WAITING_NEW_LINE = 3
		this.WAITING_NEW_LINE_END = 4

		this.length = 0
		this.content = [] // 以字符的形式，存储 body
		this.isFinished = false // 判断解析完成
		this.current = this.WAITING_LENGTH
	}

	receiveChar(char) {
		// console.log(JSON.stringify(char))
		if (this.current === this.WAITING_LENGTH) {
			if (char === '\r') {
				if (this.length === 0) {
					this.isFinished = true
				}
				this.current = this.WAITING_LENGTH_LINE_END
			} else {
				/* 
					格式为
					11
					123456sdfsdaffdsf
					0
					都是字符串类型，
					length 为 11，1和1分别进入，所以要 *= 10
				*/
				// this.length *= 10
				// this.length += char.charCodeAt(0) - '0'.charCodeAt(0)
				this.length *= 16
				this.length += parseInt(char, 16)
			}
		} else if (this.current === this.WAITING_LENGTH_LINE_END) {
			if (char === '\n') {
				this.current = this.READING_THUNK
			}
		} else if (this.current === this.READING_THUNK) {
			this.content.push(char)
			this.length--
			if (this.length === 0) {
				this.current = this.WAITING_NEW_LINE
			}
		} else if (this.current === this.WAITING_NEW_LINE) {
			if (char === '\r') {
				this.current = this.WAITING_NEW_LINE_END
			}
		} else if (this.current === this.WAITING_NEW_LINE_END) {
			if (char === '\n') {
				this.current = this.WAITING_LENGTH
			}
			/*
				\n 后面还有下面这些，不过不关心了，下一个 \r 就可以跳出了
				"0"
				"\r"
				"\n"
				"\r"
				"\n"
			*/
		}
	}
}

module.exports = ResponseParser
