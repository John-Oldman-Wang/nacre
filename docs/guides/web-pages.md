# 显示网页

这一篇讲怎么用 [`WebView`](../api/web-view.md) 在 App 里显示网页：加载地址和本地文件、处理加载失败、后退前进、限制网页能去的地址、提前加载、销毁和崩溃之后恢复。加载和事件都在 [`WebContents`](../api/web-contents.md) 上，后退前进在 [`NavigationHistory`](../api/navigation-history.md) 上。

网页要调用 App 的功能、App 要通知网页，见另一篇[让网页和 App 互发消息](web-page-messaging.md)。

## 推荐的做法

- **用约束让 `WebView` 占满安全区。** 安全区是屏幕上不会被刘海、状态栏和底部横条挡住的那一块。要让网页铺到状态栏下面，见[让网页伸到状态栏和底部横条下面](#让网页伸到状态栏和底部横条下面)。
- **要知道自己发起的那一次加载的结果，用 `loadURL()` 返回的 Promise。** 要连同用户点链接引起的加载一起处理时，监听事件。
- **用 `will-navigate` 限制网页能去的地址。** 配了预加载脚本的 `WebView` 尤其需要：网页一旦跳到别的站点，那个站点的脚本同样拿得到消息通道。
- **不用的网页调 `close()`。** 一张简单的网页在模拟器上实测占 60 MB 左右。理由见[内存和引用](../api/web-view.md#内存和引用)。
- **用 `https://`。** 明文的 `http://` 地址会被系统拦截，只有 `http://localhost` 例外。
- **本地网页用到模块脚本或者 `fetch` 时，用自定义协议加载。** 见[用自定义协议加载本地网页](#用自定义协议加载本地网页)。

## 第一张网页

从空白 App 开始，显示一张占满安全区的网页，并把加载过程打到控制台。

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

- 屏幕上显示 example.com 的网页。它占满安全区：上边在状态栏下面，下边在底部横条上面。
- 链接可以点。网页内容超出视图时可以滚动（滚动**未在模拟器验证**）。
- 控制台输出 `到了 https://example.com/ 状态码 200`、`加载完 https://example.com/`、`标题 Example Domain`。后两行谁先谁后不固定。

三步分别是：建 `WebView` 并放到页面上、在 `webContents` 上监听事件、加载。下面各节沿用这里的 `page`、`web` 和 `contents`。单独试某一节时，先写下面三行，再接着写那一节的代码：

```js
const page = new UIViewController();
const web = new WebView();
const contents = web.webContents;
```

## 知道加载到哪一步了

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

显示加载指示用 [`did-start-loading`](../api/web-contents/did-start-loading-event.md) 和 [`did-stop-loading`](../api/web-contents/did-stop-loading-event.md) 这一对。

## 处理加载失败

加载失败时，`loadURL` 返回的 Promise 被拒绝，同时派发 [`did-fail-load`](../api/web-contents/did-fail-load-event.md) 事件。两处带的信息相同。只关心自己发起的这一次加载时用 Promise；要连同用户点链接引起的加载失败一起处理时，监听事件。

```js
try {
  await contents.loadURL('https://no-such-host.invalid/');
} catch (err) {
  const failure = /** @type {Error & { code: number }} */ (err);
  console.log(failure.name, failure.code);
}
```

**效果**

- 控制台输出 `NetworkError -1003`。
- 网页停在原来那一页，不会变成空白，也不显示错误页。要告诉用户加载失败，得自己显示提示。
- 同时派发一次 `did-fail-load`，它的 `errorCode` 是 `-1003`，`validatedURL` 是 `https://no-such-host.invalid/`。

只监听事件、不接 Promise 也可以。失败时不会多出一条未处理的拒绝。

服务器返回 404、500 **不算失败**：错误页照常加载完，Promise 兑现。状态码从 [`did-navigate`](../api/web-contents/did-navigate-event.md) 事件的 `httpResponseCode` 读。

```js
contents.addEventListener('did-navigate', (e) => {
  if (e.httpResponseCode >= 400) console.log('服务器返回了', e.httpResponseCode);
});
```

**效果**：加载一个返回 404 的地址时，控制台输出 `服务器返回了 404`。

## 显示网页的标题

```js
contents.addEventListener('page-title-updated', (e) => {
  page.title = e.title;
});
```

**效果**

- 网页的标题变化时，页面的标题跟着变。
- 换页的瞬间会先收到一次空串，新页面的标题到了再收到一次。

> **注意**：不要在 `did-finish-load` 里或者 `loadURL` 兑现之后直接读 `getTitle()`。标题和「加载完」谁先到不固定，这时可能还读到空串。要标题就监听 [`page-title-updated`](../api/web-contents/page-title-updated-event.md)。

## 后退、前进、刷新

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

`WebView` 没有从屏幕左边缘右滑后退的手势。要后退，在界面上放一个按钮调 [`goBack()`](../api/navigation-history/goback.md)。

## 停掉正在进行的加载

```js
const loading = contents.loadURL('https://example.com/big');
contents.stop();
loading.catch((err) => console.log(err.name, err.code));
```

**效果**

- 控制台输出 `AbortError -999`。
- 网页停在原来那一页。

连着调两次 `loadURL` 时，后一次会取代前一次：前一次的 Promise 以 `AbortError` 拒绝，后一次照常兑现。

## 只允许网页跳到自己的域名

网页自己要跳到别的地址时（用户点了链接、脚本改了 `location`、提交了表单），先派发 [`will-navigate`](../api/web-contents/will-navigate-event.md)。在监听器里调 `preventDefault()`，这次跳转就不发生。

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

服务器重定向、只改 `#` 后面的部分、`history.pushState()`、`<iframe>` 里的跳转也不派发。全部情况见 [`will-navigate`](../api/web-contents/will-navigate-event.md#什么时候派发)。

## 处理电话、邮件和自定义协议的链接

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

- 点 `tel:10086` 的链接：`e.url` 是 `tel:10086`，网页留在原地，不派发 `did-fail-load`。系统弹出拨号确认（**未在模拟器验证**，模拟器不能拨号）。
- 点 `myapp://share?id=1` 的链接：控制台输出 `网页让 App 做一件事 myapp://share?id=1`。
- 不拦 `tel:` 链接时：派发 `did-fail-load`，`errorCode` 是 `-1002`。

自定义协议的地址是网页给的，属于不可信的输入：按它做事之前，检查它是不是 App 认识的那几种。

## 要先查一下再决定放不放行

放不放行在监听器**返回的那一刻**就定了，不能 `await` 之后再调 `preventDefault()`。需要异步判断时，先拦住，查完再自己加载。

```js
/** App 自己的检查。这里用一个固定的名单代替
 * @param {string} url */
async function isAllowed(url) {
  return url.startsWith('https://my.app/');
}

contents.addEventListener('will-navigate', async (e) => {
  e.preventDefault();                       // 先拦住。这一句要在第一个 await 之前
  const allowed = await isAllowed(e.url);
  if (allowed) contents.loadURL(e.url);
});
```

**效果**

- 网页先留在原地。`isAllowed` 兑现 `true` 之后才开始跳转。
- `loadURL` 发起的加载不派发 `will-navigate`，所以不会再进这个监听器。

## 加载打进 App 包里的网页

协议、帮助这类不需要联网的页面，可以把网页文件和 App 一起打包，用 [`loadFile()`](../api/web-contents/loadfile.md) 加载。相对路径从 App 包的根目录开始算。App 包是安装到设备上的那个目录，里面是 App 的程序和打包进去的资源文件，只能读不能写。

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

> **注意**：`loadFile()` 加载的网页里 `<script type="module">` 不执行，`fetch` 也读不了本地文件。用到这两样的网页（比如 Vite 默认的打包结果）用[自定义协议](#用自定义协议加载本地网页)加载。

## 用自定义协议加载本地网页

`loadFile()` 加载的网页地址是 `file://` 开头的：模块脚本不执行，`fetch` 读不了本地文件，所有本地网页共用一个来源（`file://`）。网页用到这些时，改用自定义协议：用 [`Protocol`](../api/protocol.md) 把一个目录登记成一个协议，比如 `app`，网页从 `app://local/index.html` 这样的地址加载，文件从这个目录里取。

| 网页 | 用哪个 |
| --- | --- |
| 静态页面、只有普通 `<script>` 的页面 | `loadFile()` 就够用 |
| 用 `<script type="module">` 的页面（比如 Vite 默认的打包结果） | 自定义协议 |
| 要用 `fetch` 读同一个目录里的 JSON 等文件 | 自定义协议 |
| 要一个独立的来源：`localStorage` 不和别的本地网页混在一起 | 自定义协议 |

把网页的打包结果放进项目的 `assets/web/`。这个目录在 App 包里是 `JS/assets/web`。

```js
// 1. 先登记：app://任意主机/路径 从 JS/assets/web 里取文件
session.defaultSession.protocol.serveDirectory('app', 'JS/assets/web');

// 2. 再建网页。登记之前建好的网页不认这个协议
const site = new WebView();
site.frame = page.view.bounds;
page.view.addSubview(site);
await site.webContents.loadURL('app://local/index.html');
console.log(await site.webContents.executeJavaScript('location.origin'));
```

**效果**

- 屏幕上显示 `assets/web/index.html`。不联网也能显示。
- 网页里的 `<script type="module">` 执行，能 `import` 同目录下的其他模块。样式表照常加载。
- 控制台输出 `app://local`。
- 网页里 `fetch('/data.json')` 取到 `assets/web/data.json`。以 `/` 开头的路径从这个目录的根算。
- `localStorage` 能用。`file://` 的网页看不见它写的数据。
- 网页里 `isSecureContext` 是 `true`。

这一节新建了 `site`，没有用第一个例子里的 `web`：`web` 在登记之前就建好了，加载 `app://` 的地址时 `loadURL()` 拒绝。

### 先登记，再建网页

一张网页认哪些协议，在 `new WebView()` 那一刻就定了。所以登记要放在建网页之前，推荐在 App 启动时登记一次。

- 登记之前建好的网页加载这个协议的地址，`loadURL()` 拒绝。
- 之后再调一次 `serveDirectory()` 换目录，之前建好的网页照旧用原来的目录，只有之后建的网页用新的。
- [`unhandle()`](../api/protocol/unhandle.md) 也一样：只对之后建的网页起作用。

### 主机名统一写 `local`

主机名不参与找文件：`app://local/a.html` 和 `app://other/a.html` 取的是同一个文件。主机名决定网页的来源：前者是 `app://local`，后者是 `app://other`，两个来源的 `localStorage` 不互通（**未在真机验证**）。整个 App 都写 `app://local/`，网页之间的数据就在同一个来源下。

### 分区各管各的

登记的协议属于一个分区。网页用了 `partition` 时，在那个分区的 `protocol` 上登记。

```js
session.fromPartition('persist:shop').protocol.serveDirectory('app', 'JS/assets/shop');
const shop = new WebView({ webPreferences: { partition: 'persist:shop' } });
await shop.webContents.loadURL('app://local/index.html');
```

**效果**

- `shop` 显示 `assets/shop/index.html`。
- 默认分区的网页加载 `app://local/index.html`，`loadURL()` 拒绝：默认分区没有登记 `app`。

### 判断页面找没找到

主页面的状态码从 [`did-navigate`](../api/web-contents/did-navigate-event.md) 读不到：自定义协议的主页面，`httpResponseCode` 是 `-1`。主页面的文件不存在时，`loadURL()` 照样兑现，网页上显示 `Not Found`。

网页里的 `fetch` 拿得到真实的状态码：文件不存在是 404。

```js
const status = await site.webContents.executeJavaScript("fetch('/nope.json').then((r) => r.status)");
console.log(status);
```

**效果**：`assets/web/` 里没有 `nope.json` 时，控制台输出 `404`。

服务的规则（`index.html`、`Content-Type`、不支持的请求方法）见 [`serveDirectory()`](../api/protocol/servedirectory.md#说明)。其中一条：分段请求一律给整个文件，网页里的 `<video>` 拖动进度条可能拖不动（**未在真机验证**）。

## 显示一段 HTML

服务器下发的协议、帮助文章是一段 HTML 字符串时，把它写成 `data:` 地址，用 [`loadURL()`](../api/web-contents/loadurl.md) 加载。不用先写进文件。

```js
const article = new WebView({ webPreferences: { javascript: false } });
const html = '<!doctype html><meta name="viewport" content="width=device-width">' +
  '<h1>用户协议</h1><p>……</p><img src="logo.png">';
await article.webContents.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html), {
  baseURLForDataURL: 'https://example.com/legal/',
});
```

**效果**

- 显示这段 HTML。图片按 `baseURLForDataURL` 找：`https://example.com/legal/logo.png`。**这张远程图片未在模拟器验证**；按相对路径找 App 包里的图片验过，见 [`loadURL()`](../api/web-contents/loadurl.md#显示一段-html引用-app-包里的图片)。
- `javascript: false`：内容里混进了 `<script>` 也不会执行。内容是自己写的、需要脚本时，去掉这一项。
- 不带 `baseURLForDataURL` 时，HTML 里的相对路径找不到东西；绝对地址照常加载。**未在模拟器验证。**

## 加载 App 下载下来的网页

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

## 读网页里的内容

[`executeJavaScript()`](../api/web-contents/executejavascript.md) 在网页里执行一段代码，把结果带回来。

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
- 这段代码不受网页的内容安全策略限制：网页禁止了脚本时照常执行。

代码是**一个表达式**时，结果是 Promise 会等。写成多条语句（`var a = 1; a + 1`）时取最后那个值，但不等 Promise。要在多条语句里用 `await`，包成一个立即执行的异步函数：

```js
const text = await contents.executeJavaScript(`(async () => {
  const response = await fetch('/api/user');
  return (await response.json()).name;
})()`);
```

**效果**：`text` 是接口返回的 `name`。

结果按 JSON 传回来，见[值怎么传](../api/web-contents.md#值怎么传)。结果是网页给的，用之前检查类型和取值范围。

## 先加载，要用的时候再显示

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
/** @param {WebView} view */
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

## 让几张网页共用或者隔离登录状态

网页的 cookie、`localStorage` 和缓存存在一个[存储分区](../api/web-view.md#存储分区)里。建 `WebView` 时用 `partition` 指定用哪一个。

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

App 自己读写分区里的 cookie、退出登录时清数据，用 [`session`](../api/session.md)。

## 销毁一张网页

一张网页占的内存不小，不用了就用 [`close()`](../api/web-contents/close.md) 销毁。

```js
contents.addEventListener('destroyed', () => console.log('销毁了'));
contents.close();
console.log(contents.isDestroyed());
web.removeFromSuperview();
```

**效果**

- 控制台输出 `true`，然后输出 `销毁了`。
- 网页从屏幕上消失，它占的内存被释放。
- `web` 还是一个视图，只是里面空了。不用了就和别的视图一样，从界面上移除。
- 之后再调 `contents.getURL()` 等方法会抛 `TypeError: Object has been destroyed`。
- 销毁不能撤销。要再显示网页，新建一个 `WebView`。
- 销毁时还在进行的 `loadURL`，它的 Promise 以 `AbortError` 被拒绝。

## 网页崩溃之后恢复

每张网页在自己独立的进程里运行。这个进程可能崩溃，也可能在内存紧张时被系统结束。这时网页变成空白，App 不受影响。运行时不会自动重新加载，要不要恢复由 App 决定。

```js
contents.addEventListener('render-process-gone', () => {
  contents.reload();
});
```

**效果**

- 网页的进程被结束时，网页重新加载，恢复显示。
- 在 `render-process-gone` 的回调里读 `contents.isCrashed()` 是 `true`，重新加载之后变回 `false`。
- 重新加载得到的是一张新加载的网页。网页里原来的状态（填到一半的表单、脚本里的变量）不会恢复。
- 进程不在的那一刻还没完成的 `loadURL`，它的 Promise 被拒绝。

## 让网页伸到状态栏和底部横条下面

第一个例子里网页只占安全区。要让网页铺满整个屏幕，把约束接到 `page.view` 自己的边上，并在网页里用 CSS 避开被挡住的部分。

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

视图这边的其他变化（大小、深浅色、移出界面）网页里怎么感知，见[网页感知得到什么](../api/web-view.md#网页感知得到什么)。

## 参见

- [`WebView`](../api/web-view.md)：视图本身，以及存储分区、网页里哪些功能和浏览器不一样。
- [`WebContents`](../api/web-contents.md)：加载、事件、执行脚本的全部成员。
- [`NavigationHistory`](../api/navigation-history.md)：后退和前进。
- [让网页和 App 互发消息](web-page-messaging.md)
- [`session`](../api/session.md)：读写网页的 cookie、清数据。
- [`Protocol`](../api/protocol.md)：用自定义协议加载本地网页。
- [Auto Layout](../api/auto-layout.md)：让网页占满安全区用的约束。
