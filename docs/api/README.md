# Nacre API 文档

这里是 Nacre 提供给 JS 的全部 API 的参考，面向用 Nacre 写 App 的 JS 开发者。每一页讲一个类或一组能力：它表示什么、怎么写、写完得到什么效果、哪里会出错。

第一次用 Nacre，先读[运行时怎么工作](how-it-works.md)和 [`application`](application.md)，再按需要查其他页面。要从零建一个自己的 App，见[入门指南](../guides/README.md)。

## 有哪些 API

API 分两类：

- **运行时自己定义的**：`application`、`console`、`fetch`、定时器、本地存储、`WebView` 等。名字和写法由 Nacre 决定。
- **iOS 的原生类**：`UIView`、`UILabel`、`CALayer` 等，直接用 iOS 里的原名，属性和方法的名字也和 Apple 的文档对应。每一页末尾有一张 ObjC 和 JS 的对照表，照着 Apple 的文档就能查到 JS 怎么写。

**能用的只有下面「参考」表里列出的这些。** 没列出的 iOS 类（比如 `NSString`、`UITableView`、`CLLocationManager`）在 JS 里不存在，读它的名字会抛 `ReferenceError`，也没有通用的办法调用到它们。App 自己的原生代码和第三方原生 SDK 的能力，目前同样不能提供给 JS。

