---
type: reference
status: partial
---

# `fetch` / `Request` / `Response`

`fetch()` 发一个 HTTP 请求，返回一个 `Promise`，得到服务器的响应。

它的写法和浏览器里的 `fetch()` 相同，会用浏览器版本的就会用这个。有五点不同：

- **URL 必须是完整的。** 要写成 `https://…`。这里没有「当前页面地址」，所以 `fetch('/api/items')` 这种相对地址会失败。
- **没有跨域限制。** 没有 CORS，没有同源策略，可以请求任何服务器。`mode`、`credentials` 这些选项不存在。
- **请求体只能是字符串。** 发 JSON 要先 `JSON.stringify()`。不能直接发 `FormData`、`Blob` 或二进制数据。
- **不能边下载边读。** 没有 `res.body` 这个流。响应内容要等全部下载完才能读到。
- **不能控制重定向和缓存。** 重定向由系统自动跟随，缓存用系统的默认行为。

## 完整例子

下面的代码请求一个返回 JSON 的地址，把结果输出到控制台。请求不依赖界面，所以可以直接写在文件顶层，不用等 `sceneconnect`。

```js
async function load() {
  // 1. 发请求。服务器开始响应时这一行就返回了
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
- 没有网络或连不上服务器时，输出 `请求没有发出去或没有收到响应：` 加一段错误描述。
- 请求进行期间界面不会卡住。

四步分别是：发请求、检查状态、读内容、处理失败。第 2 步和第 4 步处理的是两种不同的失败，见[两种失败](#两种失败)。

> **注意**：`await` 只能写在 `async` 函数里。文件顶层不能直接写 `await`。

## 常见用法

以下例子都写在 `async` 函数里。

### 取回 JSON

```js
const res = await fetch('https://httpbin.org/get');
const data = await res.json();
console.log(data.url);
```

**结果**：输出 `https://httpbin.org/get`。`data` 是解析好的普通对象。

### 判断请求是否成功

```js
const res = await fetch('https://httpbin.org/status/404');
console.log(res.ok);       // false
console.log(res.status);   // 404
```

**结果**：这段代码不会抛异常。服务器返回 404 或 500 时，`fetch()` 仍然成功，只是 `res.ok` 是 `false`。

`res.ok` 在状态码是 200 到 299 时为 `true`。读内容之前先检查它。

### 发送 JSON

```js
const res = await fetch('https://httpbin.org/post', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'nacre', count: 3 }),
});
const echo = await res.json();
console.log(echo.json.name);
```

**结果**：输出 `nacre`。这个测试地址会把收到的内容原样返回。

`body` 只接受字符串，对象要先用 `JSON.stringify()` 转换。字符串里的中文按 UTF-8 发送。

### 带上自定义请求头

```js
const res = await fetch('https://httpbin.org/get', {
  headers: {
    'Authorization': 'Bearer abc123',
    'Accept': 'application/json',
  },
});
```

**结果**：请求带着这两个请求头发出。

`headers` 可以是普通对象，也可以是 [`Headers`](url.md) 对象。

### 读响应头

```js
const res = await fetch('https://httpbin.org/get');
console.log(res.headers.get('content-type'));
console.log(res.headers.get('CONTENT-TYPE'));
```

**结果**：两行都输出 `application/json`。响应头的名字不区分大小写。

### 取回文本

```js
const res = await fetch('https://httpbin.org/range/16');
const text = await res.text();
console.log(text);
```

**结果**：输出 `abcdefghijklmnop`。

### 下载一张图片并显示

```js
const res = await fetch('https://httpbin.org/image/png');
const blob = await res.blob();
const image = UIImage.imageWithData(blob);
console.log(blob.size, image !== null);
```

**结果**：输出图片的字节数和 `true`。`image` 可以赋给 `UIImageView` 的 `image` 属性，见 [`UIImage`](ui-image.md)。**这个例子未在模拟器验证。**

