---
type: reference
native: UIApplication
status: partial
---

# `Application`

**`Application`** 表示正在运行的这个 App。它唯一的实例是全局对象 **`application`**：运行时在 App 启动时创建它，整个 App 只有这一个，一直存在到 App 结束。脚本的任何位置都可以直接使用，不需要创建，也不能再创建一个。

`application` 管整个 App 范围内的事：

- **App 的信息**：包名、版本、配置文件的内容。
- **App 的状态**：在前台还是后台，当前有哪些场景。
- **App 级的事件**：可以建界面了、进入后台、内存不足、被一条链接打开、有没处理的异常。
- **App 级的能力**：本地存储、文件和网络状态的入口，以及让系统打开一个 URL（往外打开；别的 App 打开本 App 是上一条里的事件）。装了 `@nacrejs/keychain` 之后，Keychain 的入口也在这里。
- **原生模块的入口**：App 自己的原生代码和第三方原生 SDK 提供的方法，从 `application.nativeModules` 调。

界面不在 `application` 上。界面属于场景（[`UIWindowScene`](ui-window-scene.md)）：场景表示 App 界面的一个实例，由系统创建，窗口要建在场景上才能显示。`application` 负责在场景可用时派发 [`sceneconnect`](application/sceneconnect-event.md)，并记录当前有哪些场景。

事件相关的几个类也由运行时提供，各有自己的页面：[`EventTarget`](event-target.md)（会发事件的对象的基类）、[`Event`](event.md)（事件对象的基类），以及 `application` 上三种事件的事件对象 [`ErrorEvent`](error-event.md)、[`PromiseRejectionEvent`](promise-rejection-event.md)、[`OpenURLEvent`](open-url-event.md)。

**继承关系**：[`EventTarget`](event-target.md) → `Application`

怎么组织启动代码、处理前后台和内存警告，见指南[处理 App 的生命周期](../guides/app-lifecycle.md)；怎么统一处理错误，见[统一处理错误](../guides/handle-errors.md)；怎么处理打开 App 的链接，见[处理打开 App 的链接](../guides/open-links.md)。

## 构造函数

不能用 `new` 创建。`new Application()` 抛 `TypeError: Illegal constructor`。直接用全局的 `application`。

## 实例属性

App 的信息。这四个属性在 App 运行期间不变，所以没有变化事件：

| 属性 | 说明 |
| --- | --- |
| [`info`](application/info.md) <small>只读</small> | Info.plist 的全部内容 |
| [`bundleIdentifier`](application/bundleidentifier.md) <small>只读</small> | 包名 |
| [`version`](application/version.md) <small>只读</small> | 给用户看的版本号 |
| [`build`](application/build.md) <small>只读</small> | 构建号 |

App 的状态：

| 属性 | 说明 |
| --- | --- |
| [`state`](application/state.md) <small>只读</small> | 所有场景合在一起的前后台状态 |
| [`scenes`](application/scenes.md) <small>只读</small> | 当前已接入的场景 |
| [`supportsMultipleScenes`](application/supportsmultiplescenes.md) <small>只读</small> | 能不能同时有多个场景 |
| [`protectedDataAvailable`](application/protecteddataavailable.md) <small>只读</small> | 加密保护的文件现在能不能读 |

设备的环境设置：

| 属性 | 说明 |
| --- | --- |
| [`layoutDirection`](application/layoutdirection.md) <small>只读</small> | 界面的书写方向 |
| [`contentSizeCategory`](application/contentsizecategory.md) <small>只读</small> | 用户选的字体大小档位 |
| [`backgroundRefreshStatus`](application/backgroundrefreshstatus.md) <small>只读</small> | App 能不能在后台刷新内容 |
| [`prefersReducedResourceUsage`](application/prefersreducedresourceusage.md) <small>只读</small> | 系统是否建议 App 减少资源消耗 |
| [`idleTimerDisabled`](application/idletimerdisabled.md) | 是否阻止设备自动锁屏 |

各种能力的入口。每次读到的都是同一个对象：

