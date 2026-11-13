# WebView：实现说明

← 返回[实现原理](README.md) ・ [API 文档](../api/web-view.md)

`WebView` 是上层标准，底下是 `WKWebView`。这一篇记它为什么长成这样、原生那边怎么搭的、量到了什么。

这是分四步做的第 1 步：视图、加载、导航、加载事件、存储分区、销毁。后三步（拦截导航、执行脚本和消息、cookie）还没做。

## 属于哪一层

上层。和 `fetch` 之于 `NSURLSession`、`WebSocket` 之于 `NSURLSessionWebSocketTask` 一个分工：`WKWebView` 这个类不暴露，给的是我们定的 `WebView`。

最初的草案是底层裸暴露——`new WKWebView()`、`web.loadRequest(...)`、`navigationDelegate` 的事件。被否掉的原因是它把 `WKWebView` 的形状原样交给了 JS 开发者，而那个形状的大半是配置对象和 delegate 协议（`WKWebViewConfiguration`、`WKWebsiteDataStore`、`WKHTTPCookieStore`、四个 delegate），每一样都要先学 iOS 才会用。

## 为什么照 Electron

JS 开发者里「在原生窗口里放一张网页并控制它」这件事，用得最多的现成接口是 Electron 的。它已经把这件事分好了层：

```
BrowserWindow / WebContentsView   窗口或视图：摆放
  .webContents                    网页：加载、导航、事件、执行脚本
    .session                      存储：cookie、缓存、分区
```

我们照这个分三层，第 1 步做了前两层。**方法名和事件名照搬**（`loadURL`、`getURL()`、`did-finish-load`），连 `getURL()` 是方法不是属性也照搬——从 Electron 搬过来的代码和搜到的答案能直接用，这比和运行时里别处「属性优先」的习惯保持一致更值钱。和 `WebSocket.readyState` 用数字是同一个判据：Web / Electron 的原样兼容本身就是这个 API 的主要价值时，才破自己的例。

照搬有四处停下来：

| | Electron | 我们 | 为什么 |
| --- | --- | --- | --- |
| 事件怎么听 | `on(name, (event, a, b) => …)`，数据按位置给 | `addEventListener`，数据在事件对象上 | 运行时只有 `EventTarget` 这一套。再引入一套 `on` / `once` / `off` 等于两种事件模型并存 |
| 摆放 | `setBounds` | `frame` / 约束 | `WebView` 就是一个 `UIView`，视图怎么摆它就怎么摆 |
| 类名 | `WebContentsView` | `WebView` | 更短，也是这类东西通用的叫法 |
| 给不出的字段 | `httpStatusText`、`details.reason`、`explicitSet` | 没有 | 系统不提供。不编一个值（原则 12：有什么就是有什么） |

后退前进用的是 `webContents.navigationHistory`。Electron 把 `goBack()` 那一组从 `webContents` 挪到了这里，原来的位置标了废弃——照新的。

`errorCode` 没有去凑 Electron 的数。那是 Chromium 的 `net_error_list.h`（域名解析失败是 `-105`），我们拿到的是 `NSURLError`（`-1003`）。做一张映射表要盖住几十个码，盖不住的更糟；直接给系统的原值，文档里写明不是同一套。

## 两个原生对象

```
NacreWebView      UIView 的子类，是个壳。里面只有一个铺满的 WKWebView
NacreWebContents  拿着 WKWebView，当它的 delegate，记加载状态
```

JS 的 `WebView` 包的是壳，`WebContents` 包的是 `NacreWebContents`。

**为什么不让 `WebView` 直接包 `WKWebView`：销毁。** 每张网页背后是一个独立的进程，而公开接口里让这个进程退出的办法只有一个——`WKWebView` 自己被释放（`_close` 是私有的）。JS 包装拿着原生对象，包装不死原生对象就不死。套一层壳之后，`close()` 可以把壳里面的 `WKWebView` 放掉，JS 手里的 `WebView` 照常是一个能用的空视图。

代价是 `web.subviews` 里看得到那个 `WKWebView`（当成一个普通的 `UIView`）。`UIButton` 的 `subviews` 里也有它内部的标签，这是一类事。

## 事件

`NacreWebContents` 是 `WKNavigationDelegate`，外加对 `loading` 和 `title` 两个属性的 KVO——这两样没有 delegate 回调。

| 事件 | 来源 |
| --- | --- |
| `did-start-loading` / `did-stop-loading` | KVO `loading` |
| `page-title-updated` | KVO `title` |
| `did-navigate` | `webView:didCommitNavigation:` |
| `did-finish-load` | `webView:didFinishNavigation:` |
| `did-fail-load` | `didFailNavigation:` 和 `didFailProvisionalNavigation:` 两个 |
| `render-process-gone` | `webViewWebContentProcessDidTerminate:` |
| `destroyed` | `close()` 里自己发 |