图片、视频、文件这类不需要自己逐字节处理的内容，用 `blob()` 读。原因见[四种读法怎么选](#四种读法怎么选)。

### 取回二进制数据自己处理

```js
const res = await fetch('https://httpbin.org/range/256');
const buffer = await res.arrayBuffer();
const bytes = new Uint8Array(buffer);
console.log(buffer.byteLength, bytes[0]);
```

**结果**：输出 `256 97`。`97` 是字母 `a` 的编码。

### 取消一个请求

```js
const controller = new AbortController();
const promise = fetch('https://httpbin.org/delay/5', { signal: controller.signal });

controller.abort();

try {
  await promise;
} catch (err) {
  console.log(err instanceof Error ? err.name : err);
}
```

**结果**：输出 `AbortError`。请求被真正取消，不再占用网络。

用户离开页面、或者发起了新的搜索时，用它取消还没完成的旧请求。

### 给请求设超时

```js
try {
  await fetch('https://httpbin.org/delay/5', { signal: AbortSignal.timeout(300) });
} catch (err) {
  console.log(err instanceof Error ? err.name : err);
}
```

**结果**：300 毫秒后请求被取消，输出 `AbortError`。

`AbortSignal.timeout()` 的参数单位是毫秒。不设超时的话，使用系统的默认超时时间。

### 同时发多个请求

```js
const urls = [
  'https://httpbin.org/get?id=1',
  'https://httpbin.org/get?id=2',
  'https://httpbin.org/get?id=3',
];
const responses = await Promise.all(urls.map((url) => fetch(url)));
const results = await Promise.all(responses.map((res) => res.json()));
console.log(results.length);
```

**结果**：三个请求同时发出，全部完成后输出 `3`。总耗时接近最慢的那一个，不是三个相加。

### 区分「没连上」和「服务器报错」

```js
/** @param {string} url */
async function getJSON(url) {
  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    throw new Error('网络不通');
  }
  if (!res.ok) {
    throw new Error('服务器返回 ' + res.status);
  }
  return res.json();
}
```

**结果**：没有网络时抛出「网络不通」，服务器返回 404 时抛出「服务器返回 404」，成功时返回解析好的数据。

### 自己创建一块数据

```js
const blob = new Blob(['前缀-', '后缀'], { type: 'text/plain' });
console.log(blob.size, blob.type);
console.log(await blob.text());
```

**结果**：输出 `13 text/plain` 和 `前缀-后缀`。`size` 是 UTF-8 编码后的字节数，一个汉字占 3 个字节。

## 两种失败

请求可能在两个层面失败，处理方式不同。

| | 发生了什么 | `fetch()` 的表现 | 怎么处理 |
| --- | --- | --- | --- |
| 网络层失败 | 没有网络、域名解析不了、连不上服务器、请求被取消、URL 不合法 | `Promise` 被拒绝，`await` 处抛异常 | `try` / `catch` |
| 服务器返回错误 | 服务器收到了请求，返回 404、500 这类状态码 | `Promise` 正常完成，`res.ok` 是 `false` | 检查 `res.ok` 或 `res.status` |

这和浏览器的行为相同。只写 `try` / `catch` 接不住 404，只检查 `res.ok` 接不住断网，两个都要写。

网络层失败时抛出的异常类型：

| 情况 | 异常 |
| --- | --- |
| 连不上、没有网络 | `TypeError` |
| URL 不是完整地址 | `TypeError` |
| 被 `AbortController` 取消，或 `AbortSignal.timeout()` 到时间 | `name` 是 `'AbortError'` 的 `Error` |

## 四种读法怎么选

响应内容有四个读取方法，都返回 `Promise`。

| 方法 | 得到什么 | 什么时候用 | 内存 |
| --- | --- | --- | --- |
| `json()` | 解析好的对象 | 接口返回的 JSON | 多占一份 |
| `text()` | 字符串 | 文本、HTML | 多占一份 |
| `arrayBuffer()` | `ArrayBuffer` | 要自己逐字节处理的二进制数据 | 只占一份 |
| `blob()` | [`Blob`](#blob) | 图片、视频、文件，拿到后直接交给别的 API | 只占一份，而且不计入 JS 的内存 |

- **下载大文件用 `blob()` 或 `arrayBuffer()`。** 数据在内存里只有一份。`text()` 和 `json()` 会在下载的数据之外再生成一份字符串。
- **四个方法都不会卡住界面。** 文本的解码在后台完成。
- **JSON 解析很快。** 不需要因为担心性能而自己手写解析。

### 响应内容只能读一次

```js
const res = await fetch('https://httpbin.org/get');
await res.json();
console.log(res.bodyUsed);   // true
await res.json();            // 抛 TypeError: Body has already been read
```

**结果**：第二次读取失败。四个读取方法共用这一次机会，读过任何一个之后其余的都不能再读。

需要用两次的话，把第一次读出的结果存进变量。

## 响应分两步到达

`await fetch()` 在服务器开始响应、状态码和响应头到达时就返回，这时响应内容可能还在下载。读取方法返回的 `Promise` 要等内容全部下载完才完成。

```js
const res = await fetch('https://httpbin.org/get');   // 状态码和响应头到了
console.log(res.status);                               // 立刻可用
const data = await res.json();                         // 这里等内容下载完
```

所以可以先看状态码和响应头，再决定要不要读内容。

## 成员说明

### `fetch()`

```js
fetch(input)
fetch(input, init)
```

| 参数 | 类型 | 必填 | 含义 |
| --- | --- | --- | --- |
| `input` | 字符串、[`URL`](url.md) 或 `Request` | 是 | 请求的地址，必须是完整的 URL |
| `init` | 对象 | 否 | 请求的选项，见下表 |

`init` 的字段：

| 字段 | 类型 | 默认值 | 含义 |
| --- | --- | --- | --- |
| `method` | 字符串 | `'GET'` | 请求方法：`'GET'`、`'POST'`、`'PUT'`、`'DELETE'` 等 |
| `headers` | 普通对象或 [`Headers`](url.md) | 无 | 请求头 |
| `body` | 字符串或 `null` | `null` | 请求体。非字符串的值会被转成字符串 |
| `signal` | `AbortSignal` 或 `null` | `null` | 用来取消请求 |

- **返回**：`Promise`，完成时得到 `Response`。
- **出错**：见[两种失败](#两种失败)。

### `Response`

`fetch()` 返回的响应。以下属性都只读。

| 属性 | 类型 | 含义 |
| --- | --- | --- |
| `ok` | 布尔 | 状态码在 200 到 299 之间时为 `true` |
| `status` | 数字 | 状态码，比如 `200`、`404` |
| `statusText` | 字符串 | 状态码对应的文字 |
| `headers` | [`Headers`](url.md) | 响应头 |
| `url` | 字符串 | 响应来自的地址。发生过重定向时是最终的地址 |
| `bodyUsed` | 布尔 | 响应内容是否已经读过 |
| `redirected` | 布尔 | 永远是 `false`。重定向由系统处理，这里无法得知 |
| `type` | 字符串 | 永远是 `'basic'` |

| 方法 | 返回 |
| --- | --- |
| `json()` | `Promise`，得到解析好的值。内容不是合法 JSON 时被拒绝 |
| `text()` | `Promise`，得到字符串 |
| `arrayBuffer()` | `Promise`，得到 `ArrayBuffer` |
| `blob()` | `Promise`，得到 `Blob` |

四个方法在内容已经读过时都被拒绝：`TypeError: Body has already been read`。

`url` 在重定向后是最终地址、`json()` 遇到非法 JSON 被拒绝，这两点**未在模拟器验证**。

### `Request`

把一次请求的地址和选项打包成一个对象。直接给 `fetch()` 传地址和选项就够用，很少需要它。

```js
const req = new Request('https://httpbin.org/post', { method: 'POST', body: 'hello' });
const res = await fetch(req);
```

| 成员 | 类型 | 可读 | 可写 | 含义 |
| --- | --- | --- | --- | --- |
| `url` | 字符串 | 是 | 否 | 请求的地址 |
| `method` | 字符串 | 是 | 否 | 请求方法 |
| `headers` | [`Headers`](url.md) | 是 | 否 | 请求头 |
| `clone()` | 方法 | — | — | 返回一份副本 |

`Request` 也有 `bodyUsed` 和四个读取方法，用法和 `Response` 相同。

构造时地址不是完整的 URL 会抛 `TypeError`，信息以 `Invalid URL:` 开头。

### `Blob`

一块不可修改的二进制数据。它的内容不放在 JS 的内存里，所以拿着一个很大的 `Blob` 不会增加 JS 的内存压力。需要读内容时再调用它的方法。

```js
new Blob(parts)
new Blob(parts, { type })
```

| 参数 | 类型 | 含义 |
| --- | --- | --- |
| `parts` | 数组，元素是字符串、`ArrayBuffer` 或类型化数组 | 按顺序拼接成内容。字符串按 UTF-8 编码 |
| `type` | 字符串 | 内容的类型，比如 `'image/png'`。默认是空字符串 |

| 成员 | 类型 | 含义 |
| --- | --- | --- |
| `size` | 数字，只读 | 字节数 |
| `type` | 字符串，只读 | 内容的类型 |
| `arrayBuffer()` | 方法 | 返回 `Promise`，得到 `ArrayBuffer` |
| `text()` | 方法 | 返回 `Promise`，得到按 UTF-8 解码的字符串 |

`Blob` 可以交给这些 API：[`UIImage.imageWithData()`](ui-image.md) 生成图片，[`application.fileSystem`](filesystem.md) 的 `writeBytes()` 写进文件，[`application.keychain`](keychain.md) 的 `setBytes()` 存进钥匙串。

### `AbortController` 和 `AbortSignal`

用来取消请求。`AbortController` 是发出取消指令的一方，它的 `signal` 交给 `fetch()`。

```js
const controller = new AbortController();
controller.signal.addEventListener('abort', () => {
  console.log('已取消');
});
controller.abort();
```

**结果**：输出 `已取消`。

`AbortController`：

| 成员 | 含义 |
| --- | --- |
| `new AbortController()` | 创建。没有参数 |
| `signal` | 只读。对应的 `AbortSignal` |
| `abort(reason)` | 取消。`reason` 可选，是任意值，会成为 `signal.reason`。重复调用没有效果 |

`AbortSignal` 不能用 `new` 创建，从下面三处得到：

| 来源 | 得到什么 |
| --- | --- |
| `controller.signal` | 由 `controller.abort()` 控制 |
| `AbortSignal.timeout(ms)` | 过了 `ms` 毫秒自动取消 |
| `AbortSignal.abort(reason)` | 一个已经处于取消状态的信号。把它交给 `fetch()`，请求不会发出 |

| 成员 | 类型 | 含义 |
| --- | --- | --- |
| `aborted` | 布尔，只读 | 是否已经取消 |
| `reason` | 任意值，只读 | 取消的原因。没有指定时是一个 `name` 为 `'AbortError'` 的 `Error` |
| `throwIfAborted()` | 方法 | 已取消时抛出 `reason`，否则什么都不做 |
| `abort` 事件 | — | 取消时派发一次。用 `addEventListener('abort', …)` 监听 |

## 和浏览器的对照

`fetch` 这一组是 Web 标准里的接口，不是 iOS 原生 API 的映射，所以这里对照的是浏览器。

| 浏览器 | Nacre |
| --- | --- |
| `await fetch(url, init)` | 相同。`url` 必须是完整地址 |
| `res.ok`、`res.status`、`res.headers` | 相同 |
| `res.json()`、`res.text()`、`res.arrayBuffer()`、`res.blob()` | 相同 |
| `AbortController`、`AbortSignal.timeout()` | 相同 |
| 取消时抛出 `DOMException` | 抛出 `name` 为 `'AbortError'` 的 `Error`。没有 `DOMException` 这个类 |
| `init.body` 可以是 `FormData`、`Blob`、`ArrayBuffer` | 只能是字符串 |
| `res.body`（流） | 没有 |
| `res.formData()`、`res.clone()` | 没有 |
| `init.mode`、`init.credentials`、`init.cache`、`init.redirect` | 没有 |
| CORS 预检、同源策略 | 没有，可以请求任何地址 |

## 还不能做的

| 想做的事 | 状态 |
| --- | --- |
| 上传文件或二进制数据（请求体用 `Blob`、`ArrayBuffer`、`FormData`） | 未实现 |
| 边下载边处理，或显示下载进度 | 未实现。内容要全部下载完才能读到 |
| 用几个 `Blob` 拼成一个新的 `Blob` | 未实现 |
| 禁止自动跟随重定向，或得知是否发生过重定向 | 未实现 |
| 控制缓存策略 | 未实现 |
| 实时双向通信（WebSocket） | 未实现 |

## 参见

- [`URL` / `Headers`](url.md)：地址和请求头
- [`UIImage`](ui-image.md)：把下载的 `Blob` 变成图片
- [定时器](timers.md)
- [运行时怎么工作](how-it-works.md)：为什么请求不会卡住界面
- [实现原理：网络](../internals/network.md)
