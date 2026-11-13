---
type: reference
status: partial
---

# `fetch` / `Request` / `Response`

**`fetch()`** 发出一个 HTTP 请求，返回一个 `Promise`。服务器开始响应时，这个 `Promise` 完成，得到一个 **`Response`** 对象：上面有状态码和响应头，以及读取响应内容的方法。

请求在后台进行。等待期间 JS 继续执行，界面照常响应。请求不依赖界面，App 启动后在任何地方都可以发，包括文件顶层，不用等 `sceneconnect`。

这一页还包括和请求一起使用的几个对象：**`Request`** 把一次请求的地址和选项保存成一个对象；**[`Blob`](#blob)** 表示一块不可修改的二进制数据；**`AbortController`** 用来取消请求。

## 地址怎么写

地址必须是完整的 URL，带协议和主机名，比如 `https://api.example.com/items`。`fetch('/api/items')` 这种相对地址没有可以参照的基准地址，`Promise` 被拒绝，错误是 `TypeError`。

`fetch()` 可以请求任何服务器。请求不受跨域规则限制，服务器不需要返回 CORS 响应头，也不会先发预检请求。

地址用 `https://`。iOS 默认拦截发往明文 `http://` 地址的请求，CLI 生成的工程没有放开这条限制。`fetch()` 请求 `http://` 地址的结果**未在模拟器验证**；同一条限制下，[`WebView`](web-view.md) 加载 `http://` 地址实测被拦截。

## 请求什么时候算失败

请求可能在两个层面失败，表现不同。

| | 发生了什么 | `fetch()` 的表现 | 怎么处理 |
| --- | --- | --- | --- |
| 网络层失败 | 没有网络、域名解析不了、连不上服务器、请求被取消、地址不合法 | `Promise` 被拒绝，`await` 处抛异常 | `try` / `catch` |
| 服务器返回错误 | 服务器收到了请求，返回 404、500 这类状态码 | `Promise` 正常完成，`res.ok` 是 `false` | 检查 `res.ok` 或 `res.status` |

服务器返回 404 或 500 时 `fetch()` 不抛异常。只写 `try` / `catch` 发现不了 404，只检查 `res.ok` 发现不了断网，两处都要写。写法见[推荐的做法](#推荐的做法)。

网络层失败时抛出的异常：

| 情况 | 异常 |
| --- | --- |
| 连不上、没有网络、域名解析不了 | `TypeError`，`message` 是 `Network request failed: ` 加系统给的说明。说明的语言跟随系统，只适合打日志 |
| 地址不是完整的 URL | `TypeError`，`message` 以 `Invalid URL:` 开头 |
| 请求进行中被取消，或 `AbortSignal.timeout()` 到时间 | `name` 是 `'AbortError'` 的 `Error`，`message` 是 `The operation was aborted` |
| 交给 `fetch()` 的 `signal` 在调用之前已经取消 | `signal.reason` 本身 |

状态码和响应头到达之后，网络仍然可能中断。那时 `fetch()` 的 `Promise` 已经完成，失败出现在读取内容的那一步：`res.json()`、`res.text()` 等方法返回的 `Promise` 被拒绝，异常和上表相同。

## 超时

运行时不给请求另设超时，使用系统的默认值。iOS 的文档给出的默认值是连续 60 秒没有收到数据就失败，这个数值**未在模拟器验证**。

要更短的超时，把 `AbortSignal.timeout(毫秒数)` 交给 `signal`。到时间后请求被取消，`Promise` 以 `AbortError` 被拒绝。超时和手动取消得到的异常相同，都是 `AbortError`，从异常上区分不出是哪一种。

## 请求自动带上什么

- **cookie**。`fetch()` 的 cookie 由系统管理：服务器用 `Set-Cookie` 写的 cookie 被保存下来，之后发往同一站点的请求自动带上。**未在模拟器验证。** 这份 cookie 和 [`WebView`](web-view.md) 里网页的 cookie 是分开的两份（实测）：用户在网页里登录，不会让 `fetch()` 带上登录状态，反过来也一样。
- **重定向**。服务器返回 301、302 时，系统自动请求新的地址，`fetch()` 得到的是最终的响应。`res.url` 是最终的地址（**未在模拟器验证**）。不能禁止跟随，`res.redirected` 永远是 `false`。
- **缓存**。缓存按系统的默认规则处理，不能按请求控制。具体表现**未在模拟器验证**。

`Host`、`Cookie`、`Origin` 这些请求头都可以在 `headers` 里自己设置，没有不允许设置的请求头。

## 响应内容占多少内存

响应内容全部下载到内存里，下载完才能读到。不能边下载边处理，不能直接下载到文件，也得不到下载进度。

- 下载的内容一直留在内存里，直到 `Response` 对象不再被任何变量引用并被回收。
- 拿到 `Response` 之后不需要内容时，用 `AbortController` 取消请求，下载立即停止。
- 用 `blob()` 读取时，内容不进入 JS 的内存。`text()` 和 `json()` 会在下载的内容之外再生成一份字符串。

## 同时能发多少个请求

运行时不限制同时进行的请求数量，请求之间互不等待。实测同时发出 10 个请求，总耗时小于单个请求的 4 倍。对同一个服务器同时建立多少个连接由系统决定，这个上限没有测量过。

## App 进入后台之后

iOS 在 App 进入后台后很快会暂停它的运行。那时还没完成的请求是继续、暂停还是失败，**未在模拟器验证**。必须完成的请求，回到前台后检查结果，失败了重发。

## 推荐的做法

**把两种失败和超时写在一个函数里，所有请求都经过它。** 这样每个调用的地方只需要处理一种异常。

```js
/**
 * @param {string} url
 * @param {RequestInit} [init]
 */
async function request(url, init) {
  let res;
  let data;
  try {
    // 15 秒内没有完成就放弃。调用方给了自己的 signal 时以调用方的为准
    res = await fetch(url, { signal: AbortSignal.timeout(15000), ...init });
    if (res.ok) data = await res.json();
  } catch (err) {
    if (err instanceof SyntaxError) throw new Error('服务器返回的不是 JSON');
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('请求超时或被取消');
    }
    throw new Error('网络不通');
  }
  if (!res.ok) {
    throw new Error('服务器返回 ' + res.status);
  }
  return data;
}

request('https://httpbin.org/get')
  .then((data) => console.log(data.url))
  .catch((err) => console.log(err.message));
```

**结果**

- 请求成功时输出 `https://httpbin.org/get`。
- 没有网络或连不上服务器时输出 `网络不通`。
- 服务器返回 404 时输出 `服务器返回 404`。
- 15 秒内没有下载完时输出 `请求超时或被取消`。
- 内容不是合法的 JSON 时输出 `服务器返回的不是 JSON`。

另外三条：

- **文件和图片用 `blob()` 读。** 内容不进入 JS 的内存，拿到后直接交给 [`UIImage.imageWithData()`](ui-image.md) 或 [`application.fileSystem`](filesystem.md) 的 `writeBytes()`。只有要自己逐字节处理时才用 `arrayBuffer()`。
- **不再需要的请求要取消。** 用户离开页面或者发起了新的搜索时，用 `AbortController` 取消旧请求。不取消的话它会继续下载，下载的内容留在内存里。
- **读内容之前先检查 `res.ok`。** 服务器返回错误时，内容通常是一段错误说明，不是预期的数据。

## 完整例子

下面的代码请求一个返回 JSON 的地址，把结果输出到控制台。整段可以直接写在 `main.js` 的顶层。

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
- 没有网络或连不上服务器时，输出 `请求没有发出去或没有收到响应：` 加一段错误说明。

四步分别是：发请求、检查状态、读内容、处理失败。第 2 步和第 4 步处理的是两种不同的失败，见[请求什么时候算失败](#请求什么时候算失败)。

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

内容不是合法的 JSON 时，`res.json()` 返回的 `Promise` 以 `SyntaxError` 被拒绝。

### 判断请求是否成功

```js
const res = await fetch('https://httpbin.org/status/404');
console.log(res.ok);       // false
console.log(res.status);   // 404
```

**结果**：这段代码不会抛异常。服务器返回 404 或 500 时，`fetch()` 仍然成功，只是 `res.ok` 是 `false`。

`res.ok` 在状态码是 200 到 299 时为 `true`。

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

普通对象不能直接当 `body`：它会被转成字符串 `[object Object]` 发出去，不报错。要先用 `JSON.stringify()` 转成字符串。字符串里的中文按 UTF-8 发送。

`Content-Type` 要自己写。字符串 `body` 不写时，发出去的是 `text/plain;charset=UTF-8`，服务器不会把它当 JSON 解析。

`body` 能接受哪些值见[成员说明](#fetch)。

### 上传二进制数据

`body` 可以是类型数组、`ArrayBuffer` 或 [`Blob`](#blob)，字节原样发送。

```js
const bytes = new Uint8Array([0, 255, 16, 128]);
const res = await fetch('https://httpbin.org/post', {
  method: 'POST',
  headers: { 'Content-Type': 'application/octet-stream' },
  body: bytes,
});
const echo = await res.json();
console.log(echo.data);
```

**结果**：输出 `data:application/octet-stream;base64,AP8QgA==`。四个字节原样到了服务器。这个测试地址把二进制内容用 base64 回显。

> **注意**：`body` 是类型数组或 `ArrayBuffer` 时，要自己写 `Content-Type`。不写的话系统会填上 `application/x-www-form-urlencoded`，服务器会把这些字节当成表单来解析（实测）。

`body` 是 `Blob` 时，`Blob` 的 `type` 会成为 `Content-Type`，不用另外写：

```js
const bytes = new Uint8Array([0, 255, 16, 128]);
const blob = new Blob([bytes], { type: 'application/octet-stream' });
const res = await fetch('https://httpbin.org/post', { method: 'POST', body: blob });
const echo = await res.json();
console.log(echo.headers['Content-Type']);
```

**结果**：输出 `application/octet-stream`。

### 上传一个文件

先用 [`application.fileSystem`](filesystem.md) 的 `readBytes()` 把文件读成 `ArrayBuffer`，再当 `body` 发送。

```js
const path = application.fileSystem.documents + '/photo.jpg';
const bytes = await application.fileSystem.readBytes(path);
const res = await fetch('https://httpbin.org/post', {
  method: 'POST',
  headers: { 'Content-Type': 'image/jpeg' },
  body: bytes,
});
console.log(res.status);
```

**结果**：文件的字节作为请求体发出，输出 `200`。**这个例子未在模拟器验证。**

整个文件会先读进内存。上传期间得不到进度。服务器要求表单格式（`multipart/form-data`）的上传接口现在用不了，见[还不能做的](#还不能做的)。

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

`headers` 可以是普通对象，也可以是 [`Headers`](url.md) 对象。请求头的名字里有不合法的字符，或者值里有换行时，`fetch()` 的 `Promise` 被拒绝。

### 读响应头

```js
const res = await fetch('https://httpbin.org/get');
console.log(res.headers.get('content-type'));
console.log(res.headers.get('CONTENT-TYPE'));
```

**结果**：两行都输出 `application/json`。响应头的名字不区分大小写。

服务器返回了多个同名的响应头时，`get()` 得到用 `, ` 连接起来的一个字符串。

### 取回文本

```js
const res = await fetch('https://httpbin.org/range/16');
const text = await res.text();
console.log(text);
```

**结果**：输出 `abcdefghijklmnop`。

`text()` 一律按 UTF-8 解码，不看响应头里声明的编码。内容不是合法的 UTF-8 时得到空串 `''`，不报错。其它编码的文本用 `arrayBuffer()` 读出字节，自己解码。

### 下载一张图片并显示

```js
const res = await fetch('https://httpbin.org/image/png');
const blob = await res.blob();
const image = UIImage.imageWithData(blob);
console.log(blob.size, image !== null);
```

**结果**：输出图片的字节数和 `true`。`image` 可以赋给 `UIImageView` 的 `image` 属性，见 [`UIImage`](ui-image.md)。内容不是图片时 `image` 是 `null`。

### 把下载的内容存成文件

```js
const res = await fetch('https://httpbin.org/bytes/1024');
const blob = await res.blob();
const path = application.fileSystem.documents + '/data.bin';
await application.fileSystem.writeBytes(path, blob);
console.log(blob.size);
```

**结果**：输出 `1024`。文档目录里多了一个 1024 字节的文件 `data.bin`。**这个例子未在模拟器验证。**

内容从下载到写入文件都不进入 JS 的内存。下载期间整个文件仍然在 App 的内存里，见[响应内容占多少内存](#响应内容占多少内存)。

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

setTimeout(() => controller.abort(), 200);

try {
  await promise;
} catch (err) {
  console.log(err instanceof Error ? err.name : err);
}
```

**结果**：200 毫秒后输出 `AbortError`。请求被真正取消，不再占用网络。

一个 `controller.signal` 可以交给多个请求，`abort()` 一次全部取消。已经完成的请求不受影响。

### 给请求设超时

```js
try {
  await fetch('https://httpbin.org/delay/5', { signal: AbortSignal.timeout(300) });
} catch (err) {
  console.log(err instanceof Error ? err.name : err);
}
```

**结果**：300 毫秒后请求被取消，输出 `AbortError`。

`AbortSignal.timeout()` 的参数单位是毫秒。计时从调用 `AbortSignal.timeout()` 的那一刻开始，不是从发请求开始。时间包括下载内容的时间：`fetch()` 已经返回、内容还没读完时到了时间，读取内容的那一步被拒绝。

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

**结果**：三个请求同时发出，全部完成后输出 `3`。

其中一个请求在网络层失败时，`Promise.all` 整体被拒绝，其余请求的结果拿不到。要分别得到每个请求的结果，用 `Promise.allSettled`。

### 自己创建一块数据

```js
const blob = new Blob(['前缀-', '后缀'], { type: 'text/plain' });
console.log(blob.size, blob.type);
console.log(await blob.text());
```

**结果**：输出 `13 text/plain` 和 `前缀-后缀`。`size` 是 UTF-8 编码后的字节数，一个汉字占 3 个字节。

## 概念

### 四种读法怎么选

响应内容有四个读取方法，都返回 `Promise`。

| 方法 | 得到什么 | 什么时候用 | 内存 |
| --- | --- | --- | --- |
| `json()` | 解析好的值 | 接口返回的 JSON | 在下载的内容之外，再生成一份字符串和解析出的对象 |
| `text()` | 字符串 | 文本、HTML | 在下载的内容之外，再生成一份字符串 |
| `arrayBuffer()` | `ArrayBuffer` | 要自己逐字节处理的二进制数据 | 不生成字符串 |
| `blob()` | [`Blob`](#blob) | 图片、视频、文件，拿到后直接交给别的 API | 不生成字符串，内容不进入 JS 的内存 |

下载和文本的解码都在后台进行，等待期间界面照常响应。

### 响应内容只能读一次

```js
const res = await fetch('https://httpbin.org/get');
await res.json();
console.log(res.bodyUsed);   // true
try {
  await res.json();
} catch (err) {
  console.log(err instanceof Error ? err.message : err);
}
```

**结果**：输出 `true` 和 `Body has already been read`。四个读取方法共用这一次机会，读过任何一个之后其余的都不能再读。

需要用两次的话，把第一次读出的结果存进变量。`Response` 没有 `clone()`。

### 响应分两步到达

`await fetch()` 在服务器开始响应、状态码和响应头到达时就返回，这时响应内容可能还在下载。读取方法返回的 `Promise` 要等内容全部下载完才完成。

```js
const res = await fetch('https://httpbin.org/get');   // 状态码和响应头到了
console.log(res.status);                               // 立刻可用
const data = await res.json();                         // 这里等内容下载完
```

**结果**：输出 `200`。`data` 在内容下载完之后得到。

所以可以先看状态码和响应头，再决定要不要读内容。决定不读时取消请求，见[响应内容占多少内存](#响应内容占多少内存)。

## 成员说明

### `fetch()`

```text
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
| `method` | 字符串 | `'GET'` | 请求方法：`'GET'`、`'POST'`、`'PUT'`、`'DELETE'` 等。小写会被转成大写 |
| `headers` | 普通对象或 [`Headers`](url.md) | 无 | 请求头 |
| `body` | 见下表，或 `null` | `null` | 请求体。`null` 表示没有请求体 |
| `signal` | `AbortSignal` 或 `null` | `null` | 用来取消请求 |

`input` 是 `Request` 时，`init` 里给了的字段以 `init` 为准，没给的沿用 `Request` 的。

`body` 可以是下面这些值。没有写 `Content-Type` 请求头时，按 `body` 的种类补一个默认的：

| `body` 的值 | 发送的内容 | 默认的 `Content-Type` |
| --- | --- | --- |
| 字符串 | 按 UTF-8 编码的文字 | `text/plain;charset=UTF-8` |
| [`Blob`](#blob) | `Blob` 里的字节 | `Blob` 的 `type`。`type` 是空串时不补 |
| `ArrayBuffer`、类型数组 | 这些字节 | 不补 |
| [`URLSearchParams`](url.md) | 它序列化之后的字符串，形如 `a=1&b=2` | `application/x-www-form-urlencoded;charset=UTF-8` |
| 其它值（数、布尔、普通对象） | 按 `String()` 转成的字符串。普通对象会变成 `[object Object]` | `text/plain;charset=UTF-8` |

- 自己写了 `Content-Type` 时，不会被默认值覆盖。
- 表里「不补」的情况下，系统会自己填上 `application/x-www-form-urlencoded`（实测）。所以发二进制数据时要自己写 `Content-Type`。

- **返回**：`Promise`，完成时得到 `Response`。
- **出错**：见[请求什么时候算失败](#请求什么时候算失败)。

### `Response`

`fetch()` 返回的响应。以下属性都可读、不可写。

| 属性 | 类型 | 含义 |
| --- | --- | --- |
| `ok` | 布尔 | 状态码在 200 到 299 之间时为 `true`，否则为 `false` |
| `status` | 数字 | 状态码，比如 `200`、`404` |
| `statusText` | 字符串 | `fetch()` 得到的响应上永远是空串 `''`。自己创建的 `Response` 上是创建时给的值 |
| `headers` | [`Headers`](url.md) | 响应头 |
| `url` | 字符串 | 响应来自的地址。发生过重定向时是最终的地址（**未在模拟器验证**）。自己创建的 `Response` 上是空串 |
| `bodyUsed` | 布尔 | 响应内容已经读过时为 `true`，否则为 `false` |
| `redirected` | 布尔 | 永远是 `false`。重定向由系统处理，这里无法得知 |
| `type` | 字符串 | 永远是 `'basic'` |

这些属性的值在 `Response` 创建之后不再变化，只有 `bodyUsed` 在读取内容时变成 `true`。它没有变化事件：读取是代码自己发起的。

| 方法 | 返回 |
| --- | --- |
| `json()` | `Promise`，得到解析好的值。内容不是合法 JSON 时以 `SyntaxError` 被拒绝 |
| `text()` | `Promise`，得到按 UTF-8 解码的字符串。内容不是合法的 UTF-8 时得到空串 |
| `arrayBuffer()` | `Promise`，得到 `ArrayBuffer` |
| `blob()` | `Promise`，得到 `Blob`。它的 `type` 是空串，不取响应头里的 `Content-Type` |

四个方法在内容已经读过时都被拒绝：`TypeError: Body has already been read`。下载中途网络中断或请求被取消时也被拒绝，异常见[请求什么时候算失败](#请求什么时候算失败)。

`Response` 也可以自己创建，用来在测试里代替一次真实的请求：

```js
const res = new Response('{"ok":true}', {
  status: 201,
  headers: { 'Content-Type': 'application/json' },
});
console.log(res.status);
const data = await res.json();
console.log(data.ok);
```

**结果**：输出 `201` 和 `true`。

```text
new Response()
new Response(body)
new Response(body, init)
```

| 参数 | 类型 | 默认值 | 含义 |
| --- | --- | --- | --- |
| `body` | 和 [`fetch()` 的 `body`](#fetch) 相同，或 `null` | `null` | 响应的内容。`null` 表示没有内容 |
| `init.status` | 数字 | `200` | 状态码 |
| `init.statusText` | 字符串 | `''` | 状态码对应的文字 |
| `init.headers` | 普通对象或 [`Headers`](url.md) | 无 | 响应头。没有写 `Content-Type` 时按 `body` 的种类补默认值，规则和 `fetch()` 的 `body` 相同 |

没有内容的 `Response`（`body` 是 `null`，或者没给）读取时的结果：

| 方法 | 结果 |
| --- | --- |
| `text()` | 空串 `''` |
| `arrayBuffer()` | 长度为 0 字节的 `ArrayBuffer` |
| `blob()` | `size` 为 0 的 `Blob` |
| `json()` | 被拒绝，`SyntaxError`。空串不是合法的 JSON |

这种情况下 `bodyUsed` 保持 `false`，可以重复读。空串 `''` 不算「没有内容」：它是一份长度为 0 的内容，读过一次之后 `bodyUsed` 是 `true`。

### `Request`

`Request` 把一次请求的地址和选项保存成一个对象。直接给 `fetch()` 传地址和选项就能发请求；需要把一次请求先准备好、之后再发或者交给别的函数时，用 `Request`。

```js
const req = new Request('https://httpbin.org/post', { method: 'POST', body: 'hello' });
const res = await fetch(req);
const echo = await res.json();
console.log(echo.data);
```

**结果**：输出 `hello`。请求带着 `Request` 里的方法和请求体发出。

```text
new Request(input)
new Request(input, init)
```

参数和 [`fetch()`](#fetch) 相同，其中 `signal` 不保存在 `Request` 上：取消请求用的 `signal` 要在调用 `fetch(req, { signal })` 时给。

| 成员 | 类型 | 可读 | 可写 | 含义 |
| --- | --- | --- | --- | --- |
| `url` | 字符串 | 是 | 否 | 请求的地址，规范化之后的完整 URL |
| `method` | 字符串 | 是 | 否 | 请求方法，大写 |
| `headers` | [`Headers`](url.md) | 是 | 否 | 请求头 |
| `clone()` | 方法 | — | — | 返回一份独立的副本。副本的请求体也能读、也能发送 |

`Request` 也有 `bodyUsed` 和四个读取方法，读出来的是构造时给的 `body`：

```js
const req = new Request('https://httpbin.org/post', { method: 'POST', body: 'hello' });
console.log(await req.text());
console.log(req.bodyUsed);
```

**结果**：输出 `hello` 和 `true`。

- 没有请求体的 `Request`（比如 `GET` 请求）读取时的结果和[没有内容的 `Response`](#response) 相同。
- 第一个参数可以是另一个 `Request`，新的对象沿用它的地址、方法、请求头和请求体。`init` 里给了的字段以 `init` 为准。
- 把 `Request` 交给 `fetch()` 不会把它的 `bodyUsed` 变成 `true`。同一个带请求体的 `Request` 交给 `fetch()` 多次，**未在模拟器验证**。
- **出错**：
  - 地址不是完整的 URL：`TypeError`，信息以 `Invalid URL:` 开头
  - 请求体已经读过之后调 `clone()`：`TypeError: Cannot clone a Request whose body has already been read`
  - 第一个参数是请求体已经读过的 `Request`，并且 `init` 里没有给新的 `body`：`TypeError: Cannot construct a Request from a Request whose body has already been read`

### `Blob`

`Blob` 表示一块不可修改的二进制数据。它的内容不放在 JS 的内存里，JS 这边只有 `size` 和 `type`。需要读内容时调用它的方法。

`Blob` 有两个来源：`res.blob()` 得到下载的内容，`new Blob(parts)` 用手头的字符串或字节创建。

```text
new Blob()
new Blob(parts)
new Blob(parts, { type })
```

| 参数 | 类型 | 含义 |
| --- | --- | --- |
| `parts` | 数组，元素是字符串、`ArrayBuffer` 或类型数组 | 按顺序拼接成内容。字符串按 UTF-8 编码。不给时内容为空 |
| `type` | 字符串 | 内容的类型，比如 `'image/png'`。默认是空字符串 |

`parts` 的元素不能是 `Blob`：`new Blob([blob])` 抛 `TypeError: Blob parts cannot be Blobs yet`。

| 成员 | 类型 | 含义 |
| --- | --- | --- |
| `size` | 数字，可读、不可写 | 字节数 |
| `type` | 字符串，可读、不可写 | 内容的类型 |
| `arrayBuffer()` | 方法 | 返回 `Promise`，得到 `ArrayBuffer` |
| `text()` | 方法 | 返回 `Promise`，得到按 UTF-8 解码的字符串 |

`Blob` 的两个方法可以调用任意多次，没有「只能读一次」的限制。

`Blob` 可以交给这些 API：[`fetch()`](#fetch) 当请求体发送，[`UIImage.imageWithData()`](ui-image.md) 生成图片，[`application.fileSystem`](filesystem.md) 的 `writeBytes()` 写进文件，[`application.keychain`](keychain.md) 的 `setBytes()` 存进钥匙串。

### `AbortController` 和 `AbortSignal`

`AbortController` 用来取消请求。它是发出取消指令的一方，它的 `signal` 交给 `fetch()`。

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
| `signal` | 可读、不可写。对应的 `AbortSignal`，每次读是同一个对象 |
| `abort(reason)` | 取消。`reason` 可选，是任意值，会成为 `signal.reason`。重复调用没有效果，`abort` 事件不会再派发 |

取消之后不能恢复。要再发请求，新建一个 `AbortController`。

`AbortSignal` 不能用 `new` 创建：`new AbortSignal()` 抛 `TypeError: AbortSignal cannot be constructed directly, use new AbortController()`。它从下面三处得到：

| 来源 | 得到什么 |
| --- | --- |
| `controller.signal` | 由 `controller.abort()` 控制 |
| `AbortSignal.timeout(ms)` | 过了 `ms` 毫秒自动取消。它的 `reason` 是一个 `name` 为 `'TimeoutError'` 的 `Error` |
| `AbortSignal.abort(reason)` | 一个已经处于取消状态的信号。把它交给 `fetch()`，请求立即被取消，`Promise` 以 `reason` 被拒绝 |

| 成员 | 类型 | 含义 |
| --- | --- | --- |
| `aborted` | 布尔，可读、不可写 | 已经取消时为 `true`，否则为 `false` |
| `reason` | 任意值，可读、不可写 | 取消的原因。取消之前是 `undefined`。取消时没有指定原因的，是一个 `name` 为 `'AbortError'` 的 `Error` |
| `throwIfAborted()` | 方法 | 已取消时抛出 `reason`，否则什么都不做 |
| `abort` 事件 | — | 取消时派发一次。用 `addEventListener('abort', …)` 监听 |

> **注意**：请求进行中被取消时，`fetch()` 抛出的不是 `signal.reason`，而是一个新的 `AbortError`。所以 `AbortSignal.timeout()` 到时间后 `signal.reason.name` 是 `'TimeoutError'`，`fetch()` 抛出的异常的 `name` 是 `'AbortError'`。判断请求是否被取消，看异常的 `name` 是不是 `'AbortError'`。

## 和浏览器的对照

`fetch` 这一组接口的名字和浏览器里的相同。这张表给熟悉浏览器写法的人查差别。

| 浏览器 | Nacre |
| --- | --- |
| `await fetch(url, init)` | 相同。`url` 必须是完整地址 |
| `res.ok`、`res.status`、`res.headers` | 相同 |
| `res.statusText` | `fetch()` 得到的响应上永远是空串 |
| `res.json()`、`res.text()`、`res.arrayBuffer()`、`res.blob()` | 相同 |
| `res.text()` 按响应声明的编码解码，不合法的字节换成替换字符 | 一律按 UTF-8 解码，不合法时得到空串 |
| `res.blob()` 的 `type` 取自 `Content-Type` | `type` 是空串 |
| `AbortController`、`AbortSignal.timeout()` | 相同 |
| 取消时抛出 `signal.reason`，默认是 `DOMException` | 抛出 `name` 为 `'AbortError'` 的 `Error`。没有 `DOMException` 这个类 |
| `AbortSignal.timeout()` 到时间后 `fetch()` 抛出 `TimeoutError` | 抛出 `AbortError` |
| `init.body` 可以是字符串、`Blob`、`ArrayBuffer`、类型数组、`URLSearchParams` | 相同 |
| `init.body` 可以是 `FormData`、`ReadableStream` | 没有 |
| `body` 是 `ArrayBuffer` 且没写 `Content-Type` 时，不发这个请求头 | 系统会填上 `application/x-www-form-urlencoded` |
| `new Response(body, init)`、`new Request(input, init)` | 相同 |
| `new Blob([blob])` | 抛 `TypeError` |
| `res.body`（流） | 没有 |
| `res.formData()`、`res.clone()` | 没有 |
| `init.mode`、`init.credentials`、`init.cache`、`init.redirect` | 没有，写了不起作用 |
| CORS 预检、同源策略 | 没有，可以请求任何地址 |
| 不允许设置 `Host`、`Cookie` 等请求头 | 都可以设置 |

## 还不能做的

| 想做的事 | 状态 |
| --- | --- |
| 用表单的方式上传文件（请求体用 `FormData`） | 未实现。二进制数据可以直接当 `body` 发送，见[上传二进制数据](#上传二进制数据) |
| 边下载边处理，或显示下载、上传的进度 | 未实现。内容要全部下载完才能读到 |
| 把大文件直接下载到磁盘，不经过内存 | 未实现。对应原生的 `NSURLSessionDownloadTask` |
| App 在后台或退出后继续上传、下载 | 未实现。对应原生的后台 `NSURLSession` |
| 用几个 `Blob` 拼成一个新的 `Blob` | 未实现 |
| 禁止自动跟随重定向，或得知是否发生过重定向 | 未实现 |
| 控制缓存策略 | 未实现 |
| 读取、清除 `fetch()` 保存的 cookie | 未实现。对应原生的 `NSHTTPCookieStorage`。单个响应的 `Set-Cookie` 可以用 `res.headers.getSetCookie()` 读到 |
| 设置系统默认的超时时间 | 未实现。用 `AbortSignal.timeout()` |

## 参见

- [`URL` / `Headers`](url.md)：地址和请求头
- [`UIImage`](ui-image.md)：把下载的 `Blob` 变成图片
- [文件读写](filesystem.md)：把下载的 `Blob` 写进文件，读出文件用来上传
- [`WebView`](web-view.md)：需要显示网页时用它。它的 cookie 和 `fetch()` 的不通
- [WebSocket](websocket.md)：需要服务器主动推送数据时用它
- [定时器](timers.md)：`AbortSignal.timeout()` 之外的定时
- [运行时怎么工作](how-it-works.md)：为什么请求不会卡住界面
- [实现原理：网络](../internals/network.md)
