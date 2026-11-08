# Nacre API 文档

面向用 Nacre 写 App 的 JS 开发者。这些 API 遵循的设计原则见[项目说明第 2 节](../project.md)。

Nacre 的 API 分两层：

- **上层**：Nacre 自己定义的标准，能力导向、好用、一致。本目录记录的就是这一层
- **底层**：iOS 原生符号按 ObjC 类名裸暴露在全局（`UIWindow`、`NSString`、`CLLocationManager`），完整、一一对应、不丢能力

上层没覆盖的，底层一定能补上。

> 这里只讲**怎么用和什么效果**。桥怎么搭的、为什么这么选、实测数据在[实现原理](../internals/README.md)；已定的决策和进度在[项目说明](../project.md)。

每份文档的末尾都有一张 **ObjC ↔ JS 对照表**——照着 Apple 文档就能查到 JS 怎么写。

## 参考

| 对象 | 说明 |
| --- | --- |
| [`application`](application.md) | App 实例：App 级的状态、事件和能力 |
| [`UIWindowScene`](ui-window-scene.md) | 场景：App 的一个 UI 实例，JS 创建界面的入口 |
| [`UISceneSession`](ui-window-scene.md#uiscenesession) | 场景的持久身份：角色、标识、自定义数据 |
| [`UIWindow`](ui-window.md) | 视图树的根，挂在场景上 |
| [`UIView`](ui-view.md) | 视图。几何、层级、外观 |
| [`UILabel`](ui-label.md) | 文字 |
| [`UIFont`](ui-font.md) | 字体 |
| [`UIImage` / `UIImageView`](ui-image.md) | 图片。四条取图路径，`size` 是点不是像素 |
| [Auto Layout](auto-layout.md) | 约束、锚点、`UILayoutGuide`。用了约束就别再写 frame |
| [`CALayer`](ca-layer.md) | 圆角、边框、阴影 |
| [`UIControl`](ui-control.md) | 控件事件。16 个事件名，`addEventListener` 直接用 |
| [结构体](structs.md) | `CGPoint`、`CGSize`、`CGRect`、`UIEdgeInsets`，只读 |
| [枚举](enums.md) | 一律用字符串 |
| [定时器](timers.md) | `setTimeout` 系列。调度参考 Chromium |
| [`URL` / `Headers`](url.md) | WHATWG 三件套。和浏览器有五处已知差异 |
| [`fetch`](fetch.md) | 网络请求。线程分工是实测定下来的 |
| [`UIColor`](ui-color.md) | 颜色。基础色、系统色、语义色 |
| `UIViewController` | 页面。目前只有可构造和只读的 `view`（文档待补） |
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
| `setTimeout` / `setInterval` / `queueMicrotask` | 不是 ECMAScript 的一部分，由宿主提供；V8 只实现语言本身。JS 在主线程上，定时器可以直接建在 run loop 上 |
| `fetch`、`URL`、`TextEncoder`、`crypto`、`performance`、`structuredClone`、`AbortController` | 同上，都是 Web 平台 API |
| `process`、`require`、`module`、`Buffer` | Node 的宿主 API |
| `Intl`，以及所有 `toLocale*` 的本地化能力 | 预编译包关掉了 i18n 支持，ICU 被排除。实测 `new Date(0).toLocaleString('zh-CN')` 完全忽略 locale |
| `WebAssembly` | lite mode / jitless 下不能编译 wasm |

---

← 返回[项目说明](../project.md)
