# WebView：实现说明

← 返回[实现原理](README.md) ・ [API 文档](../api/web-view.md)

`WebView` 是上层标准，底下是 `WKWebView`。这一篇记它为什么长成这样、原生那边怎么搭的、量到了什么。

分四步做。第 1 步：视图、加载、导航、加载事件、存储分区、销毁。第 2 步：拦截导航（`will-navigate`）。中间插了一步 `loadFile`。第 3 步：执行脚本、预加载脚本、网页和 App 互发消息。第 4 步（cookie）还没做。

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
| `will-navigate` | `webView:decidePolicyForNavigationAction:decisionHandler:`，见[下面](#will-navigate第一个能取消的原生事件) |
| `did-navigate` | `webView:didCommitNavigation:` |
| `did-finish-load` | `webView:didFinishNavigation:` |
| `did-fail-load` | `didFailNavigation:` 和 `didFailProvisionalNavigation:` 两个 |
| `render-process-gone` | `webViewWebContentProcessDidTerminate:` |
| `destroyed` | `close()` 里自己发 |

**事件原生一直在发**，不管有没有人听。`[kSubscribe]` 只让原生校验一下名字，写错当场报——和 `WebSocket` 一个做法。

连带的一条：**`WebView` 构造时就把 `webContents` 的包装建出来并记上持有边**，而不是等第一次读 `.webContents`。事件是派发到 `webContents` 的包装上的，等到读的时候才建，前面的事件就会落在一个现建的包装上，触发「包装被重建」那条警告。

### 状态码要实现一个本来不用实现的方法

`did-navigate` 的 `httpResponseCode` 只有 `webView:decidePolicyForNavigationResponse:decisionHandler:` 里拿得到。这个方法是让 App **决定**放不放行的，而原生层不做决定。所以它的实现是：记下状态码，然后照系统在没人实现这个方法时的做法放行——`canShowMIMEType` 为真就放，否则取消。

## `will-navigate`：第一个能取消的原生事件

[项目说明](../project.md#cancelable-按派发来源定)里早就写了判据：原生事件能不能取消，看原生**能不能把默认动作推迟到 JS 答复之后**。UIKit 的 delegate 多数是同步返回 `BOOL`，推不了。这一个推得了：系统问「放不放行」时给的是一个回调，可以晚点再调。实测晚 50 毫秒、晚 2 秒再答都正常。

流程：

```
系统问放不放行（带一个 decisionHandler）
  → 原生先不答，照常排一轮（postToJS）
  → 派发 will-navigate，监听器跑完
  → 引擎把 event.defaultPrevented 作为返回值交回来
  → 原生调 decisionHandler：取消了就不放，否则放
```

**原生不做决定。** 没人监听、没调 `preventDefault()`、监听器抛了、引擎不在了，全都是放行——和不实现这个方法时一样。

### 答复怎么交回原生

引擎的 `EmitObjectEventWithJSON` 加了返回值：事件汇入口（sink）返回 `event.defaultPrevented`。未处理拒绝那条路已经是这个形状（JS 调了 `preventDefault()` 就不打默认日志）。

JS 侧有一张表 `cancelableNativeEvents`，现在只有 `will-navigate` 一条。表里的事件建成 `cancelable: true`，其余的原生事件照旧是 `false`——它们派发时默认动作早就做完了，`preventDefault()` 照标准静默无效。

被否掉的做法是「JS 派发完再调一次原生把答案送过去」。系统的那个回调必须恰好被调一次，不调的话 WebKit 会在它被释放时抛异常（按 WebKit 的做法，这条没有实测）。走返回值，答复和派发在同一个任务里，任何一步出岔子都落到「返回 false」，漏不掉；走回调则要另外保证「sink 中途抛了也得答」。

### 怎么认出是谁发起的

照 Electron，`loadURL()`、`reload()`、后退、前进**不派发**。这条重要：混合 App 里常见的写法是「网页里每点一个链接，就拦下来、开一个新页面去加载它」，要是 `loadURL` 自己也触发 `will-navigate`，就成了死循环。

难处是系统对所有导航都来问，而公开接口上没有「这是谁发起的」这一项。试过的三样都分不开：

| | 结果 |
| --- | --- |
| `navigationType` | `loadRequest:` 和脚本改 `location` 都是 `Other` |
| `sourceFrame` | 全都非空、全都是主框架，`loadRequest:` 发起的也是 |
| `request.timeoutInterval` | App 发起的是 60，网页发起的是 `INT_MAX`——看着能用，但网页自己 `history.back()` 也是 60 |

分得开的是这一条（iOS 26.0 和 27.2 一致）：**系统来问的那一刻，`webView.URL` 是不是已经等于要去的地址。**

| 谁发起的 | `navigationType` | 那一刻 `webView.URL` | `isLoading` |
| --- | --- | --- | --- |
| `loadRequest:` | `Other` | **已经是要去的地址** | 是 |
| `reload` | `Reload` | 等于要去的地址（本来就一样） | 是 |
| `goBack` / `goForward` | `BackForward` | **已经是要去的地址** | 是 |
| 服务器重定向 | `Other` | **已经是重定向之后的地址** | 是 |
| 点链接 | `LinkActivated` | 还是当前页 | 否 |
| 脚本改 `location` | `Other` | 还是当前页 | 否 |
| 提交表单 | `FormSubmitted` | 还是当前页 | 否 |
| 脚本 `history.back()` | `BackForward` | 还是当前页 | 否 |
| 脚本 `location.reload()` | `Reload` | 等于要去的地址（本来就一样） | 否 |
| 脚本改 `#` | `Other` | 还是当前页（只差 `#` 后面） | 否 |
| `<iframe>` 加载 | `Other` | — | `targetFrame.isMainFrame` 是 `NO` |
| `pushState` | 系统不问 | | |

两个地址都是 WebKit 自己规范化过的（`http://localhost:8765` 两边都是带斜杠的，大写的主机名两边都是小写），所以直接比字符串，不用自己处理规范化。

表里有一处重叠：App 的 `reload()` 和网页自己的 `location.reload()`，要去的地址都等于当前地址。所以另配一个标记 `apiNavigationPending`——四个发起导航的调用点在系统返回了导航对象时置上，被对应的那次询问用掉。判定顺序：

```
不是主框架，或者是新窗口（targetFrame 为 nil）   → 放行，不派发
要去的地址 == webView.URL：
    apiNavigationPending                        → App 发起的，放行
    前一次导航已经开始、还没落地                 → 服务器重定向，放行
    带 #，且不是 Reload                          → 滚到锚点，放行
    其余                                        → 网页导航到自己，派发
只差 # 后面                                      → 同文档，放行
其余                                            → 网页发起的，派发
```

标记可能错位的情形只有一种：App 调了加载接口、而同一瞬间网页恰好在导航到**同一个地址**。那时两者的结果本来也一样。

这套分类依据的是实测，不是文档的承诺。验收里把上面每一行都做成了断言。

### 为什么 App 发起的导航从不取消

量过取消的后果：

| 被取消的是 | 结果 |
| --- | --- |
| 网页发起的 | 干净。网页留在原地，一个加载事件都没有 |
| `loadRequest:` 发起的 | `did-start-loading`、`did-stop-loading` 各来一次，**没有任何失败回调**，等它的 Promise 永远不结算 |

App 发起的导航不派发 `will-navigate`，也就不会走到第二行。

### 三条实测到的边角

- **不带用户手势的新窗口，系统根本不问。** 脚本点一个 `target="_blank"` 的链接、脚本调 `window.open`，一次询问都没有（被弹窗拦截挡在更前面）。真实点击会问，那时 `targetFrame` 是 `nil`，现在是放行——而没有 `WKUIDelegate` 时放行的结果是什么都不发生。这是「新窗口」那一项的事，不在这一步。
- **不拦 `tel:` 链接**：系统照常去加载，然后失败，`-1002`。
- **iOS 26.0 上 `data:` 网页的锚点是 `%23`。** 在 `data:` 的网页里改 `location.hash`，系统交过来的地址结尾是 `%23x` 而不是 `#x`，`NSURL.fragment` 是 `nil`；iOS 27.2 上是正常的 `#x`。照 `#` 去认「只差锚点」就认不出来，被当成了一次跳转（而且那次跳转调了取消也拦不住，地址照变）。所以对 `data:` 多认一种形状：要去的地址等于当前地址后面接一段 `%23` 开头的。只盖住第一次加锚点；从 `%23a` 改到 `%23b` 按代码推断会多派发一次，没有实测。`http(s)` 的网页两个系统上都是正常的 `#`。

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

## `loadFile`：本地网页

签名照 Electron：`loadFile(filePath, { query, search, hash })`。相对路径的起点是 App 包的根，和 `UIImage.imageNamed('JS/assets/…')` 一个起点；绝对路径原样用，所以 App 下载到文档目录里的网页也能加载。`?` 和 `#` 那一段在 JS 侧拼好（`query` 走 `URLSearchParams`），原生只管接到文件地址后面。

底下是 `loadFileURL:allowingReadAccessToURL:`。**`loadURL` 收到 `file:` 的地址也走它**，两个入口行为一致。普通的 `loadRequest:` 加载本地文件在模拟器上是通的（实测样式表、脚本都加载出来了），但模拟器不执行沙盒的读权限，真机上是不是也通没有验，所以不依赖它。

### 能读哪个目录

那个接口的第二个参数是「这张网页能读哪个目录」，不在里面的文件网页引用不到。定法：

| 文件在哪 | 可读范围 | 为什么 |
| --- | --- | --- |
| App 包里 | 整个 App 包 | 包是 App 自己的东西，没有要防的；网页引用上一级目录的资源是常见写法 |
| 别处（文档目录等） | 文件所在的目录 | 下载下来的一包网页只碰得到自己 |

**模拟器不执行这条限制**：探针里只给了文件所在目录，上一级目录的图片照样加载出来了。所以这个范围只有真机上看得出来。真机（iPhone 14，iOS 27.0.1）上验过：

| 网页在哪 | 引用同目录 | 引用子目录 | 引用上一级目录 |
| --- | --- | --- | --- |
| App 包里 | 加载 | 加载 | 加载（整个包可读） |
| 文档目录里 | 加载 | 加载 | **加载不出来** |

第二行是一次性的探针，没有常驻断言——它在模拟器和真机上结果不同。

没有做成可以由 JS 指定。Electron 没有这个概念，先按上面的默认走，有人撞到了再加。

### 量出来的限制

iOS 26.0 和 27.2 模拟器上一致。包里放了一组验收用的网页（`ios/JS/assets/web/`），加载完把结果写进标题。

| | 结果 |
| --- | --- |
| 相邻的样式表、子目录里的普通脚本和图片 | 加载 |
| `?a=1#x` | 网页里 `location.search` / `hash` 读得到 |
| `localStorage`、`document.cookie` | 能用。重启之后还在（走的是默认的存储分区） |
| `location.origin` | `file://`。**所有本地网页同一个来源**，两个文件的 `localStorage` 计数是接着的 |
| `<script type="module" src>` | **不执行** |
| `fetch('data.json')` | **失败**（`Load failed`） |
| `XMLHttpRequest` | **失败** |
| 网页里点链接到另一个本地文件 | 派发 `will-navigate`（`linkActivated`），放行后跳过去 |
| 不存在的文件 | `NSURLErrorDomain` 的 `-1100` |
| 路径是目录 | 响应的类型是 `application/octet-stream`，不能显示，`WebKitErrorDomain` 的 `102` |

后三条限制都记成了断言（期望它们**失败**）。哪天系统放开了验收会红，文档要跟着改。

模块脚本和 `fetch` 不通，意味着 Vite 这类默认输出模块脚本的打包结果不能用 `loadFile` 加载。两条绕开的路：

| | 结论 |
| --- | --- |
| 两个未公开的开关（`allowFileAccessFromFileURLs`、`allowUniversalAccessFromFileURLs`，靠 KVC 设） | 不用。这个项目到现在只用公开接口 |
| 自定义协议：`WKURLSchemeHandler` 让本地文件以 `app://…` 这样的地址提供，网页有一个正常的来源 | 是正路，对应 Electron 的 `protocol.handle`。单独一步，要另外设计（协议名、目录怎么映射、在哪配置） |

`loadFile` 不会因为将来做了自定义协议而变：它在 Electron 里就是 `file://`，这里也一直是。自定义协议将来用 `loadURL('app://…')` 加载。这样现在存在 `file://` 来源下的数据不会搬家。

### 顺带量到的一条

「不能显示的内容」报失败的速度两个系统不一样。加载一个目录，或者用 `loadURL` 加载一个二进制文件的地址：响应来了之后我们答「不放行」，iOS 26.0 上 `102` 立刻回来，iOS 27.2 上要 4 秒多。Promise 最后都会结算。这是第 1 步就有的行为，只记录。

## 执行脚本、预加载脚本、消息

第 3 步。名字全部照 Electron：`executeJavaScript`、`webPreferences.preload`、`ipcRenderer`、`contextBridge`、`ipc-message`、`contents.send`、`contents.ipc.handle`。

原生代码分在两个文件里：`NacreWebView.mm` 管消息通道（它要碰 `NacreWebContents` 的状态），`NacreWebScript.mm` 是两个不依赖网页状态的函数（执行代码、读预加载脚本）。后者是因为前者过了 800 行才拆出去的。

### `executeJavaScript`：两种执行方式

Electron 的语义有两条：结果是代码里**最后一个表达式的值**；结果是 **Promise 就等它**。系统的两个接口各占一条：

| 接口 | 最后一个表达式的值 | 等 Promise |
| --- | --- | --- |
| `evaluateJavaScript:` | 给 | 不等。结果是 Promise 时报「不支持的类型」 |
| `callAsyncJavaScript:` | 不给。代码是函数体，要自己 `return` | 等 |

两条都要，直接的办法是在网页里 `eval`：`callAsyncJavaScript:@"return await (0, eval)(code)"`。量过，普通网页上完全符合 Electron 的语义。**但有内容安全策略的网页会拦 `eval`**：

| 在 `script-src 'none'` 的网页上 | 结果 |
| --- | --- |
| `evaluateJavaScript:@"1+1"` | 2。App 执行的代码不受网页的策略限制 |
| 注入的脚本（`WKUserScript`） | 照常执行 |
| 上面那种包了 `eval` 的写法 | `EvalError: Refused to evaluate a string as JavaScript…` |

所以不用 `eval`，改成分两种：

- 代码整个是**一个表达式**：包成 `return (代码\n)` 交给 `callAsyncJavaScript:`。Promise 会等。
- 代码是**多条语句**：原样交给 `evaluateJavaScript:`。取最后的值，不等 Promise。

「是不是表达式」在**运行时自己的引擎**里判断：拿 `'return (' + code + '\n)'` 建一个异步函数，建得出来就是。只解析、不执行，网页不参与，网页的安全策略也管不到这里。这是「我们自己就是一个 JS 运行时」直接用上的地方。细节：

- 结尾的分号和空白先去掉再试——`'fetch(u).then(f);'` 是最常见的写法，带着分号建不出来。
- 三种开头照 `eval` 的读法当语句：`{`（语句块）、`function`、`class`（声明；包进括号会变成表达式，名字就不进全局了）。
- 用异步函数来试，所以表达式里可以写 `await`。
- 包的时候在右括号前面加一个换行：代码结尾有行注释时，右括号不会被注释掉。

V8 和 WebKit 的引擎对「合不合语法」的判断理论上可能有出入（某个新语法一边认一边不认）。那时最坏的结果是走了另一种执行方式，或者到网页里才报语法错，不会重复执行。

### 结果怎么带回来

系统交回来的是 ObjC 对象，过桥之前要变成 JSON 装得下的东西（`JSONSafeResult`）：

| 网页里的值 | 系统给的 | 过桥之后 |
| --- | --- | --- |
| 数、字符串、布尔、数组、普通对象 | `NSNumber` / `NSString` / `NSArray` / `NSDictionary` | 原样 |
| `null` | `NSNull` | `null` |
| `undefined` | `nil` | `undefined`。靠包一层 `{ value }`：没有值时不带这个键 |
| `new Date(0)` | `NSDate` | ISO 8601 字符串，和 `JSON.stringify` 给的一样 |
| `NaN`、无穷 | `NSNumber` | `null`。**不处理的话 `NSJSONSerialization` 直接抛异常** |
| `new Map()` | 空的 `NSDictionary` | `{}` |
| 函数、DOM 节点、Promise（语句方式下） | 报错，`WKErrorDomain` 的 5 | 以 `TypeError` 拒绝 |

网页里抛的异常：错误的 `userInfo` 里有 `WKJavaScriptExceptionMessage`，是 `"Error: boom"` 这种带类名的原文，直接当 `message`。

50 次执行往返：iOS 27.2 上 6.3 毫秒，iOS 26.0 上 13.3 毫秒。

### 预加载脚本：注入的是什么

`webPreferences.preload` 给的是文件路径。建 `WebView` 时：

1. 原生把文件读出来（`WebView.readPreload:`，同步——`new WebView` 是同步的，文件很小）。
2. JS 在自己的引擎里建一个函数来查语法。有语法错当场抛 `SyntaxError`。
3. JS 把它拼进一段固定的代码，整段交给原生，作为 `WKUserScript` 注入：文档开始时、只进主文档。

第 2 步不能省：注入的是**一整段脚本**，预加载脚本有语法错的话它整个不执行，而且没有任何报错——网页里没有通道，App 这边什么事件都收不到。

拼出来的那一段长这样：

```js
(function () {
  var handler = window.webkit.messageHandlers.nacreIPC;   // 系统给的通道
  var ipcRenderer = { send, invoke, on, once, off, … };
  var contextBridge = { exposeInMainWorld };
  Object.defineProperty(window, '__nacreIPCDeliver', { … });   // App 发来的消息从这里进
  try {
    (function (ipcRenderer, contextBridge) {
      /* 预加载脚本的源码 */
    })(ipcRenderer, contextBridge);
  } catch (error) {
    /* 发一条 preload-error */
  }
})();
```

`ipcRenderer` 和 `contextBridge` 是函数的**参数**，不是全局，所以网页自己的脚本够不着它们，只够得着预加载脚本主动暴露的东西。

实测（两个系统一致）：注入的脚本在网页的第一段脚本之前执行，那时 `document.body` 是 `null`、`readyState` 是 `loading`；`<iframe>` 里不执行；最初那张空白文档里不执行。

### 不隔离，以及隔离是做得到的

预加载脚本和网页在**同一个环境**里。网页可以改它暴露的对象，也可以绕过它直接调 `window.webkit.messageHandlers.nacreIPC.postMessage(...)` 伪造消息，或者调 `__nacreIPCDeliver` 伪造 App 发来的消息。这相当于 Electron 的 `contextIsolation: false`，和 Electron 的默认相反。文档里写的是信任模型：收到的消息当不可信输入，不给不信任的网页配预加载脚本。

隔离是量过可行的。`WKContentWorld` 能建一个独立的环境：

| | 实测 |
| --- | --- |
| 两个环境的全局 | 互相看不到（各自的 `window` 属性、DOM 节点上挂的属性都不通） |
| 消息通道 | 按环境注册。只注册在隔离环境里，网页就够不着 |
| 共用的 | 同一个 DOM |
| DOM 事件的 `detail` | **两个方向都过得去，对象也行** |

所以能在隔离环境里跑预加载脚本，用 DOM 事件搭一座桥把暴露的函数接到网页那边。代价是暴露的函数**全部变成异步**（只能返回 Promise），实现也多。先做了不隔离的：自己的网页不需要，同步函数更好用。以后可以作为一个选项加上，现有的预加载脚本不用改——它们只通过 `contextBridge.exposeInMainWorld` 往网页那边放东西。

### 消息通道

底下是一个 `WKScriptMessageHandlerWithReply`，名字是 `nacreIPC`，只有配了预加载脚本才注册。

**值按 JSON 文本传，两个方向都是。** 原因有两个：

- 系统自己的转换不一致。网页那头直接 `postMessage` 一个对象，日期变成 `NSDate`、带函数时的行为两个系统还不一样（见下）。
- iOS 26.0 上，往带回复的通道里 `postMessage` 一个函数，返回的 Promise **永远不结算**；iOS 27.2 上是报错。先在网页里转成 JSON 文本（带函数当场抛），就到不了那一步。

`JSON.stringify` 遇到函数是悄悄丢掉，所以两头都用了一个会抛的 replacer。

三种消息，网页那头发的都是 `{ kind, channel, args }` 的 JSON 文本：

| `kind` | 原生怎么办 |
| --- | --- |
| `send` | 派发 `ipc-message`，当场答复 |
| `invoke` | 记下系统给的答复回调（按一个递增的编号），派发内部事件 `@ipc-invoke`。JS 找到 `ipc.handle` 登记的函数，等它的结果，再调 `ipcReply` 把结果送回原生，原生调那个回调 |
| `preload-error` | 派发 `preload-error` |

几条细节：

- **只收主文档发来的。** 通道在每个框架里都够得着（系统是这么注册的），而通道的两头只注入了主文档。`<iframe>` 里常常是别人的内容，它直接往通道里塞的消息原生不收。验收里有一条：`<iframe>` 里够得着通道，但塞进来的消息 App 收不到。
- **`invoke` 一定有答复。** JS 那边不管走哪条路（没登记、处理函数抛了、结果带不过去）都调 `ipcReply`；网页销毁或者进程没了，原生把还挂着的全部答成失败。
- **转接对象。** `userContentController` 强持有它的消息处理者，而它自己被 `WKWebView` 的配置拿着。让 `NacreWebContents` 直接当处理者就成了环，所以隔一个只有弱引用的 `NacreWebMessageRelay`。
- **App 发给网页**（`contents.send`）用的是 `callAsyncJavaScript:arguments:`，频道名和内容作为**参数**传进去，不是拼成一段代码——不会被当成代码执行。

带回复的消息往返一次约 0.13–0.27 毫秒。

错误的措辞照 Electron：`Error invoking remote method 'x': Error: …`、`No handler registered for 'x'`、`Attempted to register a second handler for 'x'`、`Cannot bind an API on top of an existing property on the window object`。

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
- 后退回到一张 HTTP 的网页（`httpbin.org/html`），`did-navigate` 的 `httpResponseCode` 是 `-1`：页面是从缓存里恢复的，没有新的响应。这条是真实点「后退」按钮时看到的。

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

同名共用、不同名隔离、`persist:` 落盘、不带的不落盘，四条都对。

前两条后来补成了常驻断言（第 3 步有了 `executeJavaScript`，加上 `loadFile` 给的同一个来源）：在一张网页的 `localStorage` 里写一个这一轮才有的键，到别的分区的网页里去读。落盘那两条要重启进程才看得出来，仍然只有这次探针。

## 没验到的

- 真实触摸里的滚动（日志里看不出来）。其余都在真机上真实点过：四个按钮（example.com、后退、前进、刷新）事件都对；点网页里的链接派发 `will-navigate`（`linkActivated`），随后四个加载事件依次到；监听器里调了 `preventDefault()` 之后再点，只有 `will-navigate`，后面一个加载事件都没有，网页不动。和脚本替用户点的结果一样。
- App 退到后台时网页的 `visibilitychange`（裸的 `WKWebView` 上验过，新的 `WebView` 上没重验）。

## 链接 WebKit

`project.yml` 的 `OTHER_LDFLAGS` 里加了 `-framework WebKit`。ObjC++ 文件里的 `#import` 不会自动链接框架（自动链接靠模块，而 `.mm` 不开模块）；UIKit 那些能链上是因为 Swift 的那几个文件引用了它们。
