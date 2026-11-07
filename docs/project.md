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
| 设计目标 | 完整、一一对应、不丢能力 | 好用、一致、面向能力 |
| 服务谁 | iOS 开发者的亲切感 | JS 开发者的轻松感 |
| 变化来源 | 跟着 iOS SDK 走 | 我们自己的版本承诺 |

**每遇到一个新能力，第一个问题是「它属于哪层」。** 上层没覆盖的，底层一定要能补上——这是「原生 API 完整暴露」这条承诺的含义。

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
| 排版 | iOS 原生方式：Auto Layout 约束、UIStackView、CALayer 属性。**不实现 DOM、CSS、flexbox** |
| 加载模型 | JS 在构建时打进 App Bundle，启动时从本地读取。不通过 HTTP 加载，没有 URL、origin、`location`、`history` |
| 模块化 | 运行时只负责执行 JS 文件，模块化和打包交给社区工具 |
| 工程管理 | XcodeGen：`ios/project.yml` 描述工程，`Nacre.xcodeproj` 由它生成，不提交 |
| 代码分层 | Swift：启动壳；ObjC++：运行时入口和 iOS 桥接；C++：引擎封装（`Runtime/Engine/` 只依赖 V8，不依赖 iOS） |
| 生命周期 | 只使用 Scene 生命周期 |
| 场景数量 | 运行时**不写死**，配置是什么就读到什么。两个事实都提供给 JS：**声明值**在 `application.info.UIApplicationSceneManifest.UIApplicationSupportsMultipleScenes`，**实际能力**在 `application.supportsMultipleScenes`（＝声明 AND 环境允许；iPhone 上多场景主要靠外接显示器，iPad 是常态）。原生层只提供事实，由 JS 自行判断。当前项目声明为 `false` |
| JS 全局对象 | `globalThis` 保留不动；运行时注入 `Application` 类及其**唯一实例** `application`（单例）。**不叫 `window`**：`UIWindow` 在 iOS 里是真实存在的另一个东西，会撞。详见 [API 文档](api/application.md) |
| 原生 API 命名空间 | **不设命名空间**，按 ObjC 类名裸暴露在全局：`new UIWindow(...)`、`NSString`。理由见下 |
| 暂不考虑 | 插槽、CLI、开发模式、启动屏、iPad、Mac Catalyst，以后按需再做 |

### JS 为什么跑在主线程

最初定的是 JS 跑在独立线程（裸任务队列、不挂 run loop），理由是「JS 不卡 UI」。后来发现这条路和一个更早的决定冲突，必须改。

**冲突点**：本节定了「排版用 Auto Layout，不实现 DOM、CSS、flexbox」。于是：

- 布局引擎在 UIKit 里，只在主线程
- JS 要**同步读布局**（`view.frame`、`sizeThatFits`）就必须在主线程
- **同步回调**同理——`cellForRowAtIndexPath:` 必须立刻返回一个 cell，没有声明式替代

对比三个成熟运行时，分水岭正在这里：

| | 布局引擎在哪 | JS 能不能独立线程 |
| --- | --- | --- |
| React Native（Fabric） | 自己的 Yoga，在 C++ 影子树里 | 能——布局结果在影子树，同线程可读 |
| Chrome | Blink 的布局，和 JS 同线程 | 不需要，本来就同线程 |
| **Nacre** | **Auto Layout，在 UIKit 里** | **不能** |

要在独立线程下同时支持「同步读布局」和「同步回调」，唯一出路是自己实现布局引擎——那推翻的是更早的决定。所以 JS 上主线程。

**代价，都要正视：**