| 属性 | 说明 |
| --- | --- |
| [`storage`](application/storage.md) <small>只读</small> | 键值存储 |
| [`fileSystem`](application/filesystem.md) <small>只读</small> | 文件读写 |
| [`network`](application/network.md) <small>只读</small> | 网络状态：连没连上、哪种网络、是否按流量计费 |
| [`keychain`](application/keychain.md) <small>只读</small> | 令牌和密码的加密存储。**只在装了 `@nacrejs/keychain` 的项目里有** |
| [`nativeModules`](application/nativemodules.md) <small>只读</small> | 登记进这个 App 的原生模块 |

## 实例方法

还继承 [`EventTarget`](event-target.md) 的 [`addEventListener()`](event-target/addeventlistener.md)、[`removeEventListener()`](event-target/removeeventlistener.md)、[`dispatchEvent()`](event-target/dispatchevent.md)。

| 方法 | 说明 |
| --- | --- |
| [`openURL()`](application/openurl.md) | 把一个 URL 交给系统打开 |

## 事件

事件名全部小写，没有分隔符。

场景：

| 事件 | 什么时候派发 |
| --- | --- |
| [`sceneconnect`](application/sceneconnect-event.md) | 系统创建好了一个场景。界面代码写在这里 |
| [`scenedisconnect`](application/scenedisconnect-event.md) | 系统销毁了一个场景 |

链接：

| 事件 | 什么时候派发 |
| --- | --- |
| [`openurl`](application/openurl-event.md) | 别的 App 或一条链接打开了本 App |

前后台：

| 事件 | 什么时候派发 |
| --- | --- |
| [`inactive`](application/inactive-event.md) | App 即将离开活动状态 |
| [`background`](application/background-event.md) | App 已经进入后台 |
| [`foreground`](application/foreground-event.md) | App 即将回到前台 |
| [`active`](application/active-event.md) | App 已经进入活动状态 |
| [`beforeterminate`](application/beforeterminate-event.md) | 系统即将结束 App |

系统通知：

| 事件 | 什么时候派发 |
| --- | --- |
| [`memorywarning`](application/memorywarning-event.md) | 系统内存不足，App 应该释放缓存 |
| [`screenshot`](application/screenshot-event.md) | 用户截了屏 |
| [`significanttimechange`](application/significanttimechange-event.md) | 时间发生大的变化：过了午夜、时区变了、夏令时切换 |
| [`contentsizecategorychange`](application/contentsizecategorychange-event.md) | 用户改了系统字体大小 |
| [`localechange`](application/localechange-event.md) | 用户改了地区设置：国家或地区、货币、数字和日期的格式 |
| [`protecteddataavailable`](application/protecteddataavailable-event.md) | 设备解锁，加密保护的文件可以读了 |
| [`protecteddataunavailable`](application/protecteddataunavailable-event.md) | 设备即将锁屏，加密保护的文件将读不了 |
| [`backgroundrefreshstatuschange`](application/backgroundrefreshstatuschange-event.md) | 用户改了后台刷新的设置 |
| [`reducedresourceusagechange`](application/reducedresourceusagechange-event.md) | 系统对资源消耗的建议变了 |

错误：

| 事件 | 什么时候派发 |
| --- | --- |
| [`error`](application/error-event.md) | 有没被捕获的异常 |
| [`unhandledrejection`](application/unhandledrejection-event.md) | 有被拒绝、却没有挂处理函数的 Promise |

`application` 也可以监听和派发自己定义的事件，事件名可以是任意字符串，只要不和上面的相同。

## 场景

拿到场景有两个途径：

| 途径 | 什么时候有值 |
| --- | --- |
| `sceneconnect` 事件的 `e.scene` | 事件派发时 |
| `application.scenes` | `sceneconnect` 派发之后。脚本刚开始执行时是空数组 |

所以界面代码的入口固定是 `sceneconnect`。App 启动后，运行时先把整个 `main.js` 执行完，系统随后才创建场景。场景被销毁时派发 `scenedisconnect`，这个场景同时从 `application.scenes` 里移除。

`application` 和场景的分工：

| | 管什么 |
| --- | --- |
| `application` | 整个 App：信息、所有场景合在一起的前后台状态、内存警告、错误 |
| 场景 | 一个界面实例：它的窗口、它自己的前后台状态 |

## 前台、后台和运行状态

iOS 的 App 不是一直在运行。用户回到主屏幕或切到别的 App 时，当前 App 进入后台，系统随后可能暂停它，也可能直接结束它。

[`application.state`](application/state.md) 有三种正常取值：

