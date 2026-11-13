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
- **上层 API 在内置 JS 里定义**。`EventTarget`、`Event`、`Application` 都写在 `ios/Runtime/Builtin/parts/` 下，由 iOS 层在 `main.js` **之前**执行。内置脚本按能力域拆成了 26 个 part，每个整个是一个函数表达式，运行时按文件名顺序编译执行、拿到函数之后用所有 part 共享的 `ctx` 调一次（`Engine::RunBuiltinPart`）；**任何一个 part 失败都是致命的**——后面的 part 会在半装好的状态上继续跑，错得更远也更难查，所以第一个失败处就点名文件停下。拆法和取舍见[项目说明](../project.md#nacrejs-怎么拆已拆2026-11-14)。不用 C++ 的 `FunctionTemplate`，因为那样每个实例要在 internal field 上挂 C++ 监听器表，里面的 `v8::Global<Function>` 是强引用，必须用 weak callback 在对象被 GC 时手动释放——漏了就是回调永不释放。JS 实现交给 GC 全自动。Node 的 `EventTarget` 同样是 JS 实现的（`node:internal/event_target`）。
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
