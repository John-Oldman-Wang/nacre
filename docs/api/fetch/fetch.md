---
type: reference
web: fetch()
---

# `fetch()` 函数

**`fetch()`** 函数发出一个 HTTP 请求，返回一个 `Promise`。状态码、响应头和第一块响应内容到达时，`Promise` 完成，得到一个 [`Response`](../response.md)。

## 语法

```
fetch(input)
fetch(input, init)
```

### 参数

**`input`**

请求的地址：字符串、[`URL`](../url.md) 或 [`Request`](../request.md)。必须是带协议和主机名的完整 URL，比如 `https://api.example.com/items`。`'/api/items'` 这种相对地址没有可以参照的基准地址，`Promise` 以 `TypeError` 被拒绝。

是 `Request` 时，请求沿用它的地址、方法、请求头、请求体和 `signal`。`init` 里给了的字段以 `init` 为准。

**`init`**

请求的选项，对象，可选。不给或者给 `null` 都视为空对象。

**`init.method`**

请求方法，字符串：`'GET'`、`'POST'`、`'PUT'`、`'DELETE'` 等。默认 `'GET'`。小写会被转成大写。

**`init.headers`**

请求头，普通对象或 [`Headers`](../headers.md)。默认没有请求头。`Host`、`Cookie`、`Origin` 这些请求头都可以设置，没有不允许设置的请求头。

**`init.body`**

请求体。默认 `null`，表示没有请求体。可以是下面这些值；没有写 `Content-Type` 请求头时，按 `body` 的种类补一个默认的：

| `body` 的值 | 发送的内容 | 默认的 `Content-Type` |
| --- | --- | --- |
| 字符串 | 按 UTF-8 编码的文字 | `text/plain;charset=UTF-8` |
| [`Blob`](../blob.md) | `Blob` 里的字节 | `Blob` 的 `type`。`type` 是空串时不补 |
| `ArrayBuffer`、类型数组 | 这些字节 | 不补 |
| [`URLSearchParams`](../url-search-params.md) | 它序列化之后的字符串，形如 `a=1&b=2` | `application/x-www-form-urlencoded;charset=UTF-8` |
| 其它值（数、布尔、普通对象） | 按 `String()` 转成的字符串。普通对象会变成 `[object Object]` | `text/plain;charset=UTF-8` |

- 自己写了 `Content-Type` 时，不会被默认值覆盖。
- 表里「不补」的情况下，系统会自己填上 `application/x-www-form-urlencoded`（实测）。所以发二进制数据时要自己写 `Content-Type`。

**`init.signal`**

[`AbortSignal`](../abort-signal.md) 或 `null`，用来取消请求。默认 `null`，请求不能被取消。

`input` 是 `Request` 时：`init` 里没写 `signal` 就用 `Request` 带着的那个；写了就只听 `init` 里的，`Request` 带着的那个不再影响这次请求；写 `null` 表示这次请求不能被取消。

### 返回值

