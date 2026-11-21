---
type: reference
native: WKURLSchemeHandler
---

# `Protocol`

**`Protocol`** 表示一个存储分区的自定义协议。自定义协议是 App 自己定的地址开头，比如 `app://`：把一个目录登记成一个协议之后，用这个分区的网页加载 `app://local/index.html` 这样的地址，内容从这个目录里取。

用自定义协议加载的网页有自己的来源（`app://local`），所以模块脚本（`<script type="module">`）执行，同源的 `fetch` 读得到目录里的文件，`localStorage` 和别的网页分开。用 [`loadFile()`](web-contents/loadfile.md) 加载的 `file://` 网页做不到这几样。

一个分区一个 `Protocol`，从 [`Session`](session.md) 的 [`protocol`](session/protocol.md) 属性拿到。登记的协议只对**之后新建**的、用这个分区的 [`WebView`](web-view.md) 起作用。

**继承关系**：`Protocol` 不继承任何类。

什么时候用它、怎么组织网页文件，见指南[显示网页](../guides/web-pages.md#用自定义协议加载本地网页)。

## 构造函数

不能用 `new` 创建：`new Protocol()` 抛 `TypeError: Illegal constructor`。

从这几处拿到：

- `session.defaultSession.protocol`：默认分区的。
- `session.fromPartition(partition).protocol`：某一个分区的。
- `webView.webContents.session.protocol`：这张网页所在分区的。

同一个分区每次读到的是同一个对象。不同分区的是不同的对象。

## 实例方法

| 方法 | 说明 |
| --- | --- |
| [`serveDirectory()`](protocol/servedirectory.md) | 把一个目录登记成一个协议：之后新建的网页从这个目录取文件 |
| [`unhandle()`](protocol/unhandle.md) | 去掉一个协议：之后新建的网页不再认它 |
| [`isProtocolHandled()`](protocol/isprotocolhandled.md) | 这个分区现在有没有登记这个协议 |

## 只对之后新建的网页起作用

一张网页认哪些协议，在 `new WebView()` 那一刻就定了，之后不变：

- 登记之前建好的网页，加载这个协议的地址，`loadURL()` 拒绝。
- 换目录、`unhandle()` 之后，之前建好的网页照旧从原来的目录取文件。
- 只有之后新建的网页按新的登记来。

所以要先登记，再建网页。App 启动时登记一次，之后建的网页都能用。

## 示例

### 加载打包进 App 的网页

从空白 App 开始。项目的 `assets/web/` 里放着网页文件（`index.html` 和它引用的模块脚本、样式表），这个目录在 App 包里的路径是 `JS/assets/web`。

```js
application.addEventListener('sceneconnect', async (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 先登记，再建网页
  session.defaultSession.protocol.serveDirectory('app', 'JS/assets/web');

  const web = new WebView();
  web.frame = page.view.bounds;
  page.view.addSubview(web);
  await web.webContents.loadURL('app://local/index.html');
  console.log(await web.webContents.executeJavaScript('location.origin'));
});
```

**效果**

- 屏幕上显示 `assets/web/index.html`。不联网也能显示。
- 网页里的 `<script type="module">` 执行，能 `import` 同目录下的其他模块。样式表照常加载。
- 控制台输出 `app://local`。

### 写错协议名

```js
try {
  session.defaultSession.protocol.serveDirectory('App', 'JS/assets/web');
} catch (err) {
  console.log(String(err));
}
```

**效果**：控制台输出 `TypeError: serveDirectory: "App" is not a valid scheme; use lowercase letters, digits, +, - and ., starting with a letter`。协议名只能用小写字母开头。

## 和 Electron 的差别

| Electron | 这里 | 差别 |
| --- | --- | --- |
| `require('electron').protocol`，整个 App 一个 | `ses.protocol`，一个分区一个 | 登记的协议只对这个分区的网页起作用 |
| `protocol.registerSchemesAsPrivileged()` | 没有 | 登记的协议直接有自己的来源，模块脚本、`fetch`、`localStorage` 都能用 |
| `protocol.handle(scheme, handler)` | `serveDirectory(scheme, directory)` | 不由 JS 逐个请求返回内容，由一个目录决定 |
| `protocol.unhandle(scheme)` | 相同 | 已经建好的网页不受影响 |
| `protocol.isProtocolHandled(scheme)` | 相同 | |

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[configuration setURLSchemeHandler:forURLScheme:]`，加上一个从目录读文件的 `WKURLSchemeHandler` | `ses.protocol.serveDirectory(scheme, directory)`，之后 `new WebView()` 时挂到网页的配置上 |
| `+[WKWebView handlesURLScheme:]` | `serveDirectory()` 遇到它返回 `YES` 的协议时抛 `TypeError` |

## 参见

- [显示网页](../guides/web-pages.md#用自定义协议加载本地网页)：什么时候用自定义协议、什么时候用 `loadFile()`
- [`Session`](session.md)：存储分区，`protocol` 属性在它上面
- [`WebView`](web-view.md)：建网页时用 `partition` 指定分区
- [`loadURL()`](web-contents/loadurl.md)：加载 `app://` 这样的地址
- [`loadFile()`](web-contents/loadfile.md)：加载 `file://` 的本地网页
