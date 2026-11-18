# Nacre API 文档

这里是 Nacre 提供给 JS 的全部 API 的参考，面向用 Nacre 写 App 的 JS 开发者。每一页讲一个类或一组能力：它表示什么、怎么写、写完得到什么效果、哪里会出错。

第一次用 Nacre，先读[运行时怎么工作](how-it-works.md)和 [`application`](application.md)，再按需要查其他页面。要从零建一个自己的 App，见[入门指南](../guides/README.md)。

## 有哪些 API

API 分两类：

- **运行时自己定义的**：`application`、`console`、`fetch`、定时器、本地存储、`WebView` 等。名字和写法由 Nacre 决定。
- **iOS 的原生类**：`UIView`、`UILabel`、`CALayer` 等，直接用 iOS 里的原名，属性和方法的名字也和 Apple 的文档对应。每一页末尾有一张 ObjC 和 JS 的对照表，照着 Apple 的文档就能查到 JS 怎么写。

**能用的只有下面「参考」表里列出的这些。** 没列出的 iOS 类（比如 `NSString`、`UITableView`）在 JS 里不存在，读它的名字会抛 `ReferenceError`，也没有通用的办法调用到它们。

表里的大部分 API 每个项目都有。定位、拍照、面容 ID 等几项要单独安装对应的包才有，说明里写着「要装」的就是。哪些要装、装了之后还要做什么，见[核心和能力包](capabilities.md)。App 自己的原生代码和第三方原生 SDK 的能力不在表里：它们要先包成原生模块，再从 [`application.nativeModules`](native-modules.md) 调，做法见[写自己的原生模块](../guides/native-modules.md)。

