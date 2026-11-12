# Nacre 项目说明

本文件记录 Nacre 的项目定义、已确定的决策、目录约定、开发流程和进度。新的决策确定后更新这里。
AI 协作规则见 `.claude/CLAUDE.md`，它会引入本文件。

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
| 设计目标 | **能力完整**，不丢任何 iOS 能力 | 好用、一致、面向能力 |
| 服务谁 | iOS 开发者的亲切感 | JS 开发者的轻松感 |
| 变化来源 | 跟着 iOS SDK 走 | 我们自己的版本承诺 |

**每遇到一个新能力，第一个问题是「它属于哪层」。** 上层没覆盖的，底层一定要能补上——这是「原生 API 完整暴露」这条承诺的含义。

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

三处**不照搬**：

- **不可空的字符串，`null` 和 `undefined` 给空串。** Web 的普通字符串会得到 `'null'` / `'undefined'` 这两个字面量（`el.setAttribute('x', null)`），那是公认的坑。我们学的是 `input.value = null` 得到 `''` 的那一类
- **整数不学老 API。** Web 的老接口把 `NaN` 当 0、还按 32 位回绕（`el.tabIndex = 'abc'` 得到 0），那是历史包袱，Web 自己的新接口也改成抛了。`insertSubview(v, { atIndex: NaN })` 插到第 0 位不是任何人想要的
- **枚举作属性也抛。** Web 是静默忽略（`xhr.responseType = 'foo'` 什么都不发生），我们早就定了一律抛，理由见[枚举](internals/enums.md#为什么不学-css)

取值范围是另一回事：类型对、但超出范围（负的次数、强度大于 1），由各 API 自己拒，不归这条管。

为什么转换必须在 JS 一侧、这条规则是怎么来的，见[参数转换](internals/conversion.md)。

### 怎么用这一节

这是给 SOP 第 1 步（讨论）用的判据。**往后每一步新增能力，都要对照本节说明设计理由**：它属于哪层、职责边界在哪、异步形态是什么、读写和变化通知是否完备、有没有照搬了不该照搬的东西。

## 3. iOS 技术选型（已确定）

| 方面 | 选型 |
| --- | --- |
| 系统与设备 | iOS 26+，只支持 iPhone，只支持 arm64（真机和 Apple Silicon 模拟器），Xcode 26+。**用到 iOS 27 才有的符号时，`#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 270000` 和 `@available` 两层都要写**——前者管编译用的 SDK 认不认识，后者管跑的机器有没有。只写后者在 Xcode 26 上编译不过 |
| JS 引擎 | V8 14.9.207.39，使用 [NativeScript/v8-buildscripts](https://github.com/NativeScript/v8-buildscripts) 发布的预编译静态库；lite mode 构建，即 jitless。**不要传 `--jitless`**（只读标志，设置会崩溃） |
| V8 获取方式 | `ios/scripts/fetch-v8.sh` 下载并校验 SHA256，放到 `ios/Vendor/v8`，不提交 |
| 线程模型 | **JS 运行在主线程**，和 UIKit 同线程，所以同步读布局和同步回调天然成立。主线程栈用链接器参数 `-Wl,-stack_size,0x800000` 设为 8MB（真机默认 1MB，不够 V8 用）。V8 的空闲任务在 run loop 即将等待时执行，做增量 GC。理由和代价见下 |
| UI 框架 | UIKit（不用 SwiftUI 作为渲染目标；需要 SwiftUI 组件时通过 `UIHostingController` 嵌入） |
| 排版 | iOS 原生方式：Auto Layout 约束、UIStackView、CALayer 属性。**不必须实现 DOM、CSS、flexbox**——运行时不提供它们，但也不挡着谁在 JS 层自己做一套 |
| 加载模型 | JS 在构建时打进 App Bundle，启动时从本地读取。不通过 HTTP 加载，没有 URL、origin、`location`、`history` |
| 模块化 | 运行时只负责执行 JS 文件，模块化和打包交给社区工具。**已验证**：`app/` 用 esbuild 打成 iife 产物，在运行时上跑通（`--format=iife` 是硬约束，ESM 产物里的 `import` 会直接抛）|
| 网络 | `NSURLSession` + delegate 两段式。**delegate 队列只投递，重活派到并发队列**——实测 20 个请求每个做 100ms 重活，直接做 2179ms，派出去 166ms。body 的 `arrayBuffer()` 走 `BackingStore` 零拷贝。详见 [fetch 文档](api/fetch.md) |
| URL 解析 | `NSURLComponents` + `standardizedURL`，规范化全在原生层做完。和 WHATWG 有五处已知差异，最要紧的是**没有 base**（我们没有 location）。详见 [URL 文档](api/url.md) |
| 任务调度 | 定时器用「一个最小堆 +（到期时间, 注册序号）排序 + 一个唤醒源」，参考 Chromium 的 MessagePump。一次唤醒最多占用主线程 8ms，超了让出去给渲染。详见 [定时器文档](api/timers.md) |
| 类型定义 | `types/` 下的 `@nacre/types`，手写，靠 `ios/scripts/check-api.sh` 核对三边一致。还没发布到 npm。类型检查和打包都是 `app/` 的 devDependency，版本钉在它的 `package.json` 里 |
| 工程管理 | XcodeGen：`ios/project.yml` 描述工程，`Nacre.xcodeproj` 由它生成，不提交 |
| 代码分层 | Swift：启动壳；ObjC++：运行时入口和 iOS 桥接；C++：引擎封装（`Runtime/Engine/` 只依赖 V8，不依赖 iOS） |
| 生命周期 | 只使用 Scene 生命周期 |
| 场景数量 | 运行时**不写死**，配置是什么就读到什么。两个事实都提供给 JS：**声明值**在 `application.info.UIApplicationSceneManifest.UIApplicationSupportsMultipleScenes`，**实际能力**在 `application.supportsMultipleScenes`（＝声明 AND 环境允许；iPhone 上多场景主要靠外接显示器，iPad 是常态）。原生层只提供事实，由 JS 自行判断。当前项目声明为 `false` |
| JS 执行模式 | **严格模式**。运行时给每个脚本（内置脚本和用户脚本）前置一行 `'use strict'`，行号用 `ScriptOrigin` 的 `line_offset = -1` 抵回来。理由见下 |
| JS 全局对象 | `globalThis` 保留不动；运行时注入 `Application` 类及其**唯一实例** `application`（单例）。**不叫 `window`**：`UIWindow` 在 iOS 里是真实存在的另一个东西，会撞。详见 [API 文档](api/application.md) |
| 原生 API 命名空间 | **不设命名空间**，按 ObjC 类名裸暴露在全局：`new UIWindow(...)`、`NSString`。理由见下 |
| 暂不考虑 | 插槽、CLI、开发模式、启动屏、iPad、Mac Catalyst，以后按需再做 |

### JS 为什么跑在主线程

最初定的是 JS 跑在独立线程（裸任务队列、不挂 run loop），理由是「JS 不卡 UI」。后来发现这条路和一个更早的决定冲突，必须改。

**冲突点**：本节定了「排版用 Auto Layout」。于是：

- 布局引擎在 UIKit 里，只在主线程
- JS 要**同步读布局**（`view.frame`、`sizeThatFits`）就必须在主线程
- **同步回调**同理——`cellForRowAtIndexPath:` 必须立刻返回一个 cell，没有声明式替代

对比三个成熟运行时，分水岭正在这里：

| | 布局引擎在哪 | JS 能不能独立线程 |
| --- | --- | --- |
| React Native（Fabric） | 自己的 Yoga，在 C++ 影子树里 | 能——布局结果在影子树，同线程可读 |
| Chrome | Blink 的布局，和 JS 同线程 | 不需要，本来就同线程 |
| **Nacre** | **Auto Layout，在 UIKit 里** | **不能** |

要在独立线程下同时支持「同步读布局」和「同步回调」，唯一出路是**运行时自带一套不依赖 UIKit 的布局引擎**（React Native 的 Yoga 就是这么做的）。那是另一个产品。所以 JS 上主线程。

> 「DOM、CSS、flexbox 不必须实现」这条**不会重开这个结论**。它说的是运行时不提供这些，谁想在 JS 层自己做一套都可以——但那一套最终还是要落到 `UIView.frame` 上，量文字还是得问 `sizeThatFits`，所以照样要主线程。

**代价，都要正视：**

- **jitless 让代价比浏览器大**。我们是 lite mode，只有 Ignition 解释器，没有 TurboFan。浏览器敢把 JS 放主线程是建立在 JIT 之上的。UI 编排代码问题不大，但 App 里一旦有重计算就会卡住界面
- **滚动会跟着卡**。浏览器有合成器线程兜底，JS 卡住滚动照样流畅；iOS 的 `UIScrollView` 滚动是主线程驱动的，没有这个兜底
- **栈**。真机 iOS 主线程栈默认 1MB，刚好卡在 V8 的默认假设上，零余量。用 `-Wl,-stack_size,0x800000` 写进 `LC_MAIN`，实测运行时生效（模拟器上从 8176 KB 变成 8192 KB）。代价是必须关掉 `ENABLE_DEBUG_DYLIB`，否则链接器报「`-stack_size` 只能用于主可执行文件」，Debug 增量构建也会变慢。**真机是否同样生效尚未验证**
- **启动**。V8 初始化实测 10 ms、context 15 ms，直接计入启动耗时

**连带的变化：**

- **空闲 GC 从可选变成必须**。平台初始化改成 `IdleTaskSupport::kEnabled`（默认 `kDisabled`，等于没有空闲 GC），用 `CFRunLoopObserver` 在 `kCFRunLoopBeforeWaiting` 时调 `RunIdleTasks`。Chrome 就是这样在帧间隙做增量 GC 的
- **原来「JS 线程不挂 run loop」的判据作废**。那条写的是「只有当某个能力必须在有 run loop 的线程上工作、且无法放到主线程时才改」，现在 JS 就在主线程上
- **自动释放池不再需要手动包**，主线程 run loop 每轮自带。`JSThread` 整个类已删除
- **启动顺序由队列保证，不需要同步执行**。三个启动任务（初始化 V8、内置脚本、`main.js`）都在 `didFinishLaunching` 里入队，而系统在它返回**之后**才连接场景——场景接入事件投递的任务必然排在 `main.js` 后面。主队列是 FIFO，不管队列中途有没有排空，JS 都来得及注册监听器。

  **不要为此把启动改成同步执行**：那会把约 70 ms 挪进启动阻塞，而且 `main.js` 是用户代码，慢起来有触发看门狗的风险。实测场景接入晚于 `main.js` 执行完约 111 ms，但这个时间差不是正确性的依据——队列的 FIFO 才是。
- **影子树降级为优化**。独立线程方案里它是必须的（否则跨线程开销爆炸、同步询问无解）；JS 上主线程后直接操作真实 `UIView` 即可。批量提交仍有价值（减少 layout 次数），但不再是正确性要求

### JS 为什么强制严格模式

非严格模式下这三件事是**静默失败**的，严格模式才抛：

| 写法 | 非严格 | 严格 |
| --- | --- | --- |
| 写只读属性（`view.superview = x`） | 什么都不发生 | `TypeError` |
| 写冻结对象的字段 | 什么都不发生 | `TypeError` |
| 未声明的赋值（`x = 1`） | 悄悄建一个全局变量 | `ReferenceError` |

这正是这个项目一路在拒绝的那类错——**写不进去又不报错**。而判据不是我们自己定的：ECMAScript 在 ES5 引入严格模式时，就是把这几件事从静默失败改成了抛，理由和我们的一样。

一个关键的实测事实：**抛不抛由「写的那一方」决定，不是「定义的那一方」。** `nacre.js` 里的 class 体天然是严格的，但用户在 `main.js` 里写 `label.intrinsicContentSize = x` 时，决定行为的是 `main.js` 的模式。所以只能在脚本这一层开。

V8 没有「强制严格」的编译选项（`v8::Script::Compile` 编译的是 classic script，默认非严格），ECMAScript 也只认 `'use strict'` 这一种开启方式，所以运行时在源码前面拼这一行。连带的好处是结构体不必再靠逐字段抛异常的取值器来防静默失败——不过那套实现更强（两种模式下都抛），留着。

### 事件模型：借什么、不借什么

`EventTarget` 和 `Event` **不是 ECMAScript 的一部分**（实测 `globalThis` 的 65 个内置里没有），要由运行时自己实现并注入全局——这是继 `console` 之后第二个注入的非标准全局。Node 22、Deno、Bun 都提供全局 `EventTarget`，所以它是跨运行时的通用基础设施——引入它不等于实现了 DOM。

判据见第 2 节原则 9：**从 iOS 的能力出发，问「这个能力怎么表达最自然」；W3C 的方案是重要的答案来源，但只是来源之一。** 下面是把这条原则落到事件模型上的结果。

| 借 | 不借 |
| --- | --- |
| `addEventListener` / `removeEventListener` / `dispatchEvent` 三个名字和基本语义 | `passive`（为浏览器滚动性能设计，我们没有可阻止的默认滚动） |
| `EventTarget` 作基类，统一 `application`、scene、将来的 view 的接口 | ~~`signal` / `AbortSignal`~~ ← **后来借了**：做网络请求时两个前提都变了，定时器有了，而 `NSURLSessionTask.cancel` 是实打实的能力 |
| `Event` 带 `type` 和 `target` | `composed` / `composedPath()`（shadow DOM 概念） |
| `once` 选项 | 捕获阶段（iOS 没有这个阶段） |
| 事件名全小写的惯例 | 重入保护、监听器列表快照的精确语义（浏览器用来防御病态代码） |

#### `cancelable` 按派发来源定

实测标准 `EventTarget`：`preventDefault()` 本身**不自动阻止任何事**，它只是置一个标志位，让 `dispatchEvent()` 返回 `false`；**默认动作由派发方自己实现**，派发方看返回值决定做不做。整个机制依赖 `dispatchEvent` 是**同步**的。

所以有效性不取决于是不是 DOM 元素，而取决于派发方能否同步拿到答案：

| 事件来源 | `cancelable` | 原因 |
| --- | --- | --- |
| JS 执行期间 Nacre 自己派发 | 可以 `true` | 同步，派发方立刻拿到返回值，和 Web 一样 |
| 原生通知派发 | **必须 `false`** | 运行时刻意延后一轮执行，避免在 UIKit 操作中途重入 JS，所以派发方早已返回；这类通知本来也没有可取消的默认行为 |
| 原生能推迟默认动作的场合 | 可以 `true` | 原生先不做、派发事件、等 JS 回调回主线程再查 `defaultPrevented`。但 UIKit 多数 delegate 是同步返回 BOOL，推不了 |

#### 传播：先只做 target 阶段

`addEventListener` 注册在具体对象上，事件只派发到那一个对象，不传播。不是因为规范允许省略，而是因为 `UIControl` 的 target-action 本来就是这个语义，覆盖了按钮、开关、输入框等绝大多数需求。将来加冒泡是**扩展**，不是破坏性修改。

**view 层是否继承 `EventTarget` 待定。** 调研结论先记下，免得重查：

- iOS 有四套并存的机制：hit-testing（自上而下找目标）、responder chain（自下而上传未处理的事件）、`UIGestureRecognizer`（平行、抢占）、`UIControl` 的 target-action（直接注册，不走链）
- **hit-testing 不是捕获阶段**：`hitTest:withEvent:` 递归调 `pointInside:` 只为找出 target，全程不派发事件、不触发回调
- **responder chain 的默认语义和冒泡相反**：它是「你不处理我才给下一个」，不调 `super` 链条就断；Web 是默认continue、显式 `stopPropagation()` 才停
- **responder chain ≠ 视图树**：会经过 `UIViewController`（它不在视图树里），且 `nextResponder` 可被覆写
- **手势抢占在 Web 里没有参照**：`cancelsTouchesInView` 默认 YES（手势识别成功会给 view 发 `touchesCancelled:`）、`delaysTouchesEnded` 默认 YES（`touchesEnded` 延迟到手势失败后才发）。这是把 Web 事件模型套到 iOS 上最大的阻抗失配
- `UIControl` 的 19 种 `UIControlEvents`（`TouchUpInside`、`ValueChanged`、`EditingChanged`、`PrimaryActionTriggered` 等）最接近 `addEventListener`，第 3 步可直接映射

### 原生 API 为什么裸暴露在全局

ObjC 没有 namespace 机制，Apple 用**类名前缀**代替：`NS`（Foundation）、`UI`（UIKit）、`CA`（Core Animation）、`CL`（Core Location）、`AV`、`MK`、`SK`、`WK` 等。这些前缀已经承担了命名空间的职责，再套一层 `ios.` 是双重前缀。

裸暴露之后，JS 里写的名字和 Apple 文档、Xcode 补全、Stack Overflow 答案一一对应，心智负担最低。NativeScript 用的就是这个方案。

曾经定过扁平的 `ios.*`，理由是和将来的 `android.*` 平级。**这个理由不成立**：一个运行时实例只跑在一个平台上，JS 里不会同时出现两套原生 API，不需要平台前缀来消歧。

实现上有两个硬性要求：

1. **懒加载**。不能启动时把几千个类塞进 `globalThis`。做法是给 `Context::New` 传一个带属性拦截器的全局模板（`ObjectTemplate::SetHandler(NamedPropertyHandlerConfiguration)`，含 getter / query / enumerator），JS 第一次访问 `UIWindow` 时才去元数据里解析并建类，之后缓存。这两个 API 已在 `Vendor/v8/include` 中核实存在。
2. **撞名检查**。bindgen 生成符号时必须和 ECMAScript 内置比对，**冲突时报错，不允许静默覆盖**——ES 内置优先。

实测 `globalThis` 上一共 86 个属性，其中 22 个是运行时注入的（`console`、`application`、事件类、结构体、原生类），剩下 64 个是 ECMAScript 内置。这 64 个里没有任何一个以 `NS` / `UI` / `CA` / `CL` / `AV` / `MK` 开头，所以 ObjC 的**类**不会撞。真正要盯的是 C 函数、枚举和常量——它们不一定都有前缀；而且 ECMAScript 以后还会添新的内置名，所以撞名检查要固化进 bindgen，不能只查一次了事。

## 3.5 类型定义

`types/` 是一份**纯类型**的 npm 包（`@nacre/types`），没有任何运行时代码。Nacre 的 API 由运行时注入到 `globalThis`，这份定义只是把它们声明出来。

它和 `ios/` 平级，**不在 `ios/` 里面**：使用者是拿 Nacre 写 App 的人，不是改运行时的人。

| 文件 | 内容 |
| --- | --- |
| `nacre.d.ts` | 运行时自己的 API：`console`、`EventTarget`、`Event`、`Application`。跨平台，将来 Android 也用这份 |
| `ios.d.ts` | iOS 原生符号：`UIView`、`UIColor`、`UIFont`、结构体、枚举 |
| `index.d.ts` | 入口，现在把两份都引上 |

**还没按平台拆导出。** 只有 iOS 的时候那条路验证不到，形状多半会定歪；文件已经分开，将来加 `android.d.ts` 时再定，那时有真实需求。

**还没发布到 npm**（`package.json` 标着 `private`）。包名 `@nacre/types` 没被占用，但 scope 要先注册。无前缀的 `nacre` 已经被一个 2022 年的 "Intuitive Shell" 占了。

### 怎么保证三边不漂

同一套 API 现在有三个面：

| | 角色 |
| --- | --- |
| `NacreRuntime.mm` 的分发表 | 真相，决定运行时实际能做什么 |
| `nacre.js` 的取值器 | 桥，JS 能碰到的东西 |
| `types/*.d.ts` | 契约，开发者看到的东西 |

手写绑定的时期这三份只能分别维护，所以必须有东西盯着。`ios/scripts/check-api.sh` 比对类是否齐、成员是否对得上、只读/读写是否一致、枚举可选值是否相同。**脚本本身验证过**：故意删一个属性、把只读改成读写、枚举少一个值，三种都能抓到。

**每个提取点都要能说出「是我自己失效了」。** 这个脚本靠正则从三份源码里抽名字，正则一旦对不上就会**安静地返回空集合**，于是报出一屏看着像真 diff 的假阳性——拆 `NacreProperties.mm` 时就是这么被咬了一次，报了一百多条假的「nacre.js 有但原生层没有」。

所以每个提取点都走统一的 `extract()`：定位不到或抽出来是空的，就报「`<什么>` 定位不到，check-api.sh 要更新」，并且**由它推出来的那条 diff 不再报**（`compare()` 对 `None` 直接跳过，取值器的并集 `js_union()` 任何一个成员失效就整个返回 `None`）。

这一条同样**验证过**，在仓库的沙盒副本里逐类弄坏：d.ts 的联合类型改名、原生的 `NACRE_ENUM_MAP` 改名、手写表的函数改名、颜色表的定位注释改掉、取值器改名、`defineNativeClass` 改名、域函数签名改名——**七类各报一条「脚本要更新」，一条噪音都没有**；同时「d.ts 删一个枚举值」「nacre.js 删一个 getter」这两种真实 diff 照样精确报出来。

**它只比对符号，不比对类型。** 参数类型写错了、返回类型写反了，脚本看不出来——那一层靠 `main.js` 的实际使用和 `tsc` 兜着。所以两件事都要做，缺一个都有漏网的。

等 bindgen 从 SDK 头文件生成，三份都变成产物，这个脚本就可以退休。

### `main.js` 是第一个用户

`ios/JS/tsconfig.json` 直接 include 仓库里的类型定义，不走 npm。开了 `checkJs`，所以 `main.js` 的每一行都被检查。

验收用例里那些**故意写错**的地方（枚举给错值、写只读属性、构造不可构造的类）全部标了 `@ts-expect-error`，于是它们变成了类型定义的测试——**双向的**：

- 类型定义写错了 → 正常报错
- 类型定义漏了某条 → `@ts-expect-error` 报 `Unused '@ts-expect-error' directive`

实测确认：把 `UIViewContentMode` 放宽成 `string`、把 `superview` 改成可写，两种都会被反过来抓到。

### 运行时没有什么

实测 `globalThis` 得到的事实，类型定义据此配 `lib`：

**没有**：定时器（`setTimeout` / `setInterval` / `queueMicrotask` 一个都没有）、`Intl`、`fetch` / `URL`、`TextEncoder` / `TextDecoder`、`structuredClone`、`WebAssembly`、DOM 的一切。

**有**：ECMAScript 的新特性基本是全的，`Float16Array`、`Iterator` 辅助方法、`DisposableStack`、`SuppressedError` 都在，所以 `lib` 用 `ESNext` 而不是 `ES2023`。

`Intl` 比较特殊：TypeScript 的 ES lib 自带它的类型，**没办法从 `lib` 里减掉**，所以类型上看着存在、运行时会抛 `ReferenceError`。这是已知的不对齐，记在 `types/README.md` 里。

## 3.6 `app/`：运行时的第一个客户

`app/` 是这个 App 的 JS 源码。它和 `ios/`、`types/` 平级，**不在 `ios/` 里面**——第 4 节的 Android 计划是「同一份业务 JS，按平台分支调用各自的原生能力」，而 `ios/` 的约定是「永远表示运行时源码」，跨平台的 JS 放进去从一开始就错了。

**它按真的 JS 工程结构来，这是有意的。** 这个客户是 JS 开发者，如果我们自己的第一个客户都不走 `package.json` + 依赖 + 打包那一套，「社区工具链能不能对准 Nacre」这件事就验不到。

| | |
| --- | --- |
| 打包 | esbuild，`npm run build` → `ios/JS/main.js`。**不用 vite**（dev server、HMR、index.html 对我们全没用），也不用 webpack（经典输出给每个模块包一层 CommonJS 壳，而 esbuild 的 scope hoisting 产物几乎就是源码顺序拼起来——运行时没有 source map，产物越接近源码越好） |
| 硬约束 | `--format=iife`（运行时编译 classic script，ESM 的 `import` 直接抛）、`--platform=neutral`（不能注入 `process` / `Buffer` 的 polyfill）、不压缩 + `--charset=utf8`（报错行号只能靠人去产物里对） |
| 类型 | 像真客户一样把 `@nacre/types` 装成依赖（`file:../types`），靠 `src/main.js` 里的 `/// <reference types="@nacre/types" />` 引进来，**不走相对路径 include** |
| 版本 | esbuild 和 typescript 都钉死在 `package.json`，lock 文件提交 |

### 这件事当场抓到两个问题

**1. `types/package.json` 的 `files` 白名单漏了 `ios/`。** 拆分 `ios.d.ts` 的时候没跟着改，`npm pack --dry-run` 只有 5 个文件——这个包一旦发布，装的人拿到的 `ios.d.ts` 是一串指向空气的 `/// <reference path>`，**一个 iOS 类型都没有**。而 `check-api.sh` 和 `tsc` 都查不出来，因为它们走的是相对路径 include，压根没问过「这个包发出去是什么样」。

修法是**把 `files` 删掉**：这个包里除了 `.d.ts` 和 README 什么都没有，白名单只会再漂一次。

**2. 类型检查一直跑在没钉版本的 TypeScript 上。** `npx -y -p typescript tsc` 拉的是**最新**，实测当时已经是 **7.0.2**（Go 重写版），而且是无声变过去的。现在钉成 5.9.3。

### 一条测不出东西的验收

原本想用「把 `types/package.json` 的 `types` 字段改错，类型检查要报错」来验包的入口。**这条是无效的**——Node/TS 解析在 `types` 指不到时会回落到 `index.d.ts`，所以那个字段不承重，改错了照样过。

真能证明的测法是**把 `/// <reference types="@nacre/types" />` 那行去掉**：`UIView`、`UIWindow` 连 `console` 一起全部 `Cannot find name`。这才说明全局确实是通过这个 npm 依赖进来的。

### 怎么分文件

跨段共享的只有这几样：`assert`（在 `src/support.js`）、`vc` 和 `win`（由 `stepWindow` 建好后写回 ctx），以及版面给的 `section` / `column` / `dock`（见下一小节）。其余全是段内局部。

- 顶层那几段（console、application、错误出口、前后台、包装与场景）在脚本顶层执行，所以**作为副作用 import**，执行顺序就是 `src/main.js` 里的 import 顺序
- 场景回调里那几段是 `export function stepXxx(ctx)`

**CALayer 那段没有自己的文件**——它嵌在 Auto Layout 的块里，用的是同一张卡片。拆的时候 `tsc` 当场报了 `'}' expected`，同理 `timers` 用到 `win` 也是 `tsc` 报出来的。**跨段引用靠类型检查兜住，不靠肉眼。**

### 版面：一步一个区块，从上往下排

验收界面是一个纵向滚动的「瀑布」（`src/waterfall.js`）：每一步向它要一个区块——一行小标题加一块固定高度的内容区——区块按步骤的先后从上往下排，排不下就滚。输入框那张卡片例外，它要验的是贴着键盘走，所以留在根视图上，瀑布的底边接在它上面。

**以前不是这样**：各步把东西直接摆在根视图上，位置各写各的固定坐标（`new CGRect(230, 412, 150, 90)`、`bottom: -352`），十几块互相压着；坐标还是按 iPhone Air 的 420 pt 宽写的，换到 390 pt 的 iPhone 14 上最右一列被切掉。

搬的时候定的几条：

| | 做法 | 为什么 |
| --- | --- | --- |
| 内容区的宽度 | 横向铺满安全区，不替各步留边 | 各步本来就自己写「左右各留 16」。这样内容区在版面上的角色和以前的根视图一样，`card 宽 = 安全区宽 - 32` 这类断言**一个数都不用改** |
| 滚动视图放哪 | 整个待在安全区里面 | 里面每个区块的安全区就等于它自己的范围，各步拿 `host.safeAreaLayoutGuide` 当边界用，不会被刘海掺进来 |
| 区块什么时候建 | 进入这一步时同步建 | 区块的先后就是调用的先后。模态那一步的按钮是 600 ms 之后才加的，区块要提前建好，不然它在瀑布里的位置就乱了 |
| 怎么验没搬丢东西 | 改之前和改之后两轮日志，按断言标签逐条比对 | 1221 条断言一条没少，差异只有 7 条改了措辞的日志；依赖宽度和位置的断言数值也都没变 |

这套版面本身也是在用运行时：外层是 `UIScrollView` 套 `UIStackView`，上下留白和标题的缩进用的是内边距，没有多套一层视图。

## 4. Android 扩展计划（未开始，仅记录方向）

iOS 的功能清单完成后再开始 Android。以下是目前的方向，开始前需要按 SOP 重新讨论确认：

| 方面 | 计划 |
| --- | --- |
| 目录 | 仓库根目录新建 `android/`，与 `ios/` 平级，同样是运行时源码 |
| JS 引擎 | 同一版本的 V8：v8-buildscripts 同时发布了 Android 的预编译库（arm64-v8a 等） |
| 引擎复用 | `ios/Runtime/Engine/` 是纯 C++，只依赖 V8。开始做 Android 时把它抽到公共目录（如 `core/`），两端共用 |
| 能力暴露 | Java/Kotlin 有反射机制，和 ObjC 运行时一样可以动态调用，思路可以对应 |
| 排版 | 同样按 Android 原生方式（View 体系、ConstraintLayout），不做跨平台布局抽象 |
| JS 命名空间 | iOS 按 ObjC 类名裸暴露在全局，Android 按 Java 包路径（`android.*`、`java.*`）暴露。两套命名体系天然不冲突，都不需要平台前缀 |
| 双端统一 | 由 JS 层（或社区库）自己处理，运行时不强制统一 |
| JS 代码 | 同一份业务 JS，按平台分支调用各自的原生能力 |

## 5. 目录约定

```
nacre/
├─ .claude/           AI 协作规则（CLAUDE.md）
├─ README.md
├─ docs/              项目说明、API 文档、实现原理
├─ types/             TypeScript 类型定义（@nacre/types），面向使用运行时的开发者
├─ app/               这个 App 的 JS 源码：运行时的第一个客户
├─ ios/               iOS 运行时源码 + App
└─ android/           以后再加
```

- **`ios/`、`android/` 永远表示运行时源码，必须提交。**
- **`types/` 是对外的交付物，不是源码树的一部分**，所以和 `ios/` 平级而不在它里面：它的使用者是拿 Nacre 写 App 的人，不是改运行时的人。必须提交。
- 以后工具生成的原生工程等产物，放在 `build/` 或 `.nacre/` 下，**不能命名为 `ios/`**，避免和源码混淆。
- `.gitignore` 只忽略生成的和下载的内容，**不能忽略任何源码目录**。根目录的 `.gitignore` 里不能出现平台目录名。

### 文档怎么分

四处，判据是**面向谁**：

| 目录 | 写什么 | 面向谁 |
| --- | --- | --- |
| `docs/api/` | 怎么用、参数、默认值、**效果**、会踩的坑、**ObjC ↔ JS 对照表** | 用 Nacre 写 App 的人 |
| `docs/guides/` | 跨多个类才能完成的任务，按步骤写 | 用 Nacre 写 App 的人 |
| `docs/internals/` | **桥怎么搭的、为什么这么选、实测数据、被否掉的方案** | 改运行时的人 |
| `docs/project.md` | 项目定义、已定的决策、目录约定、SOP、进度、待定的设计问题 | 这个项目本身 |

举三个例子：

- 「`shadowOpacity` 默认 0，不设就看不见」→ **api**。不知道这条就不会用
- 「`CGColorRef` 转 `UIColor` 为什么会丢动态色」→ **internals**。不知道也会用
- 「颜色的上层写法定成字符串」→ **project.md**。这是一个决策，不是实现

**每新增或改动一块能力，`api/` 和 `internals/` 两份一起写。** 只写 api 等于把原理丢了，下次改的人要重新推一遍；只写 internals 等于没交付。这和「改 API 同一步里更新 `types/`」是同一条纪律。

API 文档的写法有单独的规范：[文档写法](writing-guide.md)（2026-11-11 定）。要点：

- **读者**是做过前端或图形开发、但没碰过 iOS 的人。iOS 特有的词都要解释
- **顺序按「怎么用、什么效果」排**：完整例子 → 常见用法 → 概念 → 成员说明 → 对照表 → 还不能做的
- **每段代码后面都有「效果」**；每个数值写单位；可读和可写分开写
- 没在模拟器验证过的效果标「未验证」

对照表是**承诺的一部分**：底层说「和 Apple 文档一一对上」，那就要让人能照着 Apple 文档查到 JS 怎么写。

API 文档的样板是 [`api/ui-button.md`](api/ui-button.md)，实现原理的样板是 [`internals/ca-layer.md`](internals/ca-layer.md)。**其余 API 文档还是旧写法，分批改。**

### 文件拆分规则

一句话：**按能力域分文件，一个文件一个域；跨域共用的只放声明，不互相引实现。**

| | |
| --- | --- |
| **什么时候拆** | 单个文件超过约 800 行，或者一个文件里出现了两个互不相干的能力域（比如 URL 解析和视图属性挤在一起）。以先到的那个为准 |
| **按什么分** | 按**能力域**，不按技术分层。「颜色 / 字体 / 图片」是一个域（都是不可变的值类对象），「Auto Layout」是一个域。分发表**先**按通道分（`Properties` / `Methods`），**到了 800 行再按能力域往下分**，分发器只留顺序表——见下面「分发表怎么拆」 |
| **共享的东西往哪放** | 一个内部头文件，**只放声明和跨域要用的类型**。实现文件之间不互相 `#import` |
| **新文件怎么进工程** | 不用管。`project.yml` 收的是 `path: Runtime` 整个目录 |
| **拆完怎么验** | `check-api.sh` 的三边核对数字必须和拆之前一字不差，加上模拟器的全部断言 |

落到目录上：

```
ios/Runtime/
├─ NacreRuntime.h / .mm   启动壳、事件转发、host 接线、fetch、定时器唤醒
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
│  ├─ NacreStorage.mm     UserDefaults
│  ├─ NacreFileSystem.mm  文件读写
│  ├─ NacreKeychain.mm    Keychain
│  └─ NacreURL.mm         URL 解析
└─ Engine/                纯 C++，只依赖 V8

types/
├─ index.d.ts             入口
├─ nacre.d.ts             运行时自己的 API（跨平台）
├─ ios.d.ts               桶，只有 /// <reference>
└─ ios/                   一个能力域一个 .d.ts
```

### 分发表怎么拆

`NacreProperties.mm` 到 983 行时拆的，过程记在[实现原理](internals/bridge.md#属性分发按能力域拆开)。定下来的做法：

| | |
| --- | --- |
| **怎么切** | 每个能力域一个 `NacreProps<域>.mm`，装该域在**所有通道**上的函数（读、写、对象读、对象数组读、对象写）。`NacreProperties.mm` 只剩分发器 |
| **为什么不按通道再切一刀** | 真实的改动单元是「给某个类加几个属性」，一次要同时动读和写。按域切，这件事在一个文件里完成；按通道切要跨两三个文件 |
| **顺序怎么办** | 查过所有**跨域**的子类/父类对（`UIButton`、`UIControl`、`UIScrollView`、`UIStackView`、`UIWindow` 对 `UIView`），**没有一个键是两边都处理的**，所以分发器的顺序自由。但仍把子类所在的域排在 `View` 前面，让「子类在父类之前」这条规矩在顺序表上看得见 |
| **各通道的约定** | 读返回 `nil` 表示不认识；写返回 `YES` 表示处理了（写成了，或者填了 `error`）；对象读返回 `class_name` 为空的 ref 表示没处理；数组读只管往 `refs` 追加，没有「谁先认领」 |
| **怎么验** | `check-api.sh` 的四个数字一字不差（标量读写 108/66、对象读写 41/11），加上模拟器全部断言逐条对比 |

`check-api.sh` 也要跟着改：它原来按单个签名找分发表的函数体，拆完改成**按签名正则收集一组函数**，匹配不到就报「脚本要更新」。

**已经拆过的两次，结论记下来：**

| | 怎么切的 | 验证 |
| --- | --- | --- |
| `NacreEnums.mm` 956 行 → 7 个文件 | 按能力域，域名和 `NacreProps*` 对齐。唯一的实质改动是把两个宏搬进头文件——它们原来是 `.mm` 里的 `#define`，所以枚举只能挤在一个文件里 | 脚本按括号深度切出 85 块，**断言分配表是 0..84 的完整划分**；`check-api.sh` 四个数字一字不差 |
| `NacreMethods.mm` 854 行 → 532 + 246 + 118 | 两刀：造对象整体搬走（纯搬家）；导航域按通道全收（改了返回约定，加了 `NacreArgs`） | 三层——编译器抓到删多了、**selector 全集对比**、全部断言 |

**第二刀教会的一条**：`check-api.sh` 盯的是属性和类，**方法分支删了它看不出来**。所以拆方法时要另外做一次 selector 全集对比：拆前的文件 vs 拆后几个文件的并集，一个不丢一个不多。

**剩下的域还没拆**（UIView / UIButton / UIScrollView / UIStackView 还挤在 `NacreMethods.mm` 的 549 行里）。没有急迫性——它在线下了，而且下次谁碰到哪个域就顺手把那个域抽出去，比一次全拆安全。

**两处暂时不拆，理由写下来免得反复讨论：**

- **`nacre.js`**（2600+ 行，**过线了**）：方案已定、暂时不拆，见下面「[`nacre.js` 怎么拆](#nacrejs-怎么拆方案已定未实现)」
- ~~**`main.js`**：验收用例，按步骤顺序读下来才有意义，拆开反而难读~~ → **已拆**，见下面「[`app/`：运行时的第一个客户](#36-app运行时的第一个客户)」。顺序没丢，反而从「隐含在文件位置里」变成了 `src/main.js` 里显式的十几行调用

### `nacre.js` 怎么拆（方案已定，未实现）

2026-11-09 讨论定的，**当时决定先不拆**——它改的是加载模型而不是挪代码，值得单独走一遍 SOP；而且 JS 开发者对拆不拆毫无感知，优先级低于能看见的能力。

难点和 `.mm` 完全不同：`nacre.js` 整个是**一个 IIFE**，内部状态靠闭包里的 Symbol 共享，故意不暴露。量过共享面——17 个内部 Symbol 里**只有 6 个真跨域**（`kTarget`、`kDefaultPrevented`、`kStopImmediate`、`kListeners`、`kSubscribe`、`kHandle`），其余全是单个域自己的（URL 占 5 个、fetch 占 7 个），加上约 25 个桥接助手。共享面不大，所以可拆。

**定的做法是函数包裹**，也就是 Node 给每个模块套 `(function (exports, require, module, …) { … })` 的那一招：

```js
// nacre.js —— 入口，只剩几十行
(function (native) {
  const ctx = { native };
  ctx.kHandle = Symbol('nativeHandle');
  …                              // 6 个跨域 Symbol + 共享助手
  __nacre_runParts(ctx);         // 原生按序编译执行每个 part
})(globalThis.__nacre_native);
```

```js
// parts/05-view.js —— 整个文件就是一个函数表达式
(function (ctx) {
  const { kHandle, nativeGet, requireNative, UIResponder } = ctx;
  ctx.UIView = ctx.defineNativeClass('UIView', class UIView extends UIResponder { … });
})
```

原生侧对每个 part `Compile(源码, ScriptOrigin(文件名))` → `Run()` 拿到函数 → 用 `ctx` 调一下，约 30 行。

被否掉的两条，理由记下来免得重议：

| | 为什么不行 |
| --- | --- |
| **多脚本按序执行** | 要共享就得去掉 IIFE、让助手变成顶层 `const`（全局词法绑定，不污染属性列表）。但那会**把内部名变成用户的保留字**——`main.js` 顶层重复声明同名 `const` 是 `SyntaxError`，而我们的内部名里有 `define`、`own`、`num`、`env`。报错还指向用户自己那一行，极难查 |
| **构建期拼接** | 运行时一个字不用改，但**跑的不是你编辑的那个文件**：报错说 `nacre.js:1234`，而那个 `nacre.js` 是生成物，得回查源文件和行号。还多一个构建步骤 |

函数包裹三条都占住了：每个 part 各自正确的文件名和行号、零全局污染、不占用户的标识符，而且**依赖关系从「隐含在文件顺序里」变成显式的**——每个 part 开头那行解构写明了它要什么。

「半加载状态」这条**不是新增的风险**：今天第 1500 行语法错一样会让整个内置脚本死掉。区别只是 part 化之后前几个 part 已经装上了，状态更让人困惑。所以原生侧要把**任何一个 part 失败都当致命错误**，日志里点名是哪个文件。

切法按已有的域，和 `Bridge/`、`types/ios/` 对齐：`00-core`（桥接助手和所有权镜像）、`01-event`、`02-struct`、`03-layer`、`04-layout`、`05-view`、`06-text-image`、`07-control`、`08-scroll`、`09-scene`、`10-url`、`11-fetch`、`12-timer`，13 个文件，最大的 322 行。

### 分发链一开始就该写成「认不认领」

拆 `NacreProperties.mm` 时学到的：**纯搬家不会引入问题，但把「一个函数里的贯穿链」拆成多个函数必然要新增一个返回约定**，而新增约定就是改设计。那次写通道 88 处 `return;` 要改成 `return YES;`（漏了 12 处写在一行里的，编译器拦住了），对象读通道的 `{}` 则多出了第三个含义。

所以**新写分发链时，每个类分支就返回「我认不认领」**，别依赖「在同一个函数里往下掉」。`NacreMethods.mm`（680 行）下次轮到它拆，先把签名改成这样，拆的时候才是纯搬家。

`ios/` 内部：

| 目录 | 内容 | 是否提交 |
| --- | --- | --- |
| `project.yml` | XcodeGen 工程描述 | 提交 |
| `.gitignore` | 平台相关的忽略规则（根目录的 `.gitignore` 里不能出现平台目录名，所以放这里） | 提交 |
| `App/` | 启动壳：AppDelegate、SceneDelegate | 提交 |
| `Runtime/` | 运行时和能力暴露：`NacreRuntime`（ObjC++ 启动壳与接线）、`Bridge/`（能力暴露，按能力域分文件）、`Engine/`（纯 C++） | 提交 |
| `JS/assets/` | 图片等资源，整个目录进 App Bundle 的 `JS/` | 提交 |
| `JS/main.js` | 由 `scripts/build-js.sh` 从 `app/` 打包生成 | 不提交 |
| `scripts/` | `fetch-v8.sh`（下载 V8）、`run-sim.sh`（一键在模拟器运行） | 提交 |
| `Nacre.xcodeproj/`、`App/Info.plist` | 由 `project.yml` 生成 | 不提交 |
| `Vendor/` | 由 `fetch-v8.sh` 下载的 V8 | 不提交 |
| `build/` | 构建产物 | 不提交 |

## 6. 开发流程 SOP

**原则：先讨论，明确清楚，再确定实现。没有确认就不写代码。**

每一步按下面的顺序进行：

1. **讨论**：说明这一步要解决什么问题，列出可选方案和各自的取舍。
2. **明确**：确定这一步做什么、不做什么，以及验收标准（运行后应该看到什么）。只做这一步，不夹带后续功能。
3. **确认**：用户明确同意方案和范围后，才进入实现。
4. **实现**：编写代码并写入仓库。写入前先读取仓库中的现有文件，不覆盖用户的改动。**新增或改动任何 JS 能碰到的 API，同一步里更新 `types/`**——类型定义和实现是同一件事的两个面，分两步做必然漂。
5. **检查**：能检查的先检查，比如 C++ 对照 V8 头文件做语法检查、脚本做语法检查。另外两条固定要跑：

   ```bash
   bash ios/scripts/check-api.sh      # 三边符号核对
   ```

   ```bash
   cd app && npm run check            # 类型检查（tsc 版本钉在 app/package.json）
   ```

   没有实际运行过的内容，要明确标注"未验证"。
6. **验证**：在 Mac 上运行 `cd ios && bash scripts/run-sim.sh`（用户执行，或在 Claude Code 中由 AI 执行），根据终端输出或报错判断是否通过。
7. **提交**：验收通过后由用户提交，一步一个 commit。
8. **记录**：新的决策写进本文件（`docs/project.md`），更新进度表。

实现过程中如果发现需要改变已确认的方案，**先停下来回到第 1 步讨论**，不能自行调整。

Commit message 格式：

```
<范围>: <中文描述>
```

例如：`ios: 搭建 iOS 工程，启动 V8 引擎并执行 main.js`。范围可以是 `ios`、`docs`、`repo` 等。

## 7. 进度

### 功能清单

每一项是一步、一个 commit。顺序从简单到复杂，开始每一项前都要按 SOP 讨论确认。

**M 开头的三项是「机制」，不是能力。** 区别在于有没有逃生口：上层没封装的能力，底层裸暴露还能补；而这三条不做就是**真的做不了**，再怎么裸暴露也绕不过去。所以它们比清单上大多数项更决定这个运行时能不能承接业务。

| 步骤 | 功能 | 会需要暴露的能力 | 状态 |
| --- | --- | --- | --- |
| 0 | 搭建 iOS 工程：App 启动、V8 启动、全局对象 `console`、执行 `main.js` 输出 hello world | — | 已完成（commit `eba1b23`） |
| 1 | 运行时基础对象：`EventTarget`、`Event`、`Application` 和单例 `application`，以及全局错误出口 | Info.plist、应用状态、App 级通知、未捕获异常与未处理拒绝 | 已在模拟器验证通过，待提交 |
| 2 | 窗口和根页面由 JS 创建 | 场景事件转发、UIWindow、UIViewController、UIColor | 已在模拟器验证通过：JS 创建窗口和根页面，并设好底色，屏幕不再是黑的 |
| 2.5 | `UIView` 的几何、层级、外观 | 结构体、带参数的方法通道、对象数组 | 已在模拟器验证通过：JS 建子视图、设 frame 和颜色，屏幕上出现色块 |
| 3a | 文字 | UILabel、UIFont、枚举、带参数的类方法 | 已在模拟器验证通过：JS 设字体、颜色、对齐和行数，文字上屏并正确截断；顺带补上 `UIWindow` 的四个 key/可见性事件 |
| 3b | 图片 | UIImageView、UIImage、Blob 解码、后台解码 | 已在模拟器验证通过：bundle 图自动选 @3x、SF Symbol、九宫格、fetch 下来的网络图上屏 |
| 3c | Auto Layout | NSLayoutConstraint、锚点、UILayoutGuide | 已在模拟器验证通过：锚点建约束、批量激活、flex-1 式的抱紧优先级、UILayoutGuide、三个调试接口 |
| 3d | 圆角、边框、阴影 | CALayer、位掩码 | 已在模拟器验证通过：卡片有圆角和边框，子块也圆了 |
| 3e | 一维排列 | UIStackView、别名枚举、哨兵常量 | 已在模拟器验证通过：三等分排开、嵌套、隐藏即塌陷，49 条断言全过 |
| 3f | 滚动 | UIScrollView、delegate trampoline、事件合并 | 已在模拟器验证通过：真实滑动一次派发 100 个 scroll，事件顺序正确，三次直写合并成一个 |
| 3g | 缩放 | zoomScale、viewForZooming、捏合手势 | 待讨论，和手势那一步绑一起 |
| — | `app/`：JS 源码独立成工程，esbuild 打包 | package.json、@nacre/types 当依赖装 | 已在模拟器验证通过：358 条断言和打包前一字不差，含真实滑动和点击 |
| — | A5-1 子图层和渐变 | CALayer 可构造、几何、层级、CAGradientLayer | 已在模拟器验证通过：48 条断言全过，屏幕上一张渐变卡片；实测 view.layer 的 contentsScale 也是 1 |
| — | A5-2 路径和形状图层 | UIBezierPath、CAShapeLayer、三个字符串枚举、UIRectCorner 位掩码 | 已在模拟器验证通过：788 条断言全过，屏幕上一条折线和一个扇形；path 的身份靠 JS 侧镜像，写进去的对象原样还回来 |
| — | A6-1 动画核心（CABasicAnimation、时间曲线、CATransaction、动画事件） | keyPath 定取值类型、两条新引擎通道、动画 trampoline | 已在模拟器验证通过：850 条断言全过，折线画出来、圆点脉动；顺带把「隐式动画」那条未验证钉死了——是真的，但要等图层渲染过一轮 |
| — | A6-2 关键帧、动画组、弹簧 | CAKeyframeAnimation、CAAnimationGroup、CASpringAnimation、values 的数组取值 | 已在模拟器验证通过：897 条断言全过，圆点沿路径走并转向、色块跳色、方块弹进来；顺带把验收用例里最后一个写死的延迟换成了等条件 |
| — | A6-3 CADisplayLink | 每帧回调、NSRunLoop、run loop 模式、CAFrameRateRange | 已在模拟器验证通过：925 条断言全过，圆点跟着帧左右走；按「能用就先用着」收窄，讨论里冒出的四条机制一条都没做 |
| — | A8 事件带触点位置 | 两参的 action、JSON 负载通道 | 已在模拟器验证通过：九个 touch* 带 location / tapCount，其余事件根本没有这两个字段 |
| — | 构造通道带上标量参数 | construct_native 加 argsJSON | 已在模拟器验证通过：纯重构，933 条断言和改之前一字不差 |
| — | A16 WebSocket | NSURLSessionWebSocketTask、拉改推、headers、协议级 ping | 已在模拟器验证通过：958 条断言全过，文本/二进制往返、ping/pong、干净关闭（1000 + wasClean）都验到；子协议协商和首部到达未验证 |
| — | 内边距 | UIView 的四个边距属性、NSDirectionalEdgeInsets | 已在模拟器验证通过：996 条断言全过，栈视图的排列项按边距缩进；实测安全区是加上去的（写 16 读回 84） |
| — | A7 点按和长按 | UIGestureRecognizer 三个类、UIView 的挂和摘、事件名即状态名 | 已在模拟器验证通过：1042 条断言全过，含 GC 回归；真实触摸也点过——点按、长按、移动都到了 JS，父视图的单击不抢 `UIButton`。实测纠正一条：长按的 began 回调里 state 是 `began` 不是 `possible`。真机（iPhone 14）上也点过，结论一致，并验到了 `cancelled`（长按中 App 退后台） |
| — | A19 `performance.now()` | 引擎里的单调时钟、零点和 timeOrigin | 已在模拟器验证通过：1054 条断言全过，连读 1000 次没有倒退，读一次约 1 µs |
| — | A15 随机数 | `crypto.getRandomValues`、`randomUUID`、宿主的随机源 | 已在模拟器验证通过：1073 条断言全过，子视图只填自己那一段；填 32 字节约 0.67 µs |
| — | `UIDevice` 静态信息 | 类级单例 currentDevice、七个只读属性 | 已在模拟器验证通过：1086 条断言通过；实测纠正一条——模拟器上 name 是模拟器的名字，不是 model |
| — | A14 剪贴板 | UIPasteboard 的字符串、通知中心观察者 | 已在模拟器验证通过：1104 条断言全过；实测写 null 是清空、写一次收到 2 次 change。真机上点过：读别的 App 复制的内容会弹系统提示，**那一次同步读卡了主线程 6.6 秒**；别的 App 改剪贴板不发 change |
| — | A12 触感反馈 | 三个生成器类、绑定视图的工厂、两个枚举 | 已在模拟器验证通过：1125 条断言全过（建得出来、调了不抛、写错会抛）。真机上六个按钮都点过，调用都执行了；震感如何日志里看不到 |
| — | 参数转换 1：options 里 `undefined` 视为没带 | `has(o, key)` 换掉 39 处 `in` 判断，含 Request / Response / Blob | 已在模拟器验证通过：1141 条断言全过。试用反馈里三处闪退（`{ atIndex: undefined }`、`{ scale: undefined }`）都不再发生 |
| — | 参数转换 2：API 层按 Web IDL 转 | 七个转换助手，110 个取值器和三十来处方法参数 | 已在模拟器验证通过：1183 条断言全过。`view.alpha = undefined` 以前静默写成 0，现在抛；`systemFontOfSize(NaN)`、`{ atIndex: NaN }` 以前闪退，现在抛。旧断言里只有一条受影响 |
| — | 参数转换 3：原生层只校验不转换 | 三个取参宏（类型不对就从所在函数返回）、`SafeNumber`、`check-api.sh` 的裸取值检查 | 已在模拟器验证通过：全部断言通过；另用一次性探针绕过 JS 的转换把 31 种脏值直接送到原生，全部报错、不崩、原值不动。探针抓到一处漏网（`unsignedIntValue`），已改 |
| — | 参数转换 4：入口的异常保护 | `Guarded` 包住 17 个宿主入口，三个入口补了报错出口，异步的接住后拒掉 Promise | 已在模拟器验证通过：1193 条断言全过。`view.addSubview(view)` 以前闪退，现在是能 `catch` 的 TypeError；整轮验收里只有这一次走到保底 |
| — | 参数转换 5：对象参数类型不对就抛 | `viewArg` 一类填报错、`NACRE_OBJECT_OR_NIL`、写对象属性的通道补上报错出口 | 已在模拟器验证通过：1219 条断言全过。那条记了很久的待办（`addSubview(颜色)` 静默什么都不做）关掉了 |
| — | 修复：`new Blob()` 在 GC 之后丢数据 | `createBlob` 改成把 `this` 绑成包装（`BindWrapper`），和 `construct` 一致 | 已在模拟器验证通过：先加断言跑出失败（GC 后 `size` 是 `null`），修完 1221 条断言全过 |
| — | 验收界面按区块瀑布排列 | `app/src/waterfall.js`：滚动视图套排列容器，每一步一个带标题的区块 | 已在模拟器验证通过：1221 条断言一条没少（按标签逐条比对），几何相关的数值没变；滚动、点按钮、点手势区块都试过。长按在滚动视图里还没试 |
| — | 修复：fetch 请求记录的两处生命周期问题 | 读取期间由 JS 拿着 `Response`；记录加 `responded`，响应头没到就结束的当场删；释放时停掉还在跑的下载 | 已在模拟器验证通过：先加用例跑出失败（读取的 Promise 等了 15 秒不结算），修完照常结算。失败请求的滞留用一次性探针验的，没有常驻断言。来源是一份外部审查 |
| — | 修复：订阅失败后监听器还留在表里 | `addEventListener` 改成原生订阅成功之后再登记 | 已在模拟器验证通过：先加断言跑出 3 条失败（同一个非法事件名第二次注册静默通过），修完 1224 条断言全过 |
| — | 修复：自己构造的 `Request` / `Response` 读不出 body；请求体支持二进制 | body 统一存成 `Blob`，发送通道改成交 `Blob` 的句柄；默认 `Content-Type` 照 Web | 已在模拟器验证通过：先加 48 条断言跑出 35 条失败，修完 1272 条断言全过。二进制的字节和 `Blob` 的 `type` 都实测到了服务器。字符串 body 不写 `Content-Type` 时发的值变了（原来是系统填的表单类型，现在是 `text/plain`） |
| — | 所有权镜像补全（一）：没有父对象的三类 | `check-api.sh` 堵三个盲区；run loop → display link、`application` → `WebSocket`、单例由类持有 | 已在模拟器验证通过：先加 10 条不带监听器的断言跑出 4 条失败，改完 1282 条断言全过 |
| — | `transform` | CGAffineTransform、UIView.transform | 已在模拟器验证通过：屏幕上转了 30° 放大 1.2 倍，实测 frame 变成包围盒且 = 宽 × (\|a\|+\|c\|) |
| — | 定时器：`setTimeout` 系列 + `queueMicrotask` | 到期堆、唤醒源、时间预算 | 已在模拟器验证通过：8 条断言全过，含同时到期的顺序、嵌套不饿死、`clearInterval` 自取消 |
| **M1a** | **异步回调回 JS** | 订阅通道、trampoline 持有 handle、延后一轮派发 | 已在模拟器验证通过：真实触摸走通，一次点击一个 touchDown 一个 touchUpInside |
| **M1b** | **同步回调回 JS** | 重入判定：UIKit 主动调我们才允许同步 | **没有逃生口**，第 8 步列表绕不过去 |
| **M2** | **JS 子类化原生类** | 动态生成 ObjC 子类、方法转发回 JS | **没有逃生口**：覆写 `drawRect:`、`layoutSubviews`、任何 delegate 协议都要它 |
| **M3** | **通用能力暴露**（bindgen） | 从 SDK 头文件生成元数据，运行时动态调用 | **没有逃生口**：不做这个，覆盖面永远追不上，而且手写的三份分发表注定要漂 |
| 4a | `UIControl` 的 16 个控件事件 | 订阅通道、target-action | 已在模拟器验证通过：261 条断言全过，含真机点击 |
| 4b | `UIButton` | `setTitle:forState:`、状态作参数 | 已在模拟器验证通过：按状态设标题/颜色/图，真实点击收到 primaryActionTriggered |
| 4c | first responder | `becomeFirstResponder` / `resignFirstResponder` | 待讨论，和第 9 步绑一起 |
| 5a | 页面栈 | UINavigationController、可写的对象数组属性、导航级事件 | 已在模拟器验证通过：真实点返回和左滑返回都走通，GC 回归证明栈的持有边有效；外加一个**写在 JS 里**的 router（`app/src/router.js`），三页跳转实测通过 |
| 5b | 导航条上的东西 | UINavigationItem、UIBarButtonItem、UIBarItem | 已在模拟器验证通过：导航条上真的有「完成」按钮并且点得动；实测 vc.title 和 navigationItem.title 是单向的 |
| 5c | 模态呈现 | present / dismiss 是 Promise、关闭事件、call_async 补对象参数 | 已在模拟器验证通过：真实向下拖走、锁住后拖只收到 dismissattempted；实测程序 dismiss 不发事件 |
| — | 页面生命周期（viewDidLoad 等） | **M2**——全是覆写点不是 delegate | 待讨论 |
| 6a | `URL` / `URLSearchParams` / `Headers` | NSURLComponents、WHATWG 语义 | 已在模拟器验证通过：37 条断言全过，和 Chrome 对撞过一批 URL |
| 6b | `fetch` / `Request` / `Response` | NSURLSession、BackingStore 零拷贝 | 已在模拟器验证通过：当初对着本地服务器跑，20 个并发 36ms；验收用例在 3b 改成打公开的 `httpbin.org`，不用再起服务 |
| 6c | `Blob` + `AbortController` 和取消 | NSURLSessionTask.cancel、原生对象包装 | 已在模拟器验证通过：blob 零拷贝、取消、超时中止 |
| — | 原生类一律 final：继承当场抛，删掉 `allowNativeConstruct` | `finalCheck`、包装工厂改 `Object.create` | 已在模拟器验证通过：508 条断言全过，三种「没有原生对象」分开报错 |
| — | 补上 `UIButton` 按状态存的颜色/图的所有权边 | `stateKey`，读写两侧都记 | 已在模拟器验证通过：512 条断言全过，三条新回归在对照组被回收的前提下成立 |
| — | `check-api.sh` 核对所有权边 | 原生层的取参助手当真相，JS 侧必须记边或登记白名单 | 已验证：四类弄坏法各报一条，白名单失配也报 |
| — | 颜色全面字符串化（缺口清单 A3） | 解析在 JS、spec 过桥、池化、声明表 | 已在模拟器验证通过：646 条断言全过 |
| 7a | 本地存储：`application.storage` | NSUserDefaults、plist 值校验、change 通知 | 已在模拟器验证通过：557 条断言全过，启动计数器跨进程验到落盘 |
| 7b | 文件读写：`application.fileSystem` | 后台队列、四种兑现、错误借 DOMException 的名字 | 已在模拟器验证通过：589 条断言全过，跨进程验到；「不卡主线程」那条只单边有效，赌不赢时报未验证 |
| 7c | Keychain：`application.keychain` | SecItem、五个访问级别、默认不迁移新设备 | 已在模拟器验证通过：588 条断言全过，三种持久化各自跨进程验到 |
| 8 | 列表 | UICollectionView、DataSource（同步回调） | 待讨论 |
| 9a | 输入框和键盘（含 4c first responder） | UITextField、48 个 textContentType、keyboardLayoutGuide | 已在模拟器验证通过：644 条断言全过，**不卡 M1b** |
| 9b | `UITextView`（多行） | | 待讨论 |
| 10 | 动画和手势 | Core Animation、手势识别器 | 待讨论 |
| 11 | 系统能力 | 相机、相册、定位、权限请求 | 待讨论 |
| 12 | App 生命周期 | 前后台切换、深链接 | 待讨论 |

注意：第 0 步中的 `App/RootViewController.swift` 由原生创建根页面，不符合第 1 节的边界。第 2 步已把它移到 JS 中，该文件已删除，`SceneDelegate` 只剩空壳。

#### 第 4 步：按事件机制的层分，一步一层

iOS 的触摸不是一套机制，是**四套并行**的（hit-testing、responder chain、手势识别器、`UIControl` 的 target-action），实测细节见[事件模型](internals/events.md)。所以第 4 步按「碰哪一层」切开，一步只碰一层：

| | 碰哪一层 | 依赖 |
| --- | --- | --- |
| **4a** | 只碰 `UIControl` 的 target-action | M1a |
| 4b | 不碰事件，纯属性 | — |
| 4c | first responder | 和第 9 步输入框一起 |
| 第 10 步 | 手势识别器 | 抢占语义没有 Web 参照，要单独设计 |
| — | `touchesBegan` 这一层裸暴露 | M2（要能覆写原生方法） |

**为什么 4a 能先做**：target-action 是四套里唯一**不走 responder chain、不受手势抢占影响**的——它是直接注册的。所以做它不需要先想清楚传播和抢占。

**4a 只需要 M1 的一半。** 控件事件是「原生发生了什么，告诉 JS」，延后一轮没问题；同步回调（`cellForRowAtIndexPath:` 必须立刻返回一个 cell）要到第 8 步才绕不过去。所以 M1 拆成 M1a / M1b。

已定的几条（未回答的按推荐方案）：

| | 定法 |
| --- | --- |
| 订阅 | **惰性**：某类型第一次有监听器时通知原生，最后一个移走时取消。`EventTarget` 加钩子，这个钩子将来所有原生事件源都要用 |
| 原生侧怎么接 | **自己持有的 trampoline 对象，持有 handle 不持有 JS 函数**。派发时拿 handle 查包装再 `dispatchEvent` —— 生命周期就只剩「包装活不活」，而那个所有权镜像已经解决了 |
| 事件名 | 按已定规则去前缀首字母小写：`'touchUpInside'`、`'valueChanged'`、`'editingChanged'`。**不加 `'click'` 别名**——Web 的 `click` 含键盘和辅助功能触发，iOS 的对应物是 `primaryActionTriggered` 而不是 `touchUpInside`，加别名等于把两个不同的东西糊在一起 |
| 派发时机 | **延后一轮**，和现有的原生通知一致。`cancelable` 为 `false` |
| `dispatchEvent` | **不触发原生 action**。它是 `EventTarget` 的语义，只派发给 JS 监听器；要真的触发原生用显式的 `sendActionsForControlEvents([...])` |
| 事件对象 | ~~第一版只有 `type` 和 `target`~~ —— **这条当时判断错了**：以为要等手势那一步，其实 `UIControl` 的 action 换成两参的 `fire:forEvent:` 就拿得到 `UIEvent`，不需要手势识别器。A8 已做 |

#### 屏幕方向（方案已定，未实现）

从 `ui-window-scene.md` 搬过来——它是设计方案，不是已有的 API。

方向是第一个能完整走通「读 + 写 + 变化通知」三格的能力，而且「写」那一格会把**「系统要同步返回值，就转成 JS 预先声明的状态」**这个模式第一次落地。

**iOS 26 挪过位置**：`UIWindowScene.interfaceOrientation` 已废弃，方向现在在 `effectiveGeometry` 上；旧的 `windowScene:didUpdateCoordinateSpace:interfaceOrientation:traitCollection:` 也废弃了，换成 `windowScene:didUpdateEffectiveGeometry:`。

| 格 | JS 形态 | 原生怎么实现 |
| --- | --- | --- |
| **读** | `scene.effectiveGeometry.interfaceOrientation` | 新增 `UIWindowSceneGeometry` 类，先只暴露 `interfaceOrientation` 和 `isInterfaceOrientationLocked` |
| **写** | `scene.supportedOrientations = ['portrait', 'landscapeLeft']` | 运行时存下这个值；`SceneDelegate` 实现 `supportedInterfaceOrientationsForWindowScene:`，**直接返回存的值，不回 JS**；写入时调 `setNeedsUpdateOfSupportedInterfaceOrientations` |
| **变化通知** | `scene` 上的 `geometrychange` 事件 | 实现 `windowScene:didUpdateEffectiveGeometry:` |

「写」这一格的关键是：**系统的回调是同步的，但回调的内容来自异步设置的状态**。这正是 Apple 推荐的写法——`shouldAutorotate` 的废弃说明里原话就是「更新你支持的方向，然后调 `setNeedsUpdateOfSupportedInterfaceOrientations` 表示变了」。React Native 生态的方向库也是这个模式，只是它要求 App 开发者手改 `AppDelegate`，我们做进运行时。

用**属性**而不是方法（`scene.supportedOrientations = [...]`），因为它表达的是状态而非动作——原则 2。

两个要分清的：**设备方向 ≠ 界面方向**（`UIDevice.orientation` 是物理朝向，含面朝上/朝下；`interfaceOrientation` 是界面实际显示的方向，App 锁竖屏时设备横过来界面不变）；以及实际开发中更常用的是**每个页面**的方向（`UIViewController.supportedInterfaceOrientations`），scene 这层管的是窗口整体。

### 第二份试用报告（2026-11-11）：三条「文档和实际不一致」

有人把一个 Expo / React Native 的真实 App（登录注册、首页、底部 tab，约 2600 行 JS）用 Nacre 重写。他们只看 `docs/api/` 和 `@nacre/types`。报告里有三条**说我们和自己写的不一致**，核下来全部属实。

**1. `textContentType` 在 iOS 26.x 上必崩。** `NacreEnumsInput.mm` 的表里有三个 `API_AVAILABLE(ios(27.0))` 的常量（`cellularIMEI1` / `cellularIMEI2` / `cellularNAL`），低版本上弱链接成 nil，往字典字面量里插 nil 当场抛——而且发生在 `dispatch_once` 里，JS 既捕获不到也看不到输出。

**我们自己的验收永远碰不到它**：全跑在 iOS 27 的模拟器上。「支持 iOS 26+」这句话从来没被验证过。这是**验证方法的缺口**，不只是代码的。

**2. Xcode 26.5 编译不过。** 两处用了 iOS 27 才有的符号（`systemPrefersReducedResourceUsage` 和它的通知），只写了 `@available`。那是运行时检查，**编译时符号还得在 SDK 里**。

**3. 「底层裸暴露」那句承诺是假的。** `docs/api/README.md` 原来写着「iOS 原生符号按 ObjC 类名裸暴露在全局（`UIWindow`、`NSString`、`CLLocationManager`）……上层没覆盖的，底层一定能补上」。实际全局只有手写的那几十个类，`NSString` 和 `CLLocationManager` 都没有。那句描述的是 **M3 做完之后**的目标，被当成现状写给用户了。已改。

#### 最大的结构性发现：宿主扩展点

**宿主 App 没有办法把自己的原生代码暴露给 JS。** 运行时对外只有 `NacreRuntime` 的 `startWithScriptsDirectory:`，没有注册自定义原生能力的口子。

这条**我们的缺口表里完全没有**，而且和 M3 不是一回事：

| | 解决什么 |
| --- | --- |
| M3 bindgen | 把**系统 SDK** 的类自动暴露给 JS |
| **宿主扩展点** | 让**宿主 App / 第三方 SDK** 的原生代码暴露给 JS |

bindgen 做完也解决不了同盾（风控）、mtpush（推送）、Sentry 原生部分、Geetest（人机验证）。报告的结论是对的：凡是只提供原生 SDK、没有纯 JS 形态的能力，现在都用不了。

#### 其余新增的缺口

~~`UIDevice`~~（**静态信息已做**，见[系统能力](internals/system.md)；当时的问题是读不到系统版本，所以连「只在 iOS 27+ 上开 textContentType」这种降级都做不了，和第 1 条直接咬在一起）、`NSAttributedString`、`UIVisualEffectView`、`UIView` 级的 `tintColor`、Lottie / 动图、**「怎么在 Nacre 仓库之外建一个自己的 App」的文档**（他们靠读我们的工程文件拼出来的）。

另外 `UIActivityIndicatorView` 要**改判**：之前归在「JS 层拼得出来，不单独排」，这次他们用文字 `•••` 代替了，说明拼不出来。

#### 要注意：这份报告的基线比现在旧

报告里标「未提及」的 `CAShapeLayer` / `UIBezierPath` 和 Core Animation **已经做了**（A5-2、A6-1/2/3）。它说的 35 个类现在是 47 个。排优先级时别照着它的清单来。

### 试用报告暴露的能力缺口（2026-11-10）

有人以**客户**身份（只看 `docs/api/` 和 `@nacre/types`，不改运行时）用 Nacre 写了一个约 1500 行的金融 App，记录了哪里给不出能力。下面是对那份报告的复核结果。

**筛选原则：JS 层封装得出来的一律不做。** 报告第 2 节（建视图啰嗦、Auto Layout 样板、确认框/分段选择/toast/数字键盘/tab 条等组件）全部属于客户自己的库，运行时不管；第 1.4 节「拼得出替代品」的控件（`UIAlertController`、`UISegmentedControl`、`UISwitch`、`UIPickerView`、`UIActivityIndicatorView`）同理，底层以后靠 bindgen 一并补齐，不单独排步骤。

**报告有三处分类要改：**

| 报告的说法 | 复核 |
| --- | --- |
| 「绘图」整块算一条，要 M2 | **要拆**。`CAShapeLayer` / `CAGradientLayer` / `UIBezierPath` / `CGPath` 是对象、属性和方法，**现在就能暴露**；只有 `drawRect:` 是覆写点才要 M2 |
| 「动画」整块算一条 | **要拆**。Core Animation（`CABasicAnimation` 一组）是纯对象，不需要任何回调；`UIView.animateWithDuration:animations:` 的 animations 是**同步执行的 block**，那条路要 M1b |
| 「事件对象不带数据」放在第 2 节（JS 层问题） | **分错了**。触点位置只能由原生在派发时填进事件对象，JS 拿不到。这是能力缺失 |

#### 必须做，现在就能做（不依赖 M1b / M2）

| | 缺什么 | 为什么绕不过去 |
| --- | --- | --- |
| A1 | **输入框和键盘**：`UITextField` / `UITextView`、first responder | 系统键盘、输入法、光标、粘贴、密码自动填充只能由原生输入控件唤起。没有它任何带表单的 App 起不了步。对应清单第 9 步和 4c |
| A2 | **本地存储**：`NSUserDefaults`、文件读写、Keychain | JS 没有任何落盘的口子。对应清单第 7 步 |
| A3 | **任意色值**：`colorWithRed:…`、`colorWithAlphaComponent:`、自定义动态色 | 今天只能取预置常量，品牌色、半透明遮罩、「浅色一个值深色一个值」全造不出来。[方案已定](#待讨论的设计问题)、未实现，改动小 |
| A4 | **容器控制器**：`UITabBarController`、`addChildViewController:` 一组 | tab 条自绘得出来，但父子控制器关系、生命周期和安全区传递只能原生给。它决定 App 的骨架，越晚补客户迁移越痛 |
| A5 | ~~**绘图对象**~~ **已做**：`CAGradientLayer`（A5-1）、`CAShapeLayer` + `UIBezierPath`（A5-2）。剩 `CGPath` 和 `mask` / `shadowPath` | 折线图、K 线、饼图、渐变。纯对象，不需要覆写 |
| A6 | ~~**Core Animation**~~ **已做**：A6-1 核心、A6-2 关键帧/动画组/弹簧、A6-3 CADisplayLink。剩 CATransition、CASpringAnimation 的感知时长初始化器 | `CADisplayLink` 是 target-action，M1a 已经够 |
| A7 | **手势识别器**：~~点按、长按~~ **已做**（见[事件模型](internals/events.md#a7-的第一片点按和长按)）。剩拖动、捏合、轻扫 | target-action，M1a 够。抢占语义原样暴露 iOS 的三个属性，没有另外设计。delegate 那部分要 M2 |
| A8 | ~~**事件对象带数据**~~ **已做**：九个 `touch*` 事件带 `location` / `tapCount`。其余事件按 Web 的做法**根本没有这两个字段** | 只能由原生在派发时填 |
| A9 | **`UITraitCollection`** + `overrideUserInterfaceStyle` | 读不到深浅色、收不到外观变化、App 内做不了主题开关。顺带堵上 `layer` 的 `borderColor` / `shadowColor` 切换主题不变色 |
| A10 | **`UIRefreshControl`** | 依附在滚动视图的原生机制上 |
| A11 | **`UISheetPresentationController` 的 detents** | 模态的呈现高度由系统控制，下单卡片只能整页 |
| A12 | ~~**触感反馈**~~ **已做**：`UIImpactFeedbackGenerator` 一组三个类，只给绑定视图的工厂（`init` 已被 Apple 标成将废弃） | 系统能力 |
| A13 | **`NSNumberFormatter` / `NSDateFormatter`** | 预编译的 V8 不带 ICU，`Intl` 缺失。千分位、货币符号、日期顺序按地区本地化手写不了 |
| A14 | ~~**`UIPasteboard`**~~ **已做**：字符串的读写、`hasStrings`、`changeCount`、`change` 事件。剩图片、网址、多条内容 | 复制地址、订单号 |
| A15 | ~~**`crypto.getRandomValues`**~~ **已做**，连同 `randomUUID()`。剩 `crypto.subtle` | 随机源必须来自系统。摘要/签名 JS 算得出来，但 jitless 下慢，该走 CommonCrypto |
| A16 | ~~**WebSocket**~~ **已做**：比 Web 多两样——可以带首部、有协议级 `ping()` | `fetch` 只有请求-响应，实时行情只能轮询 |
| A17 | **`WKWebView`** | 协议、KYC、活动页 |
| A18 | **生物识别**：LocalAuthentication | 系统能力 |
| A19 | ~~**`performance.now()`**~~ **已做**：`now()` 和 `timeOrigin`，时钟在引擎的 C++ 里 | `Date.now()` 只有毫秒精度 |

**零碎的小口子**（都在 A 组，单独列是因为改动极小）：

- ~~`UIStackView` 的内边距~~ **已做**：边距其实是 `UIView` 的属性（`layoutMargins` / `directionalLayoutMargins`），连同 `insetsLayoutMarginsFromSafeArea` 一起暴露了。见[实现原理](internals/auto-layout.md#内边距属性在-uiview-上不在-uistackview-上)
- 颜色常量表缺 `systemGray2`–`systemGray6`、`systemFill` 一组、`systemGroupedBackground` 一组
- 被模态呈现的 `UINavigationController` 收不到 `diddismiss`——这就是[订阅按事件名分流那条 TODO](#待讨论的设计问题)

#### 必须做，卡在 M1b（同步回调）

| | 缺什么 |
| --- | --- |
| B1 | **可复用列表**：`UITableView` / `UICollectionView`。今天只能一次建出所有行，数据量一大就不可用 |
| B2 | **`UIView` 动画**：`animateWithDuration:animations:` 的 animations block 是同步执行的。走 Core Animation（A6）能绕开，但两套写法差别不小 |

#### 必须做，卡在 M2（JS 子类化原生类）

| | 缺什么 |
| --- | --- |
| C1 | **页面生命周期**：`viewWillAppear:` 一组。页面不知道自己何时出现和消失，停不掉轮询、移不掉监听。**自动聚焦也卡在这里**——`becomeFirstResponder()` 要在页面出现之后调才不被拒，而 JS 表达不了那个时机，只能拿定时器猜（验收用例就被这个咬过一次） |
| C2 | **`drawRect:`** 自定义绘制 |
| C3 | **手势识别器的 delegate**：同时识别、是否开始 |

### 性能：能用就先用着

判据是**整个 App 流不流畅**，不是某个数字好不好看。

- 先按最直白的写法做出来，跑起来
- 真卡到不能用了，再去量、再针对性优化
- **不为「可能会慢」提前加机制**——加的每一条机制都要自己维护、自己验证，而且多半优化错了地方

实测一次过桥 1.3–2.4 µs，120 Hz 的一帧（8333 µs）能放三千多次属性写入；而 SF Symbol 冷加载一次就 11.7 ms，是它的**四千倍**。瓶颈几乎从来不在想当然的地方。

按这条否掉过的一个例子记在[实现原理](internals/bridge.md#json-那条快路为什么不做)里：给数字和布尔开一条绕过 JSON 的快路。

#### 性能，不是能力缺失

| | 实测 | 状态 |
| --- | --- | --- |
| SF Symbol 首次加载慢 | 每个新名字冷加载约 11.7 ms，在主线程上；一次建很多图标时主线程阻塞 1.0–1.5 s，运行时自己打出了 `Timer callback blocked the main thread` 警告 | 要查，可能需要后台预热 |
| 空闲后第一次渲染变慢 | 空闲 30 s 后重建列表 199–418 ms，紧接着再来一次只要 36–41 ms | **原因未查**。猜测是字节码被回收或 GC，未验证 |
| 桥本身不是瓶颈 | `new UIView` 约 4 µs，写属性 2–7 µs，建约束约 10 µs，`addSubview` 约 12 µs | 好消息 |

#### 开发体验（不排进能力清单，但记着）

改一行 JS 要重新打包重装重启；报错行号指向 esbuild 产物，没有 source map；`console` 输出在非终端环境看不到。

### 待讨论的设计问题

开始第 1 步前需要先确定能力暴露的方案和 JS 层结构。

能力暴露方案的三个候选：

- 复用 NativeScript 的方案：构建时扫描 SDK 头文件生成元数据，运行时用 libffi 和 ObjC 运行时动态调用
- 纯 ObjC 运行时动态桥接：不需要元数据，但拿不到 C 函数、枚举、常量
- 手写绑定：简单可控，但覆盖面有限

命名空间和全局对象已经定了（见第 3 节和 [API 文档](api/application.md)），线程语义也定了（JS 在主线程，见第 3 节）。

**已定的两条**（2026-11-07 确认，开始做 `UIView` 的几何与层级之前定的，因为这两条一旦写进 JS 代码就改不动了）：

**1. 方法名映射：第一段 + options 对象。** selector 的第一段做方法名，其余段作为 options 对象的键，键名就是 ObjC 的段名原文：

```js
view.addSubview(box)                              // addSubview:
view.insertSubview(box, { atIndex: 0 })           // insertSubview:atIndex:
view.insertSubview(box, { belowSubview: other })  // insertSubview:belowSubview:
view.convertPoint(p, { toView: other })           // convertPoint:toView:
view.convertPoint(p, { fromView: other })         // convertPoint:fromView:
```

这样看 Apple 文档能直接写出调用，重载也自然消歧——只取第一段的方案在 `convertPoint:toView:` / `convertPoint:fromView:` 上就会撞，而且就撞在 `UIView` 里。和[原则 6](#原则)（options 对象，不是长参数列表）一致。

不漂亮的地方是参数同质的构造类方法：`UIColor.colorWithRed(1, { green: 0, blue: 0, alpha: 1 })`。但这类方法上层已经用字符串绕开了（见 [`UIColor` 文档](internals/ui-color.md#上层怎么写颜色已实现而且结论改过一次)），JS 开发者基本不碰；要原样调用还有 `send(selector, ...args)` 兜底。

**2. 结构体：JS 类 + 只读字段。** `CGRect` / `CGPoint` / `CGSize` 等做成 JS 类，实例上同时提供嵌套访问和扁平访问，字段**写入即抛**：

```js
box.frame = new CGRect(40, 100, 200, 120);
box.frame.x;            // 40
box.frame.origin.x;     // 40  ← 和 ObjC 的 {CGPoint origin; CGSize size;} 对得上
box.frame.x = 10;       // TypeError
```

写入即抛是关键。ObjC 里 `view.frame.x = 10` 是编译错误（不能改返回的临时结构体），用普通对象表示的话它会变成**静默无效**——我们一路在拒绝的那种错。

注意这里**不能用 `Object.freeze`**：冻结对象的赋值只在严格模式下抛，而用户的 `main.js` 是普通脚本（sloppy），冻结反而会静默失败。实现用的是逐字段抛异常的取值器加 `Object.preventExtensions`。代价是每次读 `frame` 要建一个对象，jitless 下有成本，正确性优先。

**3. 枚举：一律用字符串。**（唯一的例外是 `WebSocket.readyState`，见 [network.md](internals/network.md#readystate-为什么破了枚举规矩)——只有「Web 原样兼容本身就是这个 API 的主要价值」时才破例） 名字是 ObjC 常量去掉类型前缀、首字母小写；位掩码用字符串数组；认不出的值直接抛，不静默忽略也不退回默认值。

```js
label.textAlignment = 'center';            // NSTextAlignmentCenter
view.contentMode = 'scaleAspectFit';       // UIViewContentModeScaleAspectFit
view.autoresizingMask = ['flexibleWidth', 'flexibleHeight'];   // 位掩码（未实现）
```

和已有的 `scene.activationState` / `application.state` 一致。

参数位的枚举（`UIFont.systemFontOfSize(17, { weight })`）和属性位一样抛。Web 在这一点上自己就是分两套的——CSS 属性值给错了静默保持原值，而 Web IDL 的 enum 参数（`Request` 的 `mode`、`animate` 的 `fill`）一律抛 `TypeError`。我们的 options 键在形状上就是后者。实测对照记在[枚举文档](internals/enums.md#为什么不学-css)。

**名字 ↔ 数值的映射只能放在原生层**：`NSTextAlignment` 的数值随 ABI 变（`TARGET_ABI_USES_IOS_VALUES`——iOS 上 `Center` 是 1，macOS 上是 2），JS 里按数组下标映射换个平台就全错。为此 `write_property` 改成返回 `bool`：原生层查不到名字就返回 `false`，JS 据此抛异常。写不进去又不报错是最难查的那种错。

**别名：写入全认，读出给主名。** 已经撞上两次（`UIStackViewAlignment` 的 `Top = Leading`、`UIBarButtonItemStyle` 的 `Done = Prominent`），所以**新加枚举前先扫一眼头文件里有没有 `= 另一个值` 的写法**——`NACRE_ENUM_MAP` 的反查用无序字典，碰上别名会给出不确定的答案。 `UIStackViewAlignment` 里 `Top = Leading`、`Bottom = Trailing`，一个数值两个名字。两个名字都要认（照 Apple 文档写 `.top` 不能抛），但读出来只能有一个确定答案——这类枚举**不能用无序字典做反查表**，否则同一个进程里两次读可能不一样。实现改用有序的 pairs，主名在前。主名取头文件里被赋值的那一侧（`Top = Leading` ⇒ 主名是 `leading`）。

**平台的哨兵常量也用字符串。** `UIStackViewSpacingUseSystem` 是 `FLT_MIN`、`UseDefault` 是 `FLT_MAX`，它们是**令牌不是数量**。让 JS 写 `1.1754943508222875e-38` 不现实，硬编进 JS 换个 CGFloat 宽度就全错，所以映射同样留在原生层：`spacing = 'system'`。代价是这类属性的类型成了 `number | 'system'`。

详见 [枚举文档](api/enums.md)。

还剩三个设计点（推荐方案，未确认）：

1. 创建与继承：`new X()` 等于 `alloc().init()`；继承原生类用 ES class
2. 其余类型转换：字符串、数字、布尔值自动转换；数组和字典作为参数时自动转换，返回值保留原生对象；`NSError **` 转为抛出异常
3. ~~类型来源~~：**已定并实现**，见下面「类型定义」一节。目录是 `types/` 不是 `ios/Types/`

**接口设计要回头 review（TODO）**：底层的「一一对应」和使用场景的简洁之间有张力。现在让窗口显示出来是三步仪式——建 window、设 `rootViewController`、`makeKeyAndVisible()`——每个 App 都要原样抄一遍（第四步「保持引用」已经被所有权镜像去掉了），这正是原则 2「能力导向而非实现导向」要消灭的东西。

真正的简化应该在**上层**（比如一行 `scene.rootViewController = vc`，窗口由运行时自己建），但上层抽象要等 hello world 跑通、看清视图层该怎么抽象之后再设计，现在造容易造歪；而且在 `UIWindowScene` 上加 ObjC 没有的属性会把上层掺进底层，那个边界糊了很难收回。

期间底层已经做了一次不发明 API 的简化：`new UIWindow(scene)` 的参数改为可选，`windowScene` 首次赋值兼做创建时机，让构造和绑定解耦。

review 时参考 **Phaser** 的对象模型，有三点和我们正在纠结的问题直接对应：

1. **实例化和启动是分开的**。Scene Manager 持有 scene 实例，「start 一个 scene」和「创建这个 scene 对象」是两件事，所以 scene 可以重启而不重建对象。这正是「JS 对象实例化 ≠ 原生对象实例化」那条，我们在 `UIWindow` 上已经做了一半（`windowScene` 首次赋值才创建原生对象）
2. **初始化用生命周期方法而不是构造函数**。Phaser 3 的 Scene 用 `init` / `preload` / `create` / `update`，构造函数只负责建 JS 对象。他们的论坛专门有一帖解释为什么不用构造函数——和我们「构造时要不要立刻创建原生对象」是同一个问题
3. **全局管理器 vs 场景级系统的分层**。texture / cache / sound 是跨场景共享的，display list / cameras / input / tweens 是每个场景一份。这和我们 `application`（App 级）vs `scene`（每窗口）的分工高度相似，可以对照着看我们的边界划对了没有

Phaser 的 Scene 还有一套明确的状态机（PENDING → INIT → START → LOADING → CREATING → RUNNING → PAUSED / SLEEPING → SHUTDOWN → DESTROYED），比我们现在只有 `activationState` 一个枚举细得多，值得看看哪些状态对我们有意义。

参考：[Scenes 概念文档](https://docs.phaser.io/phaser/concepts/scenes)、[Scene Manager 的状态列表](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scenemanager)、[为什么用 init 而不是构造函数](https://phaser.discourse.group/t/why-does-phaser3-use-init-instead-of-the-constructor/6278)。

**已实现：颜色读写都是字符串。** 写入接受字符串（`'#5856D6'`、`'light-dark(#fff, #000)'`、`'systemBackground'`、`'asset(BrandBlue)'`）或 `UIColor` 对象；**读出也是字符串**，合法写入的原样还回来。

字符串是构造的简写，不是颜色的表示法。读出不跟着做成字符串，是因为**要么失败、要么静默丢东西**：图案色会失败（`getRed:green:blue:alpha:` 返回 `NO`，一个分量都拿不到）；动态色转得出来但会降精度——外观不止明暗一维，`accessibilityContrast`、`userInterfaceLevel` 也影响取值，两个样本盖不住，而且丢了不报错。这是取舍不是硬约束，我们选择不接受静默的错。

Web 能双向字符串化是因为 CSSOM 自己留着声明串，我们没有这一层——`UIView` 只存一个 `UIColor`。推导过程见 [`UIColor` 文档](internals/ui-color.md#上层怎么写颜色已实现而且结论改过一次)。

顺带两个事实也记在那边：`UIColor` **不可变**（属性全 `readonly`、无 setter、派生方法返回新对象），所以读出的对象不用防御性复制；但不可变不等于定值——动态色持有的是 `UITraitCollection → UIColor` 的函数，明暗主题挂在**视图层级的 trait** 上，不在颜色上。

连带结论：底层的 `colorWithRed:green:blue:alpha:` 不急——日常写颜色走字符串，它只作为「完整暴露」的承诺留着。

**已实现一半：不可变原生值对象的相等性。** 颜色这一侧的候选 A（按构造参数池化）做掉了——同一个串永远拿到同一个 `UIColor`。剩下的缺口仍在：`UIColor.redColor` 和 `'#f00'` 是两个不同的原生对象。下面是当初的分析。

**TODO：不可变原生值对象的相等性怎么给 JS。** 以颜色为起点，但这是通用问题——所有不可变的「值类对象」（将来的 `NSString`、`CGColor`、`NSNumber`）都会遇到。

现状：主要路径的 `===` 已经成立，因为常量是原生单例、`copy` 对不可变对象返回自己、包装机制保证指针到 JS 对象一对一。缺口只剩**重复构造同值颜色**，以及**常量 vs 构造的同值色**（`UIColor.redColor` 和 `colorWithRed(1,0,0,1)` 实测 `isEqual:` 为 YES 但指针不同）。

两个候选，都不急着做：

| | 做法 | 代价 |
| --- | --- | --- |
| A | `Map<构造参数, WeakRef>`，只池化我们自己构造的颜色 | O(1)、零风险，但盖不住「常量 vs 构造」 |
| B | 新建对象后用 `isEqual:` 和池子里的逐个比，相等就返回池里的、让新对象被回收 | 语义最准（实测 `isEqual:` 连动态色和图案色都处理得对），但**需要一个可遍历的弱集合** |

**B 卡在 JS 上，不是卡在 iOS 上。** `WeakSet` 只有 `add` / `has` / `delete`，不可遍历、也不能按值查；`WeakRef` / `FinalizationRegistry` 同样不可枚举。这是 ECMAScript 的有意设计——遍历弱集合会泄漏 GC 时机。所以 B 要么用强引用的池子（泄漏，且每次构造要跨桥 O(n) 次 `isEqual:`），要么退化成「按 key 查」，而那就是 A。

为了做到 B 去耦合垃圾回收，复杂度和收益不成比例。倾向先做 A，再把 `isEqual()` 作为逃生口暴露出去（从 `NSObject` 继承，一行的事），两个加起来既便宜又没有静默的坑。

实测数据见 [`UIColor` 文档的「实测：相等性和 `description`」](internals/ui-color.md#实测相等性和-description)。真正动手要等视图层起来、看清真实代码里怎么写颜色。

**已定并实现：原生类一律是 final。** `class X extends UIView {}` 在 `new X()` 时抛 `Illegal constructor`，错误信息里点名子类和基类。详见 [API 文档](api/native-classes.md) 和[实现原理](internals/wrapper.md#原生类为什么定成-final)。

定这条的理由**不是继承危险**——子类字段和 `view.myData` 是同一个机制，包装被回收重建时一起丢，而所有权镜像对两者同样有效。理由是**现在做它没有价值**：加字段、加方法、`instanceof` 分派组合全都能做（`app/src/pages.js` 的 `makePage()` 就是），继承真正多出来的只有「覆写原生方法」，而那是 M2。支持继承但不支持覆写，等于把组合已经能给的东西换个写法。

**改之前有一半其实是能继承的**，这才是最坏的地方：`UILabel` / `UIStackView` 这些叶子类完全能用，`UIView` / `UIControl` / `UIButton` / `UIViewController` **构造静默成功**、读属性才抛「还没连接到场景」，而 `tsc` 实测**零报错**。编辑器全绿、构造成功、错误指向几十行外无关的地方。

那四个类带闸的理由和「支不支持子类」无关：`UILabel extends UIView` 的 `super()` 会建一次 `UIView`，`UILabel` 再建一次，第二次定义 `kHandle` 直接抛 `Cannot redefine property`。**闸是为了防重复构造。** 那条隐规则是「被另一个运行时类继承就加闸」，没有任何东西检查，已经漏过一次（5a 的 `UINavigationController`）、抄错过一次（`UIButton` 那道闸没有任何类继承它）。

现在闸吃进了 `constructNative(this, new.target, 'UILabel', [])`——每个可构造的类都是这一行，没有要判断的东西，类名只出现一次。「不许继承」只拦 `NSObject` 一处，因为所有原生类的构造链都经过它。

**拦不到 `class` 那一行本身**：JS 没有「拒绝被继承」的钩子，`extends` 只是读 `prototype` 再 `setPrototypeOf`。TypeScript 也表达不了 `final`（「可以 `new`、不可以 `extends`」只能一起开或一起关），所以类型层仍然是绿的。

**顺带删掉了 `allowNativeConstruct`。** 包装工厂原来靠这个全局布尔量让构造函数放行，而布尔量**不可重入**；一旦卡在 `true`，之后每个 `new` 都静默返回空壳，全局、永久、无声。查下来工厂调 `new Cls()` 的唯一作用是让 `EventTarget` 挂上 `kListeners`，所以工厂改成 `Object.create(Cls.prototype)` + 共用的 `initWrapper`，19 处引用全删。这也正是 Web 的 upgrade 做法。

**真正支持继承推到 M2**，那时**必须**连包装生命周期一起解决：覆写了 `layoutSubviews` 的包装如果被重建成基类，覆写直接失效，比丢个字段严重得多。

**没堵上的是那个静默失败**：对象参数没有句柄时应该抛，不该当成 nil。和下面「属性名拼错了不报错」是同一类错。

**已实现：所有权边有机械检查了。** `check-api.sh` 新增一节：**原生层说哪些 selector 收对象参数，JS 侧对应的方法就必须出现 `own` / `ownOne` / `ownAll` / `nativeSetOwned` 之一，否则登记进 `OWNERSHIP_EXEMPT`**。白名单今天 8 条，每条都写了为什么（只读不持有、参数本来就已经被别的边持有、或者是解除持有）。四类弄坏法都验过，见[包装机制](internals/wrapper.md#这条已经变成机械检查)。

**TODO：颜色解析的性能还没实测。** 现在解析在 JS 侧，靠池化摊掉——同一个串只解析一次，之后是 `Map.get` + `WeakRef.deref`。而**过桥写属性那一次省不掉**，所以稳态成本里解析接近零；把解析挪到原生反而会让重复字符串每次都过桥。但**首次解析在 jitless 下到底多少微秒没量过**。先给验收用例加一条基准，有数再谈优化。WebAssembly 这条路不通——lite mode / jitless 下编译不了 wasm。

**TODO：`check-api.sh` 的标量核对是按名字的并集，不分类。** 做输入框时咬了一次：`textAlignment` 只在 `UILabel` 分支接了原生，`UITextField` 漏了，而名字在集合里所以脚本没报，运行时才抛，连带整个 `sceneconnect` 中断、黑屏。同一家的还有「标量接了不等于对象属性也接了」——那是另一条通道。要改成按类比对，得先让脚本知道每个分支属于哪个类。

**已实现：对象参数类型不对会抛。** 原来 `view.addSubview(UIColor.redColor)`、`NSLayoutConstraint.activateConstraints([1, 2, 3])`、`label.font = 'Helvetica'` 都是什么都不发生也不报错。现在统一按 Web IDL：对象不转换，不是要求的那个类就抛 `TypeError`；本来就可空的参数和属性传 `null` 照常。见[参数转换](internals/conversion.md#第-5-步对象参数不转换类型不对就抛)。

**TODO：`layer` 上的颜色读两次不相等。** `borderColor` / `shadowColor` 在 ObjC 里是 `CGColorRef`，桥上用 `colorWithCGColor:` 包成 `UIColor`，而它**每次新建一个对象**（实测两次指针不同）。于是包装机制「同一个原生指针永远同一个 JS 对象」的保证在这里失效。

底下的 `CGColor` 指针是稳定的，所以补法是按 `CGColorRef` 缓存 `UIColor`。不急：日常不会拿边框色做 `===`，而且真要补也等 `UITraitCollection` 一起（动态色定死是同一个根因，见 [`CALayer` 文档](internals/ca-layer.md)）。

**TODO：属性名拼错了不报错。** 原生对象的 JS 包装对象是**可扩展**的，所以：

```js
view.backgroundColour = 'red';   // 英式拼法，悄悄挂在 JS 对象上，什么都不会发生
```

JS 侧的属性是一个个显式定义的取值器，名字不认识的赋值压根不过桥——原生层那句「没有这个可写属性」现在触发不到。这和只读属性静默失败是同一类错，但**严格模式救不了它**：给一个可扩展对象加新属性，ECMAScript 认为是完全合法的。

要堵只能靠 `Object.preventExtensions`，而那是个真实的取舍：JS 开发者习惯往对象上挂自己的数据（`view.myData = {...}`），禁止扩展就挂不了，连 ES 子类的 `this.xxx = ...` 也一起挡掉。候选是给原生对象留一个专门的地方放用户数据，或者干脆接受这个缺口。

和[子类化原生类](#待讨论的设计问题)那条相关，一起定。

**TODO：订阅按事件名分流，而不是按类分流。** 现在 `setSubscription:` 是按对象的类挑分支的，于是两个问题：

- **原生类上只能用它自己认识的事件名**，Web 里合法的「在任意 EventTarget 上挂自定义事件」做不到。好处是打错名字当场报，坏处是没有逃生口
- **被模态呈现的 `UINavigationController` 收不到关闭事件**——它的分支只认导航事件，`willdismiss` 那三条过不去

两个都是同一个根因。改法是先按事件名查一张总表，再决定交给哪个 trampoline。做 5c 时撞出来的。

**TODO：`check-api.sh` 不核对「对象数组」那条通道。** 它只比标量读写和对象读写两栏，所以 `colors`、`sublayers`、`viewControllers`、`values`、`timingFunctions`、`animations` 这些**三边都没人盯着**——原生层删一个、JS 侧漏一个，脚本一声不吭。这是早就存在的缺口（`sublayers` 那会儿就有了），做 A6-2 时又宽了三条。补法和已有的两栏一样：从 `ReadXxxObjectArray` / `WriteXxxObjectArray` 里按正则收名字，和 `nativeGetObjectArray` / `nativeSetObjectArray` 的调用点以及 d.ts 对。

**TODO：内存警告没转给 V8。** `UIApplicationDidReceiveMemoryWarningNotification` 现在只转成 JS 的 `memorywarning` 事件（`NacreRuntime.mm`），而 `Isolate::MemoryPressureNotification(MemoryPressureLevel)` **全仓库零调用**。也就是说系统喊内存不够时 V8 完全不知情，不会因此收一次内存——我们现在只有 `kCFRunLoopBeforeWaiting` 那条空闲增量 GC。Chrome 在这个信号上是会通知 V8 的。改动很小（一行转发），但 `kModerate` / `kCritical` 怎么映射要定一下，所以算新增能力，要走一遍 SOP。不要紧，排在后面。

连带的一条事实：**V8 的内存我们一个字节都没限。** `Isolate::CreateParams` 只设了 `array_buffer_allocator`，`constraints` 是默认构造的（`max_old_generation_size_` 等全是 0，`stack_limit_` 是 nullptr），也没有任何地方调 `SetFlagsFromString`。传 0 的含义是让 V8 按设备物理内存自己算，**算出来多少没量过**——要知道得调 `GetHeapStatistics().heap_size_limit`，那个没暴露。

**TODO：`layer.transform`（`CATransform3D`）还没暴露。** `UIView.transform`（`CGAffineTransform`）已经做了，见[结构体文档](api/structs.md#cgaffinetransform)。剩下 3D 的那一半：16 个字段，而且 `m34` 那种透视参数单靠结构体不好用，要和动画一起看。

> 记这条 TODO 时担心的「C 函数怎么暴露」**在仿射变换这里没出现**：`CGAffineTransformMakeScale` 那几个全是纯算术，静态工厂在 JS 里算就行，过桥的只有六个数。判据记在[实现原理](internals/structs.md)里——**C 函数只在值类型上做算术就在 JS 侧实现，真要跨桥的是会碰系统状态的那些**。

**已定并实现：`CALayer` 按它自己的面暴露。** 第 3d 步定的是「只暴露 `UIView` 上没有的」（圆角、边框、阴影），重叠的 `opacity` / `backgroundColor` / `masksToBounds` / 几何 / `isHidden` 一个都不开。**独立子图层一来这条就守不住了**——渐变层要 `masksToBounds` 配圆角，纯色块要 `backgroundColor`，所有子图层都必须有 `frame`，而 view 在这些图层上没有对应物。属性定义在类上，开了之后 `view.layer.opacity` 也跟着有。

所以改成：`CALayer` 按自己的面暴露，文档里指明「view 自己那一层请用 view 的写法」。这里的「两种写法」不是真的二选一，它们服务的是两类不同的对象。

**TODO：视图布局变化没有通知。** 子图层不走 Auto Layout 是 **iOS 的事实**，不是我们的缺口——`CALayer.autoresizingMask` 和 `layoutManager` 在 iOS 上都标着 `API_UNAVAILABLE(ios)`，`CAConstraintLayoutManager.h` 整个文件也是。原生 App 在 `layoutSubviews` 里手写子图层的 frame。

于是 JS 侧现在只能在自己知道布局变了的时候重设一次，**系统驱动的重新布局（旋转、动态字体、键盘）跟不上**。三条路：覆写 `layoutSubviews`（M2）、`+layerClass`（M2）、**KVO 监听 `view.layer.bounds` 做成 `layoutchange` 事件（不需要 M2）**。第三条该单独走一遍 SOP——它是新发明一个事件，而且 KVO 在布局动画期间的时序没实测过。

**TODO：JS 读不到屏幕的 scale。** 做 A5-1 时撞出来的：`CALayer.contentsScale` 默认是 1，**实测连 `view.layer` 在场景接入时也是 1**，所以它当不了屏幕 scale 的替代品。而 `UIScreen` 没暴露、`UITraitCollection.displayScale` 也没有，于是自己建的图层要高清光栅化只能把 3 写死在 JS 里。跟下面那条一起补。

**TODO：`UITraitCollection` 还没暴露。** 这一条挡着三件事：

- JS 读不到当前是深色还是浅色、文字大小是多少、对比度设置
- JS 收不到外观变化的通知，没法自己做判断（换图、换布局）
- `overrideUserInterfaceStyle` 写不了，局部强制深浅做不到

**注意区分**：动态色和动态字体本身**不需要** JS 做任何事——`view.backgroundColor = UIColor.systemBackgroundColor` 之后，深色模式切换时 UIKit 自己重新解析并重绘；标签跟随文字大小靠 `UILabel.adjustsFontForContentSizeCategory` 这个属性。trait 事件服务的是**JS 自己要对外观做反应**的场合，不是颜色和字体的刷新。

另外四个来自第 0 步的待定问题：

- **本地化（`Intl`）怎么补**：预编译的 V8 不带 ICU，`Intl` 缺失且 `toLocale*` 退化成非本地化实现。三条路——换带 i18n 的 V8 构建（ICU 数据几 MB 到几十 MB，包体积涨得多，还得自己编译）、JS 层 polyfill（同样要带 locale 数据，而且慢）、把 `NSDateFormatter` / `NSNumberFormatter` 暴露给 JS（数据来自系统，包体积零增长）。倾向第三条，它和第 1 节「原生 API 完整暴露给 JS」的定位一致，和能力暴露方案一起定。

- **原生对象和循环引用怎么打印**：第 1 步出现原生对象之后，`JSON.stringify` 这条路就没有意义了（`UIView.superview` 这类天然循环）。和能力暴露方案一起定。
- ~~**未处理拒绝的结算是否再延一轮任务**~~：**已定，对齐 Chromium**。做定时器时顺带定了：`FlushRejections` 从「微任务检查点后当场跑」改成「排到宿主队列尾部」，于是 `setTimeout(() => p.catch(...), 0)` 补的 handler 来得及抑制上报。代价是队列忙时上报会被推后，Chromium 也接受了这个代价。详见 [定时器文档](internals/timers.md#未处理拒绝的结算被推后了)。
- ~~**JS 层的未处理拒绝钩子**~~：**已实现**。采用 Web 命名，`application` 上的 `unhandledrejection` 和 `error` 事件，事件对象是 `PromiseRejectionEvent` / `ErrorEvent`，可 `preventDefault()` 抑制运行时的默认日志。详见 [API 文档](api/application.md)。还没做的是 `rejectionhandled`（已上报之后才挂 handler 时发出的更正）。
