---
type: reference
native: "-[WKWebView loadRequest:]、-[WKWebView loadData:MIMEType:characterEncodingName:baseURL:]"
---

# `WebContents`：`loadURL()` 方法

**`loadURL()`** 方法让网页加载一个地址。返回的 Promise 在加载完时兑现。

## 语法

```
loadURL(url)
loadURL(url, { baseURLForDataURL })
```

### 参数

**`url`**

要加载的地址，字符串，必须带协议。支持 `https:`、`file:`、`data:` 和 `about:`（`about:blank` 是一张空白页）。`file:` 的地址和 [`loadFile()`](loadfile.md) 效果相同。用 [`serveDirectory()`](../protocol/servedirectory.md) 登记过的自定义协议（比如 `app://local/index.html`）也支持，网页建好之前要先登记。

要显示一段 HTML 字符串，把它写成 `data:` 地址：`'data:text/html;charset=utf-8,' + encodeURIComponent(html)`。

**`options`**

对象，可以不传。传 `null` 或 `undefined` 和不传相同。

**`options.baseURLForDataURL`**

字符串，一个完整的地址，比如 `'https://example.com/docs/'`、`'file://' + application.fileSystem.assets + '/web/'`。只对 `data:` 地址起作用：网页里的相对路径（图片、样式表、链接）按它找，网页的 `document.baseURI` 是它。目录的地址末尾要带 `/`。`url` 不是 `data:` 地址时不起作用。

> **注意**：明文的 `http://` 地址会被系统拦截：Promise 以 `NetworkError` 拒绝，`code` 是 `-1022`。iOS 默认不允许 App 用没有加密的 HTTP 连接，CLI 生成的工程没有放开这条限制。用 `https://`。`http://localhost` 不受这条限制，开发时可以用。

### 返回值

`Promise<void>`。

| 情况 | 结果 |
| --- | --- |
| 加载完 | 兑现，值是 `undefined` |
| 服务器返回 404、500 等 | 兑现。错误页照常加载完。状态码在 [`did-navigate`](did-navigate-event.md) 事件的 `httpResponseCode` 上 |
| 地址没带协议，或者是空串 | 以 `TypeError` 拒绝：`loadURL: invalid URL; it must include the scheme, like https://`。不发起加载 |
| `baseURLForDataURL` 不是完整的地址（比如 `'docs/'`） | 以 `TypeError` 拒绝：`loadURL: baseURLForDataURL must be an absolute URL, like https://example.com/`。不发起加载 |
| 网络层失败（域名解析不了、没有网络、超时） | 以 `name` 为 `'NetworkError'` 的错误拒绝 |
| 被 [`stop()`](stop.md) 停掉 | 以 `name` 为 `'AbortError'` 的错误拒绝，`code` 是 `-999` |
| 被另一次加载取代（连着调两次 `loadURL`） | 前一次以 `name` 为 `'AbortError'` 的错误拒绝，后一次照常兑现 |
| 加载中途被 [`close()`](close.md) 销毁 | 以 `name` 为 `'AbortError'` 的错误拒绝 |
| 加载中途网页的进程不在了 | 拒绝 |
| 网页已经销毁 | 以 `TypeError` 拒绝：`Object has been destroyed` |

拒绝的错误上有两个附加的字段：

- `code`：系统的错误码，和 [`did-fail-load`](did-fail-load-event.md) 的 `errorCode` 相同。
- `domain`：错误的来源。网络层的错误是 `'NSURLErrorDomain'`。

`message` 是系统给的说明，语言跟随系统，只适合打日志。

失败时同时派发 [`did-fail-load`](did-fail-load-event.md)，带的信息和拒绝的错误相同。例外：调 `loadURL` 之后立刻 `stop()`，Promise 以 `AbortError` 拒绝，但**不派发** `did-fail-load`。要知道一次 `loadURL` 的结果，以它的 Promise 为准。

不接这个 Promise、只监听事件也可以：失败时不会多出一条未处理的拒绝。

### 异常

不直接抛。所有错误都通过返回的 Promise 拒绝。

## 说明

调用之后立刻读 [`isLoading()`](isloading.md) 是 `true`。加载过程中依次派发 `did-start-loading`、`did-navigate`、`did-stop-loading`、`did-finish-load`。

App 调 `loadURL` 发起的加载不派发 [`will-navigate`](will-navigate-event.md)。

带了 `baseURLForDataURL` 时，加载完 [`getURL()`](geturl.md) 读到的是 `baseURLForDataURL`，不是 `data:` 地址（实测）。不带时读到的是 `data:` 地址。

## 示例

### 等加载完

```js
const contents = new WebView().webContents;
await contents.loadURL('https://example.com/');
console.log('加载完', contents.getURL());
```

**结果**：输出 `加载完 https://example.com/`。

### 处理加载失败

```js
const contents = new WebView().webContents;
try {
  await contents.loadURL('https://no-such-host.invalid/');
} catch (err) {
  const failure = /** @type {Error & { code: number }} */ (err);
  console.log(failure.name, failure.code);
}
```

**结果**

- 输出 `NetworkError -1003`。
- 网页停在原来那一页，不会变成空白，也不显示错误页。
- 同时派发一次 `did-fail-load`，它的 `errorCode` 是 `-1003`，`validatedURL` 是 `https://no-such-host.invalid/`。

### 显示一段 HTML，引用 App 包里的图片

```js
const contents = new WebView().webContents;
const html = '<!doctype html><title>帮助</title><img src="sub/pic.png">';
await contents.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html), {
  baseURLForDataURL: 'file://' + application.fileSystem.assets + '/web/',
});
const width = await contents.executeJavaScript(
  'new Promise((resolve) => { const i = document.images[0];' +
  ' if (i.complete) resolve(i.naturalWidth); else i.onload = () => resolve(i.naturalWidth); })');
console.log(width > 0);
```

**结果**：项目里有 `assets/web/sub/pic.png` 时，图片加载出来，输出 `true`。真机上**未验证**。

## 和 Electron 的差别

和 Electron 的 `contents.loadURL(url, options)` 相同。第二个参数只支持 `baseURLForDataURL`，不支持 `httpReferrer`、`userAgent`、`extraHeaders`、`postData`。错误码是系统的那一套（`-1003` 等），不是 Chromium 的（`-105` 等）。

对应的 iOS 原生写法是 `[webView loadRequest:]`；带 `baseURLForDataURL` 的 `data:` 地址是 `[webView loadData:MIMEType:characterEncodingName:baseURL:]`，它就是 `loadHTMLString:baseURL:` 的通用版。

## 参见

- [`loadFile()`](loadfile.md)：加载本地的网页文件
- [`did-fail-load`](did-fail-load-event.md)：错误码的含义
- [处理加载失败](../../guides/web-pages.md#处理加载失败)
