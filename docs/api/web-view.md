---
type: reference
native: WKWebView
status: partial
---

# 网页（`WebView`）

`WebView` 是一个显示网页的视图。把它加进界面，让它加载一个地址，网页就显示在它的范围里。

它分成两个对象：

- **`WebView`**：视图本身。放在哪、多大、显示还是隐藏，用[视图](ui-view.md)的写法。
- **`webView.webContents`**：里面那张网页。加载、后退前进、加载事件都在它上面。

它相当于网页里的 `<iframe>`。接口的形状照 [Electron](https://www.electronjs.org/docs/latest/api/web-contents) 的 `WebContentsView` 和 `webContents`：方法名和事件名和 Electron 相同。和 Electron 有五点不同：

- **事件用 `addEventListener` 监听，数据在事件对象上。** Electron 写 `on('did-fail-load', (event, errorCode) => …)`，这里写 `addEventListener('did-fail-load', (e) => e.errorCode)`。
- **摆放用视图的写法。** 没有 `setBounds`，用 `frame` 或者[约束](auto-layout.md)。
- **错误码是 iOS 的那一套数**，不是 Electron 的。
- **`will-navigate` 多一个 `navigationType` 字段**，说明这次跳转是点链接、提交表单还是脚本引起的。
- **只有一部分方法和事件。** 没有的列在[还不能做的](#还不能做的)里。

## 完整例子

下面的代码从空白 App 开始，显示一张占满屏幕的网页，并把加载过程打到控制台。

```js
application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 建一个 WebView，用约束让它占满安全区
  const web = new WebView();
  web.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(web);
  const safe = page.view.safeAreaLayoutGuide;
  NSLayoutConstraint.activateConstraints([
    web.topAnchor.constraintEqualToAnchor(safe.topAnchor),
    web.bottomAnchor.constraintEqualToAnchor(safe.bottomAnchor),
    web.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor),
    web.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor),
  ]);

  // 2. 网页的事都在 webContents 上
  const contents = web.webContents;
  contents.addEventListener('did-navigate', (event) => {
    console.log('到了', event.url, '状态码', event.httpResponseCode);
  });
  contents.addEventListener('page-title-updated', (event) => {
    console.log('标题', event.title);
  });
  contents.addEventListener('did-fail-load', (event) => {
    console.log('加载失败', event.errorCode, event.validatedURL);
  });

  // 3. 加载。返回的 Promise 在加载完时兑现
  contents.loadURL('https://example.com/').then(() => {
    console.log('加载完', contents.getURL());
  });
});
```

**效果**

- 屏幕上显示 example.com 的网页。它占满安全区：上边在状态栏下面，下边在底部横条上面。安全区是屏幕上不会被刘海、状态栏和底部横条挡住的那一块，见[安全区](ui-view.md#安全区)。
- 链接可以点。网页可以滚动（未验证）。
- 控制台输出 `到了 https://example.com/ 状态码 200`、`加载完 https://example.com/`、`标题 Example Domain`。后两行谁先谁后不固定。

## 常见用法

下面的例子沿用完整例子里的 `page`、`web` 和 `contents`。

### 知道加载到哪一步了

```js
contents.addEventListener('did-start-loading', () => console.log('开始加载'));
contents.addEventListener('did-navigate', (e) => console.log('换到了', e.url));
contents.addEventListener('did-stop-loading', () => console.log('不再加载'));
contents.addEventListener('did-finish-load', () => console.log('加载完'));
contents.loadURL('https://example.com/');
```

**效果**

- 四个事件各来一次，顺序是 `did-start-loading` → `did-navigate` → `did-stop-loading` → `did-finish-load`。
- `loadURL` 调用之后立刻读 `contents.isLoading()` 是 `true`，`did-stop-loading` 之后是 `false`。
- 用户在网页里点链接跳到别的页面，这四个事件同样会来。

显示加载指示用 `did-start-loading` 和 `did-stop-loading` 这一对。

### 处理加载失败

失败有两个地方能知道：`loadURL` 返回的 Promise 被拒绝，同时派发 `did-fail-load` 事件。用哪个都可以。

```js
try {
  await contents.loadURL('https://no-such-host.invalid/');
} catch (err) {
  console.log(err.name, err.code);
}
```

**效果**

- 控制台输出 `NetworkError -1003`。
- 网页停在原来那一页，不会变成空白。
- 同时派发一次 `did-fail-load`，它的 `errorCode` 是 `-1003`，`validatedURL` 是 `https://no-such-host.invalid/`。

只监听事件、不接 Promise 也可以。失败时不会多出一条未处理的拒绝。

服务器返回 404、500 **不算失败**：错误页照常加载完，Promise 兑现。状态码从 `did-navigate` 事件的 `httpResponseCode` 读。

```js
contents.addEventListener('did-navigate', (e) => {
  if (e.httpResponseCode >= 400) console.log('服务器返回了', e.httpResponseCode);
});
```

**效果**

- 加载一个返回 404 的地址时，控制台输出 `服务器返回了 404`。

### 显示网页的标题

```js
contents.addEventListener('page-title-updated', (e) => {
  page.title = e.title;
});
```

**效果**

- 网页的标题变化时，页面的标题跟着变。
- 换页的瞬间会先收到一次空串，新页面的标题到了再收到一次。

> **注意**：不要在 `did-finish-load` 里或者 `loadURL` 兑现之后直接读 `getTitle()`。标题和「加载完」谁先到不固定，这时可能还读到空串。要标题就监听 `page-title-updated`。

### 后退、前进、刷新

```js
const history = contents.navigationHistory;
if (history.canGoBack()) history.goBack();
if (history.canGoForward()) history.goForward();
contents.reload();
```

**效果**

- `goBack()` 回到上一张网页，`goForward()` 回到后退之前的那一张。每次都会派发一轮加载事件。
- 不能后退时调 `goBack()` 什么都不发生，不报错。
- `reload()` 重新加载当前的地址。

### 停掉正在进行的加载

```js
const loading = contents.loadURL('https://example.com/big');
contents.stop();
loading.catch((err) => console.log(err.name, err.code));
```

**效果**

- 控制台输出 `AbortError -999`。
- 网页停在原来那一页。

连着调两次 `loadURL` 时，后一次会取代前一次：前一次的 Promise 以 `AbortError` 拒绝，后一次照常兑现。

### 只允许网页跳到自己的域名

网页自己要跳到别的地址时（用户点了链接、脚本改了 `location`、提交了表单），先派发 `will-navigate`。在监听器里调 `preventDefault()`，这次跳转就不发生。

```js
contents.addEventListener('will-navigate', (e) => {
  if (!e.url.startsWith('https://my.app/')) {
    e.preventDefault();
    console.log('拦住了', e.url, e.navigationType);
  }
});
```

**效果**

- 网页里点一个指向 `https://other.site/` 的链接：控制台输出 `拦住了 https://other.site/ linkActivated`，网页留在原地，一个加载事件都不派发。
- 点指向 `https://my.app/` 下面的链接：照常跳转。
- 自己调 `contents.loadURL(...)`、`reload()`、后退、前进**不派发**这个事件，所以不会被这段代码拦住。

哪些情况派发、哪些不派发，见 [`will-navigate` 什么时候派发](#will-navigate-什么时候派发)。

### 处理电话、邮件和自定义协议的链接

网页不认识 `tel:`、`mailto:` 和 App 自己定的协议（比如 `myapp://`）。不处理的话，点这类链接会加载失败。在 `will-navigate` 里拦下来，自己处理。

```js
contents.addEventListener('will-navigate', (e) => {
  if (e.url.startsWith('tel:') || e.url.startsWith('mailto:')) {
    e.preventDefault();
    application.openURL(e.url);       // 交给系统：拨号、写邮件
  } else if (e.url.startsWith('myapp://')) {
    e.preventDefault();
    console.log('网页让 App 做一件事', e.url);
  }
});
```

**效果**

- 点 `tel:10086` 的链接：`e.url` 是 `tel:10086`，网页留在原地，不派发 `did-fail-load`。系统弹出拨号确认（未在模拟器验证，模拟器不能拨号）。
- 点 `myapp://share?id=1` 的链接：控制台输出 `网页让 App 做一件事 myapp://share?id=1`。
- 不拦 `tel:` 链接时：派发 `did-fail-load`，`errorCode` 是 `-1002`。

### 要先查一下再决定放不放行

放不放行在监听器**返回的那一刻**就定了，不能 `await` 之后再调 `preventDefault()`。需要异步判断时，先拦住，查完再自己加载。

```js
contents.addEventListener('will-navigate', async (e) => {
  e.preventDefault();                       // 先拦住。这一句要在第一个 await 之前
  const allowed = await isAllowed(e.url);   // isAllowed 是你自己的函数
  if (allowed) contents.loadURL(e.url);
});
```

**效果**

- 网页先留在原地。`isAllowed` 兑现 `true` 之后才开始跳转。
- `loadURL` 发起的加载不派发 `will-navigate`，所以不会再进这个监听器。

### 加载打进 App 包里的网页

协议、帮助这类不需要联网的页面，可以把网页文件和 App 一起打包，用 `loadFile` 加载。路径从 App 包的根开始写，和 [`UIImage.imageNamed`](ui-image.md) 的写法一样。

```js
await contents.loadFile('JS/web/help.html');
console.log(contents.getURL());

// 带上 ? 和 # 后面的部分
await contents.loadFile('JS/web/help.html', { query: { topic: 'fees' }, hash: 'refund' });
```

**效果**

- 不联网也能显示。网页旁边的样式表、脚本、图片用相对路径引用，照常加载。
- 控制台输出一个 `file:///` 开头、以 `/JS/web/help.html` 结尾的地址。
- 第二次加载时，网页里 `location.search` 是 `?topic=fees`，`location.hash` 是 `#refund`。
- 文件不存在时 Promise 以 `NetworkError` 拒绝，`code` 是 `-1100`。

> **注意**：本地网页里 `<script type="module">` 不执行，`fetch` 也读不了本地文件。用到这两样的网页（比如 Vite 默认的打包结果）不能这样加载，见[本地网页的限制](#本地网页的限制)。

### 加载 App 下载下来的网页

`loadFile` 也接受绝对路径。App 把网页下载或写到自己的目录里之后，可以直接加载。

```js
const dir = application.fileSystem.documents + '/pages';
await application.fileSystem.makeDirectory(dir);
await application.fileSystem.writeText(dir + '/notice.html', '<h1>公告</h1>');
await contents.loadFile(dir + '/notice.html');
```

**效果**

- 屏幕上显示「公告」。
- 网页能用相对路径引用同一个目录和它的子目录下的文件。目录以外的文件引用不到：真机上那张图片加载不出来。模拟器不受这条限制，在模拟器上能加载不代表真机上可以。

### 读网页里的内容

`executeJavaScript` 在网页里执行一段代码，把结果带回来。

```js
const title = await contents.executeJavaScript('document.title');
const count = await contents.executeJavaScript('document.querySelectorAll("a").length');
const status = await contents.executeJavaScript('fetch("/api/ping").then((r) => r.status)');
console.log(title, count, status);
```

**效果**

- 控制台输出网页的标题、链接的个数和那次请求的状态码。
- 第三句的结果是 Promise，会等它兑现再带回来。
- 网页里抛了异常，这边的 Promise 被拒绝：`executeJavaScript('throw new Error("boom")')` 的错误说明是 `Error: boom`。

代码是**一个表达式**时，结果是 Promise 会等。写成多条语句（`var a = 1; a + 1`）时取最后那个值，但不等 Promise。要在多条语句里用 `await`，包成一个立即执行的异步函数：

```js
const text = await contents.executeJavaScript(`(async () => {
  const response = await fetch('/api/user');
  return (await response.json()).name;
})()`);
```

**效果**

- `text` 是接口返回的 `name`。

结果按 JSON 传回来，见[值怎么传](#值怎么传)。

### 让网页调用 App 的功能

网页要让 App 做事（分享、关闭页面、取登录状态），分两步：用**预加载脚本**在网页里放一个对象，网页调这个对象；对象的方法把消息发给 App。

预加载脚本是一个单独的 JS 文件，和 App 一起打包：

```js
// JS/web/preload.js
contextBridge.exposeInMainWorld('app', {
  share: (id) => ipcRenderer.send('share', id),
});
```

App 这边建 `WebView` 时指定它，并监听消息：

```js
const web = new WebView({ webPreferences: { preload: 'JS/web/preload.js' } });
web.webContents.addEventListener('ipc-message', (e) => {
  if (e.channel === 'share') console.log('网页要分享', e.args[0]);
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

> **注意**：网页里的任何脚本（包括它引入的第三方脚本）都能调 `app.share`，也能绕过它直接发消息。`ipc-message` 里收到的内容一律当成不可信的输入来检查。不要给不信任的网页配预加载脚本。

### 让网页向 App 要一个结果

网页要等 App 给回一个值时，预加载脚本用 `ipcRenderer.invoke`，App 这边用 `ipc.handle` 登记处理函数。

```js
// JS/web/preload.js
contextBridge.exposeInMainWorld('app', {
  getUser: () => ipcRenderer.invoke('get-user'),
});
```

```js
web.webContents.ipc.handle('get-user', async () => {
  return { name: application.storage.get('name') };
});
```

网页里：

```js
const user = await app.getUser();
```

**效果**

- 网页里的 `user` 是处理函数返回的那个对象。处理函数可以是异步的，网页会一直等到它返回。
- 处理函数抛了异常，网页那边的 Promise 被拒绝，说明是 `Error invoking remote method 'get-user': Error: …`。
- App 没登记这个频道时，网页那边同样被拒绝，说明是 `Error invoking remote method 'get-user': Error: No handler registered for 'get-user'`。

### App 主动通知网页

```js
// JS/web/preload.js
ipcRenderer.on('theme', (event, name) => {
  document.documentElement.dataset.theme = name;
});
```

```js
web.webContents.send('theme', 'dark');
```

**效果**

- 网页的 `<html>` 上多了 `data-theme="dark"`。
- 网页还没加载、或者没配预加载脚本时，这条消息没人收，直接丢掉，不报错。所以要在 `did-finish-load` 之后再发。

### 先加载，要用的时候再显示

`WebView` 不加进界面也能加载。提前建好几张，要显示哪张就把哪张加进界面。

```js
// 提前加载两张。它们还不在界面里，所以要自己拿着引用
const pages = {
  help: new WebView(),
  terms: new WebView(),
};
pages.help.webContents.loadURL('https://example.com/help');
pages.terms.webContents.loadURL('https://example.com/terms');

// 之后要显示帮助页时
function show(view) {
  view.frame = page.view.bounds;
  page.view.addSubview(view);
}
show(pages.help);
```

**效果**

- 两张网页在后台加载，包括网络请求。屏幕上没有变化。
- 调 `show(pages.help)` 时，帮助页立刻显示出来，不用再等加载。

不在界面里的网页有两点不同：

- 网页里读 `document.visibilityState` 是 `'hidden'`。
- 系统会放慢它的定时器：间隔 100 毫秒的 `setInterval` 大约每秒只执行一次。

想让网页在显示之前就照常运行，把它加进界面再设 `isHidden = true`。隐藏的视图不显示、不接收触摸，但网页认为自己是可见的，定时器照常。

> **注意**：还没加进界面的 `WebView` 要自己拿着引用，像上面存进 `pages` 那样。没有任何引用的 `WebView` 会被回收，网页跟着销毁。加进界面之后不用管。

### 让几张网页共用或者隔离登录状态

网页的 cookie、`localStorage` 和缓存存在一个存储分区里。建 `WebView` 时用 `partition` 指定用哪一个。

```js
// 这两张共用一份数据：在一张里登录，另一张也是登录状态
const shop = new WebView({ webPreferences: { partition: 'persist:shop' } });
const cart = new WebView({ webPreferences: { partition: 'persist:shop' } });

// 这一张用另一份，和上面两张互不相干
const guest = new WebView({ webPreferences: { partition: 'guest' } });
```

**效果**

- `shop` 和 `cart` 读写的是同一份 cookie 和 `localStorage`。App 退出再打开，数据还在。
- `guest` 看不到它们的数据。App 退出之后 `guest` 的数据就没了。

三种写法的区别见[存储分区](#存储分区)。

### 销毁一张网页

一张网页占的内存不小，不用了就销毁。

```js
contents.addEventListener('destroyed', () => console.log('销毁了'));
contents.close();
console.log(contents.isDestroyed());
web.removeFromSuperview();
```

**效果**

- 控制台输出 `true`，然后输出 `销毁了`。
- 网页从屏幕上消失，它占的内存被释放。
- `web` 还是一个视图，只是里面空了。不用了就像别的视图一样从界面上拿掉。
- 之后再调 `contents.getURL()` 等方法会抛 `TypeError: Object has been destroyed`。

### 网页崩溃之后恢复

每张网页在自己独立的进程里运行。这个进程可能崩溃，也可能在内存紧张时被系统结束。这时网页变成空白。

```js
contents.addEventListener('render-process-gone', () => {
  contents.reload();
});
```

**效果**

- 网页的进程被结束时，网页重新加载，恢复显示。
- 在 `render-process-gone` 的回调里读 `contents.isCrashed()` 是 `true`，重新加载之后变回 `false`。

### 让网页伸到状态栏和底部横条下面

完整例子里网页只占安全区。要让网页铺满整个屏幕，把约束接到 `page.view` 自己的边上，并在网页里用 CSS 避开被挡住的部分。

```js
NSLayoutConstraint.activateConstraints([
  web.topAnchor.constraintEqualToAnchor(page.view.topAnchor),
  web.bottomAnchor.constraintEqualToAnchor(page.view.bottomAnchor),
  web.leadingAnchor.constraintEqualToAnchor(page.view.leadingAnchor),
  web.trailingAnchor.constraintEqualToAnchor(page.view.trailingAnchor),
]);
```

网页那一侧要写 `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`，再用 `env(safe-area-inset-top)` 这一组 CSS 值留出边距。

**效果**

- 网页的背景伸到状态栏和底部横条下面。
- 在 iPhone Air 上，网页里 `env(safe-area-inset-top)` 是 68px，`env(safe-area-inset-bottom)` 是 34px，和窗口的 `safeAreaInsets`（68 pt、34 pt）相等。
- 网页只占安全区时，这两个值是 0。

## 概念

### `WebView` 和 `webContents` 的分工

| 想做的事 | 用哪个 | 例子 |
| --- | --- | --- |
| 改位置和大小 | `WebView` | `web.frame = …`，或者约束 |
| 显示、隐藏、透明度 | `WebView` | `web.isHidden = true` |
| 圆角、边框 | `WebView` | `web.layer.cornerRadius = 12` |
| 加载地址、后退前进 | `webContents` | `web.webContents.loadURL(…)` |
| 监听加载过程 | `webContents` | `web.webContents.addEventListener(…)` |

`WebView` 继承自 [`UIView`](ui-view.md)，视图有的属性和方法它都有。

### 网页感知得到什么

视图这边的变化，网页里用标准的 Web 接口都能感知到。

| 视图这边发生的事 | 网页里看到什么 |
| --- | --- |
| 视图的宽高变了 | `window.innerWidth` / `innerHeight` 跟着变，派发 `resize`。1 pt 对应 CSS 的 1px |
| 视图伸到安全区外面 | `env(safe-area-inset-*)` 给出被挡住的宽度，需要 `viewport-fit=cover` |
| 系统切换深浅色，或者视图被[强制](ui-trait-collection.md)成深色或浅色 | `prefers-color-scheme` 跟着变，`matchMedia` 的 `change` 事件会派发 |
| 设 `isHidden` | **没有变化。** 不派发 `visibilitychange` |
| 从界面上拿掉（`removeFromSuperview`） | `visibilityState` 变成 `'hidden'`，派发 `visibilitychange` |
| 加回界面 | `visibilityState` 变回 `'visible'`，派发 `visibilitychange` |
| App 退到后台、回到前台 | `visibilityState` 变成 `'hidden'`、变回 `'visible'`（未在模拟器验证） |

### `will-navigate` 什么时候派发

只有**网页自己发起的、会换成另一个文档的**跳转才派发。

| 情况 | 派发吗 | `navigationType` |
| --- | --- | --- |
| 用户点链接 | 是 | `'linkActivated'` |
| 网页的脚本改 `location` | 是 | `'other'` |
| 提交表单 | 是 | `'formSubmitted'` |
| 网页的脚本调 `location.reload()` | 是 | `'reload'` |
| 网页的脚本调 `history.back()` / `forward()` | 是 | `'backForward'` |
| `tel:`、`mailto:`、自定义协议的链接 | 是 | 同上，按它是怎么引起的 |
| App 调 `loadURL()`、`reload()`、`navigationHistory.goBack()` / `goForward()` | 否 | |
| 服务器重定向（301、302） | 否。只为重定向之前的那个地址派发一次 | |
| 只改 `#` 后面的部分 | 否 | |
| `history.pushState()` | 否 | |
| `<iframe>` 里的跳转 | 否 | |

拦住之后网页留在原地，不派发任何加载事件。监听器里抛了异常，按没拦算。

用户点一下链接，到跳转真正开始，中间要等监听器执行完。监听器里不要做耗时的事。

### 预加载脚本

预加载脚本是建 `WebView` 时用 `webPreferences.preload` 指定的一个 JS 文件。

| | |
| --- | --- |
| 什么时候执行 | 每张网页开始加载时，在网页自己的任何脚本之前。那时还没有 `<body>` |
| 在哪里执行 | 只在主文档里。`<iframe>` 里不执行 |
| 换了网页 | 重新执行一遍 |
| 能用什么 | 网页里能用的一切（`document`、`window`），外加 `ipcRenderer` 和 `contextBridge` 两个名字 |
| 网页禁止了脚本（内容安全策略） | 照常执行。受限的只是网页自己的脚本 |

它和网页的脚本在**同一个环境**里：预加载脚本往 `window` 上挂的东西，网页看得到也改得了。这相当于 Electron 的 `contextIsolation: false`，和 Electron 的默认值相反。

预加载脚本里能用的两个名字：

| 名字 | 用法 | 作用 |
| --- | --- | --- |
| `ipcRenderer.send(channel, ...args)` | | 给 App 发一条消息。App 收到 `ipc-message` 事件 |
| `ipcRenderer.invoke(channel, ...args)` | 返回 Promise | 向 App 要一个结果。App 用 `ipc.handle` 应答 |
| `ipcRenderer.on(channel, listener)` | `listener(event, ...args)` | 收 App 用 `contents.send` 发来的消息 |
| `ipcRenderer.once(channel, listener)` | | 同上，只收一次 |
| `ipcRenderer.off(channel, listener)` | 也叫 `removeListener` | 不再收 |
| `ipcRenderer.removeAllListeners(channel)` | `channel` 可以不给 | 去掉一个频道（或全部频道）的监听 |
| `contextBridge.exposeInMainWorld(key, api)` | | 把 `api` 挂到网页的 `window[key]` 上，网页改不掉这个名字。名字已经被占用时抛 |

### 值怎么传

`executeJavaScript` 的结果、消息的参数、`invoke` 的返回值，都按 JSON 传。

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

### 本地网页的限制

用 `loadFile` 加载的网页，地址是 `file://` 开头的。它和从服务器加载的网页有几处不同。

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

静态页面和用传统方式（一个普通的 `<script>`）打包的网页适合用 `loadFile`。用到模块脚本的单页应用现在还不能从本地加载。

### 存储分区

`partition` 决定网页的 cookie、`localStorage` 和缓存存在哪一份里。写法和 Electron 相同。

| `partition` 的值 | 数据存在哪 | App 退出之后 |
| --- | --- | --- |
| 不写，或者空串 | 默认的那一份。所有不写 `partition` 的网页共用 | 还在 |
| `'persist:名字'` | 名字对应的那一份。同名的网页共用 | 还在 |
| `'名字'`（不带 `persist:`） | 名字对应的那一份，只在内存里。同名的网页共用 | 没了 |

不同分区之间互相看不到数据。`partition` 只能在建 `WebView` 时指定，之后不能改。

网页的 cookie 和 [`fetch`](fetch.md) 的 cookie 是分开的两份：在网页里登录，不会让 `fetch` 带上登录状态，反过来也一样。

### 每张网页占多少资源

每张网页在自己独立的进程里运行，和 App 的 JS 不在同一个进程。所以网页里的脚本再慢也不会卡住 App 的界面，网页崩溃也不会让 App 退出。

代价是内存：模拟器上实测一张简单的网页占 60 MB 左右。同时存在的网页越多，被系统结束进程的可能越大。不用的网页用 `close()` 销毁。

### 谁拿着 `WebView`

| `WebView` 的状态 | 需要自己拿着引用吗 |
| --- | --- |
| 在界面里 | 不需要。界面拿着它 |
| 不在界面里（还没加进去，或者拿掉了） | 需要。没有引用就会被回收，网页跟着销毁 |

## 成员说明

### `WebView`

```js
new WebView();
new WebView({ webPreferences: { partition: 'persist:main' } });
```

| 参数 | 类型 | 默认值 | 含义 |
| --- | --- | --- | --- |
| `options.webPreferences.partition` | `string` | `''` | 用哪个[存储分区](#存储分区) |
| `options.webPreferences.preload` | `string` | 无 | [预加载脚本](#预加载脚本)的路径。相对路径从 App 包的根开始，`/` 开头的是绝对路径 |

`options` 和 `webPreferences` 都可以不传。`WebView` 不能被继承。

指定了 `preload` 时，`new WebView` 可能抛：

| 情况 | 抛什么 |
| --- | --- |
| 文件读不到 | `TypeError: preload: cannot read JS/web/preload.js as UTF-8 text` |
| 脚本有语法错 | `SyntaxError: preload JS/web/preload.js: …`，后面是具体的语法错误 |

| 属性 | 类型 | 可读 | 可写 | 含义 |
| --- | --- | --- | --- | --- |
| `webContents` | `WebContents` | 是 | 否 | 里面那张网页。每次读是同一个对象 |

其余成员继承自 [`UIView`](ui-view.md)。

### `WebContents`

从 `webView.webContents` 得到，不能自己建：`new WebContents()` 抛 `TypeError: Illegal constructor: WebContents is created by the runtime, not by new`。

| 方法 | 返回值 | 含义 |
| --- | --- | --- |
| `loadURL(url)` | `Promise<void>` | 加载一个地址。见下 |
| `loadFile(filePath, options)` | `Promise<void>` | 加载一个本地的网页文件。见下 |
| `executeJavaScript(code)` | `Promise<any>` | 在网页里执行一段代码，兑现它的结果。见下 |
| `send(channel, ...args)` | 无 | 给网页的预加载脚本发一条消息。参数里有函数时抛 `TypeError: send: functions cannot be sent` |
| `getURL()` | `string` | 当前网页的地址。还没加载过是空串 |
| `getTitle()` | `string` | 当前网页的标题。没有标题是空串 |
| `isLoading()` | `boolean` | 是不是正在加载 |
| `stop()` | 无 | 停掉正在进行的加载。还没兑现的 `loadURL` 以 `AbortError` 拒绝 |
| `reload()` | 无 | 重新加载当前的地址 |
| `close()` | 无 | 销毁这张网页。已经销毁的再调什么都不发生 |
| `isDestroyed()` | `boolean` | 是不是已经销毁 |
| `isCrashed()` | `boolean` | 网页的进程是不是已经不在了。重新加载之后变回 `false` |

| 属性 | 类型 | 可读 | 可写 | 含义 |
| --- | --- | --- | --- | --- |
| `navigationHistory` | `NavigationHistory` | 是 | 否 | 后退和前进。每次读是同一个对象 |
| `ipc` | `WebContentsIPC` | 是 | 否 | 应答网页的 `ipcRenderer.invoke`。每次读是同一个对象 |

`getURL()`、`getTitle()`、`isLoading()` 的值变化时分别有事件通知：`did-navigate`、`page-title-updated`、`did-start-loading` 和 `did-stop-loading`。

销毁之后，除了 `close()` 和 `isDestroyed()`，其余方法都抛 `TypeError: Object has been destroyed`；`loadURL` 返回一个以同样的错误拒绝的 Promise。

#### `loadURL(url)`

`url` 必须带协议，比如 `https://`。支持 `https:`、`file:`、`data:` 和 `about:`（`about:blank` 是一张空白页）。`file:` 的地址和 `loadFile` 效果相同。

返回的 Promise：

| 情况 | 结果 |
| --- | --- |
| 加载完 | 兑现，值是 `undefined` |
| 服务器返回 404、500 等 | 兑现。状态码在 `did-navigate` 事件上 |
| 地址没带协议，或者是空串 | 以 `TypeError` 拒绝：`loadURL: invalid URL; it must include the scheme, like https://`。不发起加载 |
| 网络层失败（域名解析不了、没有网络、超时） | 以 `name` 为 `'NetworkError'` 的错误拒绝 |
| 被 `stop()` 停掉 | 以 `name` 为 `'AbortError'` 的错误拒绝，`code` 是 `-999` |
| 被另一次加载取代 | 以 `name` 为 `'AbortError'` 的错误拒绝 |
| 加载中途被 `close()` 销毁 | 以 `name` 为 `'AbortError'` 的错误拒绝 |

拒绝的错误上有两个附加的字段：`code` 是系统的错误码（见 [`did-fail-load`](#事件) 的 `errorCode`），`domain` 是错误的来源，网络层的错误是 `'NSURLErrorDomain'`。`message` 是系统给的说明，语言跟随系统，只适合打日志。

> **注意**：明文的 `http://` 地址会被系统拦截：`loadURL` 以 `NetworkError` 拒绝，`code` 是 `-1022`。用 `https://`。`http://localhost` 不受这条限制，开发时可以用。

#### `loadFile(filePath, options)`

| 参数 | 类型 | 含义 |
| --- | --- | --- |
| `filePath` | `string` | 网页文件的路径。相对路径从 App 包的根开始；`/` 开头的是绝对路径 |
| `options.query` | 对象 | 地址里 `?` 后面的部分，按键值给：`{ a: '1' }` 得到 `?a=1` |
| `options.search` | `string` | 地址里 `?` 后面的部分，直接给字符串。带不带开头的 `?` 都可以。和 `query` 都给时用它 |
| `options.hash` | `string` | 地址里 `#` 后面的部分。带不带开头的 `#` 都可以 |

返回的 Promise 和事件与 `loadURL` 相同。不同的只有出错的情况：

| 情况 | 结果 |
| --- | --- |
| `filePath` 是空串 | 以 `TypeError` 拒绝：`loadFile: the path is empty` |
| 文件不存在 | 以 `name` 为 `'NetworkError'` 的错误拒绝，`code` 是 `-1100`，同时派发 `did-fail-load` |
| 路径是一个目录 | 以 `name` 为 `'Error'` 的错误拒绝，`code` 是 `102`，同时派发 `did-fail-load` |

> **注意**：最后一种情况（以及用 `loadURL` 加载一个不能显示的文件，比如压缩包）在 iOS 27 上要等 4 秒多才报失败，iOS 26 上是立刻。

#### `executeJavaScript(code)`

| 情况 | 结果 |
| --- | --- |
| 代码是一个表达式 | 兑现它的值。值是 Promise 时等它；它被拒绝，这边也被拒绝 |
| 代码是多条语句 | 兑现最后一个表达式的值，不等 Promise。值是对象时成员顺序不保证 |
| 网页里抛了异常，或者代码有语法错 | 以 `Error` 拒绝，`message` 是网页那边的原文，比如 `Error: boom`、`SyntaxError: …` |
| 结果传不回来（函数、DOM 节点、多条语句得到的 Promise） | 以 `TypeError` 拒绝：`executeJavaScript: the result cannot be passed back; it is a function, a DOM node, or a Promise produced by multi-statement code` |

三种开头的代码按多条语句处理：`{`（语句块）、`function`、`class`（声明，名字会进网页的全局）。结尾的分号不影响判断，`'foo();'` 算表达式。

还没加载任何网页时也能执行，那时是一张空白文档。网页禁止了脚本（内容安全策略）时照常能执行。

### `WebContentsIPC`

从 `webContents.ipc` 得到。

| 方法 | 含义 |
| --- | --- |
| `handle(channel, listener)` | 登记一个频道的处理函数。`listener(event, ...args)` 的返回值（或它返回的 Promise 兑现的值）就是网页那边 `ipcRenderer.invoke` 的结果。`event.sender` 是发来请求的 `webContents` |
| `removeHandler(channel)` | 去掉一个频道的处理函数。没登记过也不报错 |

一个频道只能登记一个处理函数。重复登记抛 `Error: Attempted to register a second handler for 'get-user'`。

网页销毁时还没答复的请求，网页那边全部被拒绝。

### `NavigationHistory`

从 `webContents.navigationHistory` 得到。

| 方法 | 返回值 | 含义 |
| --- | --- | --- |
| `canGoBack()` | `boolean` | 能不能后退 |
| `canGoForward()` | `boolean` | 能不能前进 |
| `goBack()` | 无 | 后退一页。不能后退时什么都不发生 |
| `goForward()` | 无 | 前进一页。不能前进时什么都不发生 |

能不能后退、前进在每次 `did-navigate` 之后可能变化，在那个事件里重新读。

### 事件

在 `webContents` 上用 `addEventListener` 监听。事件名写错会抛 `TypeError`，报错里列出全部可用的名字：

```
addEventListener has no value "did-finsh-load"; expected one of: will-navigate / did-start-loading / did-stop-loading / did-finish-load / did-fail-load / did-navigate / page-title-updated / ipc-message / preload-error / render-process-gone / destroyed
```

| 事件 | 什么时候派发 | 事件对象上的字段 |
| --- | --- | --- |
| `will-navigate` | 网页自己要跳到别的地址，还没开始跳。见[什么时候派发](#will-navigate-什么时候派发) | `url`、`isMainFrame`、`navigationType` |
| `did-start-loading` | 开始加载 | 无 |
| `did-stop-loading` | 不再加载。成功和失败都会派发 | 无 |
| `did-navigate` | 网页换成了一个新的文档 | `url`、`httpResponseCode` |
| `did-finish-load` | 加载完 | 无 |
| `did-fail-load` | 加载失败 | `errorCode`、`errorDescription`、`validatedURL`、`isMainFrame` |
| `page-title-updated` | 标题变了 | `title` |
| `ipc-message` | 网页的预加载脚本调了 `ipcRenderer.send` | `channel`、`args` |
| `preload-error` | 预加载脚本执行时抛了异常。网页照常加载 | `preloadPath`、`error` |
| `render-process-gone` | 网页的进程不在了（崩溃，或者被系统结束） | 无 |
| `destroyed` | 被 `close()` 销毁 | 无 |

`will-navigate` 是唯一能取消的事件：它的 `cancelable` 是 `true`，调 `preventDefault()` 跳转就不发生。其余事件派发时事情已经发生，`cancelable` 是 `false`，调 `preventDefault()` 没有效果。

字段的含义：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `url` | `string` | `did-navigate`：新的地址。`will-navigate`：要去的地址 |
| `navigationType` | `string` | 这次跳转是怎么引起的，取值见下 |
| `httpResponseCode` | `number` | HTTP 状态码。`data:`、`about:`、本地文件这类不经过 HTTP 的是 `-1`。后退或前进回到一张之前加载过的网页时也是 `-1`：那时没有重新请求服务器 |
| `errorCode` | `number` | 系统的错误码。常见的：`-1003` 域名解析不了，`-1009` 没有网络，`-1001` 超时，`-1022` 明文 `http://` 被拦截，`-999` 被取消 |
| `errorDescription` | `string` | 系统给的说明。语言跟随系统，只适合打日志 |
| `validatedURL` | `string` | 加载失败的那个地址 |
| `isMainFrame` | `boolean` | 总是 `true`。网页里 `<iframe>` 的跳转和加载失败不会派发这两个事件 |
| `title` | `string` | 新的标题 |
| `channel` | `string` | 频道名 |
| `args` | 数组 | 跟在频道名后面的那些参数 |
| `preloadPath` | `string` | 建 `WebView` 时给的预加载脚本路径 |
| `error` | `Error` | 预加载脚本抛出来的错误 |

`navigationType` 的取值：

| 取值 | 含义 |
| --- | --- |
| `'linkActivated'` | 点了链接 |
| `'formSubmitted'` | 提交了表单 |
| `'backForward'` | 网页的脚本后退或前进 |
| `'reload'` | 网页的脚本刷新 |
| `'formResubmitted'` | 重新提交表单，比如后退到一个由表单提交得到的页面（未在模拟器验证） |
| `'other'` | 其余的。最常见的是脚本改 `location` |

> **注意**：`loadURL` 之后立刻 `stop()`，Promise 以 `AbortError` 拒绝，但**不派发** `did-fail-load`。要知道一次 `loadURL` 的结果，以它的 Promise 为准。

## 与 Electron 的对照

| Electron | 这里 | 差别 |
| --- | --- | --- |
| `new WebContentsView({ webPreferences })` | `new WebView({ webPreferences })` | 只支持 `partition` |
| `view.setBounds({ x, y, width, height })` | `web.frame = new CGRect(x, y, width, height)` | 也可以用约束 |
| `win.contentView.addChildView(view)` | `page.view.addSubview(web)` | |
| `contents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => …)` | `contents.addEventListener('did-fail-load', (e) => …)` | 数据在 `e` 上，字段名相同 |
| `contents.on('will-navigate', (details) => details.preventDefault())` | `contents.addEventListener('will-navigate', (e) => e.preventDefault())` | 多一个 `navigationType`；没有 `frame`、`initiator` |
| `did-navigate` 的 `httpStatusText` | 没有 | 系统不提供 |
| `render-process-gone` 的 `details.reason` | 没有 | 系统不说原因 |
| `did-fail-load` 的 `errorCode`（`-105` 等） | `errorCode`（`-1003` 等） | 数不同 |
| `contents.executeJavaScript(code)` | 相同 | 多条语句的代码不等 Promise、带回的对象不保证成员顺序；结果按 JSON 传（日期是字符串，`Map` 是 `{}`） |
| `webPreferences.preload` | 相同 | 相对路径的起点是 App 包。不隔离，相当于 `contextIsolation: false` |
| `ipcRenderer.send` / `invoke` / `on`、`contextBridge.exposeInMainWorld` | 相同 | 是预加载脚本里直接能用的名字，不用 `require('electron')` |
| `contents.on('ipc-message', (event, channel, ...args) => …)` | `contents.addEventListener('ipc-message', (e) => …)` | `e.channel`、`e.args` |
| `contents.send(channel, ...args)`、`contents.ipc.handle(channel, listener)` | 相同 | |
| `contents.loadFile(filePath, { query, search, hash })` | 相同 | 相对路径的起点是 App 包。本地网页的限制比 Electron 多，见[本地网页的限制](#本地网页的限制) |
| `contents.navigationHistory.goBack()` | 相同 | |
| `contents.close()` / `isDestroyed()` / `'destroyed'` | 相同 | |

## 与 iOS 原生写法的对照

| ObjC（`WKWebView`） | JS |
| --- | --- |
| `[[WKWebView alloc] initWithFrame:configuration:]` | `new WebView()` |
| `configuration.websiteDataStore` | `webPreferences.partition` |
| `[webView loadRequest:]` | `contents.loadURL(url)` |
| `[webView loadFileURL:allowingReadAccessToURL:]` | `contents.loadFile(filePath)`。可读的目录由运行时按文件的位置定 |
| `webView.URL` | `contents.getURL()` |
| `webView.title` | `contents.getTitle()`，`page-title-updated` 事件 |
| `webView.loading` | `contents.isLoading()`，`did-start-loading` / `did-stop-loading` 事件 |
| `[webView stopLoading]` | `contents.stop()` |
| `[webView reload]` | `contents.reload()` |
| `webView.canGoBack` / `canGoForward` | `contents.navigationHistory.canGoBack()` / `canGoForward()` |
| `[webView goBack]` / `[webView goForward]` | `contents.navigationHistory.goBack()` / `goForward()` |
| `[webView evaluateJavaScript:completionHandler:]`、`callAsyncJavaScript:…` | `contents.executeJavaScript(code)` |
| `WKUserScript`（文档开始时注入，只进主文档） | `webPreferences.preload` |
| `WKScriptMessageHandlerWithReply` | 预加载脚本里的 `ipcRenderer`；App 这边的 `ipc-message` 事件和 `ipc.handle` |
| `webView:decidePolicyForNavigationAction:decisionHandler:` | `will-navigate` 事件，`decisionHandler(.cancel)` 对应 `e.preventDefault()` |
| `navigationAction.navigationType` | 事件的 `navigationType` |
| `webView:didCommitNavigation:` | `did-navigate` 事件 |
| `webView:didFinishNavigation:` | `did-finish-load` 事件 |
| `webView:didFailNavigation:withError:`、`webView:didFailProvisionalNavigation:withError:` | `did-fail-load` 事件 |
| `webViewWebContentProcessDidTerminate:` | `render-process-gone` 事件 |
| 释放 `WKWebView` | `contents.close()` |

## 还不能做的

| 想做的事 | 对应的能力 |
| --- | --- |
| 拦住服务器重定向 | Electron 的 `will-redirect` |
| 拦住 `<iframe>` 里的跳转 | Electron 的 `will-frame-navigate` |
| 让预加载脚本和网页的脚本互相隔离 | Electron 的 `contextIsolation`；`WKContentWorld` |
| 在 `<iframe>` 里也执行预加载脚本 | Electron 的 `nodeIntegrationInSubFrames`；`WKUserScript` 的 `forMainFrameOnly` |
| 网页同步地向 App 要一个结果 | Electron 的 `ipcRenderer.sendSync` |
| 在 App 这边看到网页的 `console` 输出 | Electron 的 `console-message` |
| 预加载脚本的类型定义（`ipcRenderer`、`contextBridge`） | |
| 读写、删除 cookie，清掉某个分区的数据 | Electron 的 `session.cookies`、`clearStorageData`；`WKHTTPCookieStore`、`WKWebsiteDataStore` |
| 从本地加载用到模块脚本、用 `fetch` 读本地文件的网页 | Electron 的 `protocol.handle`；`WKURLSchemeHandler`（让本地文件以自己定的协议提供） |
| 自己指定本地网页能读哪个目录 | `loadFileURL:allowingReadAccessToURL:` 的第二个参数 |
| 让不在界面里的网页不被放慢 | Electron 的 `backgroundThrottling`。系统没有起作用的公开开关。替代做法见[先加载，要用的时候再显示](#先加载要用的时候再显示) |
| 处理网页打开新窗口的请求（`window.open`、`target="_blank"`） | Electron 的 `setWindowOpenHandler`；`WKUIDelegate` |
| 显示网页的 `alert()`、`confirm()`、`prompt()` | `WKUIDelegate` |
| 加载进度的百分比 | `estimatedProgress` |
| 网页内跳转的通知（只改 `#` 后面的部分） | Electron 的 `did-navigate-in-page` |
| 历史记录的列表、跳到某一条 | Electron 的 `navigationHistory.getAllEntries()`、`goToIndex()`；`backForwardList` |
| 改 User-Agent、缩放 | Electron 的 `setUserAgent`、`setZoomFactor`；`customUserAgent`、`pageZoom` |
| 从屏幕左边缘右滑后退 | `allowsBackForwardNavigationGestures` |
| 用 Safari 的开发者工具调试网页 | `inspectable` |
| 调网页滚动的行为（回弹、内边距） | `WKWebView.scrollView` |
| 下载文件 | Electron 的 `will-download`；`WKDownload` |

## 参见

- [视图](ui-view.md)：`WebView` 的摆放、显示隐藏、圆角都用它的成员。
- [Auto Layout](auto-layout.md)：完整例子里让网页占满安全区用的约束。
- [外观特征](ui-trait-collection.md)：强制深浅色，网页的 `prefers-color-scheme` 会跟着变。
- [`fetch`](fetch.md)：只要数据、不需要显示网页时用它。它的 cookie 和网页的不通。
- [实现原理](../internals/web-view.md)：为什么分成两个对象、几条实测的数据。
