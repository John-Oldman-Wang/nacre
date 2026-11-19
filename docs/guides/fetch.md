# 从网络取数据

这一篇讲怎么用 [`fetch()`](../api/fetch.md) 发 HTTP 请求：取回 JSON、发送数据、上传和下载文件、处理失败、取消和超时。涉及的类是 [`Response`](../api/response.md)、[`Request`](../api/request.md)、[`Blob`](../api/blob.md)、[`AbortController`](../api/abort-controller.md) 和 [`AbortSignal`](../api/abort-signal.md)。大文件、下载进度和服务器持续推送的内容见[边下载边读响应](streaming-response.md)。

下面的例子都写在 `async` 函数里：`await` 只能写在 `async` 函数里，文件顶层不能直接写。

## 推荐的做法

**把两种失败和超时写在一个函数里，所有请求都经过它。** 网络不通时 `fetch()` 抛异常；服务器返回 404、500 时 `fetch()` 不抛异常，只是 [`res.ok`](../api/response/ok.md) 是 `false`。两处都要处理，写在一处，每个调用的地方只需要处理一种异常。

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

另外四条：

- **文件和图片用 [`blob()`](../api/response/blob.md) 读。** 内容不进入 JS 的内存，拿到后直接交给 [`UIImage.imageWithData()`](../api/ui-image.md) 或 [`application.fileSystem`](../api/filesystem.md) 的 `writeBytes()`。只有要自己逐字节处理时才用 `arrayBuffer()`。
- **不再需要的请求要取消。** 用户离开页面或者发起了新的搜索时，用 `AbortController` 取消旧请求。不取消的话它会继续下载，下载的内容留在内存里。
- **大文件和不结束的响应用 [`res.body`](../api/response/body.md) 读。** 几十 MB 的文件用整个读的四个方法会全部留在内存里；服务器持续推送的响应永远下载不完，四个方法的 `Promise` 永远不会完成。见[边下载边读响应](streaming-response.md)。
- **读内容之前先检查 `res.ok`。** 服务器返回错误时，内容通常是一段错误说明，不是预期的数据。

## 第一个请求

下面的代码请求一个返回 JSON 的地址，把结果输出到控制台。整段可以直接写在 `main.js` 的顶层，不用等 `sceneconnect`。

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

