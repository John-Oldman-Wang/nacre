---
type: reference
native: "-[WKWebViewConfiguration setURLSchemeHandler:forURLScheme:]"
---

# `Protocol`：`serveDirectory()` 方法

**`serveDirectory()`** 方法把一个目录登记成一个自定义协议：之后新建的、用这个分区的网页里，`协议名://主机/路径` 这样的地址从这个目录里取文件。

## 语法

```
serveDirectory(scheme, directory)
```

### 参数

**`scheme`**

协议名，字符串，不带 `://`。推荐用 `app`。

- 以小写字母开头，只能有小写字母、数字、`+`、`-`、`.`。
- 不能是 WebKit 自己处理的协议，比如 `https`、`file`。WebKit 是 iOS 显示网页的引擎。
- 不是字符串时先转成字符串。`null`、`undefined` 转成空串，空串不合法。

**`directory`**

目录的路径，字符串。

- 相对路径从 App 包的根开始，和 [`loadFile()`](../web-contents/loadfile.md) 相同。项目的 `assets/web/` 在 App 包里是 `'JS/assets/web'`。App 包是安装到设备上的那个目录，里面是 App 的程序和打包进去的资源文件，只能读不能写。
- `/` 开头的是绝对路径，原样使用，比如 `application.fileSystem.assets + '/web'`。
- 调用的时候这个目录必须已经存在。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

| 情况 | 报错 |
| --- | --- |
| 协议名不合法：有大写字母、数字开头、有空格、空串 | `serveDirectory: "Nacre" is not a valid scheme; use lowercase letters, digits, +, - and ., starting with a letter` |
| 协议名是 WebKit 自己处理的，比如 `https`、`file` | `serveDirectory: "https" is handled by WebKit itself; pick another scheme, like app` |
| `directory` 是空串 | `serveDirectory: the directory must be a non-empty string` |
| 目录不存在，或者给的是一个文件 | `serveDirectory: "JS/assets/no-such-dir" is not a directory` |

报错里的协议名和路径是传进来的原文。抛错时，这个分区原来的登记不受影响。

## 说明

### 什么时候起作用

- 只对**之后新建**的、用这个分区的 [`WebView`](../web-view.md) 起作用。登记之前建好的网页加载这个协议的地址，[`loadURL()`](../web-contents/loadurl.md) 拒绝。
- 只对这个分区起作用。别的分区的网页加载这个协议的地址，`loadURL()` 拒绝。
- 同一个协议再调一次，换成新的目录。之前建好的网页照旧用原来的目录，之后建的用新的。

### 地址怎么对应到文件

- 地址的路径接在目录后面：`app://local/js/main.js` 取的是 `目录/js/main.js`。网页里以 `/` 开头的引用（`/data.json`）从目录的根算。
- 主机名不参与找文件。它决定网页的来源：`app://local/index.html` 的 `location.origin` 是 `'app://local'`。主机名不同，来源就不同。推荐整个 App 都写 `app://local/`。
- 查询串（`?` 后面的部分）不参与找文件：`/data.json?x=1` 取的是 `data.json`。
- 路径是一个目录时，给目录里的 `index.html`。结尾带不带 `/` 都一样。
- 路径出不了这个目录。编码过的 `..`（`%2e%2e`）往目录外面走的请求给 404。

### 响应

| 请求 | 响应 |
| --- | --- |
| `GET`，文件存在 | 状态码 200。内容是整个文件，带 `Content-Type` 和 `Content-Length`（文件的字节数） |
| `GET`，文件不存在 | 状态码 404。内容是纯文本 `Not Found` |
| `HEAD` | 状态码和头与 `GET` 相同，没有内容 |
| `POST` 等其他方法 | 状态码 405。内容是纯文本 `Method Not Allowed` |
| 带 `Range` 头的分段请求 | 不分段：照样给整个文件，状态码 200 |

`Content-Type` 按扩展名定，不分大小写：

| 扩展名 | `Content-Type` |
| --- | --- |
| `.html`、`.htm` | `text/html` |
| `.js`、`.mjs` | `text/javascript` |
| `.css` | `text/css` |
| `.json`、`.map` | `application/json` |
| `.wasm` | `application/wasm` |
| `.svg` | `image/svg+xml` |
| `.png`、`.jpg`、`.jpeg`、`.gif`、`.webp` | `image/png`、`image/jpeg`、`image/jpeg`、`image/gif`、`image/webp` |
| `.ico` | `image/x-icon` |
| `.woff`、`.woff2`、`.ttf`、`.otf` | `font/woff`、`font/woff2`、`font/ttf`、`font/otf` |
| `.txt` | `text/plain` |
| `.xml` | `application/xml` |
| `.mp4`、`.mp3`、`.wav` | `video/mp4`、`audio/mpeg`、`audio/wav` |
| 其他 | `application/octet-stream` |

网页里的 `<video>`、`<audio>` 播放这个协议下的文件时，拖动进度条用的是分段请求，可能拖不动（**未在真机验证**）。

### 主页面的状态码

[`did-navigate`](../web-contents/did-navigate-event.md) 事件上主页面的 `httpResponseCode` 是 `-1`，读不到 200 或 404。主页面的文件不存在时，`loadURL()` 照样兑现，网页上显示 `Not Found`。网页里用 `fetch` 请求，`status` 是真实的状态码。

## 示例

### 网页里用模块脚本和 fetch

```js
const protocol = session.defaultSession.protocol;
protocol.serveDirectory('app', 'JS/assets/web');

const contents = new WebView().webContents;
await contents.loadURL('app://local/index.html');
const status = await contents.executeJavaScript("fetch('/data.json').then((r) => r.status)");
console.log(status);
```

**效果**

- 项目的 `assets/web/` 里有 `index.html` 和 `data.json` 时，控制台输出 `200`。
- `index.html` 里的 `<script type="module">` 执行。

### 在别的分区登记

```js
const shop = session.fromPartition('persist:shop');
shop.protocol.serveDirectory('app', 'JS/assets/shop');

const inShop = new WebView({ webPreferences: { partition: 'persist:shop' } });
await inShop.webContents.loadURL('app://local/index.html');
console.log(session.defaultSession.protocol.isProtocolHandled('app'));
```

**效果**

- `inShop` 显示 `assets/shop/index.html`。
- 控制台输出 `false`：默认分区没有登记 `app`。默认分区的网页加载 `app://local/index.html`，`loadURL()` 拒绝。

## 和 Electron 的差别

Electron 没有这个方法。Electron 用 `protocol.handle(scheme, handler)`，由 JS 对每个请求返回内容，还要在 App 启动前用 `protocol.registerSchemesAsPrivileged()` 声明这个协议有自己的来源。这里由一个目录决定返回什么，登记之后网页直接有自己的来源。

## 对应的 iOS API

`-[WKWebViewConfiguration setURLSchemeHandler:forURLScheme:]`，加上一个从目录读文件的 `WKURLSchemeHandler`。登记之后 `new WebView()` 时挂到网页的配置上。

## 参见

- [`unhandle()`](unhandle.md)：去掉登记
- [`isProtocolHandled()`](isprotocolhandled.md)：读有没有登记
- [用自定义协议加载本地网页](../../guides/web-pages.md#用自定义协议加载本地网页)
- [`application.fileSystem.assets`](../filesystem/assets.md)：项目的 `assets/` 在 App 包里的绝对路径
