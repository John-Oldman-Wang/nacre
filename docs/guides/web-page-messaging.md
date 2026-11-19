# 让网页和 App 互发消息

这一篇讲网页怎么调用 App 的功能、怎么向 App 要一个结果，App 怎么通知网页。网页那一头用 [`ipcRenderer`](../api/ipc-renderer.md) 和 [`contextBridge`](../api/context-bridge.md)，App 这一头用 [`WebContents`](../api/web-contents.md) 和 [`WebContentsIPC`](../api/web-contents-ipc.md)。

只是读网页里的内容、或者改网页，不需要消息，用 [`executeJavaScript()`](../api/web-contents/executejavascript.md)，见[显示网页](web-pages.md#读网页里的内容)。

## 推荐的做法

- **只给自己控制的网页配预加载脚本。** 加载第三方网站的 `WebView` 不要配，这样那张网页里没有消息通道。同一个 App 里既有自己的网页又有第三方的网页时，建两个 `WebView`。
- **在 App 这一侧检查每一条消息。** 预加载脚本和网页的脚本不隔离，网页里的任何脚本都能发消息，参数可以是任何值。写法见[在 App 这一侧检查每一条消息](#在-app-这一侧检查每一条消息)。
- **用 `will-navigate` 限制网页能去的地址。** 网页一旦跳到别的站点，那个站点的脚本同样拿得到消息通道。写法见[只允许网页跳到自己的域名](web-pages.md#只允许网页跳到自己的域名)。
- **预加载脚本提供的方法越少越好，每个方法只做一件事。** 提供 `share(id)` 这样的具体方法，不要提供「执行任意命令」「读任意键」这样的通用方法。

为什么要这样，见[网页内容不受信任](../api/web-view.md#网页内容不受信任)。

## 第一条消息

网页要让 App 做事（分享、关闭页面、取登录状态），分两步：用**预加载脚本**在网页里放一个对象，网页调这个对象；对象的方法把消息发给 App。

预加载脚本是一个单独的 JS 文件，和 App 一起打包。它在网页里执行，不在 App 的 JS 里执行，所以不能写进 `main.js`，也用不了 App 这边的任何对象。它能用 `ipcRenderer` 和 `contextBridge` 两个名字。这两个名字现在没有类型定义，下面预加载脚本和网页里的代码不参与类型检查。

```javascript
// JS/web/preload.js
contextBridge.exposeInMainWorld('app', {
  share: (id) => ipcRenderer.send('share', id),
});
```

App 这边从空白 App 开始，建 `WebView` 时指定预加载脚本，并监听消息：

```js
application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const web = new WebView({ webPreferences: { preload: 'JS/web/preload.js' } });
  web.frame = page.view.bounds;
  page.view.addSubview(web);

  web.webContents.addEventListener('ipc-message', (e) => {
    if (e.channel === 'share') console.log('网页要分享', e.args[0]);
  });
  web.webContents.loadURL('https://my.app/');
});
```

网页里：

```html
<button onclick="app.share(42)">分享</button>
```

**效果**

- 网页调 `app.share(42)` 时（比如用户点了那个按钮），App 的控制台输出 `网页要分享 42`。
- 网页里 `typeof app` 是 `'object'`。网页自己的第一段脚本执行时它就已经在了。
- `ipcRenderer` 和 `contextBridge` 只有预加载脚本能用，网页里 `typeof ipcRenderer` 是 `'undefined'`。
- 预加载脚本的文件读不到或者有语法错时，`new WebView` 当场抛。执行时抛了异常，网页照常加载，`webContents` 上派发 [`preload-error`](../api/web-contents/preload-error-event.md)。

下面各节沿用一个配了预加载脚本的 `web`。单独试某一节时，先写这一行：

```js
const web = new WebView({ webPreferences: { preload: 'JS/web/preload.js' } });
```

## 在 App 这一侧检查每一条消息

网页里的任何脚本（包括它引入的第三方脚本）都能调 `app.share`，也能绕过它直接发消息。[`ipc-message`](../api/web-contents/ipc-message-event.md) 里收到的内容一律当成不可信的输入来检查。

```js
const contents = web.webContents;

contents.addEventListener('ipc-message', (e) => {
  // 只接受来自自己站点的消息
  if (!contents.getURL().startsWith('https://my.app/')) return;

  if (e.channel === 'share') {
    const id = e.args[0];
    // 参数的类型和范围都要检查
    if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) return;
    console.log('分享', id);
  }
});
```

**效果**

- 网页在 `https://my.app/` 下面，并且发来 `share` 和一个正整数时，控制台输出 `分享` 和这个数。
- 网页跳到了别的站点，或者参数不是正整数时，这条消息被忽略。

## 让网页向 App 要一个结果

网页要等 App 给回一个值时，预加载脚本用 [`ipcRenderer.invoke()`](../api/ipc-renderer/invoke.md)，App 这边用 [`ipc.handle()`](../api/web-contents-ipc/handle.md) 登记处理函数。

```javascript
// JS/web/preload.js
contextBridge.exposeInMainWorld('app', {
  getUser: () => ipcRenderer.invoke('get-user'),
});
```

```js
web.webContents.ipc.handle('get-user', async (event) => {
  // 处理函数的返回值会交给网页。只返回这张网页该看到的数据
  if (!event.sender.getURL().startsWith('https://my.app/')) throw new Error('not allowed');
  return { name: application.storage.get('name') };
});
```

网页里：

```javascript
const user = await app.getUser();
```

**效果**

- 网页在 `https://my.app/` 下面时，网页里的 `user` 是处理函数返回的那个对象。处理函数可以是异步的，网页会一直等到它返回。
- 网页在别的站点时，网页那边的 Promise 被拒绝，说明是 `Error invoking remote method 'get-user': Error: not allowed`。
- 处理函数抛了异常，网页那边的 Promise 被拒绝，说明是 `Error invoking remote method 'get-user': Error: …`。
- App 没登记这个频道时，网页那边同样被拒绝，说明是 `Error invoking remote method 'get-user': Error: No handler registered for 'get-user'`。

一个频道只能登记一个处理函数，重复登记抛 `Error: Attempted to register a second handler for 'get-user'`。

## App 主动通知网页

App 用 [`webContents.send()`](../api/web-contents/send.md) 发，预加载脚本用 [`ipcRenderer.on()`](../api/ipc-renderer/on.md) 收。

```javascript
// JS/web/preload.js
ipcRenderer.on('theme', (event, name) => {
  document.documentElement.dataset.theme = name;
});
```

```js
web.webContents.addEventListener('did-finish-load', () => {
  web.webContents.send('theme', 'dark');
});
```

**效果**

- 网页加载完后，`<html>` 上多了 `data-theme="dark"`。
- 网页还没加载、或者没配预加载脚本时，这条消息没人收，直接丢掉，不报错。所以要在 `did-finish-load` 之后再发。
- 参数里有函数时，`send` 当场抛 `TypeError: send: functions cannot be sent`。

预加载脚本收到的消息也不能当作一定来自 App：网页的脚本可以冒充 App 往通道里塞消息。

## 消息里能带什么

消息的参数、`invoke` 的结果都按 JSON 传：数、字符串、布尔、`null`、数组、普通对象原样到；日期变成字符串，`Map` 变成 `{}`，带了函数当场抛。全部规则见[值怎么传](../api/web-contents.md#值怎么传)。

## 参见

- [`ipcRenderer`](../api/ipc-renderer.md)、[`contextBridge`](../api/context-bridge.md)：预加载脚本里的两个名字。
- [`WebContents`](../api/web-contents.md)：`ipc-message` 事件和 `send()`。
- [`WebContentsIPC`](../api/web-contents-ipc.md)：应答网页的请求。
- [预加载脚本](../api/web-view.md#预加载脚本)：什么时候执行、和网页的脚本有没有隔离。
- [显示网页](web-pages.md)