一个类已经列出、但缺某项能力时，看那一页末尾的「还不能做的」。整体还缺什么、计划怎么补，见[项目说明的功能清单](../project.md#7-还要做的)。

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
| [核心和能力包](capabilities.md) | 哪些 API 每个项目都有，哪些要单独装包；装了之后还要做什么 |
| [`application`](application.md) | App 实例：App 级的状态、事件和能力 |
| [原生模块](native-modules.md) | `application.nativeModules`：调 App 自己的和第三方的原生代码，收它们的事件 |
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
| [`UIActivityIndicatorView`](ui-activity-indicator-view.md) | 转圈。新建的是隐藏的，开始转才显示 |
| [`UIProgressView`](ui-progress-view.md) | 进度条。进度由 App 写，高度只能用约束改 |
| [`UIVisualEffectView`](ui-visual-effect-view.md) | 毛玻璃：模糊、鲜明、玻璃。内容加在 `contentView` 上；玻璃效果赋值时是复制 |
| [`UIToolbar`](ui-toolbar.md) | 工具条。里面排的是 `UIBarButtonItem`，空白也是一个项；点击来自每个项 |
| [`UISearchBar`](ui-search-bar.md) | 搜索框。八个事件，文字从 `text` 读；九个键盘设置直接写在搜索框上 |
| [`UINavigationController`](ui-navigation-controller.md) | 页面栈。push / pop，返回按钮靠 `title` |
| [`UITabBarController`](ui-tab-bar-controller.md) | 底部标签栏。含 `UITabBarItem`、`UITabBar` |
| [导航条上的东西](ui-bar-button-item.md) | `UINavigationItem` / `UIBarButtonItem`。标题、返回按钮、左右按钮 |
| [`CALayer`](ca-layer.md) | 圆角、边框、阴影、渐变、形状 |
| [`UIBezierPath`](ui-bezier-path.md) | 路径：直线、曲线、圆弧、现成的形状 |
| [动画](ca-animation.md) | `CABasicAnimation`、时间曲线、`CATransaction` |
| [`UIControl`](ui-control.md) | 控件事件。16 个事件名，`addEventListener` 直接用 |
| [`UIButton`](ui-button.md) | 按钮。标题、颜色、图片按状态设 |
| [手势识别器](ui-gesture-recognizer.md) | 点按、长按、拖动、捏合、旋转、轻扫、屏幕边缘拖动。加在任意视图上，事件名是手势的阶段 |
| [`UISwitch`](ui-switch.md) | 开关。大小由系统定，程序改值不派发事件 |
| [`UISlider`](ui-slider.md) | 滑块。值是单精度，超出范围被改成最近的一头 |
| [`UIStepper`](ui-stepper.md) | 步进器。只有加减两个按钮，数值要自己显示 |
| [`UISegmentedControl`](ui-segmented-control.md) | 分段选择。段用下标指代，-1 是没有选中的，越界会抛 |
| [`UIPageControl`](ui-page-control.md) | 页码的圆点。只显示页码，翻页要自己接 |
| [`UIDatePicker`](ui-date-picker.md) | 日期选择器。日期是 `Date`，模式和样式是两个独立的设置 |
| [输入框和键盘](ui-text-field.md) | `UITextField`、first responder、键盘避让只要一条约束 |
| [`UITextView`](ui-text-view.md) | 多行输入。它是滚动视图不是控件；代码写 `text` 不派发 `input`；选区是 `NSRange` |
| [列表](ui-collection-view.md) | `UICollectionView`。数据用带标识的快照给；`cellProvider` 是当场执行的；单元格是复用的，不能 `new` |
| [富文本](ns-attributed-string.md) | `NSAttributedString`：一段文字里混用字体、颜色、下划线、图片，调行距和对齐。交给视图之后再改它，界面不跟着变 |
| [`UIDevice`](ui-device.md) | 设备和系统的信息。系统版本是字符串，比较前先转成数 |
| [触感反馈](ui-feedback-generator.md) | 让手机震一下。三个类，只能用绑定视图的工厂方法创建 |
| [`UIPasteboard`](ui-pasteboard.md) | 剪贴板。读写文字是同步属性；读内容可能引出系统提示 |
| [本地存储](storage.md) | `application.storage`。存什么、什么时候落盘、变化通知的边界 |
| [文件读写](filesystem.md) | `application.fileSystem`。全是 Promise，四个目录，错误怎么分类 |
| [Keychain](keychain.md) | `application.keychain`，要装 `@nacrejs/keychain`。令牌和密码，accessible 决定能不能跟着换手机 |
| [跟踪授权和广告标识](app-tracking-transparency.md) | `ATTrackingManager`、`ASIdentifierManager`。要装 `@nacrejs/app-tracking-transparency` 并写一句权限文案；没授权时广告标识是全零 |
| [`LAContext`](la-context.md) | 面容 ID / 触控 ID 认证。要装 `@nacrejs/local-authentication`；通过兑现 `true`，没通过拒绝，`err.name` 说原因；参数写错是同步抛 |
| [拍照](ui-image-picker-controller.md) | `UIImagePickerController`，要装 `@nacrejs/camera`。只做相机这一种来源；系统不会自己关掉拍照界面；模拟器上相机这种来源可用，但没有摄像头 |
| [相册](photos.md) | `PHPickerViewController` 选图、`PHPhotoLibrary` 存图。要装 `@nacrejs/photos`；选图不要权限，存图要写一句权限文案 |
| [定位](cl-location-manager.md) | `CLLocationManager`，要装 `@nacrejs/core-location`。申请授权和取一次位置是 Promise，连续更新是事件；位置里量不出来的量是 `null` |
| [通知](un-user-notification-center.md) | `UNUserNotificationCenter`，要装 `@nacrejs/user-notifications`。发本地通知、查和撤是 Promise；通知到了、被点了是事件；内容、触发器、请求是只读的值；App 开着时显不显示是预先设好的属性 |
| [原生类](native-classes.md) | 哪些能 `new`、为什么不能继承、挂自定义属性的保证边界 |
| [补上的成员（清单）](view-additions.md) | `UIView`、`UIScrollView`、`UITextField`、`UITextView` 上后补的成员。只有名字和类型，还没有写效果 |
| [取色控件（清单）](system-controls.md) | `UIColorWell`。只有名字和类型，还没有写效果 |
| [结构体](structs.md) | `CGPoint`、`CGSize`、`CGRect`、`UIEdgeInsets`，只读 |
| [枚举](enums.md) | 一律用字符串 |
| [单位](units.md) | 长度是点不是像素；点值会不会跟着缩放 |
| [定时器](timers.md) | `setTimeout` 系列。调度参考 Chromium |
| [`performance`](performance.md) | 高精度时钟。量一段代码花了多久 |
| [`Intl`](intl.md) | 按地区写数字、金额、百分比（`Intl.NumberFormat`）。结果和同一台设备上的 Safari 相同 |
| [`Intl.DateTimeFormat`](intl-date.md) | 按地区写日期和时间，时区、日历、一段时间。`Date` 的 `toLocale*String()` 也是它 |
| [`crypto`](crypto.md) | 密码学强度的随机数和 UUID。没有 `crypto.subtle` |
| [文字、字节和深拷贝](web-globals.md) | `TextEncoder` / `TextDecoder`（只做 UTF-8）、`btoa` / `atob`、`structuredClone`（还没有 `transfer`） |
| [`URL` / `Headers`](url.md) | WHATWG 三件套。和浏览器有五处已知差异 |
| [`fetch`](fetch.md) | 网络请求。线程分工是实测定下来的 |
| [`WebSocket`](websocket.md) | 长连接。比 Web 多两样：可以带首部、有协议级 `ping()` |
| [`WebView`](web-view.md) | 把网页放进界面。形状照 Electron：视图管摆放，`webContents` 管加载和导航 |
| [`session`](session.md) | 网页的 cookie 和数据：读、写、删 cookie，按分区或按站点清数据 |
| [`UIColor`](ui-color.md) | 颜色。基础色、系统色、语义色 |
| [外观特征](ui-trait-collection.md) | 深色还是浅色、屏幕几倍、文字多大。读取、强制、变化通知 |
| [`UIViewController`](ui-view-controller.md) | 页面。`view`、`title`、模态呈现、父子控制器 |
| [系统弹窗](ui-alert-controller.md) | `UIAlertController` 和 `UIAlertAction`：提示框和底部菜单。按钮被点了是按钮上的事件 |
| [系统分享面板](ui-activity-view-controller.md) | `UIActivityViewController`：把文字、网址、图片交给别的 App。结束时派发 `complete` |
| [通讯录选择器](contacts.md) | `CNContactPickerViewController` 和 `CNContact`：让用户选联系人，不需要通讯录权限。要先装 `@nacrejs/contacts`；监听哪个事件决定是单选、多选还是选某一项 |
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
| `crypto.subtle`、`DOMException`、`FormData`、`ReadableStream` | 不是 ECMAScript 的一部分，由宿主提供；V8 只实现语言本身。这几个还没做（`TextEncoder` / `TextDecoder`、`atob` / `btoa`、`structuredClone` 已经补上，见[文字、字节和深拷贝](web-globals.md)） |
| `process`、`require`、`module`、`Buffer` | Node 的宿主 API |
| `Intl` 里 `NumberFormat` 和 `DateTimeFormat` 之外的成员，以及字符串的 `localeCompare` / `toLocaleUpperCase` | 预编译包关掉了 i18n 支持，ICU 被排除。数字和日期已经用系统的格式化接口补上（见 [`Intl`](intl.md)），其余还没做：`'ä'.localeCompare('z')` 按编码值比较 |
| `WebAssembly` | lite mode / jitless 下不能编译 wasm |

---

← 返回[项目说明](../project.md)
