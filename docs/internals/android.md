# Android 的运行时

← [实现原理](README.md)

Android 这一侧现在有：最小的壳（引擎起来、执行 JS、`console` 进 logcat），事件循环，`core/builtin/` 里不依赖桥的 6 个 Web 标准内置脚本，第一条竖切（JS 拿到页面、建布局、放文字、点击收得到事件），安全区域（窗口边衬），网络（`fetch`、`Blob`、`WebSocket`），`Intl`，外观（背景、阴影、圆角裁切、变换、Drawable、模糊），滚动（`ScrollView`、`HorizontalScrollView`、`scroll` 事件）和动画（插值器、`ValueAnimator` / `ObjectAnimator`、`view.animate()`、`requestAnimationFrame`）。`core/builtin/` 的 10 个内置脚本全部接上了。方向和顺序见 [`project.md` 第 4 节](../project.md#4-android2026-11-21-定的方向)。

## 目录

```
android/
├─ settings.gradle.kts、build.gradle.kts、gradle.properties、gradlew   Gradle 工程（用仓库里的 wrapper）
├─ runtime/      运行时本身，以后打成交付的库
│  └─ src/main/
│     ├─ cpp/CMakeLists.txt   编 core/engine/ 加上 JNI，链 V8
│     ├─ cpp/NacreJni.cpp     Kotlin 经 JNI 调到这里，再交给 core/engine；原生入口的实现
│     ├─ builtin/parts/       Android 自己的内置脚本（00-core、01-bridge、09-insets、10-view、21-application、25-globals、30-appearance、31-layout、36-scroll、37-animation）
│     └─ kotlin/nacre/runtime/
│        ├─ NacreRuntime.kt   Kotlin 这一侧的入口和事件循环
│        ├─ NativeBridge.kt   身份表，按顺序问各个域（Domain.kt、Domains.kt）
│        ├─ Enums.kt          整数常量 ↔ 字符串的枚举表
│        ├─ AppearanceDomain.kt 外观
│        ├─ ScrollDomain.kt   滚动
│        ├─ AnimationDomain.kt 动画和帧时钟
│        ├─ FetchService.kt、NacreBlob.kt、NacreWebSocket.kt、Network.kt   网络
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

### WebSocket

`core/builtin/parts/06-websocket.js` 原样接上，原生那一半照 iOS 的 `NacreWebSocket.mm`，用 OkHttp 的 WebSocket（`NacreWebSocket.kt`），和 `fetch` 共用一个 OkHttp 客户端（`Network.kt`）：

- 和 iOS 一样比 Web 多 `headers`（构造的第二个参数），`maximumMessageSize` 默认 1 MiB，超了断开、发 `error` 和 1006 的 `close`。
- 事件总是发，不看有没有人订；`message` 是 `MessageEvent`（文本是字符串，二进制是 `Blob`，`origin` 是连接地址的源），`close` 是 `CloseEvent`，`error` 是 `ErrorEvent`。连接失败时先 `error` 再补一个 1006 的 `close`。`close` 之后 `application` 放开它。
- 带数据的事件第一次用到：原生发事件时带「用哪个类建」，JS 的事件汇入口按 `core` 的 `05-events.js` 登记的类建事件，负载是字典就逐项当字段，不是字典就挂在这个类登记的字段上（`MessageEvent` 的 `data`、`ErrorEvent` 的 `message`），和 iOS 的做法一样。
- **两处和 iOS 不同**：`send()` 的 Promise 在消息放进发送队列时就兑现（OkHttp 没有「发出去了」的回调；iOS 是发出去之后）；**`ping()` 以 `NotSupportedError` 被拒**：OkHttp 没有公开「手动发一个 ping、等 pong」的接口，只有定时自动发。iOS 的 `ping()` 是 iOS 多给的能力，Web 本来就没有。

### 和 iOS 不同的地方（Android 照网页标准）

- **`fetch()` 什么时候兑现**：Android 响应头一到就兑现，和网页标准、Chrome 一样；iOS 的系统网络库要等第一个内容字节。所以响应头到了之后再中止，Android 上是读 body 时以 `AbortError` 失败，iOS 上是 `fetch()` 本身被拒。
- **分块传输没发结束块就被正常关闭**：Android 当成截断，流以 `TypeError` 失败（Chrome 报 `ERR_INCOMPLETE_CHUNKED_ENCODING`）；iOS 的系统当成正常结束。

验收里这 6 条按 Android 的行为写，名字和 iOS 不同，文件开头写明了原因。

### 验收的网络

iOS 真机连不到 Mac 上的本地测试服务（`acceptance/scripts/test-server.mjs`），那部分用例跳过。Android 用 `adb reverse` 把手机上的 `127.0.0.1:47831` 转到 Mac，`run-device.sh` 跑之前起服务、做转发，所以流式读取、背压、中途断开这些用例在 Android 真机上真的跑了。另一半对着公网的 httpbin，没网时会失败。

`fetch.js` 里「读 body 期间 Response 被回收」一组、`fetch-stream.js` 里「没人拿着之后」两组没拷：它们靠 `application.storage` 的事件带出 GC 的清理回调，Android 还没有。

### 体积

加上 OkHttp（连同 Okio、Kotlin 的标准库）之后，没开代码压缩的 `classes.dex` 从 2 MB 到 6.6 MB。交付的包开 R8 之后会小很多，还没量。

## Intl

`core/builtin/parts/26-intl.js`、`27-intl-date.js` 原样接上，经「调类方法」的通道调到 `NacreIntl.kt`（类名 `NacreIntl` 只是桥上的地址），16 个调用的约定照 iOS 的 `NacreIntl.mm`、`NacreIntlDate.mm`、`NacreIntlNumber.swift`。

**全部用 Android 自带的 ICU**（`android.icu`）。网页里的 Intl（V8）底下也是 ICU，所以这里不用像 iOS 那样在系统的格式化接口上补差别：
- 数字用 `android.icu.number.NumberFormatter`（API 30 起有），选项照 V8 的方式映射：分组的 `always` / `min2` 是 ICU 本来就有的 `ON_ALIGNED` / `MIN2`，百分比是 `PERCENT` 单位加 ×100，会计写法是 `ACCOUNTING` 一族。`signDisplay: 'negative'` Android 11 的 ICU 还没有，照 iOS 的做法自己判断。
- 日期用 `DateTimePatternGenerator`、`SimpleDateFormat`、`DateIntervalFormat`。小时写一位还是两位，用网页向 ICU 要格式串时用的 `MATCH_HOUR_FIELD_LENGTH` 问一次就知道（iOS 那边只有 Swift 问得到）。公历改成「往前一直推到头」，和 JS 的 `Date` 一样；窄空格换成普通空格，和浏览器一样。
- normalize 用 ICU 的 `Normalizer2`。

**和 iOS 不同的 1 条**：`en-US` 的 `dateStyle: 'medium'` 加 `timeStyle: 'short'`，iOS 的期望照 Safari（日期和时间之间是「at」），Android 和 Chrome 一样用逗号。验收里这条按 Android 写，名字和 iOS 不同。

**覆盖面比 iOS 窄**：iOS 的验收有三张上千条的大表，期望值运行时从 WebView 里取，和网页逐条比对；Android 没有 WebView，只拷了 80 条固定期望值的断言（数字、日期、normalize）。要补得另想期望值从哪来（比如把 Chrome 的结果存成数据），以后单独讨论。

先把两个 `Intl` 脚本从包里拿掉跑过一遍，70 条失败。

## 接一组类

照 iOS 的「一组类一套新文件」（`internals/adding-classes.md`）：每组只加新文件，共享文件只在入口各加一行，几组可以分给几个会话同时做。

### 原生：一个 Domain

`Domain.kt` 定义了一个域要回答的问题，`NativeBridge` 只按顺序问「认不认领」，不认识任何具体的类：

| 方法 | 问的是 | 不是我的 |
| --- | --- | --- |
| `classes` | 这一组管哪些 Java 类，各叫什么 JS 类名 | — |
| `construct` | `new` 一个 JS 类 | 返回 `null` 表示建不了（JS 抛 `TypeError`） |
| `read` / `write` | 读写属性，读返回 JSON 文本 | `null` / `false` |
| `call` / `callObject` | 调方法，返回值或一个原生对象 | `null` / `NOT_MINE` |
| `callAsync` | 返回 Promise 的方法，用 `host.settle` 兑现 | `false` |
| `subscribe` | 某个事件的监听器从无到有、从有到无（有人订才装回调） | `false` |
| `classObject` / `classCall` | 类级的属性和方法 | `NOT_MINE` / `null` |

- **对象归哪个域问、用哪个 JS 类名**：按类的继承层级排，离对象最近的类先（`EditText` 的域排在 `TextView` 的前面），和登记的先后无关。
- **参数**：`args` 是解好的值（`null`、`Boolean`、`Double`、`String`、`List`、`Map`），对象参数按下标在 `objects` 里。JS 那一侧已经照 Web IDL 转好了类型，原生只校验，不对就抛 `NacreTypeError`（JS 是 `TypeError`）；Java 自己抛的异常在 JS 里是 `name` 为异常类名的 `Error`。
- **事件**：`host.emitter.plain`（不带数据）、`.json`（带一个 JSON 值和事件类名）、`.obj`（带一个原生对象）。都排到下一轮派发；带数据的按 `core` 的 `05-events.js` 登记的事件类建，要新的事件类就在自己的内置脚本里用 `ctx.defineEventClass` 定义。
- **枚举**：用 `Enums.kt` 的 `EnumTable`，属性写错抛 `NacreWarning`（JS 打警告、值不变），参数写错抛 `NacreTypeError`，见下面「外观」一节。
- **登记**：在 `Domains.kt` 的列表里加一行。

现有的域：`ViewDomain`（竖切的那几个类）、`WindowInsetsDomain`、`BlobDomain`、`WebSocketDomain`、`IntlDomain`、`AppearanceDomain`、`LayoutDomain`（布局）、`ScrollDomain`、`AnimationDomain`。

### JS：自己的内置脚本

在 `android/runtime/src/main/builtin/parts/` 加自己的文件（文件名的数字决定执行顺序，接在 `10-view.js` 之后的用 `3x`、`4x`……）。新类用 `ctx.defineNativeClass`；往已有的类（比如 `View`）上加成员，在自己的文件里往它的原型上加，不改 `10-view.js`。桥的助手（`nativeGet`、`nativeSet`、`nativeCall`、`nativeCallObject`、`nativeCallAsync`、`own` / `ownOne` / `disown`、`toInteger`、`toText`……）都在 `ctx` 上，见 `01-bridge.js`。持有关系（父视图持有子视图这类）要记所有权边。

### 验收和文档

- 验收：`acceptance-android/src/steps/` 加自己的步骤文件，`main.js` 加一行。先写用例、在没有实现的运行时上跑一遍看到失败，再写实现。要点击的用 `[acceptance] tap 视图上的字`。
- 跑验收：`bash android/scripts/run-device.sh`（加 `--release` 是 Release）。手机只有一台，脚本用一把锁（`$TMPDIR/nacre-android-device.lock`）让几个会话排队，别的会话占着时会打「手机正被别的验收占着」并等着。
- 文档：在这一页加自己的一节（怎么实现的、和 iOS 不同的地方、实测）。

### 规矩

`project.md` 第 4 节「接类的规矩」：整数常量变字符串枚举、方法参数照 Java 按位置传、构造只传 `context`、覆写点「能用属性就用属性」。

## 外观

View 的背景、透明度、可见性、高度和阴影、轮廓和裁切、变换；Drawable 一族（`Drawable`、`ColorDrawable`、`GradientDrawable`、`RippleDrawable`）；`RenderEffect` 的模糊。原生在 `AppearanceDomain.kt`，JS 在 `30-appearance.js`，验收是 `steps/appearance.js`。任意阴影和自定义绘制不在这一组，等绘制指令那一步单独讨论。

### 颜色：CSS 的字符串，在 JS 里解析（2026-11-24 定）

Android 的颜色是一个 `int`（ARGB）。JS 里写成 CSS 的字符串：`'#rgb'`、`'#rgba'`、`'#rrggbb'`、`'#rrggbbaa'`、`rgb()` / `rgba()`（逗号写法和空格写法，分量可以是百分比）、`'transparent'`。超出范围的分量照 CSS 夹到范围里。读出来规范化成小写的 `'#rrggbb'`（不透明）或 `'#rrggbbaa'`。

- **8 位十六进制的透明度在最后**，和 CSS 一样，和 Android 的 `Color.parseColor`（`#AARRGGBB`）相反。从 Android 的示例里抄来的 `'#80FF0000'` 会被读成另一种颜色。选 CSS 的顺序，是因为读者是做前端的人，而且和 iOS 写起来一样。
- **不照 iOS「合法写入原样读回」**：Android 只存一个 int，没有 iOS 那种有名字的动态色要保住；原样读回得在 JS 这边另记一份，换来的只是大小写一致。
- **解析在 JS 里**（纯文本运算），过桥的是 0–0xFFFFFFFF 的数，原生只校验。和 iOS 的 `16-color.js` 同一个分工。函数放在 `ctx` 上（`parseColor`、`colorText`、`colorProperty`、`colorArgument`），排在 `30` 后面的组可以用。
- 写错：属性打一条警告（`[Nacre] color: "#GGG" is not a valid color, ignored`），值不变；方法参数和构造抛 `TypeError`。
- 不认颜色名（`'red'`）、`hsl()`、系统的动态调色板（`system_accent1_500`）。深色模式下换颜色属于 App 层的配置变化。

### 枚举属性写错：桥上补了警告这条路

规矩是属性位写错打警告、值不变。Android 的桥原来只能抛：引擎的 `write_property` 有 `warning` 出参（iOS 在用），JNI 没接。补了三处共享文件：

- `NativeBridge.kt`：新的异常 `NacreWarning`。域的 `write` 抛它，`writeProperty` 把文字交回去，不当成错。
- `NacreJni.cpp`：`writeProperty` 返回警告的 UTF-8 字节（没有是空数组），填进 `warning`。
- `01-bridge.js`：`nativeSet` 收到警告就 `console.warn('[Nacre] ' + 警告 + ', ignored')`，和 iOS 一样。

枚举表在新文件 `Enums.kt`：`EnumTable("visible" to View.VISIBLE, …)`，`name()` 读，`forProperty()` 写属性（不认识抛 `NacreWarning`），`forArgument()` 方法参数（抛 `NacreTypeError`）。措辞照 iOS 的 `EnumError`：`visibility has no value "hidden"; expected one of: visible / invisible / gone`，按数值从小到大列。别的组直接用它。

Java 的枚举（`GradientDrawable.Orientation`、`Shader.TileMode`）和静态对象（`ViewOutlineProvider.BACKGROUND`）也按这个规矩变成字符串：`TOP_BOTTOM` → `'topBottom'`，`TR_BL` → `'trBl'`；`ViewOutlineProvider` 的 `null` 是 `'none'`。`GradientDrawable.LINEAR_GRADIENT` 没有前缀可去，是 `'linearGradient'`。系统自己的视图装了别的轮廓实现时，`outlineProvider` 读出来是 `'custom'`，写不进去。

### Drawable 是可以 new 的原生类

`new GradientDrawable()` 建出来、设好属性，再 `view.background = d`。视图持有背景、前景和效果，水波持有内容和遮罩，都记所有权边。`setBackgroundColor` 建的 `ColorDrawable` 是原生先有的，所以 `background` 的 getter 读到之后也记一条边。

- `Drawable` 是抽象类，自己和 JS 子类都不能 `new`（`ViewGroup` 那个助手的报错文字写的是布局，所以这里自己判断）。`GradientDrawable` 这些能继承，继承只在 JS 这一层。
- `RippleDrawable` 的内容和遮罩只能在构造时给，照 Java 按位置传：`new RippleDrawable(color, content, mask)`，后两个可以不给或给 `null`。`radius` 是数或 `'auto'`（`RADIUS_AUTO` 这个哨兵）。中间那层 `LayerDrawable` 没接，JS 里 `RippleDrawable` 直接继承 `Drawable`；系统给的别的 Drawable（`InsetDrawable`、`StateListDrawable`……）包成 `Drawable`。
- **两处在 JS 里先拦**：`setColors` 的位置和颜色个数不同、`cornerRadii` 不是 8 个数。Java 设的时候不检查，要到画的时候才用到这两个数组，那时出错就不在 JS 的调用里了（画的时候具体怎么出错没实测）。所以在 JS 里抛 `RangeError`，原生再挡一次。
- `GradientDrawable.gradientRadius` 照 Android 的文档只对放射渐变有效，验收是在放射渐变下写读的；别的渐变类型下读出什么没验。
- `View` 的这些成员加在 `View.prototype` 上，没改 `10-view.js`。这一组的 `classes` 也登记了 `View`，这样 `View` 的属性和方法会来问它；`new View()` 还是由 `ViewDomain` 建，因为它在 `Domains.kt` 里排在前面。

### RenderEffect（Android 12 起）

`RenderEffect.createBlurEffect(radiusX, radiusY, edgeTreatment?)`，不能 `new`，建出来不能改。`edgeTreatment` 是 `'clamp' | 'repeat' | 'mirror' | 'decal'`，Java 里必填，这里默认 `'clamp'`，和 Compose 的 `Modifier.blur` 一样。`view.setRenderEffect(effect | null)` 用方法不用属性：Java 只有 setter。

工厂方法走的是造对象那条通道：JS 先建一个空的 `RenderEffect`（构造函数只认内部的记号，所以用户 `new` 会抛），再 `constructNative(effect, RenderEffect, 'RenderEffect', ['blur', …])`，原生按第一个参数调对应的 `create…`。不用改桥。

**Android 11 上**：原生的 `classes` 里不放 `RenderEffect`（11 上连这个类都没有，写进表就是 `NoClassDefFoundError`），JS 问 `@appearance.hasRenderEffect` 得到 `false`，就不定义全局的 `RenderEffect`、也不往 `View` 上加 `setRenderEffect`，JS 用 `typeof RenderEffect` 检测。没有 Android 11 的设备，这一支**未验证**。

### 浮点数怎么交回去

Java 的属性大多是 `float`。照 `float` 最短的写法交给 JS（`Float.toString`），所以写 `0.3` 读回 `0.3`，不是 `0.30000001192092896`。

### 验收

`steps/appearance.js`，排在安全区域之后。全部成员的读写、默认值、Web IDL 的转换、写错时的警告和 `TypeError`、不能 `new` 的类；最后把带圆角边框阴影的卡片、带水波的按钮、模糊加变换的字挂到屏幕上画半秒，用脚本点一下水波那个，收到 `click`。阴影、水波、模糊在屏幕上的样子要人看，没看过。

先在没有实现的运行时上跑了一遍：步骤一开始就抛了 `ColorDrawable is not defined`，判为失败。实现之后 2026-11-24 在 Pixel 6（Android 17，API 37）上 Debug 是 1142 条通过、0 条失败（这一组 220 条），Release 也是 1142 条通过、0 条失败。

## 布局

`ViewGroup.LayoutParams` 一族、`LinearLayout`、`FrameLayout`、`ConstraintLayout`，`View` 上读布局结果的成员、`ViewGroup` 的层级操作、`layoutchange` 事件。原生在 `LayoutDomain.kt`，JS 在 `31-layout.js`，验收在 `steps/layout.js`。单位都是像素。

### 定下来的几条（2026-11-24）

| | 做法 | 理由 |
| --- | --- | --- |
| LayoutParams 的形状 | 原生对象的包装，挂成静态的嵌套类：`ViewGroup.LayoutParams`、`ViewGroup.MarginLayoutParams`、`LinearLayout.LayoutParams`、`FrameLayout.LayoutParams`、`ConstraintLayout.LayoutParams`，继承关系照 Java | 和 Android 的文档、Kotlin 的写法对得上；做成值对象的话「取出来、改字段、设回去」的习惯就没了 |
| 写到视图上 | 同一个对象。改字段不会自己重新排版，要 `requestLayout()` 或者再赋一次 `layoutParams` | 照 Android。`addView` 时类型不对，系统换成父视图要的类型（新对象），也照实 |
| ConstraintLayout 的约束 | 写在参数的字段上，指向视图用 id，指向父视图写 `'parent'`；不接 `ConstraintSet` | `ConstraintSet.applyTo` 最后也是写这些字段，它只是帮手，JS 能自己写。不收视图对象：写进去是视图、读出来是数，对不上 |
| 哨兵值 | 有含义的用字符串（`matchParent`、`wrapContent`、`matchConstraint`、`parent`）；表示「没设」的（`NO_ID`、`UNSET`、`GONE_UNSET`、gravity 的 −1）读出来是 `null`，写 `null` 清掉 | 「没设」做成 `'unset'` 这种字符串，读的人会当成一个取值 |
| 布局事件 | `layoutchange`，`LayoutChangeEvent` 带 `left` / `top` / `right` / `bottom` 和四个 `old…`，延后一轮派发，不可取消；**四边变了才发** | Android 的回调每次排版都来，四边没变也来。不滤的话 JS 在监听器里 `requestLayout` 一次就排个没完。和 `windowinsetschange` 只在值变了才发一样 |
| `Gravity` | 字符串数组，每个方向最多一个名字，外加 `clipHorizontal` / `clipVertical`。没有 `center`、`fill` | 横向的几个值不是单独的一位（`LEFT` 是 3，`START` 是 `0x800003`），按「每个方向一个取值」拆。合起来的名字照 iOS 位掩码的规矩不收：读出来总是拆开的，收了就写进去和读出来不一样 |

### 实现

- **嵌套的类**：`defineNativeClass` 会把类挂到全局（名字带点），`31-layout.js` 摘掉再挂成静态成员。不改 `01-bridge.js`。
- **`addView` 的重载**：在 `31-layout.js` 里换掉 `10-view.js` 的 `addView`，按参数的个数和类型分五种写法；原生那边用新的方法名（`addView@index` 这类），只传一个子视图的还走 `ViewDomain` 原来那条。父视图持有子视图（`children` 那条边），视图持有它的参数（`layoutParams` 那条边，持有的是系统真正用的那个对象）。
- **事件的订阅**接在 `10-view.js` 的 `[kSubscribe]` 后面：`layoutchange` 告诉原生，别的交给原来那一个。别的组也往 `View` 上加事件时照这样接。
- **属性里的枚举写错**走外观组补的那条路：域的 `write` 抛 `NacreWarning`，JS 那边打一条警告、值不变。简单的名字表用 `Enums.kt` 的 `EnumTable`；宽高（名字和像素混在一起）和 `Gravity`（每个方向一个取值）自己核，措辞和 `EnumTable` 一样。
- **赋一个父视图不认的参数**：视图已经在布局里时，下一次排版 Java 会在原生里抛 `ClassCastException`，整个 App 就没了。所以写 `layoutParams` 时先用父视图的 `checkLayoutParams`（protected 的公开接口，反射去调，按父视图的实际类型分派）问一次，不认就抛 `TypeError`。系统自己的 `updateViewLayout` 也是这么查的，它抛 `IllegalArgumentException`。
- **下标越界**：`removeViewAt` 不查下标，按 AOSP 的源码是拿着 `getChildAt` 给的 `null` 往下走（没实测越界时会怎样）。`removeViewAt` 和 `removeViews` 都在原生先查，抛 `IndexOutOfBoundsException`，和 `addView` 越界时 Java 自己抛的一样。
- **ConstraintLayout 2.2.2 的依赖排除了 appcompat。** 它的 pom 带着 appcompat，但 `widget` 包里的类一个都没用到（看过字节码；用到它的只有 `utils.widget` 下的几个视图，没接）。不排除的话会带进 AppCompat 的样式和资源。

### 和方案不同的一处

`LinearLayout.dividerWidth` 没做：`getDividerWidth()` 在 SDK 里是隐藏的接口（`android.jar` 里没有），不是公开 API。

### 没做的

`dividerDrawable`（要外观组的 `Drawable`，合进来之后再接）；`ConstraintSet` 和辅助线、屏障、分组、`Flow`；`optimizationLevel`；`layoutDirection`；`RelativeLayout`、`GridLayout`；`ViewTreeObserver` 的几个回调（「画之前」的回调要等需要时再做：`layoutchange` 是延后一轮派发的，在监听器里调整会晚一帧）；Android 的类型定义（`@nacrejs/types/android` 还没有）。

### 实测（Pixel 6，Android 17）

验收里的位置全是照 Android 的排版规则先算好的期望值，第一次跑就对上了：

- 600 宽的横向 `LinearLayout`，一个固定 100 宽，另外两个权重 1 和 2：分到 166 和 334（剩下的 500 按 `(int)(权重 × 剩余 / 剩余权重)` 依次分，余数落在后面的那个）。
- 竖向 `LinearLayout` 默认给子视图的参数是 `matchParent` × `wrapContent`；`gravity` 只给横向时，竖向补成 `top`，给空数组读回来是 `start`、`top`。
- `ConstraintLayout`（1000 × 500）：上下左右都连父视图的 200 × 100 居中在 (400, 200)；`horizontalBias` 0.25 在 x = 200；宽 100、高 `matchConstraint`、`dimensionRatio` 2:1 的高是 50；两个 100 宽的 `packed` 链在 x = 400、500。
- 只改参数的字段，300 毫秒后宽还是原来的；`requestLayout()` 之后 `isLayoutRequested` 立刻是 `true`，下一轮来了 `layoutchange`，旧的四边是改之前的。
- 根视图的 `parent` 是系统放内容的 `FrameLayout`，一直往上走，最外层视图的 `parent` 是 `null`（它上面是 `ViewRootImpl`，不是视图）。
- 全屏的窗口里 `getLocationOnScreen()` 和 `getLocationInWindow()` 一样。

## 滚动

`View` 上的滚动位置、滚动条、越界效果、边缘渐隐、嵌套滚动和 `scroll` 事件；`ScrollView`、`HorizontalScrollView`。原生在 `ScrollDomain.kt`，JS 在 `36-scroll.js`，验收是 `steps/scroll.js`。不接 AndroidX 的 `NestedScrollView`（第 4 节只允许两个 AndroidX 的类）。

- **任何视图都能滚。** Android 的滚动位置在 `View` 上（`scrollX` / `scrollY`、`scrollTo` / `scrollBy`），普通视图不限制范围（`scrollY` 可以是负的），`ScrollView` 覆写了 `scrollTo`，夹在内容的范围里。这些成员加在 `View.prototype` 上，没改 `10-view.js`。
- **`scroll` 事件不带数据**，和 Web、iOS 一样，位置读 `scrollX` / `scrollY`。有人订才装 `setOnScrollChangeListener`，延后一轮派发；滚到同一个位置系统不通知。订阅接在 `View` 原来的 `kSubscribe` 后面（`click` 还是 `10-view.js` 管）。
- **系统不通知的**：拖动开始和结束、滚动停下（Web 的 `scrollend`）。`ScrollView` 没有这几个回调，要靠覆写 `onTouchEvent` / `computeScroll`，按「继承」那条规矩不做。
- **方向是字符串**：`fullScroll` / `pageScroll` / `arrowScroll` 的参数在 Java 里是焦点方向的常量（`FOCUS_UP` 这些），去掉前缀是 `'up'` / `'down'`（`ScrollView`）、`'left'` / `'right'`（`HorizontalScrollView`），给另一个方向的抛 `TypeError`。关了 `isSmoothScrollingEnabled` 它们当场到位，开着是带动画滚过去。
- **`scrollIndicators` 是位掩码**，读写都是字符串数组，读出来按数值从小到大排；有一个名字不认识，整次赋值不生效，打一条警告。
- **越界效果**：Android 12 起是拉伸，11 是光晕。拉伸只能用 `overScrollMode` 开关；`setEdgeEffectColor` 和四个边的颜色只对光晕有用（`ScrollView` 里拿着 `EdgeEffect` 的字段不是公开的接口）。
- **父类**：Java 里两个滚动视图继承 `FrameLayout`。布局那一组定义了 `FrameLayout` 就接在它下面（那个 part 的文件名排在 `36` 前面），没定义就接在 `ViewGroup` 下面，合并时不用改代码。
- **核对过签名**：照 `android.jar`（API 37）核对过每个成员。原来的候选里 `smoothScrollTo(x, y, 时长)` 不存在，去掉了；`ScrollView` 多出一个 `scrollToDescendant(view)`，补上。

验收里用手指划了一下（见下面「验收」一节的 `swipe`）：从「往上滑我」的中间往上划 1000 像素，内容滚过去，一路收到 `scroll`。

## 动画

插值器（`BaseInterpolator` 和 10 个具体的类）；`Animator`（抽象）、`ValueAnimator`、`ObjectAnimator`；`view.animate()` 给的 `ViewPropertyAnimator`；全局的 `requestAnimationFrame` / `cancelAnimationFrame`；系统的动画时长缩放。原生在 `AnimationDomain.kt`，JS 在 `37-animation.js`，验收是 `steps/animation.js`。

### 形状：照 Java 的链式写法，通知用事件（2026-11-24 定）

- `view.animate().alpha(0).translationY(40).setDuration(300)`，参数照 Java 按位置传。
- **通知是事件，不是 Promise**：animator 会反复用——`view.animate()` 每次给同一个对象（`View` 自己缓存着它），`ValueAnimator` 能重新 `start()`——结束是会发生好几次的事，按「重复的通知用事件」。iOS 的 `CAAnimation` 也是 `start` / `stop` 事件。Promise 只能挂在「某一次播放」上，Java 里没有代表一次播放的对象。
- 事件名照 `AnimatorListener`：`start`、`end`、`cancel`、`repeat`、`pause`、`resume`、`update`。**被取消时先 `cancel` 再 `end`**，照 Android。Web 的 `finish`、CSS 的 `animationend` 被取消时不发，含义不同，不借。
- `withStartAction` / `withEndAction`（传回调的）、`setListener` / `setUpdateListener` 不接，用事件。
- **返回 `this` 的 setter 两种写法都给**：`a.duration = 300` 和 `a.setDuration(300).alpha(0)` 都行，不然 Android 文档里的链式写法就断了（Kotlin 也是两样都能用）。只限 Java 里返回自己的：`ViewPropertyAnimator` 的 `setDuration` / `setStartDelay` / `setInterpolator`，`ValueAnimator` 的 `setDuration`。`ValueAnimator.setInterpolator` / `setStartDelay` 在 Java 里返回 `void`，只有属性。

### 事件什么时候发

- `start`、`end`、`cancel`、`repeat`、`pause`、`resume` 不常发，JS 建的 `ValueAnimator` 一建好就装上监听、总是发：JS 要靠 `end` 放开正在跑的 animator。`update` 每帧一次，有人订才装。都排到下一轮派发，不可取消。
- **正在跑的 animator，JS 拿着它的包装到 `end` 为止**（`start()` / `end()` / `reverse()` 时放进一个集合，收到 `end` 拿出来）。Java 的动画调度拿着正在跑的 animator，镜像过来就是这样；不拿的话，JS 不留变量的 animator 跑着跑着包装被回收、监听器跟着没了。验收里有一个不留变量的 animator，制造垃圾之后照样收到 `end`。
- `ViewPropertyAnimator` 只有一个监听的位子（`setListener`），有人订 `start` / `end` / `cancel` 时装上、都摘了拆掉。回调里拿到的是它内部的那个 `Animator`，事件发在 `ViewPropertyAnimator` 上。视图持有它（所有权边 `animator`）。

### 值和类型

- `ofArgb` 的值是 CSS 的颜色字符串，`animatedValue` 读出来也是。Java 里颜色动画的值是 `Integer`，和 `ofInt` 分不开，所以原生记下哪些是颜色动画（`setFloatValues` / `setIntValues` 之后就不是了），交给 JS 时包成 `{"argb": n}`。
- `repeatCount` 是次数或 `'infinite'`（`ValueAnimator.INFINITE` 这个哨兵），`totalDuration` 无限时是 `'infinite'`（`DURATION_INFINITE`）。
- `interpolator` 写 `null` 时 Java 换成 `LinearInterpolator`，读出来就是它。
- `ObjectAnimator` 的目标可以是任何原生对象，Java 用反射找 `setXxx`，属性名不存在时只打日志、不抛。Java 对目标是弱引用，所以不记所有权边。
- 时长写负数由 Java 抛 `IllegalArgumentException`。`PathInterpolator` 的曲线往回绕也是 Java 抛的 `IllegalArgumentException`。

### 插值器是原生类

`new PathInterpolator(0.4, 0, 0.2, 1)`（三次贝塞尔，和 CSS 的 `cubic-bezier` 同一个写法）、`new OvershootInterpolator(2)`，构造参数照 Java，`getInterpolation(t)` 可以调。不认 `'ease-in'` 这样的字符串（那是上层的事）；JS 函数不能当插值器，因为 JS 不实现 Java 的类。`PathInterpolator(Path)` 要等 `Path` 接进来。JS 的类可以继承插值器，继承只在 JS 这一层，系统调的还是原生那个。

### requestAnimationFrame

- 全局的 `requestAnimationFrame(callback)` / `cancelAnimationFrame(handle)`，照 Web。不暴露 `Choreographer`：它的 `postFrameCallback` 要 JS 实现 Java 的接口。放在 Android 自己的脚本里，不进 `core/`：iOS 现在还是用 `CADisplayLink`。
- 底下是一个帧时钟（`FrameClock`，JS 里是不挂在全局的 `NacreFrameClock`）。有回调在等时 JS 调一次 `request`，原生向 `Choreographer` 约下一帧；那一帧到了发一个 `frame` 事件，带这一帧的时刻（`frameTimeNanos`）。没有回调在等时不约，不花钱。
- **时刻和 `performance.now()` 同一个起点**：`frameTimeNanos` 是 `System.nanoTime` 的时钟，`performance.now()` 是引擎里 libc++ 的 `steady_clock`，Android 上两个都是 `CLOCK_MONOTONIC`。JS 启动时各读一次，差是固定的，之后用它换算。验收里回调拿到的时刻不晚于回调里读的 `performance.now()`，差不到 100 毫秒。
- 同一帧的回调拿到同一个时刻；回调里再请求的排到下一帧；一个回调抛了照未捕获的异常报，同一帧别的回调照样调；正在跑的这一帧里取消还没轮到的，就不再调（和 Web 一样）。
- **延后一轮派发**：和 iOS 的 `CADisplayLink` 的 `tick` 一样，是普通事件，排到主线程队列的下一轮。代价是 JS 在回调里改的东西晚一帧画出来（`Choreographer` 这一帧的绘制已经做完了）。要当场派发得改 `NacreRuntime.kt` 的事件出口，按「能用就先用着」这次不改。
- App 在后台时 `Choreographer` 不来叫，回调等着，和浏览器一样。

实测：连续 30 帧的平均间隔是 11.1 毫秒（Pixel 6 的屏幕是 90 Hz）。

### 动画时长缩放

开发者选项里的「动画时长缩放」和无障碍里的「移除动画」改的都是它（相当于 Web 的 `prefers-reduced-motion`）。缩放是 0 时动画一开始就结束，`ViewPropertyAnimator` 也一样；`requestAnimationFrame` 不受它影响。

- 读：静态的 `ValueAnimator.durationScale` 和 `ValueAnimator.areAnimatorsEnabled()`。Android 13 起用系统的 `ValueAnimator.getDurationScale()`；11、12 读系统设置 `Settings.Global.ANIMATOR_DURATION_SCALE`。11、12 那一支没有设备，**未验证**。
- 变化：`application` 上的 `animatordurationscalechange`（全局的设置，挂在 App 这一层的对象上）。有人订时原生才盯着：13 起 `registerDurationScaleChangeListener`，11、12 用 `ContentObserver` 盯那条设置；值真的变了才发。订阅接在 `application` 原来的 `kSubscribe` 后面，没改 `21-application.js`。
- 验收脚本不改手机的系统设置，所以变化事件是手动验的：2026-11-24 在 Pixel 6（Android 17）上装一段只订这个事件的脚本，用 `adb shell settings put global animator_duration_scale` 依次改成 0.5、0、1，三次都收到了，事件里读到的 `durationScale` 是 0.5、0、1，`areAnimatorsEnabled()` 在 0 时是 `false`。改完设回 1。

### 验收

`steps/animation.js` 和 `steps/scroll.js`，排在外观之后。时长相关的断言假设手机的动画时长缩放是 1（没改过）。

先在没有实现的运行时上跑了一遍：两步一开始就抛了（`ScrollView is not defined`、`LinearInterpolator is not defined`），判为失败。写实现时发现用例里有一条和定下的规矩不符：原来断言 `ValueAnimator.setInterpolator()` 返回自己，但 Java 的这个方法返回 `void`，按规矩只有属性。改成断言没有这个方法，API 没变。跑真机时又发现一条期望值写错了：`BounceInterpolator` 在 t = 1 不是正好 1，Android 的弹跳曲线用的是近似常数（t × 1.1226，最后一段 8(t − 1.0435)² + 0.95），照 float 算是 1.0000545，期望改成这个数。

实现之后 2026-11-24 在 Pixel 6（Android 17，API 37）上 Debug 和 Release 都是 1482 条通过、0 条失败。Release 第一遍挂过一条网络那一组的耗时断言（对着公网的 httpbin，10 个并发请求的耗时），和这两组无关，重跑通过。

## 构建

- Android Gradle 插件 9.5.2 自带 Kotlin 编译，不用另外加 Kotlin 插件。
- 第一次编译时，插件会自己装它默认要的 build-tools 36。
- **拷内置脚本用 `Sync` 不用 `Copy`**：`Copy` 不删目标目录里的旧文件，从 `corePartsInUse` 里拿掉的脚本还留在包里。实际撞到过：拿掉 `23-fetch.js` 想看验收失败，`fetch` 却还在。
- **两个模块都要写 `ndkVersion`。** 只在 `runtime` 里写时，Release 包里的 `libnacre.so` 没去掉调试符号，有 71 MB：打包时去符号的工具从 `shell` 的 NDK 里找，`shell` 没写版本就找不到，也不报错。两边都写之后是 45 MB。
- 45 MB 里大部分是 V8：这份带完整的 JIT 和 WebAssembly。iOS 那份是 lite mode、不带 WebAssembly。要不要换一份更小的构建，以后再量。
- **CI 在每个 PR 上编一遍。** `check.yml` 的 `android` 任务在 `ubuntu-latest` 上用 `sdkmanager` 装 `platforms;android-37.0`、`ndk;29.0.14206865`、`cmake;4.1.2`，取 V8 和 ada（V8 的下载缓存起来，哈希每次都校验），打包 `acceptance-android`，再用它当 `main.js` 编 `:shell:assembleDebug` 和 `:shell:assembleRelease`。只编不跑；仓库里的 `gradle-wrapper.jar` 由 Gradle 官方的 `wrapper-validation` 核对。

## 验收

`bash android/scripts/run-device.sh`（加 `--release` 是 Release，要先设 `ANDROID_HOME`）：打包 `acceptance-android/`，编壳时用 `-PnacreMainJs=` 把它换成壳执行的 `main.js`，装、打开，从 logcat 读 `Nacre` 标签的原文，交给 iOS 验收的 `report.mjs` 判定：等到结束标记、没有 ✗ 就是 0；期限内没等到、App 提前退出、有 ✗ 都是 1。

**点击是脚本点的。** JS 打一行「`[acceptance] tap 视图上的字`」，脚本用 `uiautomator dump` 找到写着这几个字的视图，用 `adb shell input tap` 点它的正中。App 忙的时候（网络用例同时在跑）`uiautomator` 可能等不到界面空闲、写不出新文件，所以每次先删旧文件，找不到就隔一秒再 dump，最多 5 次；不这样会读到上一次的界面，点不到。跑的时候手机要**解锁、亮屏、别碰**：锁屏时点到的是锁屏；人手点的也会被如实收到，监听器会多触发（实际撞到过）。可以在开发者选项里打开「不锁定屏幕」，插着线就不会息屏。

**划动也是脚本做的。** JS 打一行「`[acceptance] swipe <dx> <dy> 视图上的字`」，脚本同样用 `uiautomator dump` 找到那个视图，从它看得见的那一块的正中，用 `adb shell input swipe` 划到偏移 (dx, dy) 像素的地方，用 300 毫秒。滚动那一步用它验手指拖动时的 `scroll`。

`acceptance-android/` 是从 iOS 的验收拷过来的 8 步（`console-basics`、`url`、`crypto`、`events`、`errors`、`web-globals`、`timers`、`performance`），去掉了用到 iOS 的类、`application`、`fetch`、`Blob`、`Intl` 的断言，留下的断言名字和期望值和 iOS 一字不差。`web-globals` 里「和网页逐条比对」那一段要 WebView，没拷。

先在第 1 步的运行时上跑过 Web 标准那批：没有 `setTimeout`，一条 ✓ 都没有、到不了结束标记，判为失败；竖切那一步在没有桥的运行时上跑，`application is not defined`，也判为失败。2026-11-24 在 Pixel 6（Android 17，API 37）上，Debug 和 Release 都是 922 条通过、0 条失败（外观之前；加上外观是 1142 条，见「外观」一节）。