- **jitless 让代价比浏览器大**。我们是 lite mode，只有 Ignition 解释器，没有 TurboFan。浏览器敢把 JS 放主线程是建立在 JIT 之上的。UI 编排代码问题不大，但 App 里一旦有重计算就会卡住界面
- **滚动会跟着卡**。浏览器有合成器线程兜底，JS 卡住滚动照样流畅；iOS 的 `UIScrollView` 滚动是主线程驱动的，没有这个兜底
- **栈**。真机 iOS 主线程栈默认 1MB，刚好卡在 V8 的默认假设上，零余量。用 `-Wl,-stack_size,0x800000` 写进 `LC_MAIN`，实测运行时生效（模拟器上从 8176 KB 变成 8192 KB）。代价是必须关掉 `ENABLE_DEBUG_DYLIB`，否则链接器报「`-stack_size` 只能用于主可执行文件」，Debug 增量构建也会变慢。**真机是否同样生效尚未验证**
- **启动**。V8 初始化实测 10 ms、context 15 ms，直接计入启动耗时

**连带的变化：**

- **空闲 GC 从可选变成必须**。平台初始化改成 `IdleTaskSupport::kEnabled`（默认 `kDisabled`，等于没有空闲 GC），用 `CFRunLoopObserver` 在 `kCFRunLoopBeforeWaiting` 时调 `RunIdleTasks`。Chrome 就是这样在帧间隙做增量 GC 的
- **原来「JS 线程不挂 run loop」的判据作废**。那条写的是「只有当某个能力必须在有 run loop 的线程上工作、且无法放到主线程时才改」，现在 JS 就在主线程上
- **自动释放池不再需要手动包**，主线程 run loop 每轮自带。`JSThread` 整个类已删除
- **影子树降级为优化**。独立线程方案里它是必须的（否则跨线程开销爆炸、同步询问无解）；JS 上主线程后直接操作真实 `UIView` 即可。批量提交仍有价值（减少 layout 次数），但不再是正确性要求

### 事件模型：借什么、不借什么

`EventTarget` 和 `Event` **不是 ECMAScript 的一部分**（实测 `globalThis` 的 65 个内置里没有），要由运行时自己实现并注入全局——这是继 `console` 之后第二个注入的非标准全局。Node 22、Deno、Bun 都提供全局 `EventTarget`，所以它是跨运行时的通用基础设施，引入它不违背「不实现 DOM」。

判据见第 2 节原则 9：**从 iOS 的能力出发，问「这个能力怎么表达最自然」；W3C 的方案是重要的答案来源，但只是来源之一。** 下面是把这条原则落到事件模型上的结果。

| 借 | 不借 |
| --- | --- |
| `addEventListener` / `removeEventListener` / `dispatchEvent` 三个名字和基本语义 | `passive`（为浏览器滚动性能设计，我们没有可阻止的默认滚动） |
| `EventTarget` 作基类，统一 `application`、scene、将来的 view 的接口 | `signal` / `AbortSignal`（牵出一整套规范，而我们连定时器都没有） |
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

