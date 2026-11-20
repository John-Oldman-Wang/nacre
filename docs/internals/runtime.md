# 运行时

V8 启动、线程、审阅问题和验证结果。

## 第 0 步的审阅问题（已修复并验证）

三个问题的修复已写入仓库，并已在模拟器上验证通过（结果见下）：

1. **JS 线程缺少自动释放池**：`JSThread` 增加 `TaskScope`（构造时传入，所以包括 V8 初始化在内的每一轮任务都被覆盖），`NacreRuntime.mm` 注入 `@autoreleasepool`。一轮 = 任务本身 + `after_each_`，整轮在池内。
2. **`console.log(Symbol())` 打不出东西**：原来记的是「会抛异常」，实测不准确——`v8::String::Utf8Value` 的构造函数内部自带 `TryCatch`，`ToString` 抛出的异常在那里就被吞掉了，所以老代码遇到 Symbol 打的是 `<unprintable>`，并不会中断执行。修复的价值在输出质量而不是修崩溃：`console` 的格式化改成三层——按类型分发（undefined / null / 布尔 / 数字 / BigInt / 字符串 / Symbol / 函数 / Error，这一层完全不执行用户代码）→ 对象走 `JSON.stringify` → 兜底的字符串转换。兜底转换和 `stack` 读取都包在 `TryCatch` 里，`ConsoleCallback` 最外层再加一层总保险。**约定：`console.*` 永不向 JS 抛异常。**
3. **未处理的 Promise 拒绝不报错**：注册 `SetPromiseRejectCallback`，维护待定表（`kPromiseRejectWithNoHandler` 登记、`kPromiseHandlerAddedAfterReject` 撤销），在 `Evaluate` 的 `Run` 返回之后和每轮 `PumpMessageLoop` 之后结算，输出 `Uncaught (in promise) …`。`kPromiseRejectAfterResolved` / `kPromiseResolveAfterResolved` 忽略——Node 曾用这两个事件做 `multipleResolves`，因为 `Promise.race()` 这类正常写法会误触发而废弃。

第 0 步明确不做，留给以后：

- `console`：Map / Set / Date / RegExp / TypedArray 的专门格式、循环引用检测、深度与长度截断、嵌套字符串加引号、`%s` 等占位符、`console.table/group/count/time`、颜色、class 识别（统一打成 `[Function: X]`）。循环引用目前走 `JSON.stringify` 失败后的兜底路径，打成 `[object Object]`。
- 未处理拒绝：已上报之后再挂 handler，不会发出「其实已处理」的更正（相当于浏览器的 `rejectionhandled`）。待定表只在一次结算周期内有效，所以用强引用是安全的；要支持延迟更正就需要弱引用和条数上限。

兜底路径拿不到异常原因（`Utf8Value` 已经在内部吞掉），所以转换失败统一打 `<unprintable>`；`SafeToString` 里的 `TryCatch` 作为 V8 行为变化时的保险留着。

`ios/JS/main.js` 里加了这三项的验收用例。原计划提交前删掉，后来决定先留着，开始第 1 步、由 JS 创建界面时再清理。

## 第 0 步的验证结果

2026-11-07 在 iPhone 18 Pro / iOS 27.2 模拟器、Xcode 27.2 上跑通：V8 14.9.207.39 初始化 15.7 ms、context 34.3 ms、`main.js` 68.3 ms，全部验收用例输出与预期一致，日志里没有 `autoreleased with no pool in place` 警告，唯一的 Error 级日志就是预期的那条 `Uncaught (in promise)`。

原先列的三项风险都已排除：预编译 V8 与 Xcode 27 工具链链接正常、XcodeGen 生成的 `App/Info.plist` 处理正确；编译宏一致性的问题在下面的审阅里有了更准确的结论。

环境上有一处变化：**Xcode 27 不再附带 `Simulator.app`**（`Contents/Developer/Applications` 整个目录都没了），模拟器窗口改由 `Contents/Applications/DeviceHub.app`（`com.apple.dt.Devices`）承担。`scripts/run-sim.sh` 原来的 `open -a Simulator` 会报 `Unable to find application named 'Simulator'` 并因 `set -e` 中断，已改成依次尝试这两个应用、都找不到也不影响（`simctl` 不需要 GUI）。

## 提交前的审阅（2026-11-07）

