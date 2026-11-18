---
type: reference
status: partial
---

# `URL` / `URLSearchParams` / `Headers`

**`URL`** 表示一个解析好的地址。它把一串地址文本拆成协议、主机、端口、路径、查询、片段几个部分，每个部分可以单独读，也可以单独改。

**`URLSearchParams`** 表示地址里 `?` 后面的那一串查询参数，是一个有顺序的「名字 = 值」列表，负责参数的编码和解码。

**`Headers`** 表示一组 HTTP 请求头或响应头。名字不区分大小写，同一个名字可以有多个值。

三个类都是全局的，用 `new` 创建，不涉及网络。[`fetch`](fetch.md) 接受 `URL` 作地址，接受 `Headers` 作请求头，响应头读出来也是 `Headers`。

## 地址必须是完整的

`new URL(text)` 里的 `text` 必须带协议，比如 `https://a.com/x`。只有路径的 `/x`、`../y` 这类相对地址单独解析不了，构造函数抛 `TypeError`，报错原文是：

```
Invalid URL: "/x". Without a base it must be absolute: this runtime does not load over HTTP, so there is no location
```

原因是 App 的 JS 是打包在 App 里从本地加载的，没有「当前页面的地址」，全局也没有 `location`。相对地址没有可以参照的起点。

类型检查查不出这个错误：`new URL('/x')` 在类型上合法，运行时才抛。

要解析相对地址，把起点作为第二个参数传进去：

```js
const api = 'https://api.example.com/v1/';
const u = new URL('items', api);
console.log(u.href);
```

**结果**：输出 `https://api.example.com/v1/items`。

推荐的做法是把服务器的根地址定义成一个常量，所有相对地址都用它作第二个参数。`fetch('/api')` 同样会失败，要写成 `fetch(new URL('/api', api))`。

