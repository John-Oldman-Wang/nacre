---
type: reference
web: fetch()
---

# `fetch()`

**`fetch()`** 函数发出一个 HTTP 请求，返回一个 `Promise`。服务器的状态码、响应头和第一块响应内容到达时，这个 `Promise` 完成，得到一个 [`Response`](response.md)。

请求在后台进行。等待期间 JS 继续执行，界面照常响应。请求不依赖界面，App 启动后在任何地方都可以发，包括文件顶层，不用等 `sceneconnect`。`fetch()` 可以请求任何服务器，不受跨域规则限制。

和 `fetch()` 一起使用的几个类：

- [`Response`](response.md)：一次请求得到的响应，读状态码、响应头和响应内容。
- [`Request`](request.md)：把一次请求的地址和选项保存成一个对象。
- [`Blob`](blob.md)：一块不可修改的二进制数据，用来上传和保存下载的内容。
- [`ReadableStream`](readable-stream.md) 和 [`ReadableStreamDefaultReader`](readable-stream-default-reader.md)：一块一块地读还在下载的响应内容。
- [`AbortController`](abort-controller.md) 和 [`AbortSignal`](abort-signal.md)：取消请求、给请求设超时。
- [`Headers`](headers.md) 和 [`URL`](url.md)：请求头和地址。

怎么用这些类完成常见的任务，见指南[从网络取数据](../guides/fetch.md)和[边下载边读响应](../guides/streaming-response.md)。

## 函数

[`fetch()`](fetch/fetch.md)

发出一个请求，返回 `Promise`，完成时得到 `Response`。

## 示例

下面的代码请求一个返回 JSON 的地址，把结果输出到控制台。整段可以直接写在 `main.js` 的顶层。

```js
async function load() {
  // 1. 发请求。响应头和第一块内容到达时这一行就返回了
  const res = await fetch('https://httpbin.org/get');

  // 2. 检查服务器是否返回了成功的状态
  if (!res.ok) {
    console.log('服务器返回了错误：', res.status);
    return;
  }

  // 3. 读出响应内容，按 JSON 解析
  const data = await res.json();
  console.log(res.status, data.url);
}

// 4. 网络不通时 fetch 会失败，要接住
load().catch((err) => {
  console.log('请求没有发出去或没有收到响应：', err.message);
});
```

**结果**

- 网络正常时，控制台输出 `200 https://httpbin.org/get`。
- 服务器返回 404 或 500 时，输出 `服务器返回了错误： 404`。
- 没有网络或连不上服务器时，输出 `请求没有发出去或没有收到响应：` 加一段错误说明。

第 2 步和第 4 步处理的是两种不同的失败，见[请求什么时候算失败](fetch/fetch.md#请求什么时候算失败)。

> **注意**：`await` 只能写在 `async` 函数里。文件顶层不能直接写 `await`。

## 和 Web 的差别

`fetch` 这一组接口的名字和 Web 的相同。差别逐条写在各成员页的「和 Web 的差别」里，这张表汇总在一起，给熟悉 Web 写法的人查。

| Web | Nacre |
| --- | --- |
| `await fetch(url, init)` | 相同。`url` 必须是完整地址 |
| `fetch()` 在响应头到达时完成 | 在第一块响应内容到达时完成 |
| `init.body` 可以是字符串、`Blob`、`ArrayBuffer`、类型数组、`URLSearchParams` | 相同 |
| `init.body` 可以是 `FormData`、`ReadableStream` | 没有 |
| `body` 是 `ArrayBuffer` 且没写 `Content-Type` 时，不发这个请求头 | 系统会填上 `application/x-www-form-urlencoded` |
| `init.mode`、`init.credentials`、`init.cache`、`init.redirect` | 没有，写了不起作用 |
| CORS 预检、同源策略 | 没有，可以请求任何地址 |
| 不允许设置 `Host`、`Cookie` 等请求头 | 都可以设置 |
| 取消时抛出 `signal.reason`，默认是 `DOMException` | 抛出一个新的 [`DOMException`](dom-exception.md)，`name` 是 `'AbortError'`，不是 `signal.reason` |
| `AbortSignal.timeout()` 到时间后 `fetch()` 抛出 `TimeoutError` | 抛出 `AbortError` |
| `res.statusText` | `fetch()` 得到的响应上永远是空串 |
| `res.text()` 按响应声明的编码解码，不合法的字节换成替换字符 | 一律按 UTF-8 解码，不合法时得到空串 |
| `res.blob()` 的 `type` 取自 `Content-Type` | `type` 是空串 |
| `res.formData()`、`res.clone()` | 没有 |
| `req.body` | 没有。`Request` 的内容只能用四个读取方法读 |
| `new Blob([blob])` | 抛 `TypeError` |
| `read()` 在请求被取消时以 `signal.reason` 拒绝 | 以 `AbortError` 拒绝 |
| `reader.closed` 在内容到头时完成 | 来自 `fetch()` 的流要 `read()` 到 `done` 才完成 |
| 没有读内容时也限制缓冲，下载会停下来等 | 开始用 `read()` 读之后才限制，之前一直下载 |
| 没有 `Content-Length` 的响应被截断时报错 | 服务器正常关闭连接时不报错 |
| `new ReadableStream(…)`、`pipeTo()`、`pipeThrough()`、`tee()`、`getReader({ mode: 'byob' })` | 没有 |
| `WritableStream`、`TransformStream`、`EventSource` | 没有 |

## 参见

- [从网络取数据](../guides/fetch.md)：发请求、处理失败、上传和下载的写法
- [边下载边读响应](../guides/streaming-response.md)：大文件、下载进度、服务器持续推送的内容
- [`URL`](url.md) 和 [`Headers`](headers.md)：地址和请求头
- [`UIImage`](ui-image.md)：把下载的 `Blob` 变成图片
- [文件读写](filesystem.md)：把下载的 `Blob` 写进文件，读出文件用来上传
- [`WebView`](web-view.md)：需要显示网页时用它。它的 cookie 和 `fetch()` 的不通
- [WebSocket](websocket.md)：需要服务器主动推送数据时用它
- [定时器](timers.md)：`AbortSignal.timeout()` 之外的定时
- [运行时怎么工作](how-it-works.md)：为什么请求不会卡住界面