`Promise`，完成时得到 [`Response`](../response.md)。完成的时刻见[什么时候返回](#什么时候返回)。

### 异常

`fetch()` 本身不抛异常，出错时返回的 `Promise` 被拒绝。

**`TypeError`**

- 连不上、没有网络、域名解析不了：`message` 是 `Network request failed: ` 加系统给的说明。说明的语言跟随系统，只适合打日志。
- 地址不是完整的 URL：`message` 以 `Invalid URL:` 开头。
- `init.signal` 不是 `AbortSignal` 也不是 `null`：`Request: signal must be an AbortSignal or null`。
- 请求头的名字里有不合法的字符：`message` 以 `Invalid header name:` 开头。
- 请求头的值里有换行或空字符：`Header value cannot contain NUL, CR or LF`。

**[`DOMException`](../dom-exception.md)，`name` 是 `'AbortError'`**

请求进行中被取消，或者 `AbortSignal.timeout()` 到了时间：`code` 是 20，`message` 是 `The operation was aborted`。超时和手动取消得到的异常相同，从异常上区分不出是哪一种。

**`signal.reason`**

交给 `fetch()` 的 `signal`（写在 `init` 里的，或者 `Request` 带着的）在调用之前已经取消：`Promise` 以这个 `signal` 的 `reason` 被拒绝。

## 说明

### 请求什么时候算失败

请求可能在两个层面失败，表现不同。

| | 发生了什么 | `fetch()` 的表现 |
| --- | --- | --- |
| 网络层失败 | 没有网络、域名解析不了、连不上服务器、请求被取消、地址不合法 | `Promise` 被拒绝，`await` 处抛异常 |
| 服务器返回错误 | 服务器收到了请求，返回 404、500 这类状态码 | `Promise` 正常完成，[`res.ok`](../response/ok.md) 是 `false` |

服务器返回 404 或 500 时 `fetch()` 不抛异常。只写 `try` / `catch` 发现不了 404，只检查 `res.ok` 发现不了断网。

状态码和响应头到达之后，网络仍然可能中断。那时 `fetch()` 的 `Promise` 已经完成，失败出现在读取内容的那一步：`res.json()`、`res.text()` 等方法返回的 `Promise` 被拒绝，异常和上面相同。用 `res.body` 边下边读时，被拒绝的是 [`read()`](../readable-stream-default-reader/read.md) 返回的 `Promise`。

### 什么时候返回

`fetch()` 在状态码、响应头和**第一块响应内容**到达时返回，不是在响应头到达时。这时其余的内容可能还在下载，读取内容的方法要等内容全部下载完才完成。

对大多数请求这没有区别：服务器发完响应头紧接着就发内容。服务器先发响应头、过一阵才有内容的接口（比如保持连接、有消息才推送的接口），第一条消息来之前 `fetch()` 一直不返回。实测数据和服务器一侧的处理办法见[响应分两步到达](../../guides/streaming-response.md#响应分两步到达)。

没有内容的响应（`HEAD` 请求的响应、状态码 204）在响应结束时返回。

### 超时

运行时不给请求另设超时，使用系统的默认值。iOS 的文档给出的默认值是连续 60 秒没有收到数据就失败，这个数值**未在模拟器验证**。要更短的超时，把 [`AbortSignal.timeout()`](../abort-signal/timeout.md) 交给 `signal`。

### 请求自动带上什么

- **cookie**。`fetch()` 的 cookie 由系统管理：服务器用 `Set-Cookie` 写的 cookie 被保存下来，之后发往同一站点的请求自动带上。**未在模拟器验证。** 这份 cookie 和 [`WebView`](../web-view.md) 里网页的 cookie 是分开的两份（实测）：用户在网页里登录，不会让 `fetch()` 带上登录状态，反过来也一样。
- **重定向**。服务器返回 301、302 时，系统自动请求新的地址，`fetch()` 得到的是最终的响应。不能禁止跟随，见 [`redirected`](../response/redirected.md)。
- **缓存**。缓存按系统的默认规则处理，不能按请求控制。具体表现**未在模拟器验证**。

### 明文 `http://` 地址

iOS 默认拦截发往明文 `http://` 地址的请求，CLI 生成的工程没有放开这条限制。`fetch()` 请求 `http://` 地址的结果**未在模拟器验证**；同一条限制下，[`WebView`](../web-view.md) 加载 `http://` 地址实测被拦截。开发时请求本机的 `http://` 服务的配置见[请求本机的测试服务](../../guides/fetch.md#请求本机的测试服务)。

### 同时进行的请求

运行时不限制同时进行的请求数量，请求之间互不等待。实测同时发出 10 个请求，总耗时小于单个请求的 4 倍。对同一个服务器同时建立多少个连接由系统决定，这个上限没有测量过。

### App 进入后台之后

iOS 在 App 进入后台后很快会暂停它的运行。那时还没完成的请求是继续、暂停还是失败，**未在模拟器验证**。

## 示例

### 发一个 GET 请求

```js
async function main() {
  const res = await fetch('https://httpbin.org/get');
  const data = await res.json();
  console.log(res.status, data.url);
}
main();
```

**结果**：输出 `200 https://httpbin.org/get`。

### 发送 JSON

```js
async function main() {
  const res = await fetch('https://httpbin.org/post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'nacre', count: 3 }),
  });
  const echo = await res.json();
  console.log(echo.json.name);
}
main();
```

**结果**：输出 `nacre`。这个测试地址会把收到的内容原样返回。

## 和 Web 的差别

- `input` 必须是完整地址。没有可以参照的基准地址。
- 在第一块响应内容到达时完成，不是在响应头到达时。
- `init.body` 不能是 `FormData` 或 `ReadableStream`。
- `body` 是 `ArrayBuffer` 或类型数组、且没写 `Content-Type` 时，系统会填上 `application/x-www-form-urlencoded`。Web 不发这个请求头。
- 没有 `init.mode`、`init.credentials`、`init.cache`、`init.redirect`，写了不起作用。
- 没有 CORS 预检和同源策略，可以请求任何地址。
- 所有请求头都可以设置，包括 `Host`、`Cookie`。
- 请求进行中被取消时抛出一个新的 `DOMException`（`name` 是 `'AbortError'`），不是 `signal.reason`。
- `AbortSignal.timeout()` 到时间后抛出 `AbortError`，不是 `TimeoutError`。

## 参见

- [`Response`](../response.md)：`fetch()` 得到的响应
- [`Request`](../request.md)：先把请求准备好再发
- [`AbortController`](../abort-controller.md)：取消请求
- [从网络取数据](../../guides/fetch.md)：常见请求的写法
