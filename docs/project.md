# Nacre 项目说明

本文件只记四样：项目是什么、定下来的规矩和选型、目录约定和开发流程、还要做的事。新的决策确定后更新这里。

**这里不放实现原理和设计推导。** 为什么这么选、怎么搭的、实测数据、被否掉的方案，都在 [`docs/internals/`](internals/README.md)。做完的事不在这里留记录：现在有什么看 [`docs/api/`](api/README.md)，过程看提交记录。


## 1. 项目定义

Nacre 仓库包含一个**没有具体业务的 iOS App**，它覆盖常见 App 所需的全部功能。

开发中有一条**硬性约束**：原生层不调度任何 API，只通过 V8 把能力暴露给 JS，所有调度都由 JS 完成。

这个 App 完成后，其中的运行时就是 Nacre：一个 App 端的 JavaScript 运行时。

> Node.js for servers, browsers for the web, Nacre for apps.

### 原生层的边界

原生层**只允许**以下三类代码：

| 类别 | 内容 |
| --- | --- |
| 启动壳 | AppDelegate、SceneDelegate：只负责启动运行时，并把系统事件转发给 JS |
| 运行时 | V8 初始化、事件循环、内存管理 |
| 能力暴露 | 把 iOS API 暴露给 JS 的桥接代码 |

**不允许**出现在原生层：界面创建、页面跳转、网络请求、数据处理等任何决定"App 做什么"的代码。

每一步的验收标准都包括：**功能可用，并且原生层没有新增任何调度代码，只新增了能力暴露代码。**

## 2. API 设计原则

Nacre 对 App 做的事，相当于 W3C 对浏览器做的事：**定义一套把系统能力暴露给 JS 的标准**。所以我们吸收 W3C 的**方法论**——它为这个问题积累了三十年——但不照搬它的具体设计。

**面向谁**：主要面向 JS 开发者和用户侧开发者。目标是**让 JS 开发者轻松，让 iOS 开发者亲切**。这两件事由分层解决，不用二选一。

### 两层 API

| | 底层 | 上层 |
| --- | --- | --- |
| 是什么 | 裸暴露的原生符号：`UIWindow`、`CLLocationManager`、`NSString` | Nacre 定义的标准：`application`、`console` 等 |
| 谁定义 | **Apple**，我们只做无损映射 | **我们** |
| 设计目标 | **接进来的类能力完整**，不丢它的任何能力。接哪些类由我们按需要定，不是把整个 SDK 都接进来 | 好用、一致、面向能力 |
| 服务谁 | iOS 开发者的亲切感 | JS 开发者的轻松感 |
| 变化来源 | 跟着 iOS SDK 走 | 我们自己的版本承诺 |

**每遇到一个新能力，第一个问题是「它属于哪层」。** 上层没覆盖的，底层一定要能补上——这是「原生 API 完整暴露」这条承诺的含义。完整说的是**接进来的类**，不是整个 SDK：接哪些类按需要定（2026-11-18）。一个已接的类还缺哪些成员，`bindgen` 的 `report` 列得出来，见 [bindgen](internals/bindgen.md)。

**承诺的是能力对齐，不是 API 形状一致。** iOS 层有的能力，JS 层就应该有，除非那个能力在 JS 侧完全没必要（比如 `retain` / `release`：ARC 下已不可调用，而且运行时的包装机制本来就在管生命周期）。但怎么把它表达成 JS，是我们的自由——方法名可以重排，长参数列表可以换成 options 对象，出参可以改成返回值或抛异常。判据是「JS 开发者能不能做到 iOS 开发者能做到的事」，不是「签名长得像不像」。

### 原则

**1. 职责分离：每个对象一个名词、一件事。** 浏览器里 `document` 管文档树、`navigator` 管设备信息、`location` 管地址、`history` 管导航栈、`screen` 管显示器，没有一个装两百个方法的 god object。我们照这个**方法**分，但分出来的对象是我们自己的——浏览器没有「App 实例」这个概念，`application` 是我们定义的。

**2. 能力导向，不是实现导向。** `fetch()` 背后是 DNS、TLS、连接池、多路复用，API 只表达「取一个资源」。上层 API 表达**要做什么**，底层裸暴露表达**系统怎么做的**。

**3. 横切关注点抽成统一基类。** W3C 不让每个对象发明自己的回调风格，而是定义 `EventTarget` 让所有会发事件的东西继承。遇到重复出现的模式，先问能不能抽成基类或协议。

**4. 异步只有一种形态：Promise。** W3C 走过回调 → 事件 → Promise 的弯路，我们有后发优势。**所有异步 API 返回 Promise，不要回调参数，不要 `onSuccess` / `onError` 属性。**

**5. Promise 和事件的分工：一次性的请求-响应用 Promise，重复发生的通知用事件。** `fetch()` 是 Promise，`click` 是事件；`application.openURL()` 是 Promise，`memorywarning` 是事件。这条能消除大量「用哪个」的纠结。

**6. options 对象，不是长参数列表。** `addEventListener(type, cb, { once })`。超过两个参数或带可选项时用 options 对象：可扩展、可读、不用记顺序。ObjC 的 selector 命名（`insertSubview:atIndex:`）在底层保留，那是另一层的事。

**7. 运行时提供事实，JS 做判断。** `application.supportsMultipleScenes` 给出运行环境的真实能力，由 JS 决定 UI 怎么做。原生层不替 JS 做决策——这是第 1 节「原生层不调度」的直接推论。

**8. 不照搬浏览器的安全模型。** 同源策略、CORS、CSP、Permissions API 都是因为浏览器要运行**不受信任**的代码。我们的 JS 是开发者自己打包进 App 的，和原生代码同等地位。权限走 iOS 的系统权限，`fetch` 不用背跨域包袱。

**9. iOS 独有的机制，按 iOS 的事实定义，不去 Web 规范里找近似物。** 手势抢占、responder chain、first responder 在 Web 里没有对应概念。硬套 `preventDefault` 或 pointer capture 只会得到一个既不像 Web 也不像 iOS 的东西。

**10. 能力要完备，不是「有个属性就行」。** 暴露一个状态，就要同时提供**读**和**变化通知**；可写的还要提供**写**。只给属性不给变化事件，JS 就只能轮询——而我们连定时器都没有，等于完全不可观测。

审阅一项能力时按这三格逐一检查，缺哪格补哪格；确实不存在的（静态值没有变化、只有自己能改的值不需要通知）要写明原因，而不是默默留空。

**12. 上层列出「有什么」，不讲它和原生名字之间的换算规则。** 我们是定这套 API 的人，所以**告诉使用者有什么就是有什么**——该给一张能用的东西的表，不该给一条「把原生符号这样那样变换一下」的规则让人自己推。

颜色上栽过一次：文档写的是「语义色 = 那 39 个常量**去掉 `Color` 后缀**」，于是 JS 开发者得先知道底层有个 `systemPinkColor`，再自己算出 `systemPink`。改成直接列 `black` / `systemBlue` / `label` 那张表之后，`Color` 后缀这件事对他就不存在了——它是桥的实现细节，记在 `internals/` 里。

连带的一条：**既然只支持表里这些，写错时就要把表列出来。** 枚举一直是这么做的（`has no value "x"; expected one of: …`），颜色名跟上了。但要看写的是什么——`'#GGG'` 那种写法的人问的不是「有哪些名字」，给他甩 39 个名字是噪音。

**11. 暴露出去的一切用英文，注释用中文。** 判据是「JS 开发者看不看得见」：抛出的 `Error.message`、运行时打的警告和日志、属性名、枚举值、类型定义，全是 API 的一部分，一律英文；源码注释、文档、验收用例的日志是给我们自己看的，用中文。

代码里的标识符也一律用英文——变量、函数、参数、属性名都是。中文只出现在注释、文档和验收用例的输出文本里。

**13. API 层宽松接收，照 Web IDL 转换；交给原生的值必须类型精确。** JS 开发者写 `view.alpha = '0.5'`、`label.text = 5`、`control.isEnabled = 1` 都该得到合理的结果，和他在 Web 上的经验一致；但原生层不猜、不转——它只校验，类型不是它要的那一种就报错。两层分工，转换只发生在 JS 一侧。