第一个 commit 之前做了一次通读，改掉了四处：

1. **AI 规则文件有两份且互相矛盾**：根目录的 `claude-rules.new.md` 是 `.claude/CLAUDE.md` 的草稿，两者对「AI 能不能执行命令」的说法相反。已用草稿替换正式文件并删除草稿——保留的是允许在 Claude Code 中执行构建运行类命令、但改变仓库状态的命令需先征得同意的那一版，与第 6 节第 6 步一致。
2. **根 `README.md` 与本文件冲突**：它描述了 `nacre.json`、`nacre ios --out ./ios` 这样的 CLI 用法（第 3 节里 CLI 是「暂不考虑」，第 5 节明确禁止把生成产物命名为 `ios/`），还把 `ios/` 说成 Swift Package。已按当前决策重写。
3. **`ios/README.md` 过时**：Xcode / iOS 版本、不存在的 `examples/` 目录、`console` 的旧描述。已重写，并补上 JS 线程和未处理 Promise 拒绝的说明。
4. **`V8Prelude.h` 是空操作，已删除**。实测方式：对同一个 `#include <v8.h>`，加和不加这个前缀头各预处理一次，比对 V8 头文件实际看到的宏。结论是它只多定义 8 个宏，其中 7 个在全部公开头文件里出现 0 次（是编译 V8 自身用的 GN 标志），剩下的 `V8_HAVE_TARGET_OS` 只决定 `v8config.h` 走哪条分支、两条分支结论相同。`V8_TARGET_ARCH_ARM64` 和 `V8_TARGET_OS_IOS` 不加也会被自动推导出来。

**真正决定对象布局的是 `V8_COMPRESS_POINTERS` 和 `V8_ENABLE_SANDBOX`**，这两个宏原来也不在 `V8Prelude.h` 里——它们在这个预编译包中是关闭的，使用方也不定义，两边正好一致。换 V8 构建时必须重新核对这两个宏。相关说明已写进 `Engine.cpp` 的注释和 `ios/README.md`。

另外加固了一处：`fetch-v8.sh` 原来从同一个 release 下载 `SHA256SUMS` 再用它校验 tarball，校验锚点和被校验文件同源，只能发现传输损坏，发现不了 release 资产被替换（GitHub 允许不换 tag 替换 assets）。现在两个预期哈希写死在脚本里，升级 V8 时一起更新。

## 设计说明

- **为什么不叫 `window`**：`UIWindow` 在 iOS 里是真实存在的另一个东西（scene 里的窗口容器），会撞名。浏览器的 `window` 同时是全局对象和窗口对象，是历史债，不值得模仿
- **为什么不叫 `app`**：`app` 是 JS 里最常见的局部变量名之一，被遮蔽的概率高
- **命名不照搬 ObjC**：上层面向 JS 开发者，用 `state` 而不是 `applicationState`，用 `layoutDirection` 而不是 `userInterfaceLayoutDirection`。要 ObjC 原名的话，底层裸暴露里有
- **异步一律 Promise**：不提供 completion handler 形态的重载

## 实现说明

