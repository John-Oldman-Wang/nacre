---
type: reference
native: WKWebView
status: partial
---

# `WebContents`

**`WebContents`** 表示 [`WebView`](web-view.md) 里的那张网页。加载地址、后退前进、监听加载过程、在网页里执行脚本、和网页互发消息，都在它上面。

`WebView` 管视图本身：位置、大小、显示隐藏。`WebContents` 管网页：

| 想做的事 | 用哪个 | 例子 |
| --- | --- | --- |
| 改位置和大小 | `WebView` | `web.frame = …`，或者约束 |
| 显示、隐藏、透明度 | `WebView` | `web.isHidden = true` |
| 圆角、边框 | `WebView` | `web.layer.cornerRadius = 12` |
| 加载地址、后退前进 | `WebContents` | `web.webContents.loadURL(…)` |
| 监听加载过程 | `WebContents` | `web.webContents.addEventListener(…)` |

**继承关系**：[`EventTarget`](event-target.md) → `WebContents`

怎么用它显示网页、处理加载失败、限制跳转，见指南[显示网页](../guides/web-pages.md)；和网页互发消息见[让网页和 App 互发消息](../guides/web-page-messaging.md)。

## 构造函数

不能用 `new` 创建：`new WebContents()` 抛 `TypeError: Illegal constructor: WebContents is created by the runtime, not by new`。它随 `WebView` 一起创建，从 [`webView.webContents`](web-view/webcontents.md) 得到。

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`navigationHistory`](web-contents/navigationhistory.md) <small>只读</small> | 后退和前进 |
| [`ipc`](web-contents/ipc.md) <small>只读</small> | 应答网页用 `ipcRenderer.invoke` 发来的请求 |
| [`session`](web-contents/session.md) <small>只读</small> | 这张网页的数据存在哪个存储分区里 |

## 实例方法

加载和导航：

| 方法 | 说明 |
| --- | --- |
| [`loadURL()`](web-contents/loadurl.md) | 加载一个地址 |
| [`loadFile()`](web-contents/loadfile.md) | 加载一个本地的网页文件 |
| [`stop()`](web-contents/stop.md) | 停掉正在进行的加载 |
| [`reload()`](web-contents/reload.md) | 重新加载当前的地址 |

读网页的状态：

| 方法 | 说明 |
| --- | --- |
| [`getURL()`](web-contents/geturl.md) | 当前网页的地址 |
| [`getTitle()`](web-contents/gettitle.md) | 当前网页的标题 |
| [`isLoading()`](web-contents/isloading.md) | 是不是正在加载 |
| [`isCrashed()`](web-contents/iscrashed.md) | 网页的进程是不是已经不在了 |

和网页交换数据：

| 方法 | 说明 |
| --- | --- |
| [`executeJavaScript()`](web-contents/executejavascript.md) | 在网页里执行一段代码，取回结果 |
| [`send()`](web-contents/send.md) | 给网页的预加载脚本发一条消息 |

销毁：

| 方法 | 说明 |
| --- | --- |
| [`close()`](web-contents/close.md) | 销毁这张网页，释放它占的内存 |
| [`isDestroyed()`](web-contents/isdestroyed.md) | 是不是已经销毁 |

还有继承自 `EventTarget` 的 `addEventListener()`、`removeEventListener()`。

## 事件

用 `addEventListener` 监听。事件名写错不会报错：它被当成自定义事件，永远不会被网页触发，所以写的时候对照下面的表。

| 事件 | 什么时候派发 |
| --- | --- |
| [`will-navigate`](web-contents/will-navigate-event.md) | 网页自己要跳到别的地址，还没开始跳。可以取消 |
| [`did-start-loading`](web-contents/did-start-loading-event.md) | 开始加载 |
| [`did-navigate`](web-contents/did-navigate-event.md) | 网页换成了一个新的文档 |
| [`did-stop-loading`](web-contents/did-stop-loading-event.md) | 不再加载。成功和失败都会派发 |
| [`did-finish-load`](web-contents/did-finish-load-event.md) | 加载完 |
| [`did-fail-load`](web-contents/did-fail-load-event.md) | 加载失败 |
| [`page-title-updated`](web-contents/page-title-updated-event.md) | 标题变了 |
| [`ipc-message`](web-contents/ipc-message-event.md) | 网页的预加载脚本调了 `ipcRenderer.send` |
| [`preload-error`](web-contents/preload-error-event.md) | 预加载脚本执行时抛了异常 |
| [`console-message`](web-contents/console-message-event.md) | 网页调了 `console` 的方法，或者有异常没被捕获 |
| [`render-process-gone`](web-contents/render-process-gone-event.md) | 网页的进程不在了 |
| [`destroyed`](web-contents/destroyed-event.md) | 被 `close()` 销毁 |