地址来自用户输入或服务器返回、不确定是否合法时，用 `URL.canParse()` 或 `URL.parse()`，它们不抛异常，见[判断一串文本是不是合法地址](#判断一串文本是不是合法地址)。

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

查询参数的编码规则和路径不同：经过 `URLSearchParams` 写入的值，空格编码成 `+`，中文按 UTF-8 编码成 `%XX`。`'中 文'` 写进去得到 `%E4%B8%AD+%E6%96%87`，读出来还是 `'中 文'`。

## 推荐的做法

**改查询参数用 `url.searchParams`，不要自己拼字符串。** `searchParams` 负责编码，值里有空格、`&`、`=`、中文时不会破坏地址的结构。直接给 `url.search` 赋值时，内容原样写入，不做编码。

```js
const u = new URL('https://api.example.com/search');
u.searchParams.set('q', '中 文');
console.log(u.href);
```

**结果**：输出 `https://api.example.com/search?q=%E4%B8%AD+%E6%96%87`。

**请求头用 `Headers` 或普通对象都可以。** 需要按名字读、判断有没有、追加同名值时用 `Headers`，它不区分大小写；只是一次性传给 `fetch` 时，写普通对象更短。

## 完整例子

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

## 常见用法

### 拆开一个地址

```js
const u = new URL('https://u:p@EXAMPLE.com:443/a/b/../c?x=1&y=2#f');
console.log(u.protocol);   // https:
console.log(u.username);   // u
console.log(u.host);       // example.com
console.log(u.port);       // 空字符串
console.log(u.pathname);   // /a/c
console.log(u.search);     // ?x=1&y=2
console.log(u.hash);       // #f
console.log(u.origin);     // https://example.com
console.log(u.href);       // https://u:p@example.com/a/c?x=1&y=2#f
```

**结果**：每行输出注释里的内容。`protocol` 带结尾的冒号，`search` 带开头的问号，`hash` 带开头的井号。

### 从一个起点解析相对地址

```js
console.log(new URL('/x', 'https://a.com').href);
console.log(new URL('../y', 'https://a.com/a/b/c').pathname);
```

**结果**：输出 `https://a.com/x` 和 `/a/y`。

### 判断一串文本是不是合法地址

```js
console.log(URL.canParse('/x'));
console.log(URL.canParse('https://a.com/x'));

const parsed = URL.parse('https://a.com/x');
if (parsed) {
  console.log(parsed.pathname);
}
```

**结果**：依次输出 `false`、`true`、`/x`。`URL.parse()` 解析不了时返回 `null`，所以用之前先判空。

### 改地址的某个部分

```js
const w = new URL('https://a.com/p');
w.pathname = 'q';
w.hash = 'top';
console.log(w.href);
```

**结果**：输出 `https://a.com/q#top`。给 `pathname` 赋值时开头的 `/` 可以省略，给 `hash` 赋值时 `#` 可以省略，给 `search` 赋值时 `?` 可以省略，会自动补上。

给 `protocol`、`username`、`password`、`host`、`hostname`、`port`、`pathname` 赋值后，整个地址重新解析一遍。新值让地址不合法时，这次赋值不生效，地址保持原样，不抛异常。

### 读同名的多个查询参数

```js
const q = new URLSearchParams('a=1&b=2&a=3');
console.log(q.get('a'));
console.log(q.getAll('a'));
console.log(q.size);
```

**结果**：依次输出 `1`、`['1', '3']`、`3`。`get()` 只返回第一个，要全部用 `getAll()`。

### 替换、追加、删除查询参数

```js
const q = new URLSearchParams('a=1&b=2&a=3');
q.set('a', '9');
console.log(q.toString());

q.append('c', '中 文');
console.log(q.toString());

q.delete('a');
console.log(q.toString());
```

**结果**：依次输出 `a=9&b=2`、`a=9&b=2&c=%E4%B8%AD+%E6%96%87`、`b=2&c=%E4%B8%AD+%E6%96%87`。

`set()` 把第一个同名参数换成新值，删掉其余同名的，位置不变。没有同名参数时加在末尾。

### 地址和它的查询参数互相同步

```js
const u = new URL('https://a.com/?k=1');
u.searchParams.append('k2', 'v2');
console.log(u.search);

u.search = '?z=9';
console.log(u.searchParams.get('z'));
```

**结果**：输出 `?k=1&k2=v2` 和 `9`。改 `searchParams`，`search` 和 `href` 跟着变；改 `search` 或 `href`，`searchParams` 跟着变。

### 追加同名的请求头

```js
const h = new Headers();
h.append('Accept', 'a');
h.append('accept', 'b');
console.log(h.get('ACCEPT'));
```

**结果**：输出 `a, b`。同名的多个值读出来时用 `, ` 连成一个字符串。要覆盖而不是追加，用 `set()`。

### 读多条 `Set-Cookie`

```js
const h = new Headers();
h.append('Set-Cookie', 'x=1');
h.append('Set-Cookie', 'y=2');
console.log(h.getSetCookie());
```

**结果**：输出 `['x=1', 'y=2']`。`Set-Cookie` 的值里本身可能有逗号，不能连成一个字符串，所以用 `getSetCookie()` 取数组。

### 遍历全部请求头

```js
const h = new Headers({ 'Content-Type': 'application/json', Accept: 'a' });
for (const [name, value] of h) {
  console.log(name, value);
}
```

**结果**：输出 `accept a` 和 `content-type application/json`。名字都是小写，按名字的字母顺序排列，和加入的先后无关。`Set-Cookie` 有几条就出现几次。

## 成员说明

### `URL`

#### `new URL(url, base?)`

- **参数**：`url` 是地址文本或另一个 `URL`。`base` 可选，是解析相对地址的起点，也是文本或 `URL`，本身必须是完整的地址。
- **出错**：解析不了时抛 `TypeError`。
  - 没传 `base`：`Invalid URL: "/x". Without a base it must be absolute: this runtime does not load over HTTP, so there is no location`
  - 传了 `base`：`Invalid URL: "/x"（base "nope"）`

#### 属性

类型都是字符串。

| 属性 | 可读 | 可写 | 含义 | 例（`https://u:p@a.com:8080/p/q?x=1#f`） |
| --- | --- | --- | --- | --- |
| `href` | 是 | 是 | 完整的地址。写入不合法的地址抛 `TypeError: Invalid URL: "…"` | 整串 |
| `origin` | 是 | 否 | 协议加主机加端口。只有 `http` 和 `https` 有值，其他协议一律是字符串 `'null'` | `https://a.com:8080` |
| `protocol` | 是 | 是 | 协议，带结尾的冒号。写入时冒号可以省略 | `https:` |
| `username` | 是 | 是 | 用户名，没有是空字符串 | `u` |
| `password` | 是 | 是 | 密码，没有是空字符串 | `p` |
| `host` | 是 | 是 | 主机加端口。默认端口不出现 | `a.com:8080` |
| `hostname` | 是 | 是 | 主机，不带端口 | `a.com` |
| `port` | 是 | 是 | 端口。是协议的默认端口时读出空字符串 | `8080` |
| `pathname` | 是 | 是 | 路径，至少是 `/`。写入时开头的 `/` 可以省略 | `/p/q` |
| `search` | 是 | 是 | 查询，带开头的 `?`，没有是空字符串。写入时 `?` 可以省略，内容不做编码 | `?x=1` |
| `searchParams` | 是 | 否 | 查询参数，一个 `URLSearchParams`。每次读到的是同一个对象，和 `search` 互相同步 | |
| `hash` | 是 | 是 | 片段，带开头的 `#`，没有是空字符串。写入时 `#` 可以省略，内容不做编码 | `#f` |

这些值变化时没有事件通知：只有 App 自己的代码能改它们。

#### 方法

| 方法 | 返回值 | 说明 |
| --- | --- | --- |
| `toString()` | 字符串 | 等于 `href` |
| `toJSON()` | 字符串 | 等于 `href`。所以 `JSON.stringify(url)` 得到带引号的地址 |
| `URL.canParse(url, base?)` | 布尔 | 能解析返回 `true`，不能返回 `false`。不抛异常 |
| `URL.parse(url, base?)` | `URL` 或 `null` | 能解析返回 `URL`，不能返回 `null`。不抛异常 |

### `URLSearchParams`

#### `new URLSearchParams(init?)`

`init` 有四种写法，不传得到空列表：

| 写法 | 例 | 说明 |
| --- | --- | --- |
| 字符串 | `'a=1&b=2'` | 开头的 `?` 会被忽略。`+` 解码成空格 |
| 对象 | `{ a: '1', b: '2' }` | 每个属性一个参数 |
| 数组 | `[['a', '1'], ['a', '2']]` | 可以表示同名的多个参数。每一项必须正好是两个元素，否则抛 `TypeError: URLSearchParams in array form needs every entry to be [name, value]` |
| 另一个 `URLSearchParams` | | 复制一份，两者之后互不影响 |

#### 属性和方法

| 成员 | 返回值 | 说明 |
| --- | --- | --- |
| `size` | 数，个数 | 参数的个数，同名的分别计数。只读 |
| `get(name)` | 字符串或 `null` | 第一个同名参数的值。没有返回 `null` |
| `getAll(name)` | 字符串数组 | 全部同名参数的值。没有返回空数组 |
| `has(name, value?)` | 布尔 | 有没有这个名字。传了 `value` 时要求名字和值都相同 |
| `append(name, value)` | 无 | 加在末尾，不管有没有同名的 |
| `set(name, value)` | 无 | 替换第一个同名的，删掉其余同名的。没有同名的就加在末尾 |
| `delete(name, value?)` | 无 | 删掉全部同名的。传了 `value` 时只删名字和值都相同的 |
| `sort()` | 无 | 按名字排序。同名的保持原来的先后 |
| `toString()` | 字符串 | 编码后的查询串，不带开头的 `?`。空格编码成 `+` |
| `keys()` / `values()` / `entries()` | 迭代器 | 按列表顺序给出名字、值、`[名字, 值]`。`for...of` 直接遍历等于 `entries()` |
| `forEach(callback, thisArg?)` | 无 | 依次调用 `callback(value, name, params)` |

名字和值不是字符串时，先转成字符串。

### `Headers`

#### `new Headers(init?)`

`init` 可以是普通对象（`{ Accept: 'a' }`）、`[名字, 值]` 的数组、或另一个 `Headers`（复制一份）。数组的每一项必须正好是两个元素，否则抛 `TypeError: Headers in array form needs every entry to be [name, value]`。

#### 方法

| 方法 | 返回值 | 说明 |
| --- | --- | --- |
| `get(name)` | 字符串或 `null` | 这个名字的值。有多个值时用 `, ` 连起来。没有返回 `null` |
| `has(name)` | 布尔 | 有没有这个名字 |
| `set(name, value)` | 无 | 设置。原来的同名值全部被覆盖 |
| `append(name, value)` | 无 | 追加。原来的同名值保留 |
| `delete(name)` | 无 | 删掉这个名字的全部值 |
| `getSetCookie()` | 字符串数组 | 全部 `Set-Cookie` 的值，一条一项。没有返回空数组 |
| `keys()` / `values()` / `entries()` | 迭代器 | 按名字的字母顺序给出。名字是小写。`for...of` 直接遍历等于 `entries()` |
| `forEach(callback, thisArg?)` | 无 | 依次调用 `callback(value, name, headers)` |

所有方法里的名字都不区分大小写。

名字和值的检查：

- 名字只能由字母、数字和 ``!#$%&'*+-.^_`|~`` 这些符号组成，不能为空。不合法时抛 `TypeError: Invalid header name: "坏 名字"`。
- 值的首尾空白（空格、制表符、回车、换行）被去掉。`'  v  '` 存进去是 `'v'`。
- 值的中间有 NUL、回车或换行时抛 `TypeError: Header value cannot contain NUL, CR or LF`。

除此之外不限制名字：`Host`、`Cookie`、`Origin` 这些名字都可以设置。

## 和浏览器的对照

这三个类的名字和成员与浏览器里的同名类相同。下面列出行为不同的地方。

| 情况 | 浏览器 | 这里 |
| --- | --- | --- |
| 相对地址的起点 | 常用 `location.href` 或 `document.baseURI` 作第二个参数 | 没有 `location`，起点要自己提供 |
| `https://a.com\evil.com`（地址里有反斜杠） | 反斜杠当作 `/`，解析成功 | 解析失败，抛 `TypeError`。这条来自和 Chrome 的对比测试，验收用例里没有断言 |
| `https://例え.jp`（非 ASCII 的域名） | `hostname` 是 `xn--r8jz45g.jp` | `hostname` 是 `%E4%BE%8B%E3%81%88.jp`。这条来自和 Chrome 的对比测试，验收用例里没有断言。用这样的地址发请求能否成功，**未在模拟器验证** |
| `ws:`、`wss:`、`ftp:` 地址的 `origin` | 协议加主机加端口 | `'null'` |
| `Headers` 里的 `Host`、`Cookie` 等名字 | 用于请求时被禁止或忽略 | 不限制 |

只处理 `http` 和 `https` 的 ASCII 地址时，不会遇到后四条。

## 还不能做的

| 想做的事 | 状态 |
| --- | --- |
| 把非 ASCII 的域名读成 `xn--` 开头的形式 | 未实现 |
| 用 `FormData` 组织表单数据 | 没有 `FormData`。用 `URLSearchParams` 组织键值对 |

## 参见

- [`fetch`](fetch.md)：发请求时用 `URL` 作地址、用 `Headers` 作请求头
- [`WebSocket`](websocket.md)：建立长连接时的地址和请求头
- [运行时怎么工作](how-it-works.md)：代码从哪里加载，为什么没有 `location`