| 取值 | 含义 |
| --- | --- |
| `'active'` | 在前台，并且在接收用户的操作 |
| `'inactive'` | 在前台，但暂时不接收操作。例如正在切换 App、来电、下拉了通知中心 |
| `'background'` | 不在屏幕上。脚本刚开始执行时也是这个值 |

状态变化时派发四个事件。其中两个在状态改变之前派发：

| 事件 | 含义 | 事件到达时 `state` 的值 |
| --- | --- | --- |
| `inactive` | 即将离开活动状态 | `'active'`，还是旧值 |
| `background` | 已经进入后台 | `'background'` |
| `foreground` | 即将回到前台 | `'background'`，还是旧值 |
| `active` | 已经进入活动状态 | `'active'` |

场景也有同名的四个事件。`application` 上的是所有场景合在一起的状态，场景上的是那一个场景的状态。两者读到的值在同一时刻可能不同，见 [`UIWindowScene`](ui-window-scene.md#场景的状态和-app-的状态)。

## 系统事件不能取消

`application` 上的事件分两类，区别在于能不能 `preventDefault()`：

| 类别 | 包括 | `cancelable` | `preventDefault()` |
| --- | --- | --- | --- |
| 系统通知 | `sceneconnect`、`openurl`、前后台事件、`memorywarning` 等，除下面两个以外的全部 | `false` | 没有效果，也不报错 |
| 错误类事件 | `error`、`unhandledrejection` | `true` | 阻止运行时输出默认的错误日志 |

系统通知不能取消，是因为监听器不是在系统发出通知的那一刻执行的。运行时稍后才派发，那时系统的处理已经结束。见[运行时怎么工作](how-it-works.md#事件)。系统通知的 `target` 都是 `application`。

## 没处理的异常不会让 App 退出

JS 里抛出的异常没有被 `try` / `catch` 接住时，App 不会退出。抛出异常的那一段代码停止执行，其余部分照常运行：监听器还在，定时器照常触发，界面可以继续操作。

| 异常出现在 | 运行时怎么处理 |
| --- | --- |
| `main.js` 顶层、定时器的回调、事件监听器的回调（包括 `sceneconnect` 的回调、按钮的点击回调） | 在 `application` 上派发 [`error`](application/error-event.md)。没有监听器取消时，向控制台输出以 `Uncaught` 开头的错误日志 |
| `Promise` 被拒绝，并且没有挂处理函数。`async` 函数里抛出的异常属于这一种 | 在 `application` 上派发 [`unhandledrejection`](application/unhandledrejection-event.md)。没有监听器取消时，输出以 `Uncaught (in promise)` 开头的错误日志 |

- `main.js` 顶层抛出异常时，这一行之后的顶层代码不再执行。在它之前注册的监听器仍然有效。
- 事件监听器抛出异常时，同一个事件的其余监听器照常执行，`error` 在下一个监听器执行之前就派发了。
- 在这两个事件的监听器里调 `preventDefault()`，取消的只是运行时输出的那条默认日志。异常已经发生，被中断的代码不会恢复执行。

## 示例

### 每个 App 的起点

打印 App 的信息，等系统准备好之后建窗口和页面。

```js
console.log('包名', application.bundleIdentifier);
console.log('版本', application.version, '构建号', application.build);
console.log('场景个数', application.scenes.length);

application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  console.log('界面建好了，场景个数', application.scenes.length);
});
```

**效果**

- 控制台先输出三行。包名是 `com.example.shop` 的 App 运行时是：
  - `包名 com.example.shop`
  - `版本 0.1.0 构建号 1`
  - `场景个数 0`
- 随后屏幕从黑色变成系统背景色：浅色模式下是白色，深色模式下是黑色。
- 控制台输出 `界面建好了，场景个数 1`。

这段代码没有作为一个整体在模拟器运行过。其中用到的每个 API 都在验收用例里运行过。

## 对应的 iOS API

`application` 不是 `UIApplication` 的逐项映射。它把 iOS 里分散在几处的 App 级能力放在一个对象上。

| ObjC | JS |
| --- | --- |
| `NSBundle.mainBundle.infoDictionary` | `application.info` |
| `NSBundle.mainBundle.bundleIdentifier` | `application.bundleIdentifier` |
| `UIApplication.sharedApplication.applicationState` | `application.state` |
| `UIApplication.sharedApplication.connectedScenes` | `application.scenes` |
| `UIApplication.sharedApplication.supportsMultipleScenes` | `application.supportsMultipleScenes` |
| `UIApplication.sharedApplication.userInterfaceLayoutDirection` | `application.layoutDirection` |
| `UIApplication.sharedApplication.preferredContentSizeCategory` | `application.contentSizeCategory` |
| `UIApplication.sharedApplication.backgroundRefreshStatus` | `application.backgroundRefreshStatus` |
| `UIApplication.sharedApplication.protectedDataAvailable` | `application.protectedDataAvailable` |
| `UIApplication.sharedApplication.idleTimerDisabled = YES` | `application.idleTimerDisabled = true` |
| `[UIApplication.sharedApplication openURL:url options:@{} completionHandler:…]` | `application.openURL(url)` |
| `NSUserDefaults.standardUserDefaults` | `application.storage` |
| `UISceneWillConnectNotification` | `application.addEventListener('sceneconnect', …)` |
| `UISceneDidDisconnectNotification` | `application.addEventListener('scenedisconnect', …)` |
| `scene:openURLContexts:` | `application.addEventListener('openurl', …)` |
| `scene:continueUserActivity:`，活动类型是 `NSUserActivityTypeBrowsingWeb` | `application.addEventListener('openurl', …)` |
| `scene:willConnectToSession:options:` 里 `connectionOptions` 的 `URLContexts` 和 `userActivities` | 同一个 `openurl`，在 `sceneconnect` 之后派发 |
| Info.plist 的 `CFBundleURLTypes` | `nacre.config.json` 的 `ios.urlSchemes` |
| `UIApplicationDidBecomeActiveNotification` | `application.addEventListener('active', …)` |
| `UIApplicationWillResignActiveNotification` | `application.addEventListener('inactive', …)` |
| `UIApplicationDidEnterBackgroundNotification` | `application.addEventListener('background', …)` |
| `UIApplicationWillEnterForegroundNotification` | `application.addEventListener('foreground', …)` |
| `UIApplicationDidReceiveMemoryWarningNotification` | `application.addEventListener('memorywarning', …)` |
| `UIApplicationUserDidTakeScreenshotNotification` | `application.addEventListener('screenshot', …)` |
| `UIApplicationSignificantTimeChangeNotification` | `application.addEventListener('significanttimechange', …)` |
| `UIContentSizeCategoryDidChangeNotification` | `application.addEventListener('contentsizecategorychange', …)` |
| `NSCurrentLocaleDidChangeNotification` | `application.addEventListener('localechange', …)` |
| `UIApplicationProtectedDataDidBecomeAvailable` | `application.addEventListener('protecteddataavailable', …)` |
| `UIApplicationProtectedDataWillBecomeUnavailable` | `application.addEventListener('protecteddataunavailable', …)` |
| `UIApplicationBackgroundRefreshStatusDidChangeNotification` | `application.addEventListener('backgroundrefreshstatuschange', …)` |
| `UIApplicationWillTerminateNotification` | `application.addEventListener('beforeterminate', …)` |

## 与浏览器的对照

| 浏览器 | Nacre |
| --- | --- |
| `window.addEventListener('error', …)` | `application.addEventListener('error', …)` |
| `window.addEventListener('unhandledrejection', …)` | `application.addEventListener('unhandledrejection', …)` |
| `document.visibilityState` 和 `visibilitychange` | `application.state` 和四个前后台事件 |
| `navigator.wakeLock.request('screen')` | `application.idleTimerDisabled = true` |
| `rejectionhandled` 事件 | 没有 |

## 参见

- [处理 App 的生命周期](../guides/app-lifecycle.md)：启动、前后台、内存警告、常亮、自己的事件
- [统一处理错误](../guides/handle-errors.md)
- [处理打开 App 的链接](../guides/open-links.md)
- [运行时怎么工作](how-it-works.md)：代码怎么执行、事件什么时候派发
- [`UIWindowScene`](ui-window-scene.md)：`sceneconnect` 给出的场景对象、场景自己的前后台事件
- [`EventTarget`](event-target.md)、[`Event`](event.md)：事件模型
- [外观特征](ui-trait-collection.md)：深色还是浅色、屏幕几倍
- [`UIDevice`](ui-device.md)：设备型号和系统版本
