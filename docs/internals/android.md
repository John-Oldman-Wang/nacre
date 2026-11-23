# Android 的运行时

← [实现原理](README.md)

Android 这一侧现在有：最小的壳（引擎起来、执行 JS、`console` 进 logcat），事件循环，`core/builtin/` 里不依赖桥的 6 个 Web 标准内置脚本，第一条竖切（JS 拿到页面、建布局、放文字、点击收得到事件），安全区域（窗口边衬），和网络（`fetch`、`Blob`）。方向和顺序见 [`project.md` 第 4 节](../project.md#4-android2026-11-21-定的方向)。

## 目录

```
android/
├─ settings.gradle.kts、build.gradle.kts、gradle.properties、gradlew   Gradle 工程（用仓库里的 wrapper）
├─ runtime/      运行时本身，以后打成交付的库
│  └─ src/main/
│     ├─ cpp/CMakeLists.txt   编 core/engine/ 加上 JNI，链 V8
│     ├─ cpp/NacreJni.cpp     Kotlin 经 JNI 调到这里，再交给 core/engine；原生入口的实现
│     ├─ builtin/parts/       Android 自己的内置脚本（00-core、01-bridge、09-insets、10-view、21-application、25-globals）
│     └─ kotlin/nacre/runtime/
│        ├─ NacreRuntime.kt   Kotlin 这一侧的入口和事件循环
│        ├─ NativeBridge.kt   身份表、读写属性、调方法、造对象、订阅事件（现在是手写的小表）
│        └─ Packed.kt         读引擎打包的参数
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

## 第一条竖切：包装、所有权、事件

JS 拿到页面（`application.activity`）、建 `LinearLayout` 和两个 `TextView`、`addView`、`setContentView`，点文字收到 `click`；JS 的类可以继承原生类（只在 JS 这一层）。引擎给宿主留的接口 iOS 全在用，Android 照着实现，`core/engine/` 没改。

### 身份：交给引擎的「指针」是编号

引擎按指针认原生对象：同一个指针永远是同一个包装。Java 对象没有固定的地址，JNI 的引用每拿一次都不一样，所以 `NativeBridge` 放一张身份表（`IdentityHashMap`），给每个 Java 对象发一个编号，交给引擎的就是这个编号。同一个对象永远是同一个编号，`layout.getChildAt(0) === label` 成立。

表里强引用着对象。引擎在包装建立时 retain、被 GC 回收时 release，计数到 0 表里就放手，Java 那边才可能回收。和 iOS「包装活着就 `CFRetain`」同一个思路。交给引擎、引擎却没 retain 的（建包装失败了），在主线程空闲时清掉：正常的交接在同一次 JNI 调用里就 retain 了，到空闲时计数早就不是 0。

### 所有权：照搬 iOS 的镜像

原生的 A 持有 B，JS 里 A 的包装也持有 B 的包装（`01-bridge.js` 的 `own` / `ownOne`）：`application` 持有 `activity`，页面持有内容视图，布局持有子视图。用例里有一个只挂在布局上、JS 不留变量的视图，制造垃圾逼 V8 回收之后，它的包装上的记号和监听器都还在；对照组（没有所有者的包装）同时被回收了，证明这一轮 GC 真的跑过。

反方向（Java 持有 JS）不会出现：JS 不实现 Java 的类（`project.md` 第 4 节「继承」），原生只往 JS 的包装上派发事件，不拿着任何 JS 对象，所以没有跨两个垃圾回收器的环。这和 Chrome 的做法同一个原则：网页的 JS 只调用平台的能力，从不去实现平台的类。

### 事件：订阅才装回调，延后一轮派发

JS 第一次给视图加 `click` 监听时，引擎经 `set_event_subscription` 告诉原生，`NativeBridge` 才给它装 `setOnClickListener`；最后一个监听摘掉时拆掉，并还原它原来的可点状态（装回调会顺手把视图设成可点）。回调里拿的是 `View` 本身不是编号：JS 的包装可能早被回收了，点击来了再发编号、重建包装。系统回调进来后排到主线程队列的下一轮再派发，不可取消，和 iOS 一样。`click` 是普通的 `Event`：Android 的点击回调不带坐标。

### 参数和返回值

- 引擎把参数打包成自己的二进制格式（`PackInto`），`Packed.kt` 直接读成 Kotlin 的值，不转 JSON。
- 返回值照 iOS 用 JSON（读属性、方法的返回值），Kotlin 交回 UTF-8 字节，不走 JNI 的字符串。
- Kotlin 抛 `NacreTypeError`（参数类的错）JS 那边是 `TypeError`；别的异常（Java 自己抛的）写成「`\x01类名\x01说明`」交给引擎，JS 那边是 `name` 为异常类名的 `Error`，比如同一个子视图加两次是 `IllegalStateException`。
- 每个宿主回调都包一层 `PushLocalFrame`：一轮 JS 里可能过桥几千次，不包的话 JNI 的局部引用表会满。

### JS 层的继承

`class Card extends TextView {}`，`new Card(ctx)`：构造链上每个原生类都调一次 `constructNative`，只有「`new.target` 在原型链上最近的原生类」那一层真的去建（`01-bridge.js` 的 `nearestNative`），所以原生那边建的是一个普通的 `TextView`。JS 这边的包装就是 `Card` 的实例，子类的方法、字段、私有字段都在；身份表里那个编号对应的就是它，从原生读回来（`getChildAt`）还是同一个 `Card`。抽象类（最近的原生类是 `ViewGroup`）和系统建的类（`Activity`、`Context`）继承了也不能 `new`。

子类覆写的方法系统看不见：用例里一个写了 `onDraw()` 的子类挂在屏幕上画了半秒，那个方法一次都没被调过。系统要告诉 JS 什么只走事件，原生不持有任何 JS 对象。

**没做的**：子类实例的「子类身份」和 JS 字段挂在包装上。包装被回收后再从原生读回来，会变成一个普通的 `TextView`。按所有权镜像，挂在界面上的视图包装不会被回收；只有镜像漏了边才会出现。方案里原本打算原生记下「这个对象是 JS 子类建的」，重建时打一条警告；但现在 Android 上所有建立持有关系的入口都做了镜像，没有一条路能触发它、也就测不了，所以没做。等出现原生自己建的持有关系（bindgen 接类之后）再加。

### 不接 Button

一开始竖切里用了 `Button`，它在 Pixel 上带着 Material 风格的样式。那不是我们写的，是系统主题给的；它也没有 `TextView` 做不到的能力。按「组件不接」去掉，点的是 `TextView`。壳的主题从「设备默认」换成 AOSP 的 `Theme.Material.Light.NoActionBar`：设备默认在各家手机上长得不一样，连 `TextView` 的默认字色、字号都会变。

### 撞到的：内容在状态栏底下

`targetSdk` 37 下系统强制内容铺满全屏（Android 15 起），状态栏 128 像素，第一版的两个按钮在 y = 0～126，整个被盖着，点到的是状态栏。窗口边衬还没交给 JS，所以先加了 `setPadding`（四个整数，像素）和四个只读的 `paddingLeft` 等，验收里把布局往下挪 400 像素。安全区域排在竖切之后紧接着做。

### 构造的那个坑

`constructNative(wrapper, builtAs, className)` 的第二个参数要传 `new.target`（正在被 `new` 的类），不是类本身：构造链上每个类都调一次，只有「被 new 的就是我」的那一层真的去建。传类本身的话，`new TextView()` 在 `View` 那一层就建了一次，到 `TextView` 那一层再定义句柄时报「Cannot redefine property」。

## 安全区域（窗口边衬）

`targetSdk` 37 下系统强制内容铺满全屏，状态栏、导航条、摄像头开孔、键盘各占多少，由系统用「窗口边衬」分发给视图树。运行时把它交给 JS，由 JS 自己往里缩，不替 JS 做排版决定。

- `activity.windowInsets`：读的时候问页面最外层的视图（`decorView.rootWindowInsets`），按 `WindowInsets.Type` 的七类各取一份 `Insets`，拼成 `[左, 上, 右, 下]` 交给 JS，JS 建成 `WindowInsets` / `Insets` 两个值类（`09-insets.js`）。它们是快照，字段只读（私有字段加 getter，严格模式下赋值抛 `TypeError`），不能 `new`。
- **`onCreate` 那一刻是 `null`**：`main.js` 在页面的 `onCreate` 里执行，窗口还没挂到屏幕上，系统还没分发过。这是 Android 的事实，照实交出去，不编一个值。
- `windowinsetschange`：有人订阅时，在页面最外层的视图上装 `OnApplyWindowInsetsListener`。系统每次分发都先经过它，值和上次不一样才发事件（同样的值系统会重复分发好几次），分发本身原样交给视图默认的处理。窗口挂上时的第一次分发也算一次变化。
- Pixel 6 上实测：`systemBars` 是 0、128、0、63（顶上状态栏 128，底下手势导航条 63），`displayCutout` 顶上 128。按 `systemBars` 给布局加内边距之后，顶上的字点得到。

**转屏（手动验的，2026-11-23）**：启动时第 1 次 `systemBars` 是 0、128、0、63；横过来第 2 次是 0、74、0、63（横屏的状态栏矮一截，手势导航条还在底边）；竖回去第 3 次回到 0、128、0、63。三次是同一个进程，页面没有被重建（壳的 `configChanges` 接住了配置变化），只是给 JS 发了事件。横屏时摄像头开孔转到侧边，而 `systemBars` 不含开孔，横屏要同时看 `systemBars` 和 `displayCutout`。验收脚本自己转不了屏（要改手机的系统设置），所以这一条是人手验的。

键盘弹出时跟着动画逐帧走的边衬（`WindowInsetsAnimation`）没做，留到做输入框和键盘的时候。

## 网络：fetch 和 Blob

`core/builtin/parts/23-fetch.js` 原样接上（`fetch`、`Request`、`Response`、流式的 `response.body`、`Blob`、`AbortController`）。原生那一半照 iOS 的 `NacreFetchService.mm`，用 OkHttp 5.5.1 实现（`FetchService.kt`、`NacreBlob.kt`）：

- **线程**：OkHttp 的线程连接、传输，响应头到了就在那个线程上一块一块读 body；UTF-8 解码这类活派到 work 线程池；兑现 Promise 一律排到主线程（`Settle`）。一个请求的状态由它自己的锁守着。
- **边下边读和背压**：和 iOS 一样，JS 每 `read()` 一次，把那一刻攒下的全部字节作为一块交出去；按块读之后攒到 1 MiB 就让读 body 的线程停下来等，被读走再接着读。
- **字节交给 V8**：Java 数组随时可能被 Java 的 GC 挪走，不能直接交，所以在主线程上拷一份到 C++ 的内存再交给 V8（iOS 是零拷贝）。
- **Blob**：字节放在原生这一侧，JS 只拿句柄。字符串编成 UTF-8 时落单的代理项换成 U+FFFD（`String.toByteArray` 会换成 `?`，和 Web 不一样）；`text()` 照 Web 的解码去掉开头的 BOM。
- **超时和 iOS 的系统网络库一样**：60 秒没有数据进出才算超时，整个请求不限时长。OkHttp 默认各 10 秒，httpbin 慢一点就超了。
- **每个主机最多同时 64 个请求**：OkHttp 默认 5 个（React Native 用的就是这个默认值），10 个并发请求被排成两轮，耗时是单次的 6 倍。改成 64 之后是单次的 1.1～1.3 倍。HTTP/2 的服务器上它们在一条连接里并行，和浏览器、iOS 一样；老的 HTTP/1.1 服务器上最多会开 64 条连接，比浏览器的 6 条多。
- **网络权限**：`INTERNET` 写在运行时自己的清单里，合并进 App。开发用的壳另外只对 `127.0.0.1` 和 `localhost` 放开明文 HTTP（`res/xml/network_security_config.xml`），给本地测试服务用。

### 和 iOS 不同的地方（Android 照网页标准）

- **`fetch()` 什么时候兑现**：Android 响应头一到就兑现，和网页标准、Chrome 一样；iOS 的系统网络库要等第一个内容字节。所以响应头到了之后再中止，Android 上是读 body 时以 `AbortError` 失败，iOS 上是 `fetch()` 本身被拒。
- **分块传输没发结束块就被正常关闭**：Android 当成截断，流以 `TypeError` 失败（Chrome 报 `ERR_INCOMPLETE_CHUNKED_ENCODING`）；iOS 的系统当成正常结束。

验收里这 6 条按 Android 的行为写，名字和 iOS 不同，文件开头写明了原因。

### 验收的网络

iOS 真机连不到 Mac 上的本地测试服务（`acceptance/scripts/test-server.mjs`），那部分用例跳过。Android 用 `adb reverse` 把手机上的 `127.0.0.1:47831` 转到 Mac，`run-device.sh` 跑之前起服务、做转发，所以流式读取、背压、中途断开这些用例在 Android 真机上真的跑了。另一半对着公网的 httpbin，没网时会失败。

`fetch.js` 里「读 body 期间 Response 被回收」一组、`fetch-stream.js` 里「没人拿着之后」两组没拷：它们靠 `application.storage` 的事件带出 GC 的清理回调，Android 还没有。

### 体积

加上 OkHttp（连同 Okio、Kotlin 的标准库）之后，没开代码压缩的 `classes.dex` 从 2 MB 到 6.6 MB。交付的包开 R8 之后会小很多，还没量。

## 构建

- Android Gradle 插件 9.5.2 自带 Kotlin 编译，不用另外加 Kotlin 插件。
- 第一次编译时，插件会自己装它默认要的 build-tools 36。
- **拷内置脚本用 `Sync` 不用 `Copy`**：`Copy` 不删目标目录里的旧文件，从 `corePartsInUse` 里拿掉的脚本还留在包里。实际撞到过：拿掉 `23-fetch.js` 想看验收失败，`fetch` 却还在。
- **两个模块都要写 `ndkVersion`。** 只在 `runtime` 里写时，Release 包里的 `libnacre.so` 没去掉调试符号，有 71 MB：打包时去符号的工具从 `shell` 的 NDK 里找，`shell` 没写版本就找不到，也不报错。两边都写之后是 45 MB。
- 45 MB 里大部分是 V8：这份带完整的 JIT 和 WebAssembly。iOS 那份是 lite mode、不带 WebAssembly。要不要换一份更小的构建，以后再量。

## 验收

`bash android/scripts/run-device.sh`（加 `--release` 是 Release，要先设 `ANDROID_HOME`）：打包 `acceptance-android/`，编壳时用 `-PnacreMainJs=` 把它换成壳执行的 `main.js`，装、打开，从 logcat 读 `Nacre` 标签的原文，交给 iOS 验收的 `report.mjs` 判定：等到结束标记、没有 ✗ 就是 0；期限内没等到、App 提前退出、有 ✗ 都是 1。

**点击是脚本点的。** JS 打一行「`[acceptance] tap 视图上的字`」，脚本用 `uiautomator dump` 找到写着这几个字的视图，用 `adb shell input tap` 点它的正中。App 忙的时候（网络用例同时在跑）`uiautomator` 可能等不到界面空闲、写不出新文件，所以每次先删旧文件，找不到就隔一秒再 dump，最多 5 次；不这样会读到上一次的界面，点不到。跑的时候手机要**解锁、亮屏、别碰**：锁屏时点到的是锁屏；人手点的也会被如实收到，监听器会多触发（实际撞到过）。可以在开发者选项里打开「不锁定屏幕」，插着线就不会息屏。

`acceptance-android/` 是从 iOS 的验收拷过来的 8 步（`console-basics`、`url`、`crypto`、`events`、`errors`、`web-globals`、`timers`、`performance`），去掉了用到 iOS 的类、`application`、`fetch`、`Blob`、`Intl` 的断言，留下的断言名字和期望值和 iOS 一字不差。`web-globals` 里「和网页逐条比对」那一段要 WebView，没拷。

先在第 1 步的运行时上跑过 Web 标准那批：没有 `setTimeout`，一条 ✓ 都没有、到不了结束标记，判为失败；竖切那一步在没有桥的运行时上跑，`application is not defined`，也判为失败。2026-11-23 在 Pixel 6（Android 17，API 37）上，Debug 和 Release 都是 815 条通过、0 条失败。