`will-navigate` 是唯一能取消的事件。其余事件派发时事情已经发生，`cancelable` 是 `false`，调 `preventDefault()` 没有效果。

一次成功的加载，四个加载事件的顺序是 `did-start-loading` → `did-navigate` → `did-stop-loading` → `did-finish-load`。用户在网页里点链接跳到别的页面，这四个事件同样会来。

## 销毁之后

调 [`close()`](web-contents/close.md) 之后，除了 `close()` 和 `isDestroyed()`，其余方法都抛 `TypeError: Object has been destroyed`；`loadURL()` 返回一个以同样的错误拒绝的 Promise。销毁不能撤销，要再显示网页就新建一个 `WebView`。

## 值怎么传

`executeJavaScript()` 的结果、消息的参数、`invoke` 的返回值，都按 JSON 传。

| 值 | 传过去之后 |
| --- | --- |
| 数、字符串、布尔、`null`、数组、普通对象 | 原样 |
| 对象的成员顺序 | 和网页里一样。例外是 `executeJavaScript` 执行**多条语句**得到的对象：值是对的，顺序不保证 |
| `undefined` | 单独一个值时还是 `undefined`；在对象里的那个成员没有了；在数组里变成 `null` |
| 日期 | 字符串，比如 `'1970-01-01T00:00:00.000Z'` |
| `NaN`、`Infinity` | `null` |
| 函数 | 消息里带了函数当场抛 `TypeError`；`executeJavaScript` 的结果是函数时被拒绝；结果是对象、里面有函数成员时，那个成员没有了 |
| `Map` | 空对象 `{}` |
| DOM 节点 | `executeJavaScript` 的结果是 DOM 节点时被拒绝 |

## 本地网页的限制

用 [`loadFile()`](web-contents/loadfile.md) 加载的网页，地址是 `file://` 开头的。它和从服务器加载的网页有几处不同。

| | 本地网页 |
| --- | --- |
| 用相对路径引用样式表、普通脚本、图片 | 可以 |
| 地址里的 `?` 和 `#` | 可以，网页里读得到 |
| `localStorage`、cookie | 可以 |
| `<script type="module">` | **不执行** |
| `fetch`、`XMLHttpRequest` 读本地文件 | **失败** |
| 来源（origin） | 所有本地网页都是同一个：`file://`。它们的 `localStorage` 互通 |
| 能读哪些文件 | 包里的网页：整个 App 包。别处的网页：它所在的目录和子目录。模拟器不执行这条限制，要在真机上试 |

本地网页请求 `https://` 的接口不受影响，受限的只是读本地文件。