实测目前 `globalThis` 上的 65 个内置属性里，没有任何一个以 `NS` / `UI` / `CA` / `CL` / `AV` / `MK` 开头，所以 ObjC 的**类**不会撞。真正要盯的是 C 函数、枚举和常量——它们不一定都有前缀；而且 ECMAScript 以后还会添新的内置名，所以撞名检查要固化进 bindgen，不能只查一次了事。

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
├─ docs/              项目说明和 API 文档
├─ ios/               iOS 运行时源码 + App
└─ android/           以后再加
```

- **`ios/`、`android/` 永远表示运行时源码，必须提交。**
- 以后工具生成的原生工程等产物，放在 `build/` 或 `.nacre/` 下，**不能命名为 `ios/`**，避免和源码混淆。
- `.gitignore` 只忽略生成的和下载的内容，**不能忽略任何源码目录**。根目录的 `.gitignore` 里不能出现平台目录名。

`ios/` 内部：

| 目录 | 内容 | 是否提交 |
| --- | --- | --- |
| `project.yml` | XcodeGen 工程描述 | 提交 |
| `.gitignore` | 平台相关的忽略规则（根目录的 `.gitignore` 里不能出现平台目录名，所以放这里） | 提交 |
| `App/` | 启动壳：AppDelegate、SceneDelegate | 提交 |
| `Runtime/` | 运行时和能力暴露：`NacreRuntime`（ObjC++ 入口）、`Engine/`（纯 C++） | 提交 |
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
4. **实现**：编写代码并写入仓库。写入前先读取仓库中的现有文件，不覆盖用户的改动。
5. **检查**：能检查的先检查，比如 C++ 对照 V8 头文件做语法检查、脚本做语法检查。没有实际运行过的内容，要明确标注"未验证"。
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

| 步骤 | 功能 | 会需要暴露的能力 | 状态 |
| --- | --- | --- | --- |
| 0 | 搭建 iOS 工程：App 启动、V8 启动、全局对象 `console`、执行 `main.js` 输出 hello world | — | 已完成（commit `eba1b23`） |
| 1 | 运行时基础对象：`EventTarget`、`Event`、`Application` 和单例 `application`，以及全局错误出口 | Info.plist、应用状态、App 级通知、未捕获异常与未处理拒绝 | 已在模拟器验证通过，待提交 |
| 2 | 窗口和根页面由 JS 创建 | 场景事件转发、UIWindow、UIViewController、UIColor | 进行中：线程模型已迁到主线程；待做原生对象包装机制、`UIWindowScene` 暴露 |
| 3 | 文字、图片 | UILabel、UIImageView、Auto Layout | 待讨论 |
| 4 | 按钮和点击事件 | Target-Action、JS 回调 | 待讨论 |
| 5 | 页面跳转 | UINavigationController、继承 UIViewController | 待讨论 |
| 6 | 网络请求 | `fetch`（基于 NSURLSession） | 待讨论 |
| 7 | 本地存储 | UserDefaults、文件读写 | 待讨论 |
| 8 | 列表 | UICollectionView、DataSource（同步回调） | 待讨论 |
| 9 | 输入框和键盘 | UITextField、keyboardLayoutGuide | 待讨论 |
| 10 | 动画和手势 | Core Animation、手势识别器 | 待讨论 |
| 11 | 系统能力 | 相机、相册、定位、权限请求 | 待讨论 |
| 12 | App 生命周期 | 前后台切换、深链接 | 待讨论 |

注意：第 0 步中的 `App/RootViewController.swift` 由原生创建根页面，不符合第 1 节的边界。第 2 步会把它移到 JS 中。

### 第 0 步的审阅问题（已修复并验证）

三个问题的修复已写入仓库，并已在模拟器上验证通过（结果见下）：

1. **JS 线程缺少自动释放池**：`JSThread` 增加 `TaskScope`（构造时传入，所以包括 V8 初始化在内的每一轮任务都被覆盖），`NacreRuntime.mm` 注入 `@autoreleasepool`。一轮 = 任务本身 + `after_each_`，整轮在池内。
2. **`console.log(Symbol())` 打不出东西**：原来记的是「会抛异常」，实测不准确——`v8::String::Utf8Value` 的构造函数内部自带 `TryCatch`，`ToString` 抛出的异常在那里就被吞掉了，所以老代码遇到 Symbol 打的是 `<unprintable>`，并不会中断执行。修复的价值在输出质量而不是修崩溃：`console` 的格式化改成三层——按类型分发（undefined / null / 布尔 / 数字 / BigInt / 字符串 / Symbol / 函数 / Error，这一层完全不执行用户代码）→ 对象走 `JSON.stringify` → 兜底的字符串转换。兜底转换和 `stack` 读取都包在 `TryCatch` 里，`ConsoleCallback` 最外层再加一层总保险。**约定：`console.*` 永不向 JS 抛异常。**
3. **未处理的 Promise 拒绝不报错**：注册 `SetPromiseRejectCallback`，维护待定表（`kPromiseRejectWithNoHandler` 登记、`kPromiseHandlerAddedAfterReject` 撤销），在 `Evaluate` 的 `Run` 返回之后和每轮 `PumpMessageLoop` 之后结算，输出 `Uncaught (in promise) …`。`kPromiseRejectAfterResolved` / `kPromiseResolveAfterResolved` 忽略——Node 曾用这两个事件做 `multipleResolves`，因为 `Promise.race()` 这类正常写法会误触发而废弃。

第 0 步明确不做，留给以后：

- `console`：Map / Set / Date / RegExp / TypedArray 的专门格式、循环引用检测、深度与长度截断、嵌套字符串加引号、`%s` 等占位符、`console.table/group/count/time`、颜色、class 识别（统一打成 `[Function: X]`）。循环引用目前走 `JSON.stringify` 失败后的兜底路径，打成 `[object Object]`。
- 未处理拒绝：已上报之后再挂 handler，不会发出「其实已处理」的更正（相当于浏览器的 `rejectionhandled`）。待定表只在一次结算周期内有效，所以用强引用是安全的；要支持延迟更正就需要弱引用和条数上限。

兜底路径拿不到异常原因（`Utf8Value` 已经在内部吞掉），所以转换失败统一打 `<unprintable>`；`SafeToString` 里的 `TryCatch` 作为 V8 行为变化时的保险留着。

`ios/JS/main.js` 里加了这三项的验收用例。原计划提交前删掉，后来决定先留着，开始第 1 步、由 JS 创建界面时再清理。

### 第 0 步的验证结果

2026-11-07 在 iPhone 18 Pro / iOS 27.2 模拟器、Xcode 27.2 上跑通：V8 14.9.207.39 初始化 15.7 ms、context 34.3 ms、`main.js` 68.3 ms，全部验收用例输出与预期一致，日志里没有 `autoreleased with no pool in place` 警告，唯一的 Error 级日志就是预期的那条 `Uncaught (in promise)`。

原先列的三项风险都已排除：预编译 V8 与 Xcode 27 工具链链接正常、XcodeGen 生成的 `App/Info.plist` 处理正确；编译宏一致性的问题在下面的审阅里有了更准确的结论。

环境上有一处变化：**Xcode 27 不再附带 `Simulator.app`**（`Contents/Developer/Applications` 整个目录都没了），模拟器窗口改由 `Contents/Applications/DeviceHub.app`（`com.apple.dt.Devices`）承担。`scripts/run-sim.sh` 原来的 `open -a Simulator` 会报 `Unable to find application named 'Simulator'` 并因 `set -e` 中断，已改成依次尝试这两个应用、都找不到也不影响（`simctl` 不需要 GUI）。

### 提交前的审阅（2026-11-07）

第一个 commit 之前做了一次通读，改掉了四处：

1. **AI 规则文件有两份且互相矛盾**：根目录的 `claude-rules.new.md` 是 `.claude/CLAUDE.md` 的草稿，两者对「AI 能不能执行命令」的说法相反。已用草稿替换正式文件并删除草稿——保留的是允许在 Claude Code 中执行构建运行类命令、但改变仓库状态的命令需先征得同意的那一版，与第 6 节第 6 步一致。
2. **根 `README.md` 与本文件冲突**：它描述了 `nacre.json`、`nacre ios --out ./ios` 这样的 CLI 用法（第 3 节里 CLI 是「暂不考虑」，第 5 节明确禁止把生成产物命名为 `ios/`），还把 `ios/` 说成 Swift Package。已按当前决策重写。
3. **`ios/README.md` 过时**：Xcode / iOS 版本、不存在的 `examples/` 目录、`console` 的旧描述。已重写，并补上 JS 线程和未处理 Promise 拒绝的说明。
4. **`V8Prelude.h` 是空操作，已删除**。实测方式：对同一个 `#include <v8.h>`，加和不加这个前缀头各预处理一次，比对 V8 头文件实际看到的宏。结论是它只多定义 8 个宏，其中 7 个在全部公开头文件里出现 0 次（是编译 V8 自身用的 GN 标志），剩下的 `V8_HAVE_TARGET_OS` 只决定 `v8config.h` 走哪条分支、两条分支结论相同。`V8_TARGET_ARCH_ARM64` 和 `V8_TARGET_OS_IOS` 不加也会被自动推导出来。