**事件原生一直在发**，不管有没有人听。`[kSubscribe]` 只让原生校验一下名字，写错当场报——和 `WebSocket` 一个做法。

连带的一条：**`WebView` 构造时就把 `webContents` 的包装建出来并记上持有边**，而不是等第一次读 `.webContents`。事件是派发到 `webContents` 的包装上的，等到读的时候才建，前面的事件就会落在一个现建的包装上，触发「包装被重建」那条警告。

### 状态码要实现一个本来不用实现的方法

`did-navigate` 的 `httpResponseCode` 只有 `webView:decidePolicyForNavigationResponse:decisionHandler:` 里拿得到。这个方法是让 App **决定**放不放行的，而原生层不做决定。所以它的实现是：记下状态码，然后照系统在没人实现这个方法时的做法放行——`canShowMIMEType` 为真就放，否则取消。

## `loadURL` 的 Promise

`loadRequest:` 返回一个 `WKNavigation` 对象，之后的 delegate 回调都带着它。原生按这个对象的**身份**记「哪次导航对应哪个 Promise」（`NSMapTable`，键按指针比）。

不按「下一个 `did-finish-load`」来兑现，是因为同一张网页上可以连着发起加载，后一次会取代前一次，两者的结果不能串。

三种系统**不报**的结束，要自己补：

| 情况 | 系统给什么 | 我们怎么办 |
| --- | --- | --- |
| `loadURL` 之后马上 `stop()` | **什么回调都没有**。那次导航还没真正开始 | `stop()` 里把还挂着的全部拒掉（`AbortError`） |
| 别的导航落地了 | 不保证给被取代的那次报失败 | `didCommitNavigation:` 里把别的全部拒掉 |
| 进程没了 | 只有 `webViewWebContentProcessDidTerminate:` | 全部拒掉 |

第一条是验收跑出来的：最初没有这段，`stop()` 那条断言等的 Promise 永远不结算，整步验收停在那里。

`loadURL` 返回之前挂了一个空的 `catch`，照 Electron。只听事件、不接 Promise 是常见写法，失败时不该多报一条 `unhandledrejection`。验收里有一条专门断言这个。

拒绝的错误分三类：`NSURLErrorDomain` 的 `-999` 是 `AbortError`（和 `fetch` 的取消同名），`NSURLErrorDomain` 的其余是 `NetworkError`，别的域不归类。`code` 和 `domain` 原样带着。

## 存储分区

`partition` 的三种写法照 Electron，落到 `WKWebsiteDataStore` 上：

| | 用什么 |
| --- | --- |
| 不写 | `defaultDataStore` |
| `'persist:名字'` | `dataStoreForIdentifier:`（iOS 17） |
| `'名字'` | `nonPersistentDataStore`，按名字记在一张表里 |

`dataStoreForIdentifier:` 要的是 `NSUUID`，不是名字。所以从名字**算**一个：对 `nacre.partition:名字` 做 SHA-256，取前 16 个字节，标成第 5 版 UUID。同一个名字每次启动算出同一个 UUID，数据才接得上。不随机生成再存起来——那就多了一份要自己管、还可能丢的映射表。

内存分区系统每次给的都是新的，「同名共用」要自己记一张名字到对象的表，留到进程结束。Electron 的内存 session 也是这么长。

## `backgroundThrottling`：做了又拿掉

方案里原本有 `webPreferences.backgroundThrottling`，打算落到 `WKPreferences.inactiveSchedulingPolicy = WKInactiveSchedulingPolicyNone`（iOS 17）。实现完量了一下：

两张不在界面里的网页，各自 `setInterval(100)` 计数，一张默认、一张设了 `None`（iOS 27.2 模拟器）：

| 过了多久 | 默认 | `None` |
| --- | --- | --- |
| 3 秒 | 8 | 8 |
| 8 秒 | 11 | 13 |
| 15 秒 | 18 | 20 |
| 25 秒 | 28 | 30 |
| 40 秒 | 43 | 45 |
| 60 秒 | 63 | 65 |

两张都是每秒一次，`visibilityState` 都是 `hidden`，60 秒内默认的那张也没有被挂起。**那个开关在这个场景下没有可观测的效果**，所以整项拿掉了——一个设了不起作用的选项比没有更糟。

从数据看，放慢定时器的不是那个策略，而是「页面不可见」本身——两张网页的 `visibilityState` 都是 `hidden`。公开接口里没有找到关掉它的开关。

