---
type: reference
native: WKWebView
status: partial
---

# `WebView`

**`WebView`** 表示一个显示网页的视图。把它加进界面，让它加载一个地址，网页就显示在它的范围里，用户可以在里面点链接、填表单。

`WebView` 只管视图本身：放在哪、多大、显示还是隐藏，都用视图的属性和方法。视图里的那张网页是 [`WebContents`](web-contents.md)，从 [`webView.webContents`](web-view/webcontents.md) 得到。加载地址、后退前进、监听加载过程、在网页里执行脚本、和网页互发消息，都在它上面。

这一组还有四个对象：

- [`WebContents`](web-contents.md)：视图里的那张网页。
- [`NavigationHistory`](navigation-history.md)：网页的后退和前进。
- [`WebContentsIPC`](web-contents-ipc.md)：应答网页发来的请求。
- [`ipcRenderer`](ipc-renderer.md) 和 [`contextBridge`](context-bridge.md)：只在[预加载脚本](#预加载脚本)里能用，是网页那一头的消息通道。

网页的 cookie、`localStorage` 和缓存存在哪里，由[存储分区](#存储分区)决定；读写 cookie 和清数据用 [`session`](session.md)。

**继承关系**：`EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → `WebView`

怎么显示一张网页、处理加载失败、限制网页能去的地址，见指南[显示网页](../guides/web-pages.md)。网页和 App 互发消息，见指南[让网页和 App 互发消息](../guides/web-page-messaging.md)。

## 构造函数

[`WebView()`](web-view/constructor.md)

创建一个显示网页的视图。可以指定存储分区和预加载脚本，创建之后不能改。

## 实例属性

还继承 [`UIView`](ui-view.md) 的属性。`WebView` 常用的继承属性是 `frame`、`isHidden`、`layer`、`translatesAutoresizingMaskIntoConstraints`。

| 属性 | 说明 |
| --- | --- |
| [`webContents`](web-view/webcontents.md) <small>只读</small> | 视图里的那张网页 |

## 实例方法

全部继承自 [`UIView`](ui-view.md)，比如 `addSubview()`、`removeFromSuperview()`。

## 网页和 App 的关系

每张网页在自己独立的进程里运行，和 App 的 JS 不在同一个进程。这决定了下面几件事：

- **两边的变量互相访问不到。** 网页里的 `window`、`document` 在 App 的 JS 里不存在；App 的 JS 里的对象、函数，网页里也没有。两边之间能传递的只有数据，按 JSON 传，见[值怎么传](web-contents.md#值怎么传)。
- **网页的脚本不占用 App 的时间。** 网页里的脚本执行多久，都不影响 App 的界面响应。
- **网页崩溃不会让 App 退出。** 网页的进程崩溃或者被系统结束时，网页变成空白，App 照常运行，并在 `webContents` 上收到 [`render-process-gone`](web-contents/render-process-gone-event.md) 事件。

App 和网页之间有三种传递数据的方式：

| 方式 | 方向 | 用在什么时候 |
| --- | --- | --- |
| [`executeJavaScript()`](web-contents/executejavascript.md) | App 在网页里执行一段代码，取回结果 | App 主动读网页里的内容，或者改网页 |
| [预加载脚本](#预加载脚本)和消息 | 两个方向都可以 | 网页要调用 App 的功能，或者 App 要通知网页 |
| [`will-navigate`](web-contents/will-navigate-event.md) 事件 | 网页要跳转时，App 得到要去的地址，并可以拦住 | 限制网页能去哪里，处理 `tel:`、自定义协议的链接 |

## 网页内容不受信任

网页的内容来自服务器，网页里还可能引入第三方的脚本。App 不能假定网页里执行的代码是自己写的。运行时按这个前提划定了边界：

- **运行时不会把 App 的任何能力自动提供给网页。** 一张没有配预加载脚本的网页，没有任何办法调用 App 的 JS、读 App 的文件或存储。它能做的只有普通网页能做的事。
- **消息通道是网页进入 App 的唯一入口。** 只有建 `WebView` 时用 `webPreferences.preload` 指定了[预加载脚本](#预加载脚本)，网页里才有消息通道。App 收到消息后做什么，完全由 App 自己的监听器决定。
- **预加载脚本和网页的脚本不隔离。** 两者在同一个环境里执行。配了预加载脚本之后，网页里的任何脚本，包括第三方脚本，都可以调用预加载脚本提供的对象，可以修改这个对象的成员，也可以不经过预加载脚本直接往消息通道里发消息。所以预加载脚本里写的检查不能当作安全措施，检查必须写在 App 这一侧。
- **`<iframe>` 里的内容发不了消息。** 预加载脚本只在主文档里执行，`<iframe>` 里发来的消息 App 不接收。

从网页来的数据有三处：消息的频道名和参数、`executeJavaScript()` 的结果、`will-navigate` 事件里的地址。这三处都要当作不可信的输入，用之前检查类型和取值范围。写法见[在 App 这一侧检查每一条消息](../guides/web-page-messaging.md#在-app-这一侧检查每一条消息)。

## 预加载脚本

预加载脚本是建 `WebView` 时用 `webPreferences.preload` 指定的一个 JS 文件，和 App 一起打包。它在网页里执行，不在 App 的 JS 里执行，所以不能写进 `main.js`，也用不了 App 这边的任何对象。

| | |
| --- | --- |
| 什么时候执行 | 每张网页开始加载时，在网页自己的任何脚本之前。那时还没有 `<body>` |
| 在哪里执行 | 只在主文档里。`<iframe>` 里不执行 |
| 换了网页 | 重新执行一遍 |
| 能用什么 | 网页里能用的一切（`document`、`window`），外加 [`ipcRenderer`](ipc-renderer.md) 和 [`contextBridge`](context-bridge.md) 两个名字 |
| 网页禁止了脚本（内容安全策略） | 照常执行。受限的只是网页自己的脚本 |
| 执行时抛了异常 | 网页照常加载，`webContents` 上派发 [`preload-error`](web-contents/preload-error-event.md) |

它和网页的脚本在**同一个环境**里执行，两者之间没有隔离。这带来四个结果：

- 预加载脚本往 `window` 上挂的东西，网页看得到。
- 用 `contextBridge.exposeInMainWorld` 挂上去的名字，网页不能换成别的对象，但能修改这个对象的成员。
- `ipcRenderer` 和 `contextBridge` 这两个名字网页用不了，但网页可以不经过它们，直接往底下的消息通道里发消息，频道名和参数都由它决定。
- 网页可以冒充 App，让预加载脚本里 `ipcRenderer.on` 登记的监听器收到假的消息。

所以预加载脚本适合用在 App 自己控制的网页上。App 这一侧收到的每条消息都要检查，预加载脚本收到的消息也不能当作一定来自 App。

## 存储分区

存储分区是网页的 cookie、`localStorage` 和缓存存放的那一份数据。建 `WebView` 时用 `webPreferences.partition` 指定用哪一个。分区的数据存在 App 自己的存储空间里，别的 App 和 Safari 都读不到（来自 iOS 的定义，**未在模拟器验证**）。

| `partition` 的值 | 数据存在哪 | App 退出之后 |
| --- | --- | --- |
| 不写，或者空串 | 默认的那一份。所有不写 `partition` 的网页共用 | 还在 |
| `'persist:名字'` | 名字对应的那一份。同名的网页共用 | 还在 |
| `'名字'`（不带 `persist:`） | 名字对应的那一份，只在内存里。同名的网页共用 | 没了 |

不同分区之间互相看不到数据。`partition` 只能在建 `WebView` 时指定，之后不能改。

分区里的 cookie 可以由 App 读写，数据可以由 App 清掉，见 [`session`](session.md)。

网页的 cookie 和 [`fetch`](fetch.md) 的 cookie 是分开的两份：在网页里登录，不会让 `fetch` 带上登录状态，反过来也一样。

## 网页里哪些功能和浏览器里不一样

| 网页里的功能 | 在 `WebView` 里 |
| --- | --- |
| 点链接、提交表单、脚本跳转 | 正常。App 可以用 `will-navigate` 拦住 |
| `localStorage`、cookie | 正常，存在[存储分区](#存储分区)里 |
| 明文的 `http://` 地址 | 被系统拦截，加载失败。`http://localhost` 除外 |
| 打开新窗口（`window.open`、`target="_blank"` 的链接） | 什么都不发生，网页留在原地。脚本触发的是实测结果；用户真实点击 `target="_blank"` 的链接**未在模拟器验证** |
| 下载文件（地址指向压缩包这类不能显示的内容） | 不下载。加载失败，派发 `did-fail-load`，`errorCode` 是 `102` |
| `alert()`、`confirm()`、`prompt()` | 不显示对话框。**未在模拟器验证** |
| 选择文件（`<input type="file">`）、相机、麦克风、定位 | **未在模拟器验证** |
| 从屏幕左边缘右滑后退 | 没有。后退用 [`navigationHistory.goBack()`](navigation-history/goback.md) |

从本地文件加载的网页另有几条限制，见[本地网页的限制](web-contents.md#本地网页的限制)。

## 网页感知得到什么

视图这边的变化，网页里用标准的 Web 接口都能感知到。

| 视图这边发生的事 | 网页里看到什么 |
| --- | --- |
| 视图的宽高变了 | `window.innerWidth` / `innerHeight` 跟着变，派发 `resize`。1 [pt](units.md) 对应 CSS 的 1px |
| 视图伸到安全区外面 | `env(safe-area-inset-*)` 给出被挡住的宽度，需要 `viewport-fit=cover` |
| 系统切换深浅色，或者视图被[强制](ui-trait-collection.md)成深色或浅色 | `prefers-color-scheme` 跟着变，`matchMedia` 的 `change` 事件会派发 |
| 设 `isHidden` | **没有变化。** 不派发 `visibilitychange` |
| 从界面上拿掉（`removeFromSuperview`） | `visibilityState` 变成 `'hidden'`，派发 `visibilitychange` |
| 加回界面 | `visibilityState` 变回 `'visible'`，派发 `visibilitychange` |
| App 退到后台、回到前台 | `visibilityState` 变成 `'hidden'`、变回 `'visible'`（**未在模拟器验证**） |

不在界面里的网页，系统会放慢它的定时器：间隔 100 毫秒的 `setInterval` 大约每秒只执行一次。

## 内存和引用

一张网页占用的内存不小：模拟器上实测一张简单的网页占 60 MB 左右。内存紧张时，系统可以结束网页的进程。

不再使用的网页，调 [`webContents.close()`](web-contents/close.md) 销毁。销毁之后网页的进程退出，内存释放；`WebView` 还是一个视图，只是里面空了，再把它从界面上拿掉。

不调 `close()` 时：

| `WebView` 的状态 | 会怎样 |
| --- | --- |
| 在界面里 | 一直存在，网页一直占着内存。界面拿着它，不用自己拿着引用 |
| 不在界面里（还没加进去，或者拿掉了） | 代码也没有保存引用时会被回收，网页跟着销毁，进程退出（实测）。回收发生在什么时候不确定，所以不要依赖它来释放内存；要留着用，就自己拿着引用 |

## 示例

### 占满屏幕的网页

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

- 屏幕上显示 example.com 的网页。它占满安全区：上边在状态栏下面，下边在底部横条上面。安全区是屏幕上不会被刘海、状态栏和底部横条挡住的那一块，见[视图](ui-view.md)。
- 链接可以点。网页内容超出视图时可以滚动（滚动**未在模拟器验证**）。
- 控制台输出 `到了 https://example.com/ 状态码 200`、`加载完 https://example.com/`、`标题 Example Domain`。后两行谁先谁后不固定。

### 用独立的分区

```js
const shop = new WebView({ webPreferences: { partition: 'persist:shop' } });
const guest = new WebView({ webPreferences: { partition: 'guest' } });
console.log(shop.webContents.session.isPersistent(), guest.webContents.session.isPersistent());
```

**结果**：输出 `true false`。`shop` 的数据在 App 退出之后还在，`guest` 的只在内存里。

## 与 Electron 的对照

| Electron | 这里 | 差别 |
| --- | --- | --- |
| `new WebContentsView({ webPreferences })` | `new WebView({ webPreferences })` | 只支持 `partition` 和 `preload` |
| `view.setBounds({ x, y, width, height })` | `web.frame = new CGRect(x, y, width, height)` | 也可以用约束 |
| `win.contentView.addChildView(view)` | `page.view.addSubview(web)` | |
| `view.webContents` | `web.webContents` | 相同 |
| `webPreferences.preload` | 相同 | 相对路径的起点是 App 包。不隔离，相当于 `contextIsolation: false` |

`WebContents`、`ipcRenderer` 这些对象各自的对照在它们的页面上。

## 对应的 iOS API

| ObjC（`WKWebView`） | JS |
| --- | --- |
| `[[WKWebView alloc] initWithFrame:configuration:]` | `new WebView()` |
| `configuration.websiteDataStore` | `webPreferences.partition` |
| `WKUserScript`（文档开始时注入，只进主文档） | `webPreferences.preload` |
| 释放 `WKWebView` | `contents.close()` |

## 还不能做的

| 想做的事 | 对应的能力 |
| --- | --- |
| 让预加载脚本和网页的脚本互相隔离 | Electron 的 `contextIsolation`；`WKContentWorld` |
| 在 `<iframe>` 里也执行预加载脚本 | Electron 的 `nodeIntegrationInSubFrames`；`WKUserScript` 的 `forMainFrameOnly` |
| 预加载脚本的类型定义（`ipcRenderer`、`contextBridge`） | |
| 让不在界面里的网页不被放慢 | Electron 的 `backgroundThrottling`。系统没有起作用的公开开关。替代做法见[先加载，要用的时候再显示](../guides/web-pages.md#先加载要用的时候再显示) |
| 处理网页打开新窗口的请求（`window.open`、`target="_blank"`） | Electron 的 `setWindowOpenHandler`；`WKUIDelegate` |
| 显示网页的 `alert()`、`confirm()`、`prompt()` | `WKUIDelegate` |
| 改 User-Agent、缩放 | Electron 的 `setUserAgent`、`setZoomFactor`；`customUserAgent`、`pageZoom` |
| 从屏幕左边缘右滑后退 | `allowsBackForwardNavigationGestures` |
| 用 Safari 的开发者工具调试网页 | `inspectable` |
| 调网页滚动的行为（回弹、内边距） | `WKWebView.scrollView` |
| 下载文件 | Electron 的 `will-download`；`WKDownload` |

加载、导航、消息方面还不能做的，见 [`WebContents`](web-contents.md#还不能做的)。

## 参见

- [显示网页](../guides/web-pages.md)：加载、处理失败、限制跳转、本地网页的完整写法。
- [让网页和 App 互发消息](../guides/web-page-messaging.md)：预加载脚本和消息的完整写法。
- [`WebContents`](web-contents.md)：视图里的那张网页。加载和事件都在它上面。
- [视图](ui-view.md)：`WebView` 的摆放、显示隐藏、圆角都用它的成员。
- [Auto Layout](auto-layout.md)：例子里让网页占满安全区用的约束。
- [外观特征](ui-trait-collection.md)：强制深浅色，网页的 `prefers-color-scheme` 会跟着变。
- [`session`](session.md)：读写网页的 cookie、清掉网页留下的数据。
- [`fetch`](fetch.md)：只要数据、不需要显示网页时用它。它的 cookie 和网页的不通。
- [实现原理](../internals/web-view.md)：为什么分成两个对象、几条实测的数据。