**真正决定对象布局的是 `V8_COMPRESS_POINTERS` 和 `V8_ENABLE_SANDBOX`**，这两个宏原来也不在 `V8Prelude.h` 里——它们在这个预编译包中是关闭的，使用方也不定义，两边正好一致。换 V8 构建时必须重新核对这两个宏。相关说明已写进 `Engine.cpp` 的注释和 `ios/README.md`。

另外加固了一处：`fetch-v8.sh` 原来从同一个 release 下载 `SHA256SUMS` 再用它校验 tarball，校验锚点和被校验文件同源，只能发现传输损坏，发现不了 release 资产被替换（GitHub 允许不换 tag 替换 assets）。现在两个预期哈希写死在脚本里，升级 V8 时一起更新。

### 待讨论的设计问题

开始第 1 步前需要先确定能力暴露的方案和 JS 层结构。

能力暴露方案的三个候选：

- 复用 NativeScript 的方案：构建时扫描 SDK 头文件生成元数据，运行时用 libffi 和 ObjC 运行时动态调用
- 纯 ObjC 运行时动态桥接：不需要元数据，但拿不到 C 函数、枚举、常量
- 手写绑定：简单可控，但覆盖面有限

命名空间和全局对象已经定了（见第 3 节和 [API 文档](api/application.md)），线程语义也定了（JS 在主线程，见第 3 节）。JS 层结构还剩四个设计点（目前的推荐方案，未确认）：

