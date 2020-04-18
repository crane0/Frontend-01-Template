/**
 * 以第一个分隔符作为进行分割，参考 https://www.npmjs.com/package/split-on-first
 * @param {string} string
 * @param {string} separator 
 */
const splitOnFirst = (string, separator) => {
  if (!(typeof string === 'string' && typeof separator === 'string')) {
    throw new TypeError('Expected the arguments to be of type `string`');
  }

  if (separator === '') {
    return [];
  }

  const separatorIndex = string.indexOf(separator);

  if (separatorIndex === -1) {
    return [];
  }

  return [
    string.slice(0, separatorIndex),
    string.slice(separatorIndex + separator.length)
  ];
};

/**
 * 解析 search 参数，特别的 search = '?artic=l?e=215813&a=7a&11'
 * @param {string} input
 */
function parseQuery(input) {
  const ret = Object.create(null);

  if (typeof input !== 'string') {
    return ret
  }

  input = input.trim().replace(/^[?#&]/, '');
  if (!input) {
    return ret;
  }
  for (const param of input.split('&')) {
    let [key, value] = result = splitOnFirst(param, '=');
    // Missing `=` should be `null`:
    // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
    value = value === undefined ? null : value
    ret[key] = value
  }
  return ret
}

module.exports = function parseURL(url) {
  // 环境中没有 document 对象，就尴尬了。
  try {
    var a = document || document.createElement('a');
    a.href = url;
    return {
      href: url,
      protocol: a.protocol,
      host: a.host,
      port: a.port,
      search: a.search,
      hash: a.hash,
      pathname: a.pathname,
      query: parseQuery(a.search),
    };
  } catch (error) {
    console.log(error)
  }

  return {}
}

// console.log(parseURL('https://crane0.com/lesson/12?artic=l?e=215813&a=7a&'))
