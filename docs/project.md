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
| 运行时 | V8 初始化、JS 线程、线程切换、内存管理 |
| 能力暴露 | 把 iOS API 暴露给 JS 的桥接代码 |

**不允许**出现在原生层：界面创建、页面跳转、网络请求、数据处理等任何决定"App 做什么"的代码。

每一步的验收标准都包括：**功能可用，并且原生层没有新增任何调度代码，只新增了能力暴露代码。**

## 2. iOS 技术选型（已确定）

| 方面 | 选型 |
| --- | --- |
| 系统与设备 | iOS 26+，只支持 iPhone，只支持 arm64（真机和 Apple Silicon 模拟器），Xcode 26+ |
| JS 引擎 | V8 14.9.207.39，使用 [NativeScript/v8-buildscripts](https://github.com/NativeScript/v8-buildscripts) 发布的预编译静态库；lite mode 构建，即 jitless。**不要传 `--jitless`**（只读标志，设置会崩溃） |
| V8 获取方式 | `ios/scripts/fetch-v8.sh` 下载并校验 SHA256，放到 `ios/Vendor/v8`，不提交 |
| 线程模型 | JS 运行在独立线程（8MB 栈，裸任务队列，不挂 run loop），所有 V8 操作只在 JS 线程上执行；UIKit 只在主线程调用；**主线程永远不同步等待 JS**；每一轮任务由 iOS 层包一个自动释放池 |
| UI 框架 | UIKit（不用 SwiftUI 作为渲染目标；需要 SwiftUI 组件时通过 `UIHostingController` 嵌入） |
| 排版 | iOS 原生方式：Auto Layout 约束、UIStackView、CALayer 属性。**不实现 DOM、CSS、flexbox** |
| 加载模型 | JS 在构建时打进 App Bundle，启动时从本地读取。不通过 HTTP 加载，没有 URL、origin、`location`、`history` |
| 模块化 | 运行时只负责执行 JS 文件，模块化和打包交给社区工具 |
| 工程管理 | XcodeGen：`ios/project.yml` 描述工程，`Nacre.xcodeproj` 由它生成，不提交 |
| 代码分层 | Swift：启动壳；ObjC++：运行时入口和 iOS 桥接；C++：引擎封装（`Runtime/Engine/` 只依赖 V8，不依赖 iOS） |
| 生命周期 | 只使用 Scene 生命周期 |
| 暂不考虑 | 插槽、CLI、开发模式、启动屏、iPad、Mac Catalyst，以后按需再做 |

### JS 线程为什么不挂 run loop

JS 线程用的是条件变量 + 任务队列，相当于 Chromium 的 `MessagePumpDefault`。Chromium 的做法是「自己的任务队列 + 可插拔的 pump」；在 macOS 上它给渲染进程主线程（跑 V8 的那个）选的确实是 `MessagePumpNSRunLoop`，原因写在 `content/renderer/renderer_main.cc` 的注释里：Cocoa 绘制滚动条要靠 NSTimer，需要 Foundation 级别的循环。

逐条核对步骤 0–11，Nacre 的 JS 线程没有这个需求：

- `NSURLSession`（第 5 步）的回调投到 session 自己的队列，不要求调用线程有 run loop
- `setTimeout` 只需要给任务队列加延时任务（`wait_until`），不需要 run loop
- UIKit 全部在主线程，不相关
- `CLLocationManager`（第 10 步）确实要求所在线程有 run loop，但它可以在主线程创建，回调再切回 JS 线程

反过来，CFRunLoop 是可重入的：嵌套的 run loop 会在 JS 调用栈中间执行队列里的其他任务，破坏「JS 线程串行执行 JS」。裸队列没有这个问题。

**判据：只有当某个要暴露的能力必须在有 run loop 的线程上工作、且无法放到主线程时，才把 JS 线程改为 run loop 支撑。** 目前步骤 0–11 中没有这样的能力。

自动释放池不依赖这个选择：没有 run loop 就没有系统提供的池，所以由 iOS 层给每一轮任务注入 `@autoreleasepool`。React Native 在 `RCTMessageThread.mm` 里给每轮 run loop 包池、Chromium 在 message pump 里给每个 work item 建池，都是同一个做法。`JSThread` 通过 `TaskScope` 接收这个包装，`Runtime/Engine/` 仍然只依赖 V8。

### 当前 JS 全局环境（2026-11-07 实测）

`globalThis` 上有 65 个自有属性，且**全部不可枚举**（ECMAScript 的规定）。所以 `Object.keys(globalThis)` 返回空数组不代表环境是空的，要用 `Object.getOwnPropertyNames` 才看得到。

**有**：完整的 ES 标准库，而且版本相当新——`Iterator`（迭代器辅助方法）、`DisposableStack` / `AsyncDisposableStack` / `SuppressedError`（显式资源管理）、`Float16Array`、`Atomics`、`SharedArrayBuffer`、`WeakRef`、`FinalizationRegistry` 都在。`Promise` 和微任务队列正常工作。`eval` 和 `new Function` 在 jitless 下走解释器，照常可用。

**唯一的非标准全局是 `console`**，由运行时装入。

**没有**（都要靠后续的能力暴露来补）：

| 缺什么 | 原因 |
| --- | --- |
| `setTimeout` / `setInterval` / `queueMicrotask` | 不是 ECMAScript 的一部分，由宿主提供；V8 只实现语言本身。JS 线程的任务队列加延时任务即可实现，不需要 run loop |
| `fetch`、`URL`、`TextEncoder`、`crypto`、`performance`、`structuredClone`、`AbortController` | 同上，都是 Web 平台 API |
| `process`、`require`、`module`、`Buffer` | Node 的宿主 API |
| `Intl`，以及所有 `toLocale*` 的本地化能力 | 预编译包关掉了 i18n 支持，ICU 被排除。实测 `new Date(0).toLocaleString('zh-CN')` 完全忽略 locale |
| `WebAssembly` | lite mode / jitless 下不能编译 wasm |

## 3. Android 扩展计划（未开始，仅记录方向）

iOS 的功能清单完成后再开始 Android。以下是目前的方向，开始前需要按 SOP 重新讨论确认：

| 方面 | 计划 |
| --- | --- |
| 目录 | 仓库根目录新建 `android/`，与 `ios/` 平级，同样是运行时源码 |
| JS 引擎 | 同一版本的 V8：v8-buildscripts 同时发布了 Android 的预编译库（arm64-v8a 等） |
| 引擎复用 | `ios/Runtime/Engine/` 是纯 C++，只依赖 V8。开始做 Android 时把它抽到公共目录（如 `core/`），两端共用 |
| 能力暴露 | Java/Kotlin 有反射机制，和 ObjC 运行时一样可以动态调用，思路可以对应 |
| 排版 | 同样按 Android 原生方式（View 体系、ConstraintLayout），不做跨平台布局抽象 |
| JS 命名空间 | Android 能力放在 `android.*` 下，与 `ios.*` 平级 |
| 双端统一 | 由 JS 层（或社区库）自己处理，运行时不强制统一 |
| JS 代码 | 同一份业务 JS，按平台分支调用各自的原生能力 |

## 4. 目录约定

```
nacre/
├─ .claude/           AI 协作规则（CLAUDE.md）
├─ README.md
├─ docs/              项目说明（project.md，本文件）和设计文档
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

## 5. 开发流程 SOP

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

## 6. 进度

### 功能清单

每一项是一步、一个 commit。顺序从简单到复杂，开始每一项前都要按 SOP 讨论确认。

| 步骤 | 功能 | 会需要暴露的能力 | 状态 |
| --- | --- | --- | --- |
| 0 | 搭建 iOS 工程：App 启动、V8 启动、全局对象 `console`、执行 `main.js` 输出 hello world | — | 已在模拟器验证通过，提交前审阅已完成，待提交 |
| 1 | 窗口和根页面由 JS 创建 | 场景事件转发、UIWindow、UIViewController、UIColor | 待讨论 |
| 2 | 文字、图片 | UILabel、UIImageView、Auto Layout | 待讨论 |
| 3 | 按钮和点击事件 | Target-Action、JS 回调 | 待讨论 |
| 4 | 页面跳转 | UINavigationController、继承 UIViewController | 待讨论 |
| 5 | 网络请求 | `fetch`（基于 NSURLSession） | 待讨论 |
| 6 | 本地存储 | UserDefaults、文件读写 | 待讨论 |
| 7 | 列表 | UICollectionView、DataSource（同步回调） | 待讨论 |
| 8 | 输入框和键盘 | UITextField、keyboardLayoutGuide | 待讨论 |
| 9 | 动画和手势 | Core Animation、手势识别器 | 待讨论 |
| 10 | 系统能力 | 相机、相册、定位、权限请求 | 待讨论 |
| 11 | App 生命周期 | 前后台切换、深链接 | 待讨论 |

注意：第 0 步中的 `App/RootViewController.swift` 由原生创建根页面，不符合第 1 节的边界。第 1 步会把它移到 JS 中。

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

1. **AI 规则文件有两份且互相矛盾**：根目录的 `claude-rules.new.md` 是 `.claude/CLAUDE.md` 的草稿，两者对「AI 能不能执行命令」的说法相反。已用草稿替换正式文件并删除草稿——保留的是允许在 Claude Code 中执行构建运行类命令、但改变仓库状态的命令需先征得同意的那一版，与第 5 节第 6 步一致。
2. **根 `README.md` 与本文件冲突**：它描述了 `nacre.json`、`nacre ios --out ./ios` 这样的 CLI 用法（第 2 节里 CLI 是「暂不考虑」，第 4 节明确禁止把生成产物命名为 `ios/`），还把 `ios/` 说成 Swift Package。已按当前决策重写。
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

JS 层结构的六个设计点（目前的推荐方案，未确认）：

1. 命名空间：所有原生 API 放在扁平的 `ios.*` 下
2. 方法名映射：selector 各段拼接，如 `insertSubviewAtIndex(view, 0)`，另保留 `send(selector, ...args)` 兜底
3. 创建与继承：`new X()` 等于 `alloc().init()`；继承原生类用 ES class
4. 线程语义：JS 线程同步切换到主线程执行 UIKit 调用，类型签名保持同步
5. 类型转换：字符串、数字、布尔值自动转换；数组和字典作为参数时自动转换，返回值保留原生对象；结构体按值复制；`NSError **` 转为抛出异常
6. 类型来源：运行时自带的 API 手写；`ios.*` 由 bindgen 从 SDK 头文件生成，TypeScript 定义放在 `ios/Types/`

另外四个来自第 0 步的待定问题：

- **本地化（`Intl`）怎么补**：预编译的 V8 不带 ICU，`Intl` 缺失且 `toLocale*` 退化成非本地化实现。三条路——换带 i18n 的 V8 构建（ICU 数据几 MB 到几十 MB，包体积涨得多，还得自己编译）、JS 层 polyfill（同样要带 locale 数据，而且慢）、把 `NSDateFormatter` / `NSNumberFormatter` 暴露给 JS（数据来自系统，包体积零增长）。倾向第三条，它和第 1 节「原生 API 完整暴露给 JS」的定位一致，和能力暴露方案一起定。

- **原生对象和循环引用怎么打印**：第 1 步出现原生对象之后，`JSON.stringify` 这条路就没有意义了（`UIView.superview` 这类天然循环）。和能力暴露方案一起定。
- **未处理拒绝的结算是否再延一轮任务**：实测 Chromium 152，上报晚于当时已排队的 timer task，`setTimeout(() => p.catch(...), 0)` 补的 handler 能完全抑制上报；HTML 规范只要求在微任务检查点之后。Nacre 现在是微任务排空后就结算，等 JS 线程有了延时任务能力再决定是否向 Chromium 对齐。
- **JS 层的未处理拒绝钩子**：倾向用 Web 的命名（`unhandledrejection` / `rejectionhandled`，`PromiseRejectionEvent` 带 `promise` 和 `reason`、可 `preventDefault()`），而不是 Node 的 `process.on`。等 JS 层有事件机制之后再做。