1. 方法名映射：selector 各段拼接，如 `insertSubviewAtIndex(view, 0)`，另保留 `send(selector, ...args)` 兜底
2. 创建与继承：`new X()` 等于 `alloc().init()`；继承原生类用 ES class
3. 类型转换：字符串、数字、布尔值自动转换；数组和字典作为参数时自动转换，返回值保留原生对象；结构体按值复制；`NSError **` 转为抛出异常
4. 类型来源：运行时自带的 API（`console`、`application`）手写；原生符号由 bindgen 从 SDK 头文件生成，TypeScript 定义放在 `ios/Types/`

另外四个来自第 0 步的待定问题：

- **本地化（`Intl`）怎么补**：预编译的 V8 不带 ICU，`Intl` 缺失且 `toLocale*` 退化成非本地化实现。三条路——换带 i18n 的 V8 构建（ICU 数据几 MB 到几十 MB，包体积涨得多，还得自己编译）、JS 层 polyfill（同样要带 locale 数据，而且慢）、把 `NSDateFormatter` / `NSNumberFormatter` 暴露给 JS（数据来自系统，包体积零增长）。倾向第三条，它和第 1 节「原生 API 完整暴露给 JS」的定位一致，和能力暴露方案一起定。

- **原生对象和循环引用怎么打印**：第 1 步出现原生对象之后，`JSON.stringify` 这条路就没有意义了（`UIView.superview` 这类天然循环）。和能力暴露方案一起定。
- **未处理拒绝的结算是否再延一轮任务**：实测 Chromium 152，上报晚于当时已排队的 timer task，`setTimeout(() => p.catch(...), 0)` 补的 handler 能完全抑制上报；HTML 规范只要求在微任务检查点之后。Nacre 现在是微任务排空后就结算，等有了定时器能力再决定是否向 Chromium 对齐。
- ~~**JS 层的未处理拒绝钩子**~~：**已实现**。采用 Web 命名，`application` 上的 `unhandledrejection` 和 `error` 事件，事件对象是 `PromiseRejectionEvent` / `ErrorEvent`，可 `preventDefault()` 抑制运行时的默认日志。详见 [API 文档](api/application.md)。还没做的是 `rejectionhandled`（已上报之后才挂 handler 时发出的更正）。