能用的办法是让网页「可见」。实测网页看不看得见只取决于**在不在窗口里**，和 `isHidden` 无关：

| | 3 秒内 `setInterval(100)` 执行次数 | `visibilityState` |
| --- | --- | --- |
| 不在界面里 | 8 | `hidden` |
| 在界面里，`isHidden = true` | 29–31 | `visible` |

所以文档里写的是「想让预加载的网页照常跑，加进界面再隐藏」。这是 JS 自己能做到的，不需要新接口。

`inactiveSchedulingPolicy` 的默认值按文档是「过一段时间后挂起」。多久之后、模拟器上会不会发生，没量到。

## 实测

iOS 27.2 模拟器（iPhone Air）和 iOS 26.0 模拟器（iPhone 17）上各跑过，除注明的以外两边一致。

**加载**

- 一次加载的事件顺序：`did-start-loading` → `did-navigate` → `did-stop-loading` → `did-finish-load`。
- `loadURL` 之后立刻读 `isLoading()` 是 `true`。
- **标题和「加载完」谁先到不固定。** iOS 27.2 上第一次加载时标题先到、刷新时标题后到；iOS 26.0 上正好反过来；同一个系统上两次跑也不一样。验收里读标题的地方因此都改成了等标题到位。
- 失败的地址在错误的 `userInfo` 里只有 `NSErrorFailingURLKey`（`NSURL`），**没有** `NSErrorFailingURLStringKey`。`NSURLSession` 的错误两个都有，照着那边写会读到空。
- 明文 `http://` 被系统拦截，`-1022`。`http://localhost` 不拦。
- 网页自己用脚本跳到一个 `data:` 地址会失败，`WebKitErrorDomain` 的 `102`。这是 WebKit 的安全限制，`loadURL` 发起的 `data:` 加载不受影响。
- 404 的网页加载本身算成功，`httpResponseCode` 是 404。

**网页感知到什么**（一张把这些写进标题的网页）

- `innerWidth` 等于视图的宽（pt）。改 `frame` 之后跟着变，派发 `resize`。
- 强制视图的 `overrideUserInterfaceStyle`，`prefers-color-scheme` 跟着变。
- 改 `isHidden` 不派发 `visibilitychange`；`removeFromSuperview` 派发、变成 `hidden`；加回去派发、变回 `visible`。
- 铺满窗口、`viewport-fit=cover` 时，`env(safe-area-inset-top)` / `bottom` 等于窗口的 `safeAreaInsets`：iPhone Air 上 68 / 34，iPhone 17 上 62 / 34。在安全区里面时是 0。

**进程和内存**（一次性的探针，从 Mac 上数模拟器里的 WebContent 进程）

| 时刻 | 进程数 |
| --- | --- |
| 9 张网页都在 | 10 |
| `close()` 掉 4 张 | 6 |
| 再有 4 张丢掉引用并被回收 | 2 |

多出来的 1 个是 WebKit 自己预热的备用进程。`close()` 和包装被回收都能让进程退出。

从 Mac 上把剩下的进程杀掉：`render-process-gone` 到了，`isCrashed()` 是 `true`，`reload()` 之后网页恢复。

更早用裸的 `WKWebView` 量过：每张网页的进程 62–68 MB，另有共用的 GPU 进程（51 MB）和网络进程（47 MB）。

**存储分区**（一次性的探针，本机起一个小网页，每次打开把 `localStorage` 里的计数加一并写进 cookie 和标题）

| | 第一次启动 | 重新启动之后 |
| --- | --- | --- |
| 默认，开两张 | 1、2 | 3、4 |
| `persist:a`，开两张 | 1、2 | 3、4 |
| `persist:b` | 1 | 2 |
| `mem`，开两张 | 1、2 | 1、2 |
| `mem2` | 1 | 1 |

同名共用、不同名隔离、`persist:` 落盘、不带的不落盘，四条都对。这组没有常驻断言：它需要本机的服务，而第 1 步没有读网页内容的接口，只能靠标题带出来。等第 3 步有了 `executeJavaScript` 再补进验收。

## 没验到的

- 真实触摸：滚动、点链接。
- App 退到后台时网页的 `visibilitychange`（裸的 `WKWebView` 上验过，新的 `WebView` 上没重验）。
- 真机。

## 链接 WebKit

`project.yml` 的 `OTHER_LDFLAGS` 里加了 `-framework WebKit`。ObjC++ 文件里的 `#import` 不会自动链接框架（自动链接靠模块，而 `.mm` 不开模块）；UIKit 那些能链上是因为 Swift 的那几个文件引用了它们。
