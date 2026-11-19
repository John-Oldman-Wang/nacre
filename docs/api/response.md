---
type: reference
web: Response
---

# `Response`

**`Response`** 表示一次 HTTP 请求得到的响应：状态码、响应头和响应内容。[`fetch()`](fetch.md) 返回的 `Promise` 完成时得到它。

状态码和响应头在拿到 `Response` 时就已经齐了。响应内容可能还在下载：用四个读取方法之一整个读，或者用 [`body`](response/body.md) 一块一块地读。内容只能读一次，见[响应内容只能读一次](#响应内容只能读一次)。

`Response` 也可以自己创建，用来在测试里代替一次真实的请求。

**继承关系**：`Response` 不继承其他类。

怎么发请求、读响应，见指南[从网络取数据](../guides/fetch.md)。

## 构造函数

[`Response()`](response/constructor.md)

用给定的内容、状态码和响应头创建一个响应。

## 实例属性

这些属性都可读、不可写。

| 属性 | 说明 |
| --- | --- |
| [`ok`](response/ok.md) <small>只读</small> | 状态码在 200 到 299 之间时为 `true` |
| [`status`](response/status.md) <small>只读</small> | 状态码 |
| [`statusText`](response/statustext.md) <small>只读</small> | 状态码对应的文字 |
| [`headers`](response/headers.md) <small>只读</small> | 响应头 |
| [`url`](response/url.md) <small>只读</small> | 响应来自的地址 |
| [`body`](response/body.md) <small>只读</small> | 响应内容的流，用来边下边读 |
| [`bodyUsed`](response/bodyused.md) <small>只读</small> | 响应内容是否已经读过 |
| [`redirected`](response/redirected.md) <small>只读</small> | 永远是 `false` |
| [`type`](response/type.md) <small>只读</small> | 永远是 `'basic'` |

## 实例方法

四个读取方法都等内容全部下载完，返回 `Promise`。读过任何一个之后，其余的都不能再读。

| 方法 | 说明 |
| --- | --- |
| [`json()`](response/json.md) | 按 JSON 解析，得到解析好的值 |
| [`text()`](response/text.md) | 按 UTF-8 解码，得到字符串 |
| [`arrayBuffer()`](response/arraybuffer.md) | 得到 `ArrayBuffer` |
| [`blob()`](response/blob.md) | 得到 [`Blob`](blob.md)，内容不进入 JS 的内存 |

## 概念

### 四种读法怎么选

| 方法 | 得到什么 | 什么时候用 | 内存 |
| --- | --- | --- | --- |
| `json()` | 解析好的值 | 接口返回的 JSON | 在下载的内容之外，再生成一份字符串和解析出的对象 |
| `text()` | 字符串 | 文本、HTML | 在下载的内容之外，再生成一份字符串 |
| `arrayBuffer()` | `ArrayBuffer` | 要自己逐字节处理的二进制数据 | 不生成字符串 |
| `blob()` | [`Blob`](blob.md) | 图片、视频、文件，拿到后直接交给别的 API | 不生成字符串，内容不进入 JS 的内存 |

下载和文本的解码都在后台进行，等待期间界面照常响应。

整个读的四个方法，下载的内容一直留在内存里，直到 `Response` 对象不再被任何变量引用并被回收。拿到 `Response` 之后不需要内容时，用 [`AbortController`](abort-controller.md) 取消请求，下载立即停止。

不想等下载完的时候，用 [`body`](response/body.md) 一块一块读，见[边下载边读响应](../guides/streaming-response.md)。

### 响应内容只能读一次

四个读取方法共用一次机会，读过任何一个之后其余的都不能再读，返回的 `Promise` 被拒绝：`TypeError: Body has already been read`。需要用两次的话，把第一次读出的结果存进变量。`Response` 没有 `clone()`。

`body` 和这四个方法读的是同一份内容，所以互相排斥：

| 先做了什么 | 之后 |
| --- | --- |
| 调过四个读取方法之一 | `res.body.locked` 是 `true`，`res.body.getReader()` 抛 `TypeError` |
| 用 `res.body` 读过（调过 `read()`），或者取消过（调过 `cancel()`） | `res.bodyUsed` 是 `true`，四个读取方法被拒绝：`TypeError: Body has already been read` |
| `res.body` 上有一个读取器，还没读 | 四个读取方法被拒绝：`TypeError: Body is locked: response.body has a reader`。`res.bodyUsed` 还是 `false`；调读取器的 `releaseLock()` 之后，四个方法可以照常用 |
| 只读取过 `res.body` 这个属性，没有拿读取器 | 没有影响 |

### 没有内容的响应

下面这些 `Response` 没有内容，它们的 `body` 是 `null`：

- 自己创建时 `body` 参数是 `null` 或者没给；
- `fetch()` 发的是 `HEAD` 请求；
- `fetch()` 得到的状态码是 204、205 或 304。

没有内容的 `Response` 读取时的结果：

| 方法 | 结果 |
| --- | --- |
| `text()` | 空串 `''` |
| `arrayBuffer()` | 长度为 0 字节的 `ArrayBuffer` |
| `blob()` | `size` 为 0 的 `Blob` |
| `json()` | 被拒绝，`SyntaxError`。空串不是合法的 JSON |

这种情况下 `bodyUsed` 保持 `false`，可以重复读。空串 `''` 不算「没有内容」：它是一份长度为 0 的内容，`body` 是一个流（第一次 `read()` 就是 `done`），读过一次之后 `bodyUsed` 是 `true`。

## 示例

```js
async function main() {
  const res = await fetch('https://httpbin.org/get');
  console.log(res.ok, res.status);
  console.log(res.headers.get('content-type'));
  const data = await res.json();
  console.log(data.url);
}
main();
```

**结果**：依次输出 `true 200`、`application/json`、`https://httpbin.org/get`。

## 和 Web 的差别

- `fetch()` 得到的响应上，`statusText` 永远是空串。
- `text()` 一律按 UTF-8 解码，不合法时得到空串。Web 按响应声明的编码解码，不合法的字节换成替换字符。
- `blob()` 得到的 `Blob` 的 `type` 是空串。Web 取自 `Content-Type`。
- `redirected` 永远是 `false`，`type` 永远是 `'basic'`。
- 没有 `clone()`、`formData()`，没有静态方法 `Response.json()`、`Response.error()`、`Response.redirect()`。

## 参见

- [`fetch()`](fetch.md)：得到 `Response`
- [`ReadableStream`](readable-stream.md)：`body` 的类型
- [从网络取数据](../guides/fetch.md)
- [边下载边读响应](../guides/streaming-response.md)