静态页面和用传统方式（一个普通的 `<script>`）打包的网页适合用 `loadFile()`。用到模块脚本或 `fetch` 的网页（比如 Vite 默认的打包结果），用 [`session.protocol`](session/protocol.md) 登记一个自定义协议，从 `app://local/` 这样的地址加载：网页有自己的来源，模块脚本执行，同源的 `fetch` 读得到文件。见[用自定义协议加载本地网页](../guides/web-pages.md#用自定义协议加载本地网页)。

## 示例

```js
const web = new WebView();
const contents = web.webContents;
contents.addEventListener('did-fail-load', (e) => {
  console.log('加载失败', e.errorCode, e.validatedURL);
});
await contents.loadURL('https://example.com/');
console.log(contents.getURL(), contents.isLoading());
```

**结果**：加载成功时输出 `https://example.com/ false`。加载失败时先输出 `加载失败` 和错误码，`await` 那一行抛出拒绝的错误。

## 与 Electron 的对照

| Electron | 这里 | 差别 |
| --- | --- | --- |
| `contents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => …)` | `contents.addEventListener('did-fail-load', (e) => …)` | 数据在 `e` 上，字段名相同 |
| `contents.on('will-navigate', (details) => details.preventDefault())` | `contents.addEventListener('will-navigate', (e) => e.preventDefault())` | 多一个 `navigationType`；没有 `frame`、`initiator` |
| `did-navigate` 的 `httpStatusText` | 没有 | 系统不提供 |
| `render-process-gone` 的 `details.reason` | 没有 | 系统不说原因 |
| `did-fail-load` 的 `errorCode`（`-105` 等） | `errorCode`（`-1003` 等） | 数不同 |
| `contents.executeJavaScript(code)` | 相同 | 多条语句的代码不等 Promise、带回的对象不保证成员顺序；结果按 JSON 传（日期是字符串，`Map` 是 `{}`） |
| `contents.on('ipc-message', (event, channel, ...args) => …)` | `contents.addEventListener('ipc-message', (e) => …)` | `e.channel`、`e.args` |
| `contents.send(channel, ...args)`、`contents.ipc.handle(channel, listener)` | 相同 | |
| `contents.session` | 相同 | 见 [`session`](session.md) |
| `contents.loadFile(filePath, { query, search, hash })` | 相同 | 相对路径的起点是 App 包。本地网页的限制比 Electron 多，见[本地网页的限制](#本地网页的限制) |
| `contents.navigationHistory.goBack()` | 相同 | |
| `contents.loadURL(url, { baseURLForDataURL })` | 相同 | 第二个参数只支持 `baseURLForDataURL` |
| `contents.on('console-message', (details) => …)` | `contents.addEventListener('console-message', (e) => …)` | 没有 `frame`；没被捕获的异常也会派发 |
| `contents.close()` / `isDestroyed()` / `'destroyed'` | 相同 | |

## 对应的 iOS API

| ObjC（`WKWebView`） | JS |
| --- | --- |
| `[webView loadRequest:]` | `contents.loadURL(url)` |
| `[webView loadHTMLString:html baseURL:base]` | `contents.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html), { baseURLForDataURL: base })` |
| `[webView loadFileURL:allowingReadAccessToURL:]` | `contents.loadFile(filePath)`。可读的目录由运行时按文件的位置定 |
| `webView.URL` | `contents.getURL()` |
| `webView.title` | `contents.getTitle()`，`page-title-updated` 事件 |
| `webView.loading` | `contents.isLoading()`，`did-start-loading` / `did-stop-loading` 事件 |
| `[webView stopLoading]` | `contents.stop()` |
| `[webView reload]` | `contents.reload()` |
| `webView.canGoBack` / `canGoForward` | `contents.navigationHistory.canGoBack()` / `canGoForward()` |
| `[webView goBack]` / `[webView goForward]` | `contents.navigationHistory.goBack()` / `goForward()` |
| `[webView evaluateJavaScript:completionHandler:]`、`callAsyncJavaScript:…` | `contents.executeJavaScript(code)` |
| `WKScriptMessageHandlerWithReply` | 预加载脚本里的 `ipcRenderer`；App 这边的 `ipc-message` 事件和 `ipc.handle` |
| `webView:decidePolicyForNavigationAction:decisionHandler:` | `will-navigate` 事件，`decisionHandler(.cancel)` 对应 `e.preventDefault()` |
| `navigationAction.navigationType` | 事件的 `navigationType` |
| `webView:didCommitNavigation:` | `did-navigate` 事件 |
| `webView:didFinishNavigation:` | `did-finish-load` 事件 |
| `webView:didFailNavigation:withError:`、`webView:didFailProvisionalNavigation:withError:` | `did-fail-load` 事件 |
| `webViewWebContentProcessDidTerminate:` | `render-process-gone` 事件 |
| 释放 `WKWebView` | `contents.close()` |

## 参见

- [`WebView`](web-view.md)：装着这张网页的视图，以及预加载脚本、存储分区的说明。
- [显示网页](../guides/web-pages.md)：加载、处理失败、限制跳转的完整写法。
- [让网页和 App 互发消息](../guides/web-page-messaging.md)
- [`NavigationHistory`](navigation-history.md)、[`WebContentsIPC`](web-contents-ipc.md)：从这个对象的属性上得到。
- [`session`](session.md)：读写网页的 cookie、清数据。
