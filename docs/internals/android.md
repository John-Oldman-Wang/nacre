# Android 的运行时

← [实现原理](README.md)

Android 这一侧现在有：最小的壳（引擎起来、执行 JS、`console` 进 logcat），事件循环，和 `core/builtin/` 里不依赖桥的 6 个 Web 标准内置脚本。方向和顺序见 [`project.md` 第 4 节](../project.md#4-android2026-11-21-定的方向)。

## 目录

```
android/
├─ settings.gradle.kts、build.gradle.kts、gradle.properties、gradlew   Gradle 工程（用仓库里的 wrapper）
├─ runtime/      运行时本身，以后打成交付的库
│  └─ src/main/
│     ├─ cpp/CMakeLists.txt   编 core/engine/ 加上 JNI，链 V8
│     ├─ cpp/NacreJni.cpp     Kotlin 经 JNI 调到这里，再交给 core/engine；原生入口的实现
│     ├─ builtin/parts/       Android 自己的内置脚本（00-core、25-globals）
│     └─ kotlin/nacre/runtime/NacreRuntime.kt   Kotlin 这一侧的入口和事件循环
├─ shell/        开发用的最小壳：一个页面，启动时建运行时、执行 main.js
│                 （默认是 src/main/js/main.js；验收时换成 acceptance-android 打出来的）
├─ scripts/
│  ├─ fetch-v8.sh     下载预编译的 V8，放到 Vendor/v8（不提交）
│  ├─ fetch-ada.sh    下载 ada，放到 Vendor/ada（不提交）
│  └─ run-device.sh   打包验收套件、编壳、装、打开，按 logcat 判定
└─ Vendor/       下载的东西，不提交
```

`shell/` 只是现在用来验运行时的。以后有了 CLI，它挪进 CLI 的模板，和 iOS 的启动壳一样由 CLI 放进项目的 `android/`。

## V8：用 NativeScript 的预编译库

NativeScript 的 v8-buildscripts 每次发布都带 Android 的四种架构，我们只取 arm64-v8a。用的是和 iOS **同一次构建**（`v8-14.9.207.39-7`），两端的 V8 源码和补丁完全相同。预期的哈希写死在 `fetch-v8.sh` 里，理由和 iOS 那份一样。

这份 Android 包和 iOS 包的打法不一样（照它的 `scripts/matrix/build-android.sh`）：

| | Android 这份 | iOS 那份 |
| --- | --- | --- |
| JIT | 开着，完整的编译器 | 关着（lite mode） |
| 指针压缩 | **开着** | 关着 |
| WebAssembly | 开 | 关 |
| 国际化（ICU） | 不带 | 不带 |
| 沙箱 | 关 | 关 |

两件要对上的事：

- **NDK 必须是 r29。** 发布说明写明它是用 r29 编的。V8 和我们的代码静态链接同一份 libc++，大版本不同 ABI 就对不上。两个模块的 `ndkVersion` 都写死成 `29.0.14206865`。
- **编译宏要和指针压缩一致。** 构建脚本里没写这一项，按 V8 的默认，arm64 上是开的；库里定义了 `v8::internal::MainCage::base_`，证实是开的。所以 `CMakeLists.txt` 定义 `V8_COMPRESS_POINTERS` 和 `V8_31BIT_SMIS_ON_64BIT_ARCH`。对不上时 V8 在初始化时就会报 `Embedder-vs-V8 build configuration mismatch`，不会悄悄出错。iOS 那份是关的，所以 iOS 一个也不定义（见[运行时](runtime.md)）。

V8 不带 RTTI，所以和 iOS 一样加 `-fno-rtti`。

## JNI 这一层

- **字符串用字节数组过 JNI。** 脚本名和源码在 Kotlin 那边编成 UTF-8 字节，C++ 原样当 `std::string`。不用 `GetStringUTFChars`：它给的是 Java 的「改良 UTF-8」，emoji 这类四字节的字符会被拆成两个代理项。
- **logcat 一条最多约 4 KB。** `console` 的输出按行切开写，一行超过 4000 字节再切，切点不落在 UTF-8 的多字节字符中间。级别对应：`debug` → D，`log` 和 `info` → I，`warn` → W，`error` → E，标签都是 `Nacre`。
- **引擎只能在主线程用。** `NacreRuntime` 的每个方法先查当前线程是不是主线程，不是就抛。

## 内置脚本：先接不依赖桥的 6 个

`core/builtin/parts/` 的 10 个文件里，Android 现在用 6 个：`05-dom-exception`、`05-events`、`22-url`、`24-timer`、`25-crypto`、`28-web-globals`。另外 4 个要等桥：`06-websocket`（`WebSocket` 是原生类）、`23-fetch`（`Response`、`Blob` 是原生类）、`26-intl` 和 `27-intl-date`（走调类方法的通道）。现在接它们，等于提前替还没定的桥做决定，所以挪到竖切之后。

用哪几个列在 `runtime/build.gradle.kts` 的 `corePartsInUse`。构建时把它们和 `runtime/src/main/builtin/parts/` 合到包里的 `nacre/parts/`，同名就报错；运行时按文件名排序执行，脚本名和 iOS 一样是 `nacre:internal/parts/xx.js`。

这 6 个要 `ctx` 上的 `Event`、`EventTarget`、`define`、`has`、`native`、`kHandle`、`kListeners`。iOS 上它们来自 `00-core.js` 和 `01-bridge.js`。**Android 拷了一份 `00-core.js`**，去掉 iOS 导航栈用的 `kSyncStack`，加上 `has` 和 `kHandle`。这份内容本该两端共用，但搬进 `core/` 要动 iOS 的运行时，等 Android 的桥定下来再统一。`25-globals.js` 把 `Event`、`EventTarget` 挂上全局、摘掉 `__nacre_native`；iOS 的同名文件还挂 `application`，Android 还没有上层对象。

### 为什么新东西不放进 core 原有的两个目录

iOS 的工程编 `core/engine/` 下的**全部**文件、执行 `core/builtin/parts/` 下的**全部**脚本。拆 `core/` 时默认放进去的东西两端从第一天起都用，没想到 Android 会分批接、会有先在一边用的东西。所以：Android 先用、iOS 还没用的不放这两个目录（ada 的胶水在 `core/url/`），`core/builtin/parts/` 里 Android 用哪几个由 Android 自己列。要根治是改成每个平台各列一份用 `core/` 里哪些文件，要改 iOS 的工程配置，等桥定下来一起讨论。

## 事件循环

和 iOS 一样，引擎只管定时器的堆，「什么时候叫醒」和「排一个任务」交给宿主：

- **定时器唤醒**：引擎调 `schedule_wakeup(delay)`，C++ 经 JNI 回调 Kotlin 的 `scheduleWakeup`，用主线程的 `Handler` 排一条消息，醒来调 `FireDueTimers`。每次重新约定都让旧的作废（代数），和 iOS 的 `_wakeupGeneration` 一样。0 延迟用 `post`，不用 `postDelayed`；毫秒向上取整，早醒了那一轮什么都到不了期。
- **投递任务**：引擎调 `post_task(task)`，任务存在 C++ 一侧的表里，Kotlin 排一条消息，轮到时按编号取回来跑。未处理拒绝的延后结算走这条。
- **每轮之后**处理 V8 平台投递的任务（`PumpMessageLoop`），和 iOS 的 `postToJS:` 一样。
- **主线程空闲时**做增量 GC：`MessageQueue.IdleHandler`，队列每空一次叫一次 `RunIdleTasks(5 ms)`。对应 iOS 的「run loop 即将等待」观察者。

定时器、任务和别的主线程消息排在同一个队列里，先后是确定的。

## URL：ada

URL 解析用 ada（Node.js 用的网页标准 URL 解析器，单文件版，Apache-2.0 / MIT 双许可，按 MIT 用）。`core/url/UrlParts.cpp` 调它，把结果拼成和 iOS 的 `ParseURL` 同样字段的 JSON，`22-url.js` 不用改。ada 不进仓库，`fetch-ada.sh` 下载并校验哈希；编译时关掉用不到的 URLPattern。加上它 `libnacre.so` 大了约 0.5 MB。

iOS 的 URL 验收（34 条，期望值是照 iOS 写的）在 Android 上原样全过。iOS 那边用的是 `NSURLComponents`，和网页标准有五处已知差异，换不换以后单独讨论。

**以后发 Android 的包时**，`THIRD-PARTY-NOTICES.md` 要加上 ada。

## 随机数

`crypto.getRandomValues` 要的随机源直接在 C++ 里用 bionic 的 `arc4random_buf`（取自内核的 `getrandom`），不经过 Java。

## 构建

- Android Gradle 插件 9.5.2 自带 Kotlin 编译，不用另外加 Kotlin 插件。
- 第一次编译时，插件会自己装它默认要的 build-tools 36。
- **两个模块都要写 `ndkVersion`。** 只在 `runtime` 里写时，Release 包里的 `libnacre.so` 没去掉调试符号，有 71 MB：打包时去符号的工具从 `shell` 的 NDK 里找，`shell` 没写版本就找不到，也不报错。两边都写之后是 45 MB。
- 45 MB 里大部分是 V8：这份带完整的 JIT 和 WebAssembly。iOS 那份是 lite mode、不带 WebAssembly。要不要换一份更小的构建，以后再量。

## 验收

`bash android/scripts/run-device.sh`（加 `--release` 是 Release，要先设 `ANDROID_HOME`）：打包 `acceptance-android/`，编壳时用 `-PnacreMainJs=` 把它换成壳执行的 `main.js`，装、打开，从 logcat 读 `Nacre` 标签的原文，交给 iOS 验收的 `report.mjs` 判定：等到结束标记、没有 ✗ 就是 0；期限内没等到、App 提前退出、有 ✗ 都是 1。

`acceptance-android/` 是从 iOS 的验收拷过来的 8 步（`console-basics`、`url`、`crypto`、`events`、`errors`、`web-globals`、`timers`、`performance`），去掉了用到 iOS 的类、`application`、`fetch`、`Blob`、`Intl` 的断言，留下的断言名字和期望值和 iOS 一字不差。`web-globals` 里「和网页逐条比对」那一段要 WebView，没拷。

先在第 1 步的运行时上跑过这份验收：没有 `setTimeout`，一条 ✓ 都没有、到不了结束标记，判为失败。2026-11-23 在 Pixel 6（Android 17，API 37）上，Debug 和 Release 都是 436 条通过、0 条失败。
