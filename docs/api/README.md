# Nacre API 文档

面向用 Nacre 写 App 的 JS 开发者。这些 API 遵循的设计原则见[项目说明第 2 节](../project.md)。

Nacre 的 API 分两层：

- **上层**：Nacre 自己定义的标准，能力导向、好用、一致
- **底层**：iOS 原生符号按 ObjC 类名暴露在全局（`UIView`、`UIColor`、`CALayer`），和 Apple 文档一一对应

本目录两层都记。

## 先读这一条：现在有哪些类

**只有下面这张「参考」表里列出来的类。** 没列出来的 iOS 类（`NSString`、`UITableView`、`CLLocationManager`、`WKWebView`…）**JS 拿不到**，也没有通用的调用方式去够到它们。

「上层没覆盖的、底层一定能补上」是**做完 bindgen 之后**的目标（[项目说明](../project.md)里的 M3），**现在还不成立**。这份文档以前把那个目标写成了现状，给人造成过误导。

同样地，**宿主 App 和第三方原生 SDK 的能力目前也没有办法暴露给 JS**——运行时对外只有一个启动入口，没有注册自定义原生能力的口子。

每份文档末尾的「还没做」列的是**那个类自己**缺的东西；整体还缺什么见[项目说明的能力清单](../project.md#功能清单)。

> 这里只讲**怎么用和什么效果**。桥怎么搭的、为什么这么选、实测数据在[实现原理](../internals/README.md)；已定的决策和进度在[项目说明](../project.md)。

这些文档怎么写，见[文档写法](../writing-guide.md)。文档正在分批改成这份规范的写法，开头带「完整例子」一节的是已经改好的。

每份文档的末尾都有一张 **ObjC ↔ JS 对照表**——照着 Apple 文档就能查到 JS 怎么写。

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
| [`UIColor`](ui-color.md) | 颜色。基础色、系统色、语义色 |
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