转换规则不自己发明，照 Web IDL：

| 期望的类型 | 怎么转 | 仍然抛 `TypeError` 的 |
| --- | --- | --- |
| 数 | `Number(v)` | 结果不是有限数（`undefined`、`'abc'`、`{}`、`NaN`） |
| 整数（下标、个数） | `Number(v)` 后向零取整 | 同上 |
| 布尔 | `Boolean(v)` | 没有 |
| 字符串 | `String(v)`。`null` 和 `undefined`：属性可空时得到 `null`，不可空时得到空串 | 没有 |
| 原生对象 | 不转 | 不是要求的那个类 |
| options 的成员 | 值是 `undefined` 视为没带；整个 options 传 `null` / `undefined` 视为空对象 | 必填的没带 |

所以 `view.alpha = null` 得到 0、`view.isHidden = 'false'` 得到 `true`——和 `audio.volume = null`、`button.disabled = 'false'` 一样。这不是疏漏，是「和 Web 一致」的直接后果。

两处**不照搬**：

- **不可空的字符串，`null` 和 `undefined` 给空串。** Web 的普通字符串会得到 `'null'` / `'undefined'` 这两个字面量（`el.setAttribute('x', null)`），那是公认的坑。我们学的是 `input.value = null` 得到 `''` 的那一类
- **整数不学老 API。** Web 的老接口把 `NaN` 当 0、还按 32 位回绕（`el.tabIndex = 'abc'` 得到 0），那是历史包袱，Web 自己的新接口也改成抛了。`insertSubview(v, { atIndex: NaN })` 插到第 0 位不是任何人想要的

取值范围是另一回事：类型对、但超出范围（负的次数、强度大于 1），由各 API 自己拒，不归这条管。

为什么转换必须在 JS 一侧、这条规则是怎么来的，见[参数转换](internals/conversion.md)。

### 怎么用这一节

这是给 SOP 第 1 步（讨论）用的判据。**往后每一步新增能力，都要对照本节说明设计理由**：它属于哪层、职责边界在哪、异步形态是什么、读写和变化通知是否完备、有没有照搬了不该照搬的东西。

### 已定的写法

这几条是接每一个原生类都要照着做的。各自的理由和实测在链接里。