- **JS 跑在主线程**，和 UIKit 同线程。理由和代价见[项目说明第 3 节](../project.md)。
- **上层 API 在内置 JS 里定义**。`EventTarget`、`Event`、`Application` 都写在 `ios/Runtime/Builtin/parts/` 下，由 iOS 层在 `main.js` **之前**执行。内置脚本按能力域拆成了 26 个 part，每个整个是一个函数表达式，运行时按文件名顺序编译执行、拿到函数之后用所有 part 共享的 `ctx` 调一次（`Engine::RunBuiltinPart`）；**任何一个 part 失败都是致命的**——后面的 part 会在半装好的状态上继续跑，错得更远也更难查，所以第一个失败处就点名文件停下。拆法和取舍见[项目说明](#nacrejs-怎么拆已拆2026-11-14)。不用 C++ 的 `FunctionTemplate`，因为那样每个实例要在 internal field 上挂 C++ 监听器表，里面的 `v8::Global<Function>` 是强引用，必须用 weak callback 在对象被 GC 时手动释放——漏了就是回调永不释放。JS 实现交给 GC 全自动。Node 的 `EventTarget` 同样是 JS 实现的（`node:internal/event_target`）。
- **脚本名用 `nacre:internal/parts/<文件名>`**，不是文件路径。这样调用栈里一眼能看出哪些帧是运行时内部、又是哪个 part，和 Node 的 `node:internal/…` 一个做法。实测效果：

  ```
  at Application.<anonymous> (main.js:126:11)                           ← 用户代码
  at Application.dispatchEvent (nacre:internal/parts/00-core.js:137:28) ← 运行时内部
  at main.js:129:15                                                     ← 用户代码
  ```

  **行号是 part 文件里的真实行号**：`00-core.js` 第 137 行就是 `entry.callback.call(this, event)` 那一句。运行时给每个脚本前置一行 `'use strict';`，`ScriptOrigin` 的 `line_offset` 设 `-1` 抵回来，这条对 part 同样成立。

- **C++ 只提供一个极小的数据桥**。`Engine` 在 Context 上装 `globalThis.__nacre_native`，只有 4 个取值函数（`infoJSON`、`state`、`supportsMultipleScenes`、`setEventSink`）。内置脚本用完**立即 `delete`**，用户代码完全拿不到——实测 `typeof __nacre_native` 为 `undefined`、不在 `globalThis` 上、`getOwnPropertyNames` 也找不到。
- **环境值走快照**。`info` 启动时抓一次；其余实时值在相关通知到达时重建成一份 JSON，JS 读取时解析。JS 现在和 UIKit 同线程，本可以直接读，保留快照是为了一次拿齐、少几次 UIKit 往返。
- **`state` 启动时读到的是 `background`**，不是 `inactive`——scene 生命周期下，`didFinishLaunchingWithOptions:` 执行时场景还没连接。场景激活后才变成 `active`。
- **原生事件的投递**：`NSNotificationCenter` 观察者 → `dispatch_async` 到主队列延后一轮 → `Engine::EmitAppEvent` → 内置脚本注册的入口 → `application.dispatchEvent`。延后一轮是为了不在 UIKit 操作中途重入 JS。单向，不等结果。

## 验证结果

2026-11-07 在 iPhone 18 Pro / iOS 27.2 模拟器上全部跑通：

- `application instanceof EventTarget` 为 `true`，`new Application()` 抛 `TypeError: Illegal constructor`
- `info` 读到 26 个键并深度冻结；`bundleIdentifier`、`version`、`build` 正确
- 多场景的**声明值**与**实际能力**都读到 `false`，两者分别取自 `info` 和 `UIApplication`
- `EventTarget`：重复注册只触发一次、移除后不再触发、`once` 只触发一次、监听器抛异常不影响后续监听器也不冒到派发方
- `preventDefault()`：JS 自己派发且 `cancelable: true` 时生效（`dispatchEvent` 返回 `false`）；`cancelable: false` 时静默失效（返回 `true`）
- **错误出口**：`error` 和 `unhandledrejection` 都能收到；`preventDefault()` 后运行时的默认日志确实消失，不调则照常输出。`ErrorEvent` 的 `message` / `filename` / `lineno` / `error` 和 `PromiseRejectionEvent` 的 `reason` / `promise` 都正确
- **JS 发起的异步调用**走 Promise：C++ 用 `v8::Promise::Resolver` 当场造一个 Promise 返回给 JS，同时把 resolver 按 id 存起来；iOS 层执行（像 `openURL` 那样本身就带 `completionHandler` 的，要等系统回调），完成后兑现。兑现时不在任何 JS 调用栈里，`kAuto` 不会自动排空微任务，所以要显式调一次 `PerformMicrotaskCheckpoint()`，否则 `await` 后面的代码会一直卡住。
- **实时环境值每次读取都重新向原生要一份 JSON 并解析**。这些值变化稀疏、读取不频繁，先用最简单的做法；连续读多个属性会重复解析，成为热点再优化。
- `openURL` 返回真正的 Promise：合法 URL 兑现 `true`，非法 URL 兑现 `false`；兑现发生在 `main.js` 执行结束**之后**，证明微任务检查点生效
- `idleTimerDisabled` 写入异步生效：刚写完读到旧值，稍后读到 `true`
- **前后台事件**：按 HOME 键再切回来，依次收到 `inactive` → `background` → `foreground` → `active`，且每个事件到达时 `state` 的值符合上表（`Will*` 类事件读到旧值）
- 新增的环境属性都读到了合理值（`protectedDataAvailable`、`layoutDirection`、`contentSizeCategory`、`backgroundRefreshStatus`、`prefersReducedResourceUsage`）
- 原生桥 `__nacre_native` 在内置脚本执行后彻底消失：`typeof` 为 `undefined`、不在 `globalThis` 上、`getOwnPropertyNames` 也找不到
- **原生事件链路**：在模拟器的设备菜单选 Simulate Memory Warning，JS 收到 `memorywarning`，`target === application`、`cancelable === false`（这条命令行触发不了——UIKit 的内存警告走 SimulatorKit 的 mach 消息，不是 Darwin 通知，试过的几个 `notifyutil` 名字都无效）
- **状态快照随通知更新**：启动时 `state` 为 `background`，场景激活后读到 `active`

---

← 返回[实现原理](README.md) ・ [项目说明](../project.md)

---

（下面这一段是 2026-11-17 从 `project.md` 搬过来的：那份文件不再放实现原理。）

## 内存警告：先给 JS，再给 V8

系统的内存警告（`UIApplicationDidReceiveMemoryWarningNotification`）到了，运行时在同一个任务里做两件事：先派发 JS 的 `memorywarning`，再调 `Isolate::MemoryPressureNotification(kCritical)`。2026-11-20 补上的后一半，在那之前 V8 完全不知道系统内存紧张，只有 `kCFRunLoopBeforeWaiting` 那条空闲时的增量 GC。

- **用 `MemoryPressureNotification`，不用 `LowMemoryNotification`。** 前者是嵌入方报告内存压力的正式接口，`kCritical` 的注释是「尽快释放内存」；V8 头文件里把强制 GC 的 `RequestGarbageCollectionForTesting` 标成只给测试用，正常调度要用前者。iOS 的内存警告只有一个级别，所以直接对应 `kCritical`，不用 `kModerate`。
- **先 JS 后 V8。** 垃圾回收只收没人引用的对象，JS 自己留着的缓存只有 JS 能放。监听器先清缓存，V8 再回收，刚放掉的对象这一次就收掉；反过来要等下一次 GC。
- **实测**（模拟器，验收的 `stepMemoryPressure`）：对象只被一个缓存数组拿着，监听器里清空数组，警告之后 3 秒内 `FinalizationRegistry` 的回调到了，期间没有制造任何分配压力。不转给 V8 时同样的用例 3 秒内等不到回调。
- 验收里的警告由示例原生模块发（`simulateMemoryWarning`，原生那边 post 同一个通知）：命令行触发不了这个通知，见上面「验证结果」里那条。

## JS 为什么跑在主线程

最初定的是 JS 跑在独立线程（裸任务队列、不挂 run loop），理由是「JS 不卡 UI」。后来发现这条路和一个更早的决定冲突，必须改。

**冲突点**：技术选型里定了「排版用 Auto Layout」。于是：

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

## JS 为什么强制严格模式

非严格模式下这三件事是**静默失败**的，严格模式才抛：

| 写法 | 非严格 | 严格 |
| --- | --- | --- |
| 写只读属性（`view.superview = x`） | 什么都不发生 | `TypeError` |
| 写冻结对象的字段 | 什么都不发生 | `TypeError` |
| 未声明的赋值（`x = 1`） | 悄悄建一个全局变量 | `ReferenceError` |

这正是这个项目一路在拒绝的那类错——**写不进去又不报错**。而判据不是我们自己定的：ECMAScript 在 ES5 引入严格模式时，就是把这几件事从静默失败改成了抛，理由和我们的一样。

一个关键的实测事实：**抛不抛由「写的那一方」决定，不是「定义的那一方」。** `nacre.js` 里的 class 体天然是严格的，但用户在 `main.js` 里写 `label.intrinsicContentSize = x` 时，决定行为的是 `main.js` 的模式。所以只能在脚本这一层开。

V8 没有「强制严格」的编译选项（`v8::Script::Compile` 编译的是 classic script，默认非严格），ECMAScript 也只认 `'use strict'` 这一种开启方式，所以运行时在源码前面拼这一行。连带的好处是结构体不必再靠逐字段抛异常的取值器来防静默失败——不过那套实现更强（两种模式下都抛），留着。

## 原生 API 为什么裸暴露在全局

ObjC 没有 namespace 机制，Apple 用**类名前缀**代替：`NS`（Foundation）、`UI`（UIKit）、`CA`（Core Animation）、`CL`（Core Location）、`AV`、`MK`、`SK`、`WK` 等。这些前缀已经承担了命名空间的职责，再套一层 `ios.` 是双重前缀。

裸暴露之后，JS 里写的名字和 Apple 文档、Xcode 补全、Stack Overflow 答案一一对应，心智负担最低。NativeScript 用的就是这个方案。

曾经定过扁平的 `ios.*`，理由是和将来的 `android.*` 平级。**这个理由不成立**：一个运行时实例只跑在一个平台上，JS 里不会同时出现两套原生 API，不需要平台前缀来消歧。

实现上有两个硬性要求：

1. **懒加载**。不能启动时把几千个类塞进 `globalThis`。做法是给 `Context::New` 传一个带属性拦截器的全局模板（`ObjectTemplate::SetHandler(NamedPropertyHandlerConfiguration)`，含 getter / query / enumerator），JS 第一次访问 `UIWindow` 时才去元数据里解析并建类，之后缓存。这两个 API 已在 `Vendor/v8/include` 中核实存在。
2. **撞名检查**。bindgen 生成符号时必须和 ECMAScript 内置比对，**冲突时报错，不允许静默覆盖**——ES 内置优先。

实测 `globalThis` 上一共 86 个属性，其中 22 个是运行时注入的（`console`、`application`、事件类、结构体、原生类），剩下 64 个是 ECMAScript 内置。这 64 个里没有任何一个以 `NS` / `UI` / `CA` / `CL` / `AV` / `MK` 开头，所以 ObjC 的**类**不会撞。真正要盯的是 C 函数、枚举和常量——它们不一定都有前缀；而且 ECMAScript 以后还会添新的内置名，所以撞名检查要固化进 bindgen，不能只查一次了事。

## `nacre.js` 怎么拆（已拆，2026-11-14）

方案是 2026-11-09 定的（函数包裹），**当时决定先不拆**——它改的是加载模型而不是挪代码，而且 JS 开发者对拆不拆毫无感知。后来「能力要能拆成边缘包」这件事把它从「优先级低」变成了**硬前置**：Keychain 的 JS 代码要拿到 `defineNativeClass`、`nativeCallAsync` 这些，而它们全在那个 IIFE 的闭包里，外面一个都够不着。

**做法就是当初定的函数包裹**，每个 part 整个是一个函数表达式；原生侧编译执行拿到函数，用所有 part 共享的 `ctx` 调一次（`Engine::RunBuiltinPart`，约 30 行）：

```js
// parts/10-view.js
(function (ctx) {
  'use strict';
  const { defineNativeClass, nativeGet, structArg, … } = ctx;

  defineNativeClass('UIView', class UIView extends UIResponder { … });
})
```

被否掉的两条，理由记下来免得重议：

| | 为什么不行 |
| --- | --- |
| **多脚本按序执行** | 要共享就得去掉 IIFE、让助手变成顶层 `const`（全局词法绑定，不污染属性列表）。但那会**把内部名变成用户的保留字**——`main.js` 顶层重复声明同名 `const` 是 `SyntaxError`，而我们的内部名里有 `define`、`own`、`num`、`env`。报错还指向用户自己那一行，极难查 |
| **构建期拼接** | 运行时一个字不用改，但**跑的不是你编辑的那个文件**：报错说 `nacre.js:1234`，而那个 `nacre.js` 是生成物，得回查源文件和行号。还多一个构建步骤 |

「半加载状态」不是新增的风险（今天第 1500 行语法错一样会让整个内置脚本死掉），但状态更让人困惑，所以原生侧**任何一个 part 失败都当致命错误、点名是哪个文件、立刻停下**，不往下跑。

### 实际切出来的和当初估的差在哪

当初估的是 13 个文件、最大 322 行、「6 个跨域 Symbol + 约 25 个助手」。实际是 **26 个 part、`ctx` 带 84 个名字**。两个原因：文件从 2600 行涨到了 6553；而且要切到**能力粒度**（Keychain 得是单独一个 part 才拆得出去），不能按大类切。

part 的划分和 `Bridge/`、`types/ios/` 的域对齐，文件名的数字前缀就是执行顺序。

**三个让这件事能做成的发现：**

1. **`defineNativeClass` 里有 `define(globalThis, name, cls)`。** 63 个原生类全挂在 `globalThis` 上，所以 `class UIButton extends UIControl` 这种跨 part 的类引用**根本不需要 `ctx`**。否则 `ctx` 会再多一倍，而且要操心类的定义顺序。
2. **后向依赖只有 4 个名字。** 原文整个是一个 IIFE，靠函数提升跨过去；part 化之后提升没了。按依赖做拓扑排序要挪 **18 个 part** 的位置——那就不是纯重构了。改成：3 个函数（`colorArg` / `colorString` / `filePath`）在用它的 part 开头**转发一道**（`const colorArg = (...a) => ctx.colorArg(...a)`），调用点一个字不用改，而且局部同名参数照常遮蔽它；只有 `application` 不是函数，按行号改了 2 处调用点。**执行顺序和原文完全一致。**
3. **`'use strict';
` 的前置带分号**（`Engine` 里本来就是这么拼的），所以 `(function (ctx) {…})` 接得上，part 不用改写法。

**可变变量跨不了 part，这条咬了一次。** `let allowConstruct` 定义在 Application 的助手里，而 `allowConstruct = true` 在 Application 类后面——解构成 `const` 之后赋值当场抛 `TypeError: Assignment to constant variable`，第一次跑验收就死在 `22-application.js`。它只在那个 part 真的去**写**的时候才炸，光看依赖表看不出来。修法是把那段助手并进 Application 那个 part（它们本来就是一伙的，只是行号上被 storage / filesystem / keychain 隔开了），**所以 part 的区间支持多段**；切分脚本里加了一条自检：跨 part 的 `let` / `var` 必须为空。

### 保证「一行都没改」的办法

不是靠脚本写得多对，而是**把每一行按原行号放回去，和原文逐行比对**——差异必须正好是计划内的那 2 行，多一行都算失败。

切分脚本本身踩了四个坑，全是「安静地给出错误答案」那一类，记下来：

| 坑 | 后果 |
| --- | --- |
| 数反引号判断模板字符串 | 第 6047 行的正则 `/[^!#$%&'*+\-.^_`\|~0-9A-Za-z]/` **里有一个反引号**，状态翻转后再没翻回来，508 行被整段吞掉，顶层声明少抽了 43 个 |
| 不排除字符串字面量 | `nativeClassObject('Keychain', …)` 里的 `'Keychain'` 被当成标识符——而那 45 个类**在 JS 顶层根本没有变量**，导出它会 `ReferenceError` |
| 不做作用域分析 | `loadFile(filePath, options)` 的**参数名**被当成跨 part 引用 |
| 正则全文替换 | `'application/x-www-form-urlencoded'` 变成 `'ctx.application/…'`，`define(globalThis, 'application', …)` 的全局名字也被改掉 |

前两个是「抽出来的数不对劲」发现的，后两个是 `node --check` 和人工核对抓到的。结论和 `check-api.sh` 那套是同一条：**每个提取点都要能说出「是我自己失效了」**，而最终的判据只能是拼回去逐行比。

## part 之间靠 `ctx` 传的名字有机械检查（2026-11-17）

part 从 `ctx` 上取一个没人放过的名字，不会当场报错：解构得到的是 `undefined`，要等用户代码走到用它的那一行才抛。改内部函数的名字、挪 part 的顺序、拆能力包时最容易漏，而验收跑不到那一行就发现不了。外部审查（2026-11-17）指出过这一条，拆 part 时自己也记着「`ctx` 成了核心给能力包的接口，没有机械检查」。

`check-api.sh` 第 11 节只读源码，不运行任何东西：

| 取的方式 | 要求 |
| --- | --- |
| 加载时就取：开头的 `const { … } = ctx`，和写在 part 最外层的 `ctx.xxx` | 必须由排在它前面的 part 放过 |
| 调用时才取：写在函数里面的 `ctx.xxx`（那 3 个后向依赖就是这么转发的） | 有任何一个 part 放过就行，那时全部 part 都执行完了 |
| 同一个名字 | 不能由两个 part 各放一次，后放的会盖掉先放的 |

能力包的 part 排在核心的全部 part 之后。「加载时」和「调用时」是按写法分的：缩进两格、前面没有 `=>` 的算最外层。

现有的代码一处问题都没有（`ctx` 上一共 91 个名字）。在仓库的副本里试过六种弄坏法，每种都报出来：取的名字拼错、放的名字改了（7 个用它的 part 各报一条）、函数里用了没人放的、能力包取了核心没有的、同一个名字放两次、把后面的 part 挪到前面。抽不到任何「放」或「取」时报「脚本要更新」，不会安静地通过。

## iOS 26 上键盘的内部场景不交给 JS

键盘第一次弹出时，会多收到一次 `sceneconnect`，已修。（2026-11-12 在 iOS 26.0 的模拟器上查到，iOS 27 上没有出现；11-13 修掉。）

输入框聚焦、键盘弹出的那一刻，系统会接入一个内部场景来放键盘的窗口：原生类是 `_UIKeyboardWindowScene`（`UIWindowScene` 的私有子类），会话角色是 `_UIScreenBasedSceneSession`，没有委托。运行时靠 `UISceneWillConnectNotification` 发 `sceneconnect`，判断条件只有「是不是 `UIWindowScene`」，所以它被当成普通场景转给了 JS。`application.scenes` 不受影响，那里面始终只有一个。

后果：`main.js` 如果像文档里的例子那样在 `sceneconnect` 里建窗口和页面，会在键盘的场景上再建一套。验收用例启动时会自动聚焦一个输入框，所以它在 26 上整套跑了两遍，两遍互相踩存储，多出 11 条失败。

用最小的 App 复现过：只建窗口和页面，一个场景；加一个输入框并聚焦，聚焦的瞬间多出第二个。

修法：运行时只把**公开角色**的场景交给 JS（应用场景 `UIWindowSceneSessionRoleApplication`，以及外接显示器场景），私有角色的不转。判断收在 `NacreRuntime.mm` 的 `IsAppFacingScene` 里，三处用它：接入和断开那一组通知、场景自己的四个前后台事件、`application.scenes`。验收里加了一条「`sceneconnect` 只来一次」。

修完在两个系统上各跑了全量：iOS 26.0 上 1442 条通过、0 条失败，iOS 27.2 上 1439 条通过。两边的差别是预期内的三处（三个 iOS 27 专属的输入类型在 26 上抛 `TypeError`；启动时自动聚焦在 26 上键盘能弹出来；启动时 `application.scenes.length` 在 26 上是 1）。从这一步起，验收在 iOS 26 和 27 上都跑，一直跑到 WebView 的脚本和消息那一步。

## 内置脚本装失败就不跑 `main.js`

（2026-11-16，来自一份外部审查。）任何一个 part 失败，运行时点名是哪个文件、停下，并且不再执行 `main.js`。用故障注入验的：把包里一个 part 写坏再启动。改之前 `main.js` 照样跑，`UIScrollView` 是 `undefined`；改之后不跑，并打出原因。

## 让窗口显示出来要三步，上层不给简化的写法

（2026-11-18 定。）让窗口显示出来是三步：建 `UIWindow`、设 `rootViewController`、调 `makeKeyAndVisible()`，每个 App 都要写一遍。考虑过在上层给一个一行的写法（比如 `scene.rootViewController = vc`，窗口由运行时自己建），没有做：

- 这三步用 JS 包成一个函数只要几行，JS 一侧的框架可以自己收进去，运行时不需要为它定一个新的 API。
- 在 `UIWindowScene` 上加 ObjC 没有的属性，会把上层掺进底层，那条边界糊了很难收回。

底层做过一次不发明 API 的简化，留着：`new UIWindow(scene)` 的参数是可选的，`windowScene` 第一次赋值时才建原生对象，构造和绑定是分开的。

## 日志的子系统名和 framework 的包名不带公司名

（2026-11-18 定。）这两样都是交付出去的，客户看得到：子系统名出现在「控制台」里，framework 的包名在他的 App 包里。原来都带着我们公司的名字，改成只有 `nacre`：

| | 现在是什么 |
| --- | --- |
| 系统日志的子系统 | `nacre`。分两类：`js`（`console` 的输出）和 `runtime`（运行时自己的日志） |
| 运行时 framework 的包名 | `nacre.runtime` |
| 能力包 framework 的包名 | `nacre.<包名>`，比如 `nacre.keychain`、`nacre.user-notifications` |
| 验收 App 的包名 | `nacre.acceptance` |

只看运行时的日志：

```bash
xcrun simctl spawn <设备> log stream --predicate 'subsystem == "nacre"' --style compact
```
