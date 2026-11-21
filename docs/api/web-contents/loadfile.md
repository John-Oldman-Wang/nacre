---
type: reference
native: "-[WKWebView loadFileURL:allowingReadAccessToURL:]"
---

# `WebContents`：`loadFile()` 方法

**`loadFile()`** 方法让网页加载一个本地的网页文件：打进 App 包里的，或者 App 自己写到设备上的。

## 语法

```
loadFile(filePath)
loadFile(filePath, { query, search, hash })
```

### 参数

**`filePath`**

网页文件的路径，字符串。相对路径从 App 包的根开始（比如 `'JS/web/help.html'`）；`/` 开头的是绝对路径（比如 `application.fileSystem.documents + '/pages/notice.html'`）。App 包是安装到设备上的那个目录，里面是 App 的程序和打包进去的资源文件，只能读不能写。

**`options.query`**

对象，地址里 `?` 后面的部分，按键值给：`{ a: '1' }` 得到 `?a=1`。可以不传。

**`options.search`**

字符串，地址里 `?` 后面的部分，直接给。带不带开头的 `?` 都可以。和 `query` 都给时用它。可以不传。

**`options.hash`**

字符串，地址里 `#` 后面的部分。带不带开头的 `#` 都可以。可以不传。

### 返回值

`Promise<void>`。兑现、拒绝的情况和派发的事件与 [`loadURL()`](loadurl.md) 相同。不同的只有出错的情况：

| 情况 | 结果 |
| --- | --- |
| `filePath` 是空串 | 以 `TypeError` 拒绝：`loadFile: the path is empty` |
| 文件不存在 | 以 `name` 为 `'NetworkError'` 的错误拒绝，`code` 是 `-1100`，同时派发 `did-fail-load` |
| 路径是一个目录 | 以 `name` 为 `'Error'` 的错误拒绝，`code` 是 `102`，同时派发 `did-fail-load` |

> **注意**：最后一种情况（以及用 `loadURL` 加载一个不能显示的文件，比如压缩包）在 iOS 27 上要等 4 秒多才报失败，iOS 26 上是立刻。

### 异常

不直接抛。所有错误都通过返回的 Promise 拒绝。

## 说明

加载出来的网页，地址是 `file://` 开头的。网页能用相对路径引用同一个目录和它的子目录下的样式表、普通脚本和图片。

本地网页里 `<script type="module">` 不执行，`fetch` 也读不了本地文件。全部限制见[本地网页的限制](../web-contents.md#本地网页的限制)。用到这两样的网页，用 [`session.protocol`](../session/protocol.md) 登记一个自定义协议，从 `app://local/` 这样的地址加载，见[用自定义协议加载本地网页](../../guides/web-pages.md#用自定义协议加载本地网页)。

## 示例

### 加载包里的网页

```js
const contents = new WebView().webContents;
await contents.loadFile('JS/web/help.html');
console.log(contents.getURL());

// 带上 ? 和 # 后面的部分
await contents.loadFile('JS/web/help.html', { query: { topic: 'fees' }, hash: 'refund' });
```

**效果**

- 不联网也能显示。
- 控制台输出一个 `file:///` 开头、以 `/JS/web/help.html` 结尾的地址。
- 第二次加载时，网页里 `location.search` 是 `?topic=fees`，`location.hash` 是 `#refund`。

### 加载 App 写下来的网页

```js
const contents = new WebView().webContents;
const dir = application.fileSystem.documents + '/pages';
await application.fileSystem.makeDirectory(dir);
await application.fileSystem.writeText(dir + '/notice.html', '<h1>公告</h1>');
await contents.loadFile(dir + '/notice.html');
```

**效果**：网页显示「公告」。它能用相对路径引用 `pages` 目录和子目录下的文件，目录以外的引用不到（真机上；模拟器不受这条限制）。

## 和 Electron 的差别

和 Electron 的 `contents.loadFile(filePath, { query, search, hash })` 相同。相对路径的起点是 App 包。本地网页的限制比 Electron 多，见[本地网页的限制](../web-contents.md#本地网页的限制)。

对应的 iOS 原生写法是 `[webView loadFileURL:allowingReadAccessToURL:]`。可读的目录由运行时按文件的位置定，不能自己指定。

## 参见

- [`loadURL()`](loadurl.md)
- [`Protocol`](../protocol.md)：用自定义协议加载本地网页，模块脚本和 `fetch` 都能用
- [加载打进 App 包里的网页](../../guides/web-pages.md#加载打进-app-包里的网页)
- [文件读写](../filesystem.md)：把网页文件写到 App 的目录里