| | 规矩 | 细节 |
| --- | --- | --- |
| 方法名 | selector 的第一段做方法名，其余段是 options 对象的键，键名用 ObjC 的段名原文：`view.insertSubview(box, { atIndex: 0 })` | [原生类](api/native-classes.md) |
| 结构体 | `CGRect` 这类做成 JS 类，字段只读，写了就抛；嵌套访问和扁平访问都有 | [结构体](internals/structs.md) |
| 枚举 | 一律字符串：ObjC 常量去掉类型前缀、首字母小写；位掩码用字符串数组；名字和数值的映射只放在原生层；一个数值两个名字时写入都认、读出给主名；系统的哨兵常量也用字符串（`spacing = 'system'`）。**写错时按位置分**：属性位打一条警告、值保持不变（位掩码数组里有一个不认识的名字，整次赋值不生效）；方法参数、options、构造参数里抛 `TypeError`。两种的话都列出全部可选值。类型定义不放宽 | [枚举](internals/enums.md) |
| 颜色 | 读写都是字符串，合法写入的原样读回；写错是警告加保持原值 | [颜色](internals/ui-color.md) |
| 原生类 | 一律 final，不做继承。`class X extends UIView {}` 在 `new X()` 时抛 | [包装](internals/wrapper.md) |
| 上层的类 | 我们定义的上层 API（Web 标准的 `WebSocket`、`Blob`，照 Electron 的 `WebContents` / `Session`，`application` 上的 `fileSystem`、`network` 这些对象）不继承 `NSObject`：会发事件的直接继承 `EventTarget`，不发事件的不继承任何类，和 Web 的 `Storage`、`Crypto` 一样。`NSObject` 只在底层，照实映射 iOS 的类层级。2026-11-21 定 | [包装](internals/wrapper.md#上层的类不继承-nsobject) |
| 属性名拼错 | 运行时不报错，不禁止往包装上挂自己的数据；拼错由类型检查挡 | [原生类](api/native-classes.md) |
| 事件类 | 一种字段组合是一个类（照 Web 的 `MouseEvent` 有 `clientX`）：带字段的事件都是真的类，`new XxxEvent(type, init)`，字段是原型上的只读 getter；哪个事件是哪个类只在原生那边写一份（发事件时带 `eventClass`）；类型上每个会发事件的类配一张「事件名 → 事件类」的表。Web 有同样字段组合的用 Web 的类（`CustomEvent`、`MessageEvent`、`CloseEvent`、`ErrorEvent`）。2026-11-22 定 | [事件](internals/events.md#事件类一种字段组合是一个类2026-11-22) |
| 报错 | 参数类型不对抛 `TypeError`，超出范围抛 `RangeError`；出错的含义 Web 上有名字的抛 `DOMException`（名字用 Web 的），系统给的原值是挂在 `cause` 上的 `NSError`；含义是 iOS 特有的抛 `NSError`（`name` 是分类名，映射不到是 `'NSError'`，`domain` / `code` 是原值，不给 `userInfo`）。原生模块的错误不归这条管。2026-11-22 定 | [报错](internals/errors.md) |
| 事件名 | 按用户做了什么来命名，全小写；Web 上有含义相同的事件就用它的名字，含义不同的不借；改名不留旧名。网页那一组照 Electron。不认识的事件名不拒绝，当自定义事件 | [事件](internals/events.md#事件名按用户做了什么来命名) |
| 事件能不能取消 | 原生的通知延后一轮派发，不可取消；系统当场来问、要立刻给答案的，当场派发，可取消；系统这一刻正在做一件 JS 要跟着做的事（键盘、转屏的动画），当场派发，不可取消；系统当场要一个值（滚动松手时停在哪），当场派发，不可取消，事件上那个字段可写，监听器写什么原生用什么 | [事件](internals/events.md) |
| 所有权 | 收对象参数并持有它的成员，JS 一侧要记所有权边，`check-api.sh` 核对 | [包装](internals/wrapper.md) |
| 覆写点 | UIKit 只能靠子类覆写拿到的能力，先看 UIKit 怎么用它：系统每次都来调的通知类（出现、消失），替换基类方法、转成事件；要「真的覆写」才生效的 getter（方向、状态栏），给 JS 能 `new` 的页面预置原生子类，JS 里是可写属性，系统的页面上写了抛 | [页面的覆写点](internals/page-overrides.md) |
| 组件不接 | 现成的界面部件不接：JS 用已有的能力拼得出来的（开关、滑块、标签栏、导航条的外观、列表的格子）。已经接了的保留，只修 bug，不再补成员。要接的是 JS 拼不出来的**能力**：绘制和交互的基础（视图、图层、文字、输入法、滚动的手感、手势）、系统的页面和服务（弹窗、分享、选图、毛玻璃）、和系统的对接（场景、键盘、转屏）。2026-11-20 定 | — |
| 接类的初稿 | 先用 `bindgen` 的 `scaffold` 照头文件写出一个域的初稿，写完就是普通的手写文件，直接改。不设「生成的、不许手改」的文件 | [bindgen](internals/bindgen.md) |

### 性能：能用就先用着

判据是整个 App 流不流畅，不是某个数字好不好看。先按最直白的写法做出来；真卡到不能用了再去量、再针对性优化。不为「可能会慢」提前加机制。


## 3. iOS 技术选型（已确定）

| 方面 | 选型 |
| --- | --- |
| 系统与设备 | iOS 26+，只支持 iPhone，只支持 arm64（真机和 Apple Silicon 模拟器），Xcode 26+。**用到 iOS 27 才有的符号时，`#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 270000` 和 `@available` 两层都要写**——前者管编译用的 SDK 认不认识，后者管跑的机器有没有。只写后者在 Xcode 26 上编译不过。漏写后者时编译器只给警告（`-Wunguarded-availability-new`），`run-sim.sh` 和 `run-device.sh` 会把这类警告单独列在构建输出的最后 |
| JS 引擎 | V8 14.9.207.39，使用 [NativeScript/v8-buildscripts](https://github.com/NativeScript/v8-buildscripts) 发布的预编译静态库；lite mode 构建，即 jitless。**不要传 `--jitless`**（只读标志，设置会崩溃） |
| V8 获取方式 | `ios/scripts/fetch-v8.sh` 下载并校验 SHA256，放到 `ios/Vendor/v8`，不提交 |
| 线程模型 | **JS 运行在主线程**，和 UIKit 同线程，所以同步读布局和同步回调天然成立。主线程栈用链接器参数 `-Wl,-stack_size,0x800000` 设为 8MB（真机默认 1MB，不够 V8 用）。V8 的空闲任务在 run loop 即将等待时执行，做增量 GC。理由和代价见[运行时](internals/runtime.md#js-为什么跑在主线程) |
| UI 框架 | UIKit（不用 SwiftUI 作为渲染目标；需要 SwiftUI 组件时通过 `UIHostingController` 嵌入） |
| 排版 | iOS 原生方式：Auto Layout 约束、UIStackView、CALayer 属性。**不必须实现 DOM、CSS、flexbox**——运行时不提供它们，但也不挡着谁在 JS 层自己做一套 |
| 加载模型 | JS 在构建时打进 App Bundle，启动时从本地读取。不通过 HTTP 加载，没有 URL、origin、`location`、`history` |
| 模块化 | 运行时只负责执行 JS 文件，模块化和打包交给社区工具。**已验证**：`acceptance/` 用 esbuild 打成 iife 产物，在运行时上跑通（`--format=iife` 是硬约束，ESM 产物里的 `import` 会直接抛）|
| 网络 | `NSURLSession` + delegate 两段式。**delegate 队列只投递，重活派到并发队列**——实测 20 个请求每个做 100ms 重活，直接做 2179ms，派出去 166ms。body 的 `arrayBuffer()` 走 `BackingStore` 零拷贝。详见 [fetch 文档](api/fetch.md) |
| URL 解析 | `NSURLComponents` + `standardizedURL`，规范化全在原生层做完。和 WHATWG 有五处已知差异，最要紧的是**没有 base**（我们没有 location）。详见 [URL 文档](api/url.md) |
| 任务调度 | 定时器用「一个最小堆 +（到期时间, 注册序号）排序 + 一个唤醒源」，参考 Chromium 的 MessagePump。一次唤醒最多占用主线程 8ms，超了让出去给渲染。详见 [定时器文档](api/timers.md) |
| 类型定义 | `packages/types/` 下的 `@nacrejs/types`，手写，靠 `ios/scripts/check-api.sh` 核对三边一致。类型检查和打包都是 `acceptance/` 的 devDependency，版本钉在它的 `package.json` 里 |
| 工程管理 | XcodeGen：`ios/project.yml` 描述工程，`Nacre.xcodeproj` 由它生成，不提交 |
| 代码分层 | Swift：启动壳，外加运行时里的两个 Swift 文件（`Bridge/NacreIntlNumber.swift` 和 `NacreIntlDate.swift`，按地区格式化；系统对得上网页结果的那套接口只有 Swift 能调，见[实现原理](internals/intl.md#运行时里第一次有-swift)）；ObjC++：运行时入口和 iOS 桥接；C++：引擎封装（仓库根的 `core/engine/`，只依赖 V8，两端共用） |
| 生命周期 | 只使用 Scene 生命周期 |
| 场景数量 | 运行时**不写死**，配置是什么就读到什么。两个事实都提供给 JS：**声明值**在 `application.info.UIApplicationSceneManifest.UIApplicationSupportsMultipleScenes`，**实际能力**在 `application.supportsMultipleScenes`（＝声明 AND 环境允许；iPhone 上多场景主要靠外接显示器，iPad 是常态）。原生层只提供事实，由 JS 自行判断。当前项目声明为 `false` |
| JS 执行模式 | **严格模式**。运行时给每个脚本（内置脚本和用户脚本）前置一行 `'use strict'`，行号用 `ScriptOrigin` 的 `line_offset = -1` 抵回来。理由见[运行时](internals/runtime.md#js-为什么强制严格模式) |
| JS 全局对象 | `globalThis` 保留不动；运行时注入 `Application` 类及其**唯一实例** `application`（单例）。**不叫 `window`**：`UIWindow` 在 iOS 里是真实存在的另一个东西，会撞。详见 [API 文档](api/application.md) |
| 原生 API 命名空间 | **不设命名空间**，按 ObjC 类名裸暴露在全局：`new UIWindow(...)`、`NSString`。理由见[运行时](internals/runtime.md#原生-api-为什么裸暴露在全局) |
| 暂不考虑 | 插槽、CLI、开发模式、iPad、Mac Catalyst，以后按需再做 |

这张表里几条选型的理由（JS 为什么在主线程、为什么强制严格模式、原生 API 为什么裸暴露在全局）见[运行时](internals/runtime.md)，事件模型借了 Web 的什么、没借什么见[事件](internals/events.md)。

## 3.5 类型定义

`packages/types/`（`@nacrejs/types`）是一份纯类型的 npm 包，没有运行时代码。使用者是拿 Nacre 写 App 的人。

| 文件 | 内容 |
| --- | --- |
| `nacre.d.ts` | 运行时自己的 API，跨平台 |
| `ios.d.ts` 和 `ios/` | iOS 原生符号，一个能力域一个 `.d.ts` |
| `index.d.ts` | 入口 |

- 同一套 API 有三个面：原生的分发表、内置脚本、类型。`ios/scripts/check-api.sh` 核对三边的符号是否一致；它不比类型，类型靠验收的 `tsc` 兜着。
- 新增或改动 JS 能碰到的 API，同一步里更新类型。

## 3.6 验收套件

`acceptance/` 是验收套件，也是运行时的第一个客户，所以按真的 JS 工程来搭。

| | |
| --- | --- |
| 打包 | esbuild。硬约束：`--format=iife`、`--platform=neutral`、不压缩、`--charset=utf8` |
| 类型 | 把 `@nacrejs/types` 装成依赖，用 `/// <reference types="@nacrejs/types" />` 引进来 |
| 版本 | esbuild 和 typescript 钉死在 `package.json`，lock 文件提交 |
| 步骤 | 一步一个文件（`src/steps/`），界面上一步一个区块 |
| 判定 | 在真机上跑 `npm run verify -- --device`，看退出码 |

怎么判通过、怎么只跑几步、版面怎么排，见[验收怎么判通过](internals/acceptance.md)。

## 3.7 交付物

交付分两半：**要放进 `ios/` 里的东西**（`@nacrejs/ios`），和**把它们放进去的命令**（`@nacrejs/cli`）。命令从项目目录生成 `ios/`。

一个 Nacre 项目的形状（验收和示例都是）：

```
<project>/
├─ package.json
├─ nacre.config.json      App 的名字、包名和工程配置
├─ icon.png / icon.icon   App 图标（可以不放）
├─ launch.png             启动屏正中的图（可以不放）
├─ src/main.js            JS 入口
├─ assets/                图片等资源
└─ ios/                   ← CLI 生成，不进版本库，随时可以删掉重建
```

| 包 | 里面有什么 |
| --- | --- |
| `@nacrejs/ios` | `template/`（启动壳）、`nacre-ios.json`（机器可读的清单）、`Nacre.xcframework`（构建产物，不提交）。没有命令 |
| `@nacrejs/cli` | 命令 `nacre`。它自己不带任何要放进 `ios/` 的东西，去项目的 `node_modules/@nacrejs/ios` 里找 |
| `@nacrejs/types` | 类型 |

- 模板和运行时同包同版本发。CLI 只读清单，不对模板做假设。
- **命令不属于任何一个平台**（2026-11-19 定）：平台的东西跟着平台的包走，以后做 Android 是多一个平台的包，命令还是同一个。
- 清单带格式版本 `manifestVersion`。格式变了就升它；命令遇到不认识的版本停下并说明要升级哪个包。
- **命令的输出是英文**，报错以 `nacre:` 开头。它是对外的东西，归「暴露出去的一切用英文」那条管。
- 启动壳不需要被改：第三方原生 SDK 通过[原生模块](guides/native-modules.md)接进来。
- CLI 只有一个命令 `nacre generate <项目目录> [--runtime=framework|source]`。`source` 引运行时的工程当子工程，我们自己用；`framework` 引预编译的 xcframework，用户用。两种都要验。
- 清单里 `appSettings` 的三条是宿主必须照做的：`-Wl,-stack_size,0x800000`、`ENABLE_DEBUG_DYLIB: NO`、`TARGETED_DEVICE_FAMILY: 1`。

### 发布

| | |
| --- | --- |
| 包名 | npm 上的前缀是 `@nacrejs`（`nacre` 这个组织名注册不了）。项目名、framework 名、命令名不带 `js` |
| 许可 | FSL-1.1-MIT：源码公开，谁都能用它做 App（含商业的），不能把它做成竞争的商业产品；每个版本满两年变成 MIT。对外不叫「开源」。版权人 `John-Oldman-Wang` |
| 版本 | 全部包同一个版本，一起发。不发布的只有示例模块 |
| 通道 | 带后缀的版本（`0.0.1-beta.1`）发到同名的通道，正式版才是默认装到的那个 |
| 二进制 | 预编译的 framework 放在 npm 包里，不另外下载 |
| 第三方声明 | 运行时里编进了 V8 和它依赖的库，随 `@nacrejs/ios` 发一份 `THIRD-PARTY-NOTICES.md`，清单照实际链进去的东西核对 |
| 怎么发 | `scripts/release.mjs`：`version` 改版本、`check` 核对、`pack` 打压缩包、`publish` 发布（已经发过的包跳过，可以重跑）。发布前跑 `scripts/smoke.sh`：在仓库外建一个新项目、只装打出来的压缩包，照用户的走法生成并编译 |
| 什么时候发 | 合并到 `main`、且包里写的版本号 npm 上还没有的时候，CI 发（`.github/workflows/release.yml`）。所以发一个新版本就是合并一个改版本号的 PR；别的合并不触发发布。第一个版本手动发 |
| 用哪个 Xcode 打包 | GitHub 的 `macos-26` 机器上默认装齐的那个（现在是 26.6），在 CI 上，版本号写死在工作流里。为什么不用最老的 26.0，见[交付物](internals/delivery.md#发出去的包用-xcode-266-来打) |
| PR 上跑什么 | `.github/workflows/check.yml`：不用编译的检查，加上用 Xcode 26 从源码打包并跑一遍 `smoke.sh`。完整的验收不在 CI 里跑，发布前在本地跑 |

为什么是这个形状、工程怎么分 target、三边怎么核对、发布这几条是怎么定的，见[交付物、工程和类型检查](internals/delivery.md)。

## 3.8 核心和能力包


### 判据

**核心是视图 + 数据 + 交互 + 网络**——一个 App 一定有的。其余的看拆它能省下什么。实打实的代价只有一种：

**用户要不要因此在他自己的工程里写点什么**——Info.plist 里一句权限文案、一条 entitlement。ITMS-90683 扫的是二进制里的符号，能力只要在核心里，每个 App 都得写。这是分界线。

**「核心要多链一个系统框架」不算代价**，这一条是量出来的。原来把它列为第二种代价，并据此说拆 WebView「收益最大」——那句话没有数据。量了之后（真机，见[能力包](internals/capabilities.md#拆不拆量过的代价)）：链接 WebKit 只让启动慢约 1 ms，而拆包之后多嵌一个动态库本身也要 0.5–1 ms。系统框架在共享缓存里，多链一个几乎不花钱。

「每个 App 都用得到吗」单独拿来当判据不够用：按它剪贴板、触感反馈、`crypto` 全该拆，而它们留在核心什么都不费。**每多一个包也有成本**——多一个要嵌的 framework、多一次启动时的加载、多一个要和核心对齐版本的东西。小而无代价的，留核心。

**隐私类别不算代价**，这一条量过之后改了主意。本地存储带 UserDefaults 那一类、文件读写带文件时间戳那一类，原来倾向把它们拆出去。但那两条声明写在**我们自己 framework 的隐私清单里**，用户的工程里什么都不用写——和 Face ID 要他自己在 Info.plist 里写一句话是两回事。而且文件读写拆了，核心那条声明也去不掉：V8 自己用了 `fstat`。

### 能力清单（2026-11-15 定）

**核心：**

| 域 | 里面有什么 |
| --- | --- |
| 运行时本身 | V8、事件循环、定时器和微任务、`console`、`performance`、全局错误出口、`EventTarget` / `Event`、`TextEncoder` / `TextDecoder`、`atob` / `btoa`、`structuredClone` |
| 桥 | 包装和所有权、参数转换、结构体、枚举 |
| App | `application`：状态、生命周期事件、场景、`openURL`（往外打开）、`openurl` 事件（被链接打开）、`nativeModules`（宿主和第三方的原生模块） |
| 窗口和页面 | `UIWindowScene`、`UIScreen`、`UIWindow`、`UIViewController`、`UINavigationController`、`UITabBarController`、导航条上的东西 |
| 视图和布局 | `UIView`、Auto Layout、`UIStackView`、`UIScrollView`、外观特征 |
| 文字、图片、颜色 | `UILabel`、`UIFont`、`UIImage` / `UIImageView`（含 GIF / APNG / WebP 动图）、颜色、富文本（`NSAttributedString` 一组） |
| 图层和动画 | `CALayer` 一组、`UIBezierPath`、Core Animation、`CATransaction`、`CADisplayLink` |
| 交互 | `UIControl`、`UIButton`、`UITextField` 和键盘、手势识别器 |
| 网络 | `fetch` / `Request` / `Response`（含流式读取 `response.body`）、`URL` / `URLSearchParams` / `Headers`、`Blob`、`AbortController`、`WebSocket` |
| 数据 | 本地存储 `application.storage`、文件读写 `application.fileSystem`（含只读的 `assets`：项目的 `assets/` 在包里的位置）、`NSBundle` |
| 网页 | `WebView`、`webContents`、`session` |
| 按地区格式化 | `Intl.NumberFormat`、`Intl.DateTimeFormat`，以及数字和日期的 `toLocale*String`（排序还没做）；`NSLocale`：用户的首选语言和地区 |
| 小而无代价的 | `crypto`（随机数、UUID）、`UIDevice`、剪贴板、触感反馈、`BarcodeDetector`（从一张图里认码） |

**单独的包**（钥匙串是第一个，也是「能力包长什么样」的样板；中间六个是 2026-11-16 并行做的）：

| 包 | 里面有什么 | 拆它省下什么 | 状态 |
| --- | --- | --- | --- |
| `@nacrejs/keychain` | `application.keychain` | 没有硬收益——`Security.framework` 被 `crypto` 占着，它也不带任何声明。选它是因为它最小最干净，拿来把机制走通 | 已拆 |
| `@nacrejs/local-authentication` | `LAContext`：面容 ID / 触控 ID 认证 | 用户要写 `NSFaceIDUsageDescription` | 已做 |
| `@nacrejs/app-tracking-transparency` | `ATTrackingManager`、`ASIdentifierManager`：跟踪授权和广告标识 | 用户要写 `NSUserTrackingUsageDescription` | 已做 |
| `@nacrejs/photos` | `PHPickerViewController` 选图、`PHPhotoLibrary` 存图 | 用户要写 `NSPhotoLibraryAddUsageDescription`（选图不要权限） | 已做 |
| `@nacrejs/camera` | `UIImagePickerController`，只做拍照 | 用户要写 `NSCameraUsageDescription` | 已做 |
| `@nacrejs/core-location` | `CLLocationManager`、`CLLocation`：使用期间的定位 | 用户要写 `NSLocationWhenInUseUsageDescription` | 已做 |
| `@nacrejs/contacts` | `CNContactPickerViewController`、`CNContact`：让用户选联系人 | 不要权限文案（只用系统的选择器）。做成包是因为它带进来两个系统框架，而且万一上传时被要求补文案，改的是包的清单 | 已做 |
| `@nacrejs/user-notifications` | `UNUserNotificationCenter` 一组：本地通知、授权、通知到了和被点了两个事件、角标 | 不要权限文案也不要 entitlement。做成包是因为它一加载就把自己装成通知中心的委托，不发通知的 App 不该带着。远程推送的注册在 `@nacrejs/push` | 已做 |
| `@nacrejs/push` | `application.remoteNotifications`：注册远程推送、设备令牌、静默推送（`push` 事件） | 用户的工程要带 `aps-environment`，签名要用开着推送能力的描述文件 | 已做 |
| `@nacrejs/av-capture` | AVFoundation 的拍摄那一组：会话、摄像头、取景图层、元数据输出（实时扫码）。不接系统的扫码页面（`DataScannerViewController`），扫描界面由 JS 自己画 | 用户要写 `NSCameraUsageDescription` | 已做 |

WebView 留在核心：它不需要用户声明任何东西，拆了的净收益约等于零，见[能力包](internals/capabilities.md#拆不拆量过的代价)。

另一条边界：**iOS SDK 里有的归我们**（最终靠 bindgen 兜住），**不在 iOS SDK 里的走宿主扩展点**（推送、风控、支付、活体检测这些第三方 SDK）。社区拦不住别人用扩展点再包一份系统框架，但官方立场要明确，否则 `UIView` 会有三个版本。

### 能力包的规矩

- **声明的单位是包。** 装了 `@nacrejs/local-authentication` 就是声明要用它，不另设能力清单，也不扫 JS 来推断。
- **装了才有。** 项目的直接依赖里有哪个能力包，生成的工程就嵌哪个 framework；没装的，工程里没有、运行时没有、类型里也没有。传递依赖不算。
- **包提要求，项目写内容。** 包在自己的清单里声明要哪些 Info.plist 键和 entitlement；内容由项目写在 `nacre.config.json` 里，没写就在生成时报错。用法见[配置 App](guides/project-config.md)。
- **iOS SDK 里有的归我们，不在 SDK 里的走原生模块。**

能力包怎么搭、怎么登记、给能力包用的头，见[能力包](internals/capabilities.md)；照着接一组类见[接入一组类](internals/adding-classes.md)。


## 4. Android（2026-11-21 定的方向）

**做的是 App 的 JS 运行时，不是 iOS 和 Android 的统一框架。** 两端共用的只有引擎和 Web 标准那批（`core/`）；原生类、`application` 这一层、能力包、包名都按 Android 自己的事实定，不和 iOS 对齐。

| 方面 | 选型 |
| --- | --- |
| UI 框架 | Android View 体系；不用 Jetpack Compose，需要时用 `ComposeView` 嵌入（对应 iOS 不用 SwiftUI） |
| 控件 | 平台 View，加上 AndroidX 里提供**能力**的两个：RecyclerView（大列表只建看得见的几行、滚动时复用）、ConstraintLayout（约束排版）。**不接现成的部件**，和 iOS 的「组件不接」一样：`Button`（就是 `TextView` 加主题样式）、Material Components、ViewPager2 都不接，样式和部件由 App 自己用底层能力做（2026-11-23 定） |
| 页面 | 单 Activity 做启动壳，向 JS 暴露生命周期、窗口、窗口边衬、返回回调；页面栈由 JS 用 View 做；不用 Fragment；配置变化不重建 Activity，改成给 JS 发事件。壳继承 AndroidX 的 `ComponentActivity`（权限和选图的结果回调、Android 11、12 上的返回键回调只有 AndroidX 版；它不带样式，`AppCompatActivity` 才带），主题用 AOSP 自带的 `Theme.Material.Light.NoActionBar`（各家手机上一样，不带厂商的样式）。`Activity` 只能由系统建，JS 里不能 `new` |
| 继承 | 和 iOS 一样：**原生类一律 final，JS 不实现 Java 的类**。只能靠覆写拿到的能力照「覆写点」那条规矩：运行时为每一处写好固定的原生实现，系统来通知的转成事件，系统当场要答案的走当场派发、可写字段的事件，系统要你提供实现的（`onDraw`、列表的内容）换成能力（绘制指令、属性）。这样原生永远不持有 JS 的对象，没有跨两个垃圾回收器的环（2026-11-23 定，取代原来「抽象类由中转子类承接、可重写的方法交给 JS」的打算） |
| 事件 | JS 里统一成 `EventTarget` 的发布订阅，原生那边有人订了才装回调。事件只来自两处：**用户做了什么**、**系统通知发生了什么**。一次性的结果用 Promise |
| 最低版本 | Android 11（API 30）。新的窗口边衬体系从这一版齐全；31 起才有的模糊、系统启动屏、屏幕圆角，在 30 上如实告诉 JS 没有 |
| 架构 | 只支持 arm64-v8a |
| 线程 | JS 跑在主线程（主 Looper），空闲任务挂 `MessageQueue.IdleHandler` |
| 引擎 | 同一版本的 V8，`core/engine/` 两端共用。预编译库用 NativeScript 和 iOS 同一次构建（`v8-14.9.207.39-7`）的 arm64 包，`android/scripts/fetch-v8.sh` 下载并校验。这份开着 JIT 和指针压缩，**必须用 NDK r29 编**。用不用 JIT 没定：这份让 `libnacre.so` 有 45 MB（压缩后约 12 MB），先量出不开 JIT 的精简构建在 Android 上多大、多快再定（NativeScript 没发布这种，可能要自己编） |
| 桥 | C++ 经 JNI 的分发表；bindgen 改读 `android.jar` |
| 语言 | Kotlin 写启动壳，C++ 写引擎和 JNI，Java 或 Kotlin 写中转类 |
| 外观 | **样式全部由 JS 定**，运行时不预设任何外观。要接的能力当成一组：Drawable 一族（`GradientDrawable` 的背景、渐变、圆角、边框，`RippleDrawable` 的按下效果）、`Outline` 和圆角裁切、按高度投的阴影、`RenderEffect`（模糊，Android 12 起，11 上如实告诉 JS 没有）、`Typeface`。**任意阴影**（颜色、模糊、偏移都能调）和**自定义绘制**系统没有现成的，照「继承」那一行的做法给一套绘制指令能力让 JS 调（底下用 `RenderNode` / `Canvas`），不让 JS 覆写 `onDraw`，具体形状单独讨论（2026-11-23 定） |
| 原生类的写法 | 用简单类名挂在全局（`TextView`、`LinearLayout`），不同包里同名的类怎么办第 4 步统计完再定；Java 的 getter / setter 合成一个属性（`getText()` / `setText()` → `text`），和 Kotlin 一样；入口是上层对象 `application`，现在只有 `application.activity`。Java 抛的异常先转成 JS 的 `Error`，`name` 是异常的简单类名，最终和第 4 步的规矩一起定（2026-11-23 定，第 3 步） |
| 网络 | `fetch` 和 `WebSocket` 都用 OkHttp，和 React Native、Expo 一样；系统里没有 WebSocket 客户端（2026-11-23 定） |
| 工具链 | Gradle（用仓库里的 wrapper）、Android Gradle 插件 9.5.2（自带 Kotlin 编译）、compileSdk 37、NDK 29.0.14206865、CMake 4.1.2。版本都写死在 `android/` 的构建文件里 |
| 单位 | 像素，照 Android 的 API 原样 |
| 能力包 | 另起包，按 Android 的 API 起名，一律带前缀（`@nacrejs/android-*`）；iOS 已发布的包不改名 |
| 类型 | Android 的类型走单独的入口 `@nacrejs/types/android`，不进现在的默认入口 |
| 验收 | 在连着的 Android 真机上跑：`android/scripts/run-device.sh` 把 `acceptance-android/`（单独一个项目）打包进开发用的壳，装、打开，按 logcat 判定，看退出码。判定和 iOS 共用 `acceptance/scripts/lib/report.mjs`。Web 标准那批步骤两边各放一份 |
| URL 解析 | ada（网页标准的 URL 解析器，Node.js 用的就是它），胶水在 `core/url/`，`android/scripts/fetch-ada.sh` 下载。iOS 还是 `NSURLComponents`，iOS 要不要也换以后单独讨论（2026-11-23 定） |
| 不影响 iOS | Android 的改动不碰 iOS 的运行时：iOS 的工程编 `core/engine/` 下的全部文件、执行 `core/builtin/parts/` 下的全部脚本，所以 Android 先用、iOS 还没用的东西不放这两个目录。`core/builtin/parts/` 里 Android 用哪几个，列在 `android/runtime/build.gradle.kts`（2026-11-23 定） |

**要新定规矩的几件事**（和版本无关，第 4 步讨论）：重载的方法怎么映射成 JS；整数常量怎么变成字符串枚举；覆写点在 Android 上逐类怎么落（哪些转事件、哪些换成能力）；只能靠样式在构造时给的外观怎么传。所有权的做法第 3 步已经定了：Java 对象发编号交给引擎，包装活着就持有，JS 侧做所有权镜像，见[Android 的运行时](internals/android.md)；JS 不实现 Java 的类，所以没有跨两个垃圾回收器的环。

**顺序**：最小壳、`core/builtin/` 里不依赖桥的 6 个、第一条竖切（包装、所有权、事件）已经有了（`android/`：运行时 `runtime/`、开发用的壳 `shell/`）→ **安全区域**（窗口边衬交给 JS：`targetSdk` 37 强制内容铺满全屏，不交出去任何界面顶上都被状态栏盖着）→ 接上 `core/builtin/` 里依赖桥的 4 个（`fetch` / `Blob`、`WebSocket`、两个 `Intl`）→ bindgen 的提取部分做统计、定上面五条规矩 → bindgen 的生成部分、按组接类。CLI 生成 `android/`、`@nacrejs/android`、能力包排在最后。每一步照 SOP 单独讨论。

## 5. 目录约定

```
nacre/
├─ README.md
├─ docs/              项目说明、API 文档、实现原理
├─ core/              两端共用：engine/（引擎，纯 C++）和 builtin/parts/（Web 标准那批内置脚本）
├─ ios/               iOS 运行时源码（= Nacre.xcframework 的源）
├─ packages/          发到 npm 的交付物
│  ├─ types/          TypeScript 类型定义（@nacrejs/types）
│  ├─ ios/            @nacrejs/ios：模板 + 清单 + xcframework
│  ├─ cli/            @nacrejs/cli：命令 nacre
│  ├─ keychain/       @nacrejs/keychain：一个能力包（清单 + 类型 + xcframework）；其余能力包同样各占一个目录
│  └─ example-module/ 示例原生模块：用 Swift 写的样板，也是验收用的模块
├─ acceptance/        验收套件（一个 Nacre 项目）
├─ examples/hello/    最小示例（一个 Nacre 项目）
├─ scripts/           发布 npm 包用的脚本：改版本、核对、打包、发布，和发布前的演练
├─ android/           Android 运行时源码：runtime/（运行时）、shell/（开发用的壳）、scripts/
│                     （以后还有 packages/android/）
└─ acceptance-android/ Android 的验收套件（现在是 Web 标准那批）
```

`acceptance/` 和 `examples/hello/` 都是**一个 Nacre 项目**，形状一样，它们的 `ios/` 都由 CLI 生成、不进版本库：

```
<project>/
├─ package.json
├─ nacre.config.json      App 的名字和包名
├─ icon.png / icon.icon   App 图标（可以不放）
├─ launch.png             启动屏正中的图（可以不放）
├─ src/main.js            JS 入口
├─ assets/                图片等资源
└─ ios/                   ← 生成的，随时可以删掉重建
```

这棵树按**交付不交付**分（2026-11-13 定，理由见 [3.7 交付物](#37-交付物)）：

| | 交付 | 说明 |
| --- | --- | --- |
| `core/`、`ios/`、`packages/` | **是** | 运行时（`core/` 编进每个平台的运行时）、类型、模板和清单 |
| `acceptance/`、`docs/internals/`、`docs/project.md` | 否 | 我们自己的 |

- **`ios/`、`android/` 永远表示运行时源码，必须提交。** `ios/` 里**只有运行时**——验收 App 的壳和资源在 `acceptance/ios/`。
- **`core/` 是两端共用的运行时源码，必须提交。** 里面的代码不认识任何平台：不引平台的头，内置脚本里不出现平台的类名，平台相关的东西从平台那一侧交进来。它要的原生入口列在 `core/builtin/README.md`。改它两个平台都要跑完整的验收（2026-11-21 拆出来，见[拆出 core](internals/core.md)）。
- **`packages/` 下的是对外交付物，不是源码树的一部分**：使用者是拿 Nacre 写 App 的人，不是改运行时的人。必须提交。
- 以后工具生成的原生工程等产物，放在 `build/` 或 `.nacre/` 下，**不能命名为 `ios/`**，避免和源码混淆。一个例外是 `acceptance/ios/` 和 `examples/*/ios/`：它们是「一个 Nacre 项目里由 CLI 生成的原生工程」，按 CLI 约定的项目结构就叫这个名字，不提交。
- `.gitignore` 只忽略生成的和下载的内容，**不能忽略任何源码目录**。根目录的 `.gitignore` 里不能出现平台目录名。

### 文档怎么分

四处，判据是**面向谁**：

| 目录 | 写什么 | 面向谁 |
| --- | --- | --- |
| `docs/api/` | 怎么用、参数、默认值、**效果**、会踩的坑、**ObjC ↔ JS 对照表** | 用 Nacre 写 App 的人 |
| `docs/guides/` | 跨多个类才能完成的任务，按步骤写 | 用 Nacre 写 App 的人 |
| `docs/internals/` | **桥怎么搭的、为什么这么选、实测数据、被否掉的方案** | 改运行时的人 |
| `docs/project.md` | 项目定义、已定的规矩和选型、目录约定、SOP、还要做的 | 这个项目本身 |

举三个例子：

- 「`shadowOpacity` 默认 0，不设就看不见」→ **api**。不知道这条就不会用
- 「`CGColorRef` 转 `UIColor` 为什么会丢动态色」→ **internals**。不知道也会用
- 「颜色的上层写法定成字符串」→ **project.md**。这是一个决策，不是实现

**对外的文档站只发布 `api/` 和 `guides/`**（2026-11-19 定）。站点默认英文、中文在 `/zh/` 下，可以切换；中文 `docs/api`、`docs/guides` 是原文，英文版在 `docs/en/` 下，改一页就两种语言一起改。`internals/`、本文件和写法规范留在仓库里，不上站；API 文档和指南里不写实现思路、不链到它们，也不写还没有的能力。还没接的能力记在 [`internals/api-gaps.md`](internals/api-gaps.md)。

**每新增或改动一块能力，`api/` 和 `internals/` 两份一起写。** 只写 api 等于把原理丢了，下次改的人要重新推一遍；只写 internals 等于没交付。这和「改 API 同一步里更新 `types/`」是同一条纪律。

API 文档的写法有单独的规范：[文档写法](writing-guide.md)（2026-11-11 定）。要点：

- **读者**是做过前端或图形开发、但没碰过 iOS 的人。iOS 特有的词都要解释
- **结构照 MDN**：类页只列成员和例子，一个属性、方法或事件一页，教步骤的内容写成指南
- **每段代码后面都有「效果」**；每个数值写单位；可读和可写分开写
- 没在模拟器验证过的效果标「未验证」

对照表是**承诺的一部分**：底层说「和 Apple 文档一一对上」，那就要让人能照着 Apple 文档查到 JS 怎么写。

API 文档的样板是类页 [`api/ui-button.md`](api/ui-button.md)、它的成员页 `api/ui-button/` 和指南 [`guides/buttons.md`](guides/buttons.md)；实现原理的样板是 [`internals/ca-layer.md`](internals/ca-layer.md)。

### 文件拆分规则

一句话：**按能力域分文件，一个文件一个域；跨域共用的只放声明，不互相引实现。**

| | |
| --- | --- |
| **什么时候拆** | 单个文件超过约 800 行，或者一个文件里出现了两个互不相干的能力域（比如 URL 解析和视图属性挤在一起）。以先到的那个为准 |
| **按什么分** | 按**能力域**，不按技术分层。「颜色 / 字体 / 图片」是一个域（都是不可变的值类对象），「Auto Layout」是一个域。分发表**先**按通道分（`Properties` / `Methods`），**到了 800 行再按能力域往下分**，分发器只留顺序表——见[桥](internals/bridge.md#属性分发按能力域拆开) |
| **共享的东西往哪放** | 一个内部头文件，**只放声明和跨域要用的类型**。实现文件之间不互相 `#import` |
| **新文件怎么进工程** | 不用管。`project.yml` 收的是 `path: Runtime` 整个目录 |
| **拆完怎么验** | `check-api.sh` 的三边核对数字必须和拆之前一字不差，加上模拟器的全部断言 |

落到目录上：

```
ios/Runtime/
├─ NacreRuntime.h / .mm   启动壳、host 接线、事件的派发和订阅、定时器唤醒
├─ NacreRuntimeInternal.h 运行时自己几个 .mm 之间共用的声明
├─ NacreEventTrampolines.mm 事件的中转对象：系统的回调先到它们，再转给运行时派发
├─ NacreFetchService.h / .mm 网络请求在原生这一侧的全部状态和逻辑
├─ Builtin/parts/         iOS 自己的内置脚本，一个能力域一个 part。和 core/builtin/parts/
│                         合在一起按文件名顺序编译执行，每个是一个函数表达式
├─ NacreExtension.h       给能力包用的接口（private 头），从内部头里划出来的最小一组
├─ Bridge/                能力暴露，一个能力域一个 .mm
│  ├─ NacreBridge.h       内部头：声明、枚举表的两个宏、方法参数包
│  ├─ NacreConvert.mm     日志、JSON、结构体互转、环境快照
│  ├─ NacreProperties.mm  属性分发的顺序表，只有分发器
│  ├─ NacreProps*.mm      属性实现，一个能力域一个文件（Scene / Control /
│  │                      Layout / Layer / Path / Animation / Scroll / View /
│  │                      Resource）
│  ├─ NacreEnums.mm       共享助手 + 文字、图片、字体
│  ├─ NacreEnums*.mm      枚举实现，域名和 NacreProps* 对齐（Layout /
│  │                      Control / Input / Scroll / Scene / Layer / Path /
│  │                      Animation）
│  ├─ NacreMethods.mm     方法分发，还没按域拆完的那些分支
│  ├─ NacreMethodsNav.mm  导航域在**所有通道**上的分支
│  ├─ NacreMethodsLayer.mm 图层域的层级操作
│  ├─ NacreMethodsPath.mm 路径域：画线、拼接、变换
│  ├─ NacreMethodsAnimation.mm 动画域：挂动画、曲线、CATransaction
│  ├─ NacreFactories.mm   造对象：类方法和构造
│  ├─ NacreAnimatedImage.mm 动图：读帧、挂帧动画、后台解码
│  ├─ NacreIntl.mm        Intl 的桥：几个类级的调用，转给下面那个 Swift 文件
│  ├─ NacreIntlNumber.swift 按地区格式化数字（Swift：系统那套接口只有它能调）
│  ├─ NacreIntlDate.mm    日期：格式串、格式化、分段、一段时间、时区
│  ├─ NacreIntlDate.swift 日期里小时写一位还是两位（同上，只有 Swift 问得到）
│  ├─ NacreStorage.mm     UserDefaults
│  ├─ NacreFileSystem.mm  文件读写
│  ├─ NacreKeychain.mm    Keychain
│  └─ NacreURL.mm         URL 解析
（引擎在仓库根的 core/engine/，纯 C++，只依赖 V8，两端共用）

types/
├─ index.d.ts             入口
├─ nacre.d.ts             运行时自己的 API（跨平台）
├─ ios.d.ts               桶，只有 /// <reference>
└─ ios/                   一个能力域一个 .d.ts
```

另外三条：

- **接一组类只加新文件。** 一组类是一个域，一个域一套新文件（原生、内置脚本的 part、类型、验收步骤、文档），入口各加一行；共享文件不碰。这样几个对话可以按组并行，各自只编译，合并后统一验收。见[接入一组类](internals/adding-classes.md)。
- **新写分发链时，每个分支返回「我认不认领」**，不依赖在同一个函数里往下掉。
- **`ios/` 里的 target 就是交付面。** `Nacre` 是运行时的 framework，公开面是 `Runtime/Nacre.h` 这个 umbrella header；每个能力包是 `Capabilities/` 下的一个目录、一个 framework target。验收 App 的壳和资源在 `acceptance/ios/`，由 CLI 生成。


## 6. 开发流程 SOP

**原则：先讨论，明确清楚，再确定实现。没有确认就不写代码。实现是测试驱动的：先写测试，再写实现。**

每一步按下面的顺序进行：

1. **讨论**：说明这一步要解决什么问题，列出可选方案和各自的取舍。
2. **明确**：确定这一步做什么、不做什么，以及验收标准（运行后应该看到什么）。只做这一步，不夹带后续功能。**API 要明确到每一个成员**：有哪些、参数和返回值是什么、哪些情况报错、哪些明确不支持——下一步的测试是照着它写的，这里含糊，测试就写不出来。
3. **确认**：用户明确同意方案和范围后，才进入实现。

   **一个例外（2026-11-15 定）：照已有规矩接入原生类时，API 直接定，事后 review。** 方法名怎么映射、枚举、结构体、事件、参数转换这些规矩已经定过很多轮，接一个新类只是照着套，不再逐个等确认。范围只到这里：新机制、改架构、改已定的规矩、任何规矩里没有答案的设计，仍然先讨论、等确认。测试驱动、检查、Debug 和 Release 都验、提交前征得同意，都不变。
4. **实现**（测试驱动，2026-11-15 定）：分两段，顺序不能反。

   1. **先写测试。** 按第 2 步明确下来的 API，把**全部成员**的验收用例写出来：正常用法、出错情况、明确不支持的也要有一条（断言它按约定的方式拒绝）。写完先跑一遍，**看到它们失败**——一条从来没失败过的断言，证明不了它盯的是对的地方。
   2. **再写实现**，写到这些用例通过为止。写入前先读取仓库中的现有文件，不覆盖用户的改动。**新增或改动任何 JS 能碰到的 API，同一步里更新 `types/`**——类型定义和实现是同一件事的两个面，分两步做必然漂。

   用例是第 2 步那份 API 的另一种写法，所以**不为了让它通过去改它**。用例和实现对不上时，先分清是哪一边错了，见第 5 步。
5. **检查**：能检查的先检查，比如 C++ 对照 V8 头文件做语法检查、脚本做语法检查。

   **检查中发现问题，回头重新 review 设计和测试用例**，不在实现里绕过去。这里的「问题」指的是用例和实现对不上、而原因不是一个普通的实现 bug：实测和明确时的假设不符、某个成员写不出合理的用例、用例本身写错了、做到一半发现 API 的形状不对。这时停下来，把设计和用例一起拿出来重看，和用户确认之后再继续。

   另外两条固定要跑：

   ```bash
   bash ios/scripts/check-api.sh      # 三边符号核对
   ```

   ```bash
   cd acceptance && npm run check     # 类型检查（tsc 版本钉在 acceptance/package.json）
   ```

   动了 CLI（`packages/cli/`）时再加一条：

   ```bash
   cd packages/cli && npm test        # CLI 的用例
   ```

   动了 bindgen（`ios/scripts/bindgen/`）时再加一条：

   ```bash
   node --test ios/scripts/bindgen/test/*.test.mjs   # 提取、规则、对照的用例
   ```

   动了发布脚本（`scripts/`）时再加一条：

   ```bash
   node --test scripts/test/*.test.mjs   # 版本的换算、发布的顺序、一个包齐不齐
   ```

   动了验收的 runner（`acceptance/scripts/`）时再加一条：

   ```bash
   cd acceptance && npm test          # runner 判结果那部分的用例
   ```

   没有实际运行过的内容，要明确标注"未验证"。
6. **验证**：在连着的真机上跑验收（2026-11-21 起），**通过不通过看退出码**。**凡是动了原生代码，Debug 和 Release 各跑一遍**：

   ```bash
   cd acceptance && npm run verify -- --device                 # Debug
   ```

   ```bash
   cd acceptance && npm run verify -- --device --release       # Release —— 交付出去的就是这个配置
   ```

   手机用线连着、保持解锁。App 的包名是 `com.test.test`，用本机的开发证书和描述文件签，不用在 Apple 的网站上登记，见[验收怎么判通过](internals/acceptance.md#真机)。

   退出码 0 是通过。没通过时原因打在输出的最后：有断言失败、步骤中途抛了、App 提前退出、期限内没跑完。真机上不比对基线。

   断言名单的基线（每一遍该出现哪些断言，`acceptance/baseline/simulator.txt`）是在模拟器上记的，2026-11-21 起不再维护：验收只用真机，真机上不比对它。偶尔要在模拟器上跑时带 `--no-baseline`。

   只改了某一个步骤、想先快点看结果时，只跑那几步（半分钟左右）。它不比对基线，**不能代替完整的一遍**：

   ```bash
   cd acceptance && npm run verify -- --device --steps=coreLocation,localAuthentication
   ```

   只想看着日志跑、不要判定时，用 `bash ios/scripts/run-device.sh`（模拟器是 `run-sim.sh`；加 `--release` 是 Release）。

   动了 `android/` 或 `core/` 时，在连着的 Android 真机上 Debug 和 Release 也各跑一遍，同样看退出码：

   ```bash
   bash android/scripts/run-device.sh && bash android/scripts/run-device.sh --release   # 要先设 ANDROID_HOME
   ```

   有一类问题只在开了优化之后出现（ARC 更早释放临时对象），而交付的 `Nacre.xcframework` 是 Release。只跑 Debug 等于没验交付物，见[包装](internals/wrapper.md#交接的那一段没人持有只在-release-下崩的悬空指针)。
7. **提交**：验收通过后由用户提交，一步一个 commit。
8. **记录**：做完的事从第 7 节「还要做的」里删掉，不留记录。新的规矩和选型写进本文件前几节；为什么这么做、实测数据、踩过的坑写进 `docs/internals/` 对应的那一页；新冒出来的待办、客户建议、欠的验证，加进第 7 节。

实现过程中如果发现需要改变已确认的方案，**先停下来回到第 1 步讨论**，不能自行调整。改方案的时候测试用例跟着一起改，两样一起确认。

Commit message 格式：

```
<范围>: <中文描述>
```

例如：`ios: 搭建 iOS 工程，启动 V8 引擎并执行 main.js`。范围可以是 `ios`、`docs`、`repo` 等。

## 7. 还要做的

做完一条删一条，不留记录。带「分析」链接的条目，分析在[还没做的设计和没解的问题](internals/pending.md)；这里每条只写一行。

### 要建设的能力

**先做：** Android：安全区域，把窗口边衬交给 JS（第 4 节顺序的下一步）。

**留着，按需要做：**

| 域 | 什么 |
| --- | --- |
| 滚动 | 双指捏合缩放：`zoomScale` 一组属性已经有了，还差系统当场问的「缩放哪个子视图」和缩放的事件 |
| 绘图和动画 | `UIViewPropertyAnimator`（跟着手指走、可以打断和反向的动画） |
| 网络和数据 | `crypto.subtle`；排最后的：`Blob.slice`、剪贴板的图片和网址和多条内容、`rejectionhandled` 事件 |
| 网页 | 让本地网页用上模块脚本和 `fetch` 的自定义协议 |
| 无障碍 | 读屏的自定义操作、「读屏开没开」的状态和变化、让读屏念一句话 |
| 系统能力（做成包） | 通用链接、Apple 登录：都能写，卡在验证上，要显式包名的描述文件，通用链接还要真实域名；应用内购买（先不做） |

### 发布之后接着做的

现在没有。

### 客户建议

现在没有。

### 已知的问题

现在没有。新发现的写在这里，分析写进[还没做的设计和没解的问题](internals/pending.md)。

### 欠的验证

| 什么 | 欠在哪 |
| --- | --- |
| 真机上没验到的 | 富文本双线和虚线的样子；流式响应和 `Request` 的 `signal` 取消（手机连不到 Mac 上的测试服务）；通用链接；原生模块随包带第三方 framework；真的从服务器发到手机上的远程推送（2026-11-21 试过：真令牌拿到了，推送 Apple 收下了，但送达记录一直是「设备不在线」，换热点、重启手机都一样，手机没连上测试环境的推送服务器；能看见的和静默的都没送到过），静默推送在后台唤醒 App；面容 ID 被锁定、设备不支持、没设密码几种情况；定位里海拔有效的那一支；相机的大部分行为 |
| 要在屏幕上点的 | 多行输入框里点链接（`linkclick`）；定位、通知、跟踪授权的申请；发通知、收到、点击；选图、存图、拍照、选联系人；弹窗的按钮和分享完成；搜索框的四个按钮事件；列表的选中；左滑返回中途取消、把卡片拖走 |
| 要真实键盘的 | 两种输入框的 `beforeinput`，单行的 `beforeclear`、`beforereturn`；输入时的 `selectionchange`；输入法组字期间的选区 |
| 要人看的 | 扫码的取景画面在图层里的样子、手电筒真的亮、平滑变焦；`shadowPath` 画出来的阴影；开着旁白时各属性念出来的样子；富文本的五行；动图是不是在动；标签栏、毛玻璃、手势几组在屏幕上的样子 |
| 触发不了的 | 扫码会话被打断（`interrupt` / `interruptend`，要来电或者别的 App 抢摄像头）、`runtimeerror` |
| 要切到后台的 | 后台任务：切到后台之后继续跑、快到时间时 `signal` 中止、系统一开始就不给时间的情况；`backgroundTimeRemaining` 在后台的读数 |
| 图标和启动屏 | 2 倍屏的机型；Icon Composer 和 Xcode 实际存出来的 `.icon`、storyboard（只验了手写的）；桌面切到深色、着色样式时图标的样子；启动屏的图多大会整屏变黑，只在一台模拟器上量过 |
| 取色控件和补上的成员 | `system-controls` 和 `view-additions` 两个域（2026-11-18 用 bindgen 出的初稿）：读写往返和一批实际用法验过，但补上去的 23 个方法里在模拟器上调过的只有 `setZoomScale` 和 `zoomToRect`；设了之后屏幕上的效果一个都没看；`UIColorWell` 点开取色面板看过了，在面板里选一个颜色之后 `selectedColor` 变没变、`change` 来没来没验 |
| iOS 26 | 没有能用的设备，验收只跑 iOS 27.2 的模拟器和真机；运行时的核心在 CI 上用 Xcode 26.0.1 编过一次；Xcode 26.0 到 26.5 能不能用 26.6 打出来的预编译包，没验过（客户用 26.5 跑通过 beta.1，那份是 Xcode 27 打的）。完整编译时没有「用了更新的接口却没包保护」的警告，这是旁证，不是证明。[分析](internals/pending.md#ios-26-暂时不跑) |

### 以后有空再议

现在的做法能用、也有依据，没有人被它挡着。[分析](internals/pending.md#以后有空再议)。

- 动图的内存预算（现在是解码后 64 MB），要不要做边播边解。
- `Intl` 剩下的成员（排序、复数、相对时间、列表），以及 V8 要不要带 ICU。现在定的是不做。
- 定时器要不要有最小间隔。现在不设。
