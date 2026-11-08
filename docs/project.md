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

**11. 暴露出去的一切用英文，注释用中文。** 判据是「JS 开发者看不看得见」：抛出的 `Error.message`、运行时打的警告和日志、属性名、枚举值、类型定义，全是 API 的一部分，一律英文；源码注释、文档、验收用例的日志是给我们自己看的，用中文。

代码里的标识符也一律用英文——变量、函数、参数、属性名都是。中文只出现在注释、文档和验收用例的输出文本里。

### 怎么用这一节

这是给 SOP 第 1 步（讨论）用的判据。**往后每一步新增能力，都要对照本节说明设计理由**：它属于哪层、职责边界在哪、异步形态是什么、读写和变化通知是否完备、有没有照搬了不该照搬的东西。

## 3. iOS 技术选型（已确定）

| 方面 | 选型 |
| --- | --- |
| 系统与设备 | iOS 26+，只支持 iPhone，只支持 arm64（真机和 Apple Silicon 模拟器），Xcode 26+ |
| JS 引擎 | V8 14.9.207.39，使用 [NativeScript/v8-buildscripts](https://github.com/NativeScript/v8-buildscripts) 发布的预编译静态库；lite mode 构建，即 jitless。**不要传 `--jitless`**（只读标志，设置会崩溃） |
| V8 获取方式 | `ios/scripts/fetch-v8.sh` 下载并校验 SHA256，放到 `ios/Vendor/v8`，不提交 |
| 线程模型 | **JS 运行在主线程**，和 UIKit 同线程，所以同步读布局和同步回调天然成立。主线程栈用链接器参数 `-Wl,-stack_size,0x800000` 设为 8MB（真机默认 1MB，不够 V8 用）。V8 的空闲任务在 run loop 即将等待时执行，做增量 GC。理由和代价见下 |
| UI 框架 | UIKit（不用 SwiftUI 作为渲染目标；需要 SwiftUI 组件时通过 `UIHostingController` 嵌入） |
| 排版 | iOS 原生方式：Auto Layout 约束、UIStackView、CALayer 属性。**不必须实现 DOM、CSS、flexbox**——运行时不提供它们，但也不挡着谁在 JS 层自己做一套 |
| 加载模型 | JS 在构建时打进 App Bundle，启动时从本地读取。不通过 HTTP 加载，没有 URL、origin、`location`、`history` |
| 模块化 | 运行时只负责执行 JS 文件，模块化和打包交给社区工具 |
| 网络 | `NSURLSession` + delegate 两段式。**delegate 队列只投递，重活派到并发队列**——实测 20 个请求每个做 100ms 重活，直接做 2179ms，派出去 166ms。body 的 `arrayBuffer()` 走 `BackingStore` 零拷贝。详见 [fetch 文档](api/fetch.md) |
| URL 解析 | `NSURLComponents` + `standardizedURL`，规范化全在原生层做完。和 WHATWG 有五处已知差异，最要紧的是**没有 base**（我们没有 location）。详见 [URL 文档](api/url.md) |
| 任务调度 | 定时器用「一个最小堆 +（到期时间, 注册序号）排序 + 一个唤醒源」，参考 Chromium 的 MessagePump。一次唤醒最多占用主线程 8ms，超了让出去给渲染。详见 [定时器文档](api/timers.md) |
| 类型定义 | `types/` 下的 `@nacre/types`，手写，靠 `ios/scripts/check-api.sh` 核对三边一致。还没发布到 npm。验证工具用 `npx -y -p typescript tsc`，不写进仓库 |
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
├─ ios/               iOS 运行时源码 + App
└─ android/           以后再加
```

- **`ios/`、`android/` 永远表示运行时源码，必须提交。**
- **`types/` 是对外的交付物，不是源码树的一部分**，所以和 `ios/` 平级而不在它里面：它的使用者是拿 Nacre 写 App 的人，不是改运行时的人。必须提交。
- 以后工具生成的原生工程等产物，放在 `build/` 或 `.nacre/` 下，**不能命名为 `ios/`**，避免和源码混淆。
- `.gitignore` 只忽略生成的和下载的内容，**不能忽略任何源码目录**。根目录的 `.gitignore` 里不能出现平台目录名。

### 文档怎么分

三处，判据是**面向谁**：

| 目录 | 写什么 | 面向谁 |
| --- | --- | --- |
| `docs/api/` | 怎么用、参数、默认值、**效果**、会踩的坑、**ObjC ↔ JS 对照表** | 用 Nacre 写 App 的人 |
| `docs/internals/` | **桥怎么搭的、为什么这么选、实测数据、被否掉的方案** | 改运行时的人 |
| `docs/project.md` | 项目定义、已定的决策、目录约定、SOP、进度、待定的设计问题 | 这个项目本身 |

举三个例子：

- 「`shadowOpacity` 默认 0，不设就看不见」→ **api**。不知道这条就不会用
- 「`CGColorRef` 转 `UIColor` 为什么会丢动态色」→ **internals**。不知道也会用
- 「颜色的上层写法定成字符串」→ **project.md**。这是一个决策，不是实现

**每新增或改动一块能力，`api/` 和 `internals/` 两份一起写。** 只写 api 等于把原理丢了，下次改的人要重新推一遍；只写 internals 等于没交付。这和「改 API 同一步里更新 `types/`」是同一条纪律。

每份 API 文档的骨架：

```
一句话说明 + 最小可用例子
按能力分组讲每个 API（签名、默认值、效果、坑）
属性一览表
和原生的对照表
还没做
→ 末尾一行链到 internals 里的实现原理
```

对照表是**承诺的一部分**：底层说「和 Apple 文档一一对上」，那就要让人能照着 Apple 文档查到 JS 怎么写。

样板见 [`api/ca-layer.md`](api/ca-layer.md) 和 [`internals/ca-layer.md`](internals/ca-layer.md)。

### 文件拆分规则

一句话：**按能力域分文件，一个文件一个域；跨域共用的只放声明，不互相引实现。**

| | |
| --- | --- |
| **什么时候拆** | 单个文件超过约 800 行，或者一个文件里出现了两个互不相干的能力域（比如 URL 解析和视图属性挤在一起）。以先到的那个为准 |
| **按什么分** | 按**能力域**，不按技术分层。「颜色 / 字体 / 图片」是一个域（都是不可变的值类对象），「Auto Layout」是一个域。分发表例外——它天然按通道组织，所以 `Properties` / `Methods` 这样分 |
| **共享的东西往哪放** | 一个内部头文件，**只放声明和跨域要用的类型**。实现文件之间不互相 `#import` |
| **新文件怎么进工程** | 不用管。`project.yml` 收的是 `path: Runtime` 整个目录 |
| **拆完怎么验** | `check-api.sh` 的三边核对数字必须和拆之前一字不差，加上模拟器的全部断言 |

落到目录上：

```
ios/Runtime/
├─ NacreRuntime.h / .mm   启动壳、事件转发、host 接线、fetch、定时器唤醒
├─ Bridge/                能力暴露，一个能力域一个 .mm
│  ├─ NacreBridge.h       内部头，只有声明
│  ├─ NacreConvert.mm     日志、JSON、结构体互转、环境快照
│  ├─ NacreEnums.mm       字符串 ↔ 数值，锚点类名
│  ├─ NacreProperties.mm  属性分发
│  ├─ NacreMethods.mm     方法分发和构造
│  └─ NacreURL.mm         URL 解析
└─ Engine/                纯 C++，只依赖 V8

types/
├─ index.d.ts             入口
├─ nacre.d.ts             运行时自己的 API（跨平台）
├─ ios.d.ts               桶，只有 /// <reference>
└─ ios/                   一个能力域一个 .d.ts
```

**两处暂时不拆，理由写下来免得反复讨论：**

- **`nacre.js`**（2000+ 行）：它是**一个 classic script**，运行时按单文件读取执行。拆开要么靠构建期拼接，要么改成多脚本按序执行——两条都引入新的失败模式（顺序、半加载状态），而现在它一个文件读下来还不难。等引入模块化构建，或者超过约 2500 行，再定
- **`main.js`**：验收用例，按步骤顺序读下来才有意义，拆开反而难读

`ios/` 内部：

| 目录 | 内容 | 是否提交 |
| --- | --- | --- |
| `project.yml` | XcodeGen 工程描述 | 提交 |
| `.gitignore` | 平台相关的忽略规则（根目录的 `.gitignore` 里不能出现平台目录名，所以放这里） | 提交 |
| `App/` | 启动壳：AppDelegate、SceneDelegate | 提交 |
| `Runtime/` | 运行时和能力暴露：`NacreRuntime`（ObjC++ 启动壳与接线）、`Bridge/`（能力暴露，按能力域分文件）、`Engine/`（纯 C++） | 提交 |
| `JS/` | 这个 App 的全部逻辑，入口是 `main.js` | 提交 |
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
   bash ios/scripts/check-api.sh                              # 三边符号核对
   npx -y -p typescript tsc --project ios/JS/tsconfig.json    # 类型检查
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
| — | 定时器：`setTimeout` 系列 + `queueMicrotask` | 到期堆、唤醒源、时间预算 | 已在模拟器验证通过：8 条断言全过，含同时到期的顺序、嵌套不饿死、`clearInterval` 自取消 |
| **M1a** | **异步回调回 JS** | 订阅通道、trampoline 持有 handle、延后一轮派发 | 已在模拟器验证通过：真实触摸走通，一次点击一个 touchDown 一个 touchUpInside |
| **M1b** | **同步回调回 JS** | 重入判定：UIKit 主动调我们才允许同步 | **没有逃生口**，第 8 步列表绕不过去 |
| **M2** | **JS 子类化原生类** | 动态生成 ObjC 子类、方法转发回 JS | **没有逃生口**：覆写 `drawRect:`、`layoutSubviews`、任何 delegate 协议都要它 |
| **M3** | **通用能力暴露**（bindgen） | 从 SDK 头文件生成元数据，运行时动态调用 | **没有逃生口**：不做这个，覆盖面永远追不上，而且手写的三份分发表注定要漂 |
| 4a | `UIControl` 的 16 个控件事件 | 订阅通道、target-action | 已在模拟器验证通过：261 条断言全过，含真机点击 |
| 4b | `UIButton` | `setTitle:forState:`、状态作参数 | 已在模拟器验证通过：按状态设标题/颜色/图，真实点击收到 primaryActionTriggered |
| 4c | first responder | `becomeFirstResponder` / `resignFirstResponder` | 待讨论，和第 9 步绑一起 |
| 5 | 页面跳转 | UINavigationController、继承 UIViewController | 待讨论 |
| 6a | `URL` / `URLSearchParams` / `Headers` | NSURLComponents、WHATWG 语义 | 已在模拟器验证通过：37 条断言全过，和 Chrome 对撞过一批 URL |
| 6b | `fetch` / `Request` / `Response` | NSURLSession、BackingStore 零拷贝 | 已在模拟器验证通过：当初对着本地服务器跑，20 个并发 36ms；验收用例在 3b 改成打公开的 `httpbin.org`，不用再起服务 |
| 6c | `Blob` + `AbortController` 和取消 | NSURLSessionTask.cancel、原生对象包装 | 已在模拟器验证通过：blob 零拷贝、取消、超时中止 |
| 7 | 本地存储 | UserDefaults、文件读写 | 待讨论 |
| 8 | 列表 | UICollectionView、DataSource（同步回调） | 待讨论 |
| 9 | 输入框和键盘 | UITextField、keyboardLayoutGuide | 待讨论 |
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
| 事件对象 | 第一版只有 `type` 和 `target`，**不带触点位置**。要位置等手势那一步 |

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

不漂亮的地方是参数同质的构造类方法：`UIColor.colorWithRed(1, { green: 0, blue: 0, alpha: 1 })`。但这类方法上层已经用字符串绕开了（见 [`UIColor` 文档](internals/ui-color.md#上层怎么写颜色方向已定未实现)），JS 开发者基本不碰；要原样调用还有 `send(selector, ...args)` 兜底。

**2. 结构体：JS 类 + 只读字段。** `CGRect` / `CGPoint` / `CGSize` 等做成 JS 类，实例上同时提供嵌套访问和扁平访问，字段**写入即抛**：

```js
box.frame = new CGRect(40, 100, 200, 120);
box.frame.x;            // 40
box.frame.origin.x;     // 40  ← 和 ObjC 的 {CGPoint origin; CGSize size;} 对得上
box.frame.x = 10;       // TypeError
```

写入即抛是关键。ObjC 里 `view.frame.x = 10` 是编译错误（不能改返回的临时结构体），用普通对象表示的话它会变成**静默无效**——我们一路在拒绝的那种错。

注意这里**不能用 `Object.freeze`**：冻结对象的赋值只在严格模式下抛，而用户的 `main.js` 是普通脚本（sloppy），冻结反而会静默失败。实现用的是逐字段抛异常的取值器加 `Object.preventExtensions`。代价是每次读 `frame` 要建一个对象，jitless 下有成本，正确性优先。

**3. 枚举：一律用字符串。** 名字是 ObjC 常量去掉类型前缀、首字母小写；位掩码用字符串数组；认不出的值直接抛，不静默忽略也不退回默认值。

```js
label.textAlignment = 'center';            // NSTextAlignmentCenter
view.contentMode = 'scaleAspectFit';       // UIViewContentModeScaleAspectFit
view.autoresizingMask = ['flexibleWidth', 'flexibleHeight'];   // 位掩码（未实现）
```

和已有的 `scene.activationState` / `application.state` 一致。

参数位的枚举（`UIFont.systemFontOfSize(17, { weight })`）和属性位一样抛。Web 在这一点上自己就是分两套的——CSS 属性值给错了静默保持原值，而 Web IDL 的 enum 参数（`Request` 的 `mode`、`animate` 的 `fill`）一律抛 `TypeError`。我们的 options 键在形状上就是后者。实测对照记在[枚举文档](internals/enums.md#为什么不学-css)。

**名字 ↔ 数值的映射只能放在原生层**：`NSTextAlignment` 的数值随 ABI 变（`TARGET_ABI_USES_IOS_VALUES`——iOS 上 `Center` 是 1，macOS 上是 2），JS 里按数组下标映射换个平台就全错。为此 `write_property` 改成返回 `bool`：原生层查不到名字就返回 `false`，JS 据此抛异常。写不进去又不报错是最难查的那种错。

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

**上层已经定下来的第一条：颜色怎么写。** 写入接受字符串（`'#5856D6'`、`'light-dark(#fff, #000)'`、`'systemBackground'`）或 `UIColor` 对象，读出永远是 `UIColor` 对象。

字符串是构造的简写，不是颜色的表示法。读出不跟着做成字符串，是因为**要么失败、要么静默丢东西**：图案色会失败（`getRed:green:blue:alpha:` 返回 `NO`，一个分量都拿不到）；动态色转得出来但会降精度——外观不止明暗一维，`accessibilityContrast`、`userInterfaceLevel` 也影响取值，两个样本盖不住，而且丢了不报错。这是取舍不是硬约束，我们选择不接受静默的错。

Web 能双向字符串化是因为 CSSOM 自己留着声明串，我们没有这一层——`UIView` 只存一个 `UIColor`。推导过程见 [`UIColor` 文档](internals/ui-color.md#上层怎么写颜色方向已定未实现)。

顺带两个事实也记在那边：`UIColor` **不可变**（属性全 `readonly`、无 setter、派生方法返回新对象），所以读出的对象不用防御性复制；但不可变不等于定值——动态色持有的是 `UITraitCollection → UIColor` 的函数，明暗主题挂在**视图层级的 trait** 上，不在颜色上。

连带结论：底层的 `colorWithRed:green:blue:alpha:` 不急——日常写颜色走字符串，它只作为「完整暴露」的承诺留着。

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

**TODO：JS 子类化原生类。** 这条原来写的是「`new MyLabel()` 建出来的原生对象是 `UILabel`」，**实测不对**：`UIView` 的构造函数有一道 `new.target !== UIView` 的闸，子类的 `super()` 走到这里直接返回，**一个原生对象都不建**。

所以今天的实际行为是：`new MyLabel()` 得到的实例没有句柄，之后要么 `requireNative` 抛「还没连接到场景」，要么更糟——`parent.addSubview(子类实例)` 时 `splitArgs` 把它当成普通值，句柄填 0，原生收到 nil，**静默什么都不做**。（做所有权镜像时写验收用例撞上的。）

这道闸本身是对的：原生类的构造函数写死了自己的类名，子类的 `super()` 在这里建出一个基类对象只会更错。要真正支持继承，得动态生成 ObjC 子类并把覆写的方法转发回 JS，那才是这条 TODO 的内容。

**没堵上的是那个静默失败**：对象参数没有句柄时应该抛，不该当成 nil。和下面「属性名拼错了不报错」是同一类错。这条和设计点 1「创建与继承」是同一件事。

**TODO：参数类型不对但有句柄 → 静默忽略。** 和「参数没有原生对象」是同一家，上一步只堵了后者。

```js
view.addSubview(UIColor.redColor);      // 什么都不发生，不报错
NSLayoutConstraint.activateConstraints([1, 2, 3]);   // 同上
```

原生侧是 `if (UIView* child = viewArg(0)) [view addSubview:child];`——`viewArg` 对非 `UIView` 返回 nil，于是整句跳过。**`NacreMethods.mm` 里 10 处这种写法**，加上 `activateConstraints:` 里按 `isKindOfClass:` 过滤的那一处，一共 11 处。

类型声明能挡住大部分（`addSubview(view: UIView)`），但运行时不该沉默。改法是让 `viewArg` 一类的取参函数带 `std::string* error` 出参，拿不到就填错误信息——和枚举写错的处理方式一致。

**TODO：`layer` 上的颜色读两次不相等。** `borderColor` / `shadowColor` 在 ObjC 里是 `CGColorRef`，桥上用 `colorWithCGColor:` 包成 `UIColor`，而它**每次新建一个对象**（实测两次指针不同）。于是包装机制「同一个原生指针永远同一个 JS 对象」的保证在这里失效。

底下的 `CGColor` 指针是稳定的，所以补法是按 `CGColorRef` 缓存 `UIColor`。不急：日常不会拿边框色做 `===`，而且真要补也等 `UITraitCollection` 一起（动态色定死是同一个根因，见 [`CALayer` 文档](internals/ca-layer.md)）。

**TODO：属性名拼错了不报错。** 原生对象的 JS 包装对象是**可扩展**的，所以：

```js
view.backgroundColour = 'red';   // 英式拼法，悄悄挂在 JS 对象上，什么都不会发生
```

JS 侧的属性是一个个显式定义的取值器，名字不认识的赋值压根不过桥——原生层那句「没有这个可写属性」现在触发不到。这和只读属性静默失败是同一类错，但**严格模式救不了它**：给一个可扩展对象加新属性，ECMAScript 认为是完全合法的。

要堵只能靠 `Object.preventExtensions`，而那是个真实的取舍：JS 开发者习惯往对象上挂自己的数据（`view.myData = {...}`），禁止扩展就挂不了，连 ES 子类的 `this.xxx = ...` 也一起挡掉。候选是给原生对象留一个专门的地方放用户数据，或者干脆接受这个缺口。

和[子类化原生类](#待讨论的设计问题)那条相关，一起定。

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
