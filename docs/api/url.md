---
type: reference
status: partial
---

# `URL`

**`URL`** 表示一个解析好的地址。它把一串地址文本拆成协议、主机、端口、路径、查询、片段几个部分，每个部分可以单独读，也可以单独改。

`URL` 是全局的，用 `new` 创建，不涉及网络。和它一起使用的还有两个类：[`URLSearchParams`](url-search-params.md) 表示地址里 `?` 后面的查询参数，[`Headers`](headers.md) 表示一组 HTTP 请求头或响应头。[`fetch()`](fetch.md) 接受 `URL` 作地址，接受 `Headers` 作请求头。

**继承关系**：`URL` 不继承任何类。

怎么拼接和解析地址，见指南[拼接和解析网址](../guides/urls.md)。

## 构造函数

[`URL()`](url/constructor.md)

解析一串地址文本，创建一个 `URL`。地址必须是完整的，或者另给一个起点。

## 静态方法

[`URL.canParse()`](url/canparse.md)

判断一串文本能不能解析成地址，不抛异常。

[`URL.parse()`](url/parse.md)

解析一串地址文本，解析不了时返回 `null`，不抛异常。

## 实例属性

类型都是字符串，除了 `searchParams`。

| 属性 | 说明 |
| --- | --- |
| [`href`](url/href.md) | 完整的地址 |
| [`origin`](url/origin.md) <small>只读</small> | 协议加主机加端口 |
| [`protocol`](url/protocol.md) | 协议，带结尾的冒号 |
| [`username`](url/username.md) | 用户名 |
| [`password`](url/password.md) | 密码 |
| [`host`](url/host.md) | 主机加端口 |
| [`hostname`](url/hostname.md) | 主机，不带端口 |
| [`port`](url/port.md) | 端口 |
| [`pathname`](url/pathname.md) | 路径 |
| [`search`](url/search.md) | 查询，带开头的 `?` |
| [`searchParams`](url/searchparams.md) <small>只读</small> | 查询参数，一个 `URLSearchParams` |
| [`hash`](url/hash.md) | 片段，带开头的 `#` |

这些值变化时没有事件通知：只有 App 自己的代码能改它们。

## 实例方法

| 方法 | 说明 |
| --- | --- |
| [`toString()`](url/tostring.md) | 返回完整的地址，等于 `href` |
| [`toJSON()`](url/tojson.md) | 返回完整的地址，`JSON.stringify()` 用它 |

## 地址必须是完整的

`new URL(text)` 里的 `text` 必须带协议，比如 `https://a.com/x`。只有路径的 `/x`、`../y` 这类相对地址单独解析不了，构造函数抛 `TypeError`。

原因是 App 的 JS 是打包在 App 里从本地加载的，没有「当前页面的地址」，全局也没有 `location`。相对地址没有可以参照的起点。要解析相对地址，把起点作为第二个参数传进去，见 [`URL()`](url/constructor.md)。

类型检查查不出这个错误：`new URL('/x')` 在类型上合法，运行时才抛。

## 地址会被整理成统一的写法

解析时 `URL` 会把地址整理成统一的写法，读出来的各部分可能和传进去的文本不同：

| 传进去的 | 读出来的 | 说明 |
| --- | --- | --- |
| `HTTPS://EXAMPLE.com` | `protocol` 是 `https:`，`host` 是 `example.com` | 协议和主机转成小写 |
| `https://a.com:443/` | `port` 是 `''`，`host` 是 `a.com` | 协议的默认端口被省略。有默认端口的协议：`http` 80、`https` 443、`ws` 80、`wss` 443、`ftp` 21 |
| `https://a.com/a/b/../c` | `pathname` 是 `/a/c` | 路径里的 `.` 和 `..` 被化简 |
| `https://a.com` | `pathname` 是 `/` | 空路径补成 `/` |
| `https://a.com/a b` | `pathname` 是 `/a%20b` | 路径里的空格编码成 `%20` |
| `https://a.com/%7Eu` | `pathname` 是 `/%7Eu` | 已经编码过的部分保持原样，不会重复编码 |

路径里的中文等非 ASCII 字符会被怎样编码，**未在模拟器验证**。

查询参数的编码规则和路径不同：经过 [`URLSearchParams`](url-search-params.md) 写入的值，空格编码成 `+`，中文按 UTF-8 编码成 `%XX`。`'中 文'` 写进去得到 `%E4%B8%AD+%E6%96%87`，读出来还是 `'中 文'`。

## 示例

下面的代码拼出一个带查询参数的接口地址，再准备一组请求头。它不需要界面，直接写在 `main.js` 顶层就能运行。

```js
// 1. 解析一个完整的地址
const url = new URL('https://api.example.com/v1/items?page=2');

// 2. 改一个查询参数，再加一个
url.searchParams.set('page', '3');
url.searchParams.append('q', '中 文');
console.log(url.href);

// 3. 单独读某个部分
console.log(url.hostname, url.pathname);

// 4. 准备请求头。名字不区分大小写
const headers = new Headers({ 'Content-Type': 'application/json' });
headers.set('Authorization', 'Bearer abc');
console.log(headers.get('content-type'));
```

**结果**：控制台输出三行。

- `https://api.example.com/v1/items?page=3&q=%E4%B8%AD+%E6%96%87`
- `api.example.com /v1/items`
- `application/json`

这段代码没有作为一个整体在模拟器运行过。其中用到的每个 API 都在验收用例里运行过。

## 和 Web 的差别

名字和成员与浏览器里的 `URL` 相同。行为不同的地方：

| 情况 | 浏览器 | 这里 |
| --- | --- | --- |
| 相对地址的起点 | 常用 `location.href` 或 `document.baseURI` 作第二个参数 | 没有 `location`，起点要自己提供 |
| `https://a.com\evil.com`（地址里有反斜杠） | 反斜杠当作 `/`，解析成功 | 解析失败，抛 `TypeError`。这条来自和 Chrome 的对比测试，验收用例里没有断言 |
| `https://例え.jp`（非 ASCII 的域名） | `hostname` 是 `xn--r8jz45g.jp` | `hostname` 是 `%E4%BE%8B%E3%81%88.jp`。这条来自和 Chrome 的对比测试，验收用例里没有断言。用这样的地址发请求能否成功，**未在模拟器验证** |
| `ws:`、`wss:`、`ftp:` 地址的 `origin` | 协议加主机加端口 | `'null'` |
| 给 `search`、`hash` 赋值 | 空格等字符被编码 | 原样写入，不做编码 |

只处理 `http` 和 `https` 的 ASCII 地址时，不会遇到第二到第四条。

## 参见

- [拼接和解析网址](../guides/urls.md)：拆开地址、改查询参数、准备请求头的完整写法
- [`URLSearchParams`](url-search-params.md)：读写地址里的查询参数
- [`Headers`](headers.md)：请求头和响应头
- [`fetch()`](fetch.md)：发请求时用 `URL` 作地址、用 `Headers` 作请求头
- [`WebSocket`](websocket.md)：建立长连接时的地址和请求头
- [运行时怎么工作](how-it-works.md)：代码从哪里加载，为什么没有 `location`