四步分别是：发请求、检查状态、读内容、处理失败。第 2 步和第 4 步处理的是两种不同的失败，见[请求什么时候算失败](../api/fetch/fetch.md#请求什么时候算失败)。

## 地址要写完整

地址必须是完整的 URL，带协议和主机名，比如 `https://api.example.com/items`。`fetch('/api/items')` 这种相对地址没有可以参照的基准地址，`Promise` 以 `TypeError` 被拒绝。

`fetch()` 可以请求任何服务器。请求不受跨域规则限制，服务器不需要返回 CORS 响应头，也不会先发预检请求。

地址用 `https://`。iOS 默认拦截发往明文 `http://` 地址的请求，CLI 生成的工程没有放开这条限制。`fetch()` 请求 `http://` 地址的结果**未在模拟器验证**；同一条限制下，[`WebView`](../api/web-view.md) 加载 `http://` 地址实测被拦截。

## 请求本机的测试服务

开发时要请求本机或局域网里的 `http://` 服务（比如跑在电脑上的测试服务），在 `nacre.config.json` 里放开本地网络这一项：

```json
{
  "ios": {
    "infoPlist": {
      "NSAppTransportSecurity": { "NSAllowsLocalNetworking": true }
    }
  }
}
```

**结果**：发往 `127.0.0.1` 的 `http://` 请求不再被拦截（模拟器上实测）。按 iOS 的文档，这一项同样放开局域网地址和 `.local` 主机名，其它地址仍然要 `https://`，这两点**未在模拟器验证**。配置文件的写法见[配置 App](project-config.md)。

## 取回 JSON

```js
async function getJson() {
  const res = await fetch('https://httpbin.org/get');
  const data = await res.json();
  console.log(data.url);
}
```

**结果**：输出 `https://httpbin.org/get`。`data` 是解析好的普通对象。

内容不是合法的 JSON 时，`res.json()` 返回的 `Promise` 以 `SyntaxError` 被拒绝。

## 判断请求是否成功

```js
async function checkStatus() {
  const res = await fetch('https://httpbin.org/status/404');
  console.log(res.ok);       // false
  console.log(res.status);   // 404
}
```

**结果**：这段代码不会抛异常。服务器返回 404 或 500 时，`fetch()` 仍然成功，只是 `res.ok` 是 `false`。`res.ok` 在状态码是 200 到 299 时为 `true`。

## 发送 JSON

```js
async function postJson() {
  const res = await fetch('https://httpbin.org/post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'nacre', count: 3 }),
  });
  const echo = await res.json();
  console.log(echo.json.name);
}
```

**结果**：输出 `nacre`。这个测试地址会把收到的内容原样返回。

- 普通对象不能直接当 `body`：它会被转成字符串 `[object Object]` 发出去，不报错。要先用 `JSON.stringify()` 转成字符串。字符串里的中文按 UTF-8 发送。
- `Content-Type` 要自己写。字符串 `body` 不写时，发出去的是 `text/plain;charset=UTF-8`，服务器不会把它当 JSON 解析。

`body` 能接受哪些值见 [`fetch()` 的参数](../api/fetch/fetch.md#参数)。

## 上传二进制数据

`body` 可以是类型数组、`ArrayBuffer` 或 [`Blob`](../api/blob.md)，字节原样发送。

```js
async function postBytes() {
  const bytes = new Uint8Array([0, 255, 16, 128]);
  const res = await fetch('https://httpbin.org/post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: bytes,
  });
  const echo = await res.json();
  console.log(echo.data);
}
```

**结果**：输出 `data:application/octet-stream;base64,AP8QgA==`。四个字节原样到了服务器。这个测试地址把二进制内容用 base64 回显。

> **注意**：`body` 是类型数组或 `ArrayBuffer` 时，要自己写 `Content-Type`。不写的话系统会填上 `application/x-www-form-urlencoded`，服务器会把这些字节当成表单来解析（实测）。

`body` 是 `Blob` 时，`Blob` 的 `type` 会成为 `Content-Type`，不用另外写：

```js
async function postBlob() {
  const bytes = new Uint8Array([0, 255, 16, 128]);
  const blob = new Blob([bytes], { type: 'application/octet-stream' });
  const res = await fetch('https://httpbin.org/post', { method: 'POST', body: blob });
  const echo = await res.json();
  console.log(echo.headers['Content-Type']);
}
```

**结果**：输出 `application/octet-stream`。

## 上传一个文件

先用 [`application.fileSystem`](../api/filesystem.md) 的 `readBytes()` 把文件读成 `ArrayBuffer`，再当 `body` 发送。

```js
async function uploadFile() {
  const path = application.fileSystem.documents + '/photo.jpg';
  const bytes = await application.fileSystem.readBytes(path);
  const res = await fetch('https://httpbin.org/post', {
    method: 'POST',
    headers: { 'Content-Type': 'image/jpeg' },
    body: bytes,
  });
  console.log(res.status);
}
```

**结果**：文件的字节作为请求体发出，输出 `200`。**这个例子未在模拟器验证。**

整个文件会先读进内存。上传期间得不到进度。服务器要求表单格式（`multipart/form-data`）的上传接口现在用不了，见[还不能做的](../api/fetch.md#还不能做的)。

## 带上自定义请求头

```js
async function withHeaders() {
  const res = await fetch('https://httpbin.org/get', {
    headers: {
      'Authorization': 'Bearer abc123',
      'Accept': 'application/json',
    },
  });
  console.log(res.status);
}
```

**结果**：请求带着这两个请求头发出，输出 `200`。

`headers` 可以是普通对象，也可以是 [`Headers`](../api/headers.md) 对象。请求头的名字里有不合法的字符，或者值里有换行时，`fetch()` 的 `Promise` 被拒绝。`Host`、`Cookie`、`Origin` 这些请求头都可以自己设置。

## 读响应头

```js
async function readHeaders() {
  const res = await fetch('https://httpbin.org/get');
  console.log(res.headers.get('content-type'));
  console.log(res.headers.get('CONTENT-TYPE'));
}
```

**结果**：两行都输出 `application/json`。响应头的名字不区分大小写。

服务器返回了多个同名的响应头时，`get()` 得到用 `, ` 连接起来的一个字符串。

## 取回文本

```js
async function getText() {
  const res = await fetch('https://httpbin.org/range/16');
  const text = await res.text();
  console.log(text);
}
```

**结果**：输出 `abcdefghijklmnop`。

`text()` 一律按 UTF-8 解码，不看响应头里声明的编码。内容不是合法的 UTF-8 时得到空串 `''`，不报错。其它编码的文本用 `arrayBuffer()` 读出字节，自己解码。

## 下载一张图片并显示

```js
async function getImage() {
  const res = await fetch('https://httpbin.org/image/png');
  const blob = await res.blob();
  const image = UIImage.imageWithData(blob);
  console.log(blob.size, image !== null);
}
```

**结果**：输出图片的字节数和 `true`。`image` 可以赋给 `UIImageView` 的 `image` 属性，见 [`UIImage`](../api/ui-image.md)。内容不是图片时 `image` 是 `null`。

## 把下载的内容存成文件

```js
async function saveFile() {
  const res = await fetch('https://httpbin.org/bytes/1024');
  const blob = await res.blob();
  const path = application.fileSystem.documents + '/data.bin';
  await application.fileSystem.writeBytes(path, blob);
  console.log(blob.size);
}
```

**结果**：输出 `1024`。文档目录里多了一个 1024 字节的文件 `data.bin`。**这个例子未在模拟器验证。**

内容从下载到写入文件都不进入 JS 的内存。下载期间整个文件仍然在 App 的内存里：整个读的四个方法，下载的内容一直留在内存里，直到 `Response` 不再被任何变量引用并被回收。

## 取回二进制数据自己处理

```js
async function getBytes() {
  const res = await fetch('https://httpbin.org/range/256');
  const buffer = await res.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  console.log(buffer.byteLength, bytes[0]);
}
```

**结果**：输出 `256 97`。`97` 是字母 `a` 的编码。

四种读法的区别见[四种读法怎么选](../api/response.md#四种读法怎么选)。响应内容只能读一次，需要用两次的话把第一次读出的结果存进变量，见[响应内容只能读一次](../api/response.md#响应内容只能读一次)。

## 取消一个请求

```js
async function cancelRequest() {
  const controller = new AbortController();
  const promise = fetch('https://httpbin.org/delay/5', { signal: controller.signal });

  setTimeout(() => controller.abort(), 200);

  try {
    await promise;
  } catch (err) {
    console.log(err instanceof Error ? err.name : err);
  }
}
```

**结果**：200 毫秒后输出 `AbortError`。请求被真正取消，不再占用网络。

- 一个 `controller.signal` 可以交给多个请求，`abort()` 一次全部取消。已经完成的请求不受影响。
- `signal` 也可以在构造 [`Request`](../api/request.md) 时给，之后把这个 `Request` 交给 `fetch()`，取消的效果相同。
- 拿到 `Response` 之后、读内容之前不想要了，也可以用它取消，下载立即停止。

## 给请求设超时

运行时不给请求另设超时，使用系统的默认值（iOS 的文档说是连续 60 秒没有收到数据，**未在模拟器验证**）。要更短的超时，用 [`AbortSignal.timeout()`](../api/abort-signal/timeout.md)：

```js
async function withTimeout() {
  try {
    await fetch('https://httpbin.org/delay/5', { signal: AbortSignal.timeout(300) });
  } catch (err) {
    console.log(err instanceof Error ? err.name : err);
  }
}
```

**结果**：300 毫秒后请求被取消，输出 `AbortError`。

- 参数单位是毫秒。计时从调用 `AbortSignal.timeout()` 的那一刻开始，不是从发请求开始。
- 时间包括下载内容的时间：`fetch()` 已经返回、内容还没读完时到了时间，读取内容的那一步被拒绝。
- 超时和手动取消得到的异常相同，都是 `AbortError`，从异常上区分不出是哪一种。

## 同时发多个请求

```js
async function many() {
  const urls = [
    'https://httpbin.org/get?id=1',
    'https://httpbin.org/get?id=2',
    'https://httpbin.org/get?id=3',
  ];
  const responses = await Promise.all(urls.map((url) => fetch(url)));
  const results = await Promise.all(responses.map((res) => res.json()));
  console.log(results.length);
}
```

**结果**：三个请求同时发出，全部完成后输出 `3`。

- 运行时不限制同时进行的请求数量，请求之间互不等待。实测同时发出 10 个请求，总耗时小于单个请求的 4 倍。
- 其中一个请求在网络层失败时，`Promise.all` 整体被拒绝，其余请求的结果拿不到。要分别得到每个请求的结果，用 `Promise.allSettled`。

## 自己创建一块数据

```js
async function makeBlob() {
  const blob = new Blob(['前缀-', '后缀'], { type: 'text/plain' });
  console.log(blob.size, blob.type);
  console.log(await blob.text());
}
```

**结果**：输出 `13 text/plain` 和 `前缀-后缀`。`size` 是 UTF-8 编码后的字节数，一个汉字占 3 个字节。

## 在测试里代替真实的请求

[`new Response()`](../api/response/constructor.md) 创建一个响应，不发请求。把要测的函数写成接收 `Response`，测试时传自己创建的那个：

```js
async function fakeResponse() {
  const res = new Response('{"ok":true}', {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  console.log(res.status, data.ok);
}
```

**结果**：输出 `201 true`。

## App 进入后台之后

iOS 在 App 进入后台后很快会暂停它的运行。那时还没完成的请求是继续、暂停还是失败，**未在模拟器验证**。必须完成的请求，回到前台后检查结果，失败了重发。

## 请求自动带上 cookie

服务器用 `Set-Cookie` 写的 cookie 被系统保存下来，之后发往同一站点的请求自动带上。**未在模拟器验证。** 这份 cookie 和 [`WebView`](../api/web-view.md) 里网页的 cookie 是分开的两份（实测）：用户在网页里登录，不会让 `fetch()` 带上登录状态，反过来也一样。

## 参见

- [`fetch()`](../api/fetch.md)：函数和这一组类
- [`Response`](../api/response.md)、[`Request`](../api/request.md)、[`Blob`](../api/blob.md)
- [`AbortController`](../api/abort-controller.md)、[`AbortSignal`](../api/abort-signal.md)：取消和超时
- [`Headers`](../api/headers.md)、[`URL`](../api/url.md)：请求头和地址
- [边下载边读响应](streaming-response.md)：大文件、下载进度、服务器推送