一个类已经列出、但缺某项能力时，看那一页末尾的「还不能做的」。整体还缺什么、计划怎么补，见[项目说明的功能清单](../project.md#功能清单)。

## 怎么读这些文档

- 每页先给一个能直接运行的完整例子，再按「想做的事」给出写法，最后是全部成员的说明。
- 每段代码后面的「效果」或「结果」写的是运行后看到什么。标着「**未在模拟器验证**」的是还没有实际运行确认过的；没标的都验证过，或者直接来自代码。
- 长度和坐标的单位都是点（pt），见[单位](units.md)。
- 文档只讲怎么用。实现方式、设计上的取舍和实测数据在[实现原理](../internals/README.md)。

文档的写法规范见[文档写法](../writing-guide.md)。

## 参考

| 对象 | 说明 |
| --- | --- |
| [运行时怎么工作](how-it-works.md) | **先读这一页**：代码怎么执行、有什么没有什么、线程、事件、原生对象 |
| [`application`](application.md) | App 实例：App 级的状态、事件和能力 |
| [`UIWindowScene`](ui-window-scene.md) | 场景：App 的一个 UI 实例，JS 创建界面的入口 |
| [`UISceneSession`](ui-window-scene.md#uiscenesession) | 场景的持久身份：角色、标识、自定义数据 |
| [`UIWindow`](ui-window.md) | 视图树的根，挂在场景上 |
| [`UIView`](ui-view.md) | 视图。几何、层级、外观 |
| [`UILabel`](ui-label.md) | 文字 |
| [`UIFont`](ui-font.md) | 字体 |
| [`UIImage` / `UIImageView`](ui-image.md) | 图片。四条取图路径，`size` 是点不是像素 |
| [Auto Layout](auto-layout.md) | 约束、锚点、`UILayoutGuide`。用了约束就别再写 frame |
| [`UIStackView`](ui-stack-view.md) | 一维排列容器。约束的工厂，不是第二套布局引擎 |
| [`UIScrollView`](ui-scroll-view.md) | 滚动。事件会合并，数据去对象上读 |
| [`UINavigationController`](ui-navigation-controller.md) | 页面栈。push / pop，返回按钮靠 `title` |
| [`UITabBarController`](ui-tab-bar-controller.md) | 底部标签栏。含 `UITabBarItem`、`UITabBar` |
| [导航条上的东西](ui-bar-button-item.md) | `UINavigationItem` / `UIBarButtonItem`。标题、返回按钮、左右按钮 |
| [`CALayer`](ca-layer.md) | 圆角、边框、阴影、渐变、形状 |
| [`UIBezierPath`](ui-bezier-path.md) | 路径：直线、曲线、圆弧、现成的形状 |
| [动画](ca-animation.md) | `CABasicAnimation`、时间曲线、`CATransaction` |
| [`UIControl`](ui-control.md) | 控件事件。16 个事件名，`addEventListener` 直接用 |
| [`UIButton`](ui-button.md) | 按钮。标题、颜色、图片按状态设 |
| [手势识别器](ui-gesture-recognizer.md) | 点按和长按。加在任意视图上，事件名是手势的阶段 |
| [输入框和键盘](ui-text-field.md) | `UITextField`、first responder、键盘避让只要一条约束 |
| [`UIDevice`](ui-device.md) | 设备和系统的信息。系统版本是字符串，比较前先转成数 |
| [触感反馈](ui-feedback-generator.md) | 让手机震一下。三个类，只能用绑定视图的工厂方法创建 |
| [`UIPasteboard`](ui-pasteboard.md) | 剪贴板。读写文字是同步属性；读内容可能引出系统提示 |
| [本地存储](storage.md) | `application.storage`。存什么、什么时候落盘、变化通知的边界 |
| [文件读写](filesystem.md) | `application.fileSystem`。全是 Promise，四个目录，错误怎么分类 |
| [Keychain](keychain.md) | `application.keychain`。令牌和密码，accessible 决定能不能跟着换手机 |
| [原生类](native-classes.md) | 哪些能 `new`、为什么不能继承、挂自定义属性的保证边界 |
| [结构体](structs.md) | `CGPoint`、`CGSize`、`CGRect`、`UIEdgeInsets`，只读 |
| [枚举](enums.md) | 一律用字符串 |
| [单位](units.md) | 长度是点不是像素；点值会不会跟着缩放 |
| [定时器](timers.md) | `setTimeout` 系列。调度参考 Chromium |
| [`performance`](performance.md) | 高精度时钟。量一段代码花了多久 |
| [`crypto`](crypto.md) | 密码学强度的随机数和 UUID。没有 `crypto.subtle` |
| [`URL` / `Headers`](url.md) | WHATWG 三件套。和浏览器有五处已知差异 |
| [`fetch`](fetch.md) | 网络请求。线程分工是实测定下来的 |
| [`WebSocket`](websocket.md) | 长连接。比 Web 多两样：可以带首部、有协议级 `ping()` |
| [`WebView`](web-view.md) | 把网页放进界面。形状照 Electron：视图管摆放，`webContents` 管加载和导航 |
| [`session`](session.md) | 网页的 cookie 和数据：读、写、删 cookie，按分区或按站点清数据 |
| [`UIColor`](ui-color.md) | 颜色。基础色、系统色、语义色 |
| [外观特征](ui-trait-collection.md) | 深色还是浅色、屏幕几倍、文字多大。读取、强制、变化通知 |
| [`UIViewController`](ui-view-controller.md) | 页面。`view`、`title`、模态呈现、父子控制器 |
| `NSObject` | ObjC 的根类，所有原生类的基类（继承 `EventTarget`） |
| `EventTarget` / `Event` | 事件基类，见 [`application`](application.md) 的「继承关系」 |
| `ErrorEvent` / `PromiseRejectionEvent` | 错误类事件对象，见 [`application`](application.md) 的「事件」 |
| `console` | 输出到 stdout 和系统日志（文档待补） |

## 当前 JS 全局环境

`globalThis` 上有 65 个自有属性，且**全部不可枚举**（ECMAScript 的规定）。所以 `Object.keys(globalThis)` 返回空数组不代表环境是空的，要用 `Object.getOwnPropertyNames` 才看得到。

**有**：完整的 ES 标准库，而且版本相当新——`Iterator`（迭代器辅助方法）、`DisposableStack` / `AsyncDisposableStack` / `SuppressedError`（显式资源管理）、`Float16Array`、`Atomics`、`SharedArrayBuffer`、`WeakRef`、`FinalizationRegistry` 都在。`Promise` 和微任务队列正常工作。`eval` 和 `new Function` 在 jitless 下走解释器，照常可用。

运行时装入的**非标准全局**：`console`、`EventTarget` / `Event`（及 `ErrorEvent`、`PromiseRejectionEvent`）、`application`，以及上面那张表里的原生类和结构体类。原生类往后会改成按需懒加载，不再一次性装入。

**没有**（都要靠后续的能力暴露来补）：

| 缺什么 | 原因 |
| --- | --- |
| `TextEncoder` / `TextDecoder`、`crypto.subtle`、`structuredClone` | 不是 ECMAScript 的一部分，由宿主提供；V8 只实现语言本身。这几个还没做 |
| `process`、`require`、`module`、`Buffer` | Node 的宿主 API |
| `Intl`，以及所有 `toLocale*` 的本地化能力 | 预编译包关掉了 i18n 支持，ICU 被排除。实测 `new Date(0).toLocaleString('zh-CN')` 完全忽略 locale |
| `WebAssembly` | lite mode / jitless 下不能编译 wasm |

---

← 返回[项目说明](../project.md)
