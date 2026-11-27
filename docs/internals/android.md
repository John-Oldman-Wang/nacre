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
│     ├─ builtin/parts/       Android 自己的内置脚本（00-core、01-bridge、09-insets、10-view、21-application、25-globals、30-appearance、31-layout、34-image、36-scroll、37-animation）
│     └─ kotlin/nacre/runtime/
│        ├─ NacreRuntime.kt   Kotlin 这一侧的入口和事件循环
│        ├─ NativeBridge.kt   身份表，按顺序问各个域（Domain.kt、Domains.kt）
│        ├─ Enums.kt          整数常量 ↔ 字符串的枚举表
│        ├─ AppearanceDomain.kt 外观
│        ├─ ScrollDomain.kt   滚动
│        ├─ AnimationDomain.kt 动画和帧时钟
│        ├─ ImageDomain.kt    图片
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

2026-11-26 起视图改成挂上树才建原生对象，页面从 `activitycreate` 拿、内容写 `contentView`，见下面[自由和挂上](#自由和挂上)。这一节下面几段说的是第一条竖切当时的做法，身份表、事件的订阅、参数的过桥现在照旧，视图那部分以「自由和挂上」为准。

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

`class Card extends TextView {}`，`new Card(ctx)`（现在是 `new Card()`，挂上时才建原生对象）：构造链上每个原生类都调一次 `constructNative`，只有「`new.target` 在原型链上最近的原生类」那一层真的去建（`01-bridge.js` 的 `nearestNative`），所以原生那边建的是一个普通的 `TextView`。JS 这边的包装就是 `Card` 的实例，子类的方法、字段、私有字段都在；身份表里那个编号对应的就是它，从原生读回来（`getChildAt`）还是同一个 `Card`。抽象类（最近的原生类是 `ViewGroup`）和系统建的类（`Activity`、`Context`）继承了也不能 `new`。

子类覆写的方法系统看不见：用例里一个写了 `onDraw()` 的子类挂在屏幕上画了半秒，那个方法一次都没被调过。系统要告诉 JS 什么只走事件，原生不持有任何 JS 对象。

**没做的**：子类实例的「子类身份」和 JS 字段挂在包装上。包装被回收后再从原生读回来，会变成一个普通的 `TextView`。按所有权镜像，挂在界面上的视图包装不会被回收；只有镜像漏了边才会出现。方案里原本打算原生记下「这个对象是 JS 子类建的」，重建时打一条警告；但现在 Android 上所有建立持有关系的入口都做了镜像，没有一条路能触发它、也就测不了，所以没做。等出现原生自己建的持有关系（bindgen 接类之后）再加。

### 不接 Button

一开始竖切里用了 `Button`，它在 Pixel 上带着 Material 风格的样式。那不是我们写的，是系统主题给的；它也没有 `TextView` 做不到的能力。按「组件不接」去掉，点的是 `TextView`。壳的主题从「设备默认」换成 AOSP 的 `Theme.Material.Light.NoActionBar`：设备默认在各家手机上长得不一样，连 `TextView` 的默认字色、字号都会变。

### 撞到的：内容在状态栏底下

`targetSdk` 37 下系统强制内容铺满全屏（Android 15 起），状态栏 128 像素，第一版的两个按钮在 y = 0～126，整个被盖着，点到的是状态栏。窗口边衬还没交给 JS，所以先加了 `setPadding`（四个整数，像素）和四个只读的 `paddingLeft` 等，验收里把布局往下挪 400 像素。安全区域排在竖切之后紧接着做。

### 构造的那个坑

`constructNative(wrapper, builtAs, className)` 的第二个参数要传 `new.target`（正在被 `new` 的类），不是类本身：构造链上每个类都调一次，只有「被 new 的就是我」的那一层真的去建。传类本身的话，`new TextView()` 在 `View` 那一层就建了一次，到 `TextView` 那一层再定义句柄时报「Cannot redefine property」。

## 自由和挂上

2026-11-26，Android API 重新设计的第一步（总则见 [`project.md` 第 4 节「接类的总则」](../project.md#接类的总则2026-11-26-定)）：桥上的机制，加上基础的几个类 `View`、`ViewGroup`、`LinearLayout`、`TextView`，`activity.contentView`，`application.activities` 和 `activitycreate` / `activitydestroy`。运行时改成跟着 App 的进程生死（在 `Application.onCreate` 里建，页面来去用事件告诉 JS）。JS 在 `01-bridge.js`、`10-view.js`、`21-application.js`，原生在 `NacreRuntime.kt`、`NacreActivity.kt`、`NativeBridge.kt`、`ViewDomain.kt`，壳是 `ShellApplication.kt`、`MainActivity.kt`，验收是 `steps/slice.js`、`inheritance.js`、`tree.js`、`activity-lifecycle.js`。

为什么这么改：原来照搬 Java，`new TextView(activity)`。一个对象建出来只能用在那个页面上，却还要再 `addView` 一次才算放进去，同一件事说了两遍。现在视图建出来不属于任何页面，放进哪个页面的树才属于哪个页面。

### 每个视图两个对象

- **引擎的包装一旦绑上原生对象就换不了**：`kHandle` 是不可写、不可配置的属性，引擎也没有解绑（`BindWrapper` 只会新发句柄）。放进另一个页面要用那个页面重建原生对象，就得换。
- 所以 JS 拿着的**公开对象**永远不带 `kHandle`，身上挂着 `kView`（它的记录：自由还是挂着、替身、树、写过的状态）。挂上时建一个内部的**替身**（`Object.create(null)`，带 `kHandle` 和指回公开对象的 `kOwner`），用 `native.construct` 绑原生对象，参数里的对象是页面：各域的 `construct` 本来就从第一个对象参数拿 `Context`，一行没改。重建就是丢掉旧替身、建新的。`core/engine/` 没改。
- 公开对象持有替身，替身活着原生对象就活着（引擎 retain），拿下来时不用另外保留原生对象。
- 原生发来的事件到替身上，`setObjectEventSink` 换成公开对象再派发；原生交回来的对象（`nativeCallObject` 这几条）是替身的也换成公开对象。替身不会被 JS 拿到。
- `View` 的构造只记下「挂上时建哪个原生类」（原型链上最近的那个，`nearestNative`）。各组的类在构造里调的 `constructNative` 碰到视图什么都不做。

### 三种状态

| | 自由 | 挂着 | 拿下来 |
| --- | --- | --- | --- |
| 原生对象 | 没有 | 替身绑着 | 替身留着 |
| `activity` | `null` | 那个页面 | `null` |
| 写状态 | 只写 JS | 写 JS，也当场设到原生（原生拒了抛给调用的那一行，值不变） | 只写 JS |
| 读状态 | JS 的值 | JS 的值 | JS 的值 |
| 动作、页面值 | 抛 `InvalidStateError` / `null` | 走替身 | 同自由 |
| 加监听器 | 只记在 JS | 装到原生 | 装到替身上（挂回去时重装） |

放回同一个页面：复用替身，把写过的状态整个重设一遍（拿下来时写的只在 JS 里）。放进别的页面：丢掉替身（摘监听器、从原生的父视图上拿下来），在那个页面重建。现在只有一个页面，**这一支走不到，没验过**。

### 挂上那一刻

写 `activity.contentView`、或者往挂着的父视图里 `addView` 时，整棵子树从下往上（`build`）：

1. 建替身。已经挂在这个页面上的（挂着的视图挪个地方）整棵跳过：原生那边是好的，只挪原生的位置。
2. 先把子视图都建好，再按登记的顺序把**写过的**状态设到原生。每项单独 try，原生拒了（JS 没查住的）打一条 `[Nacre] could not apply 名字 to 类名 (…), skipped`，不让挂上做到一半失败。
3. 把原生的子视图排成 JS 的那一串（`@setChildren`）。
4. 把 JS 里记着的监听器装到原生上：调各组的 `[kSubscribe](type, true)`，它们照旧调 `subscribeNative`，看到视图有替身就订在替身上。先状态、后事件：装 `click` 会顺手把视图设成可点。复用的替身先摘掉再装，保证这个先后。
5. 调用方最后把子树的根挂到页面（`@setContent`）或者挂着的父视图上（`@setChildren`），整棵子树只挂一次窗口，然后整棵标成挂着。

### 树在 JS 里

- `kView` 里记着 `parent`、`children`、`contentOf`（是哪个页面的内容）。`children` 返回冻结的快照，树没变时是同一个数组。
- 原生的树只在挂着时跟着变。`@setChildren` 让原生的子视图正好是给的这一串：已经一样的位置不动，不一样的先从它原来的父视图上拿下来（可能就是这一个）再插进来，最后去掉多出来的。拿下来用 `@detach`，页面的内容用 `@setContent`（`null` 是清空系统放内容的那个 `FrameLayout`）。
- 拿下来的子树里，JS 的树怎么变都只改 JS；下次挂上时 `@setChildren` 再对齐，原生上留着的旧父子关系由它拆掉。
- 成环在 JS 里查（`HierarchyRequestError`）：Java 不查，排版时栈溢出。`addView` 一个已经有父视图（或者是某个页面内容）的视图是移过来；`index` 是「加完之后排第几」，所以同一个父视图里挪位置时上限少一个。

### 登记状态（给各组用）

视图上的状态在各组自己的文件里登记，不碰共享文件：

```js
ctx.defineViewState(TextView, 'text', {
  order: 500,                                  // 挂上时设到原生的先后，小的先
  initial: '',                                 // 没写过时读到的值
  convert: (v) => toText(v),                   // 写入时在 JS 里转换、校验
  apply: (standIn, value) => nativeSet(standIn, 'text', value),   // 设到原生
  // units: 'dp' | 'sp'                        // 配置变化时要不要重设
});
```

- `order`：基础用了方向 100、内边距 300、文字 500，留着空隙。背景要排在内边距前面（换背景会改掉内边距）。一样的按登记的先后。
- `initial` **必须等于新建的原生对象的默认值**：没写过的状态不设到原生，省掉每个视图几十次过桥。
- `convert`：类型不对直接抛；属性位写错（枚举名）打警告后返回 `ctx.IGNORE`，值不变。
- `apply(替身, 值, 页面, 视图)`：页面是 `{ density, fontScale }`；几个状态合成一次原生调用的（四个内边距是一个 `setPaddingRelative`）从视图上读别的，所以写入时先存、再设，原生拒了再还原。
- 另外几个助手：`ctx.attachedNative(view)`（挂着时是替身，不然 `null`，页面值用）、`ctx.requireAttached(view, what)`（动作用，自由时抛 `InvalidStateError`）、`ctx.px(page, dp)` / `ctx.dp(page, px)`。
- 事件照旧：`[kSubscribe]` 接在原来那一个后面，调 `subscribeNative`。

第二步才用得到的几样第一步没做，由第一个用到的组加进 `10-view.js`、用自己的成员验：系统也会改的状态（挂着读原生、拿下来时把原生的值读回 JS）、排完版才能设的（ScrollView 的滚动位置）、子视图的布局参数随父视图重设。

### 枚举的名字

名字和数值的映射还是只在原生（`Enums.kt` 的 `EnumTable`）。域在 `enums` 里交出自己的表（表名 → 表，表名全局唯一），`01-bridge.js` 启动时调一次 `@bridge.enumNames` 拿到全部名字。属性位用 `ctx.enumProperty(表名, 值, 名字)`：认识的返回名字，不认识的打 `[Nacre] orientation has no value "diagonal"; expected one of: horizontal / vertical, ignored`、返回 `IGNORE`；参数位用 `ctx.enumArgument`，抛 `TypeError`。措辞和 `EnumTable` 的一样。视图自由时没有原生对象，写错的名字也是当场查出来的。

`LinearLayout.orientation` 从布局组挪进了基础：基础里要有一个枚举来验名表，它又是 `LinearLayout` 最基本的属性。

### 长度、密度和系统字号

- 状态存 dp，设到原生时按页面密度换成整数像素：四舍五入（正负对称），不是 0 的至少 1 像素。
- `ViewDomain` 订页面（`ComponentActivity`）的配置变化，`density` 或 `fontScale` 和上次不一样，就**当场**发内部的 `@metricschange`（`Emitter.plainNow`，不排到下一轮：要赶在下一次排版之前）。JS 把这个页面上挂着的整棵树里写过的 `dp` 状态（密度变了）和 `sp` 状态（密度或字号变了）重设一遍。拿下来的视图不在树上，放回去时整个重设，用的是那时的密度。
- 壳不用改：页面是 `ComponentActivity`，壳的 `configChanges` 早就接住了 `density` 和 `fontScale`，页面不重建。
- 实测（Pixel 6，Android 17）：手机本来是 420 dpi（1 dp = 2.625 像素）。上 10、下 20.5 dp 的空布局量出来 80 像素；`wm density 560` 之后同一个视图变成 177 像素（上边先改成了 30 dp），拿下来时密度变了、放回去的那个按 3.5 设成 35；还原之后回到 133。基础里没有读得出像素的成员，验收借了布局组的 `measuredHeight`（布局组第二步改成 `frame` 时顺手改），密度读 App 层的 `configuration.density`。
- `sp` 那一支（字号）基础里没有成员用，文字组第二步验。

### 页面的事件：运行时跟着 App 生死

运行时不跟着页面建、关（`project.md` 第 1 节「运行时跟着 App 生死」）：

- **在进程启动时建。** 壳的 `ShellApplication`（清单里 `android:name`）在 `Application.onCreate` 里 `NacreRuntime.create(this)`、执行 `main.js`，运行时一直留着，不关（`close()` 还在，进程里不用）。`create` 里订 `registerActivityLifecycleCallbacks`：系统在 `Application.onCreate` 返回之后才建第一个页面，所以第一个页面也走这条路，不用壳手动通知，`main.js` 一定先跑完。壳的页面 `MainActivity` 是空的。
- **只认 `NacreActivity`。** 运行时提供 `open class NacreActivity : ComponentActivity()`，只有它和它的子类发事件、进 `activities`。生命周期回调对进程里所有的页面都来，以后第三方 SDK 自己的页面（支付、登录）不交给 JS。`androidx.activity` 在运行时的依赖里改成 `api`：壳要继承 `NacreActivity`，它的父类得露出去。
- **`activitycreate` 用 `onActivityPostCreated`，当场派发**：页面的 `onCreate`（含壳自己的代码）整个跑完之后、`onStart` 之前。先把页面加进 `activities`，再派发。实测（Pixel 6，Android 17，冷启动）：这一刻 `lifecycleState` 是 `created`、`windowInsets` 是 `null`（窗口还没挂上）；监听器里订的 `start`、`resume` 都收到了；设的 `contentView` 赶得上第一帧（在 `decorView` 上挂一次性的绘制回调，第一次绘制时页面里已经有它，3 遍都是）。
- **当场派发是为了 `start`、`resume`，不是为了第一帧。** 临时改成延后一轮（`handler.post`）也赶得上第一帧，同样 3 遍都是。原来读源码以为赶不上（系统排第一次绘制时在消息队列上放一道屏障），实测推翻了；按源码，这条消息是在挂窗口、放屏障之前投的，排在屏障前面。但延后一轮的监听器排在整个启动之后：启动、`onStart`、`onResume` 在主线程的同一条消息里做完，那时这两个已经过了，监听器里订的收不到。这一条是读源码推的，延后那一半的实测被打断了，**没验过**。
- **`activitydestroy` 用 `onActivityDestroyed`，当场派发**：页面的 `onDestroy` 里，视图都还在。先派发（`activities` 里还有它，`contentView` 还是那棵树），再把内容拿下来、丢掉替身（内容变回自由的），最后从 `activities` 里拿掉。
- **销毁的页面**：`contentView` 读出 `null`；写一个视图抛 `InvalidStateError`（写不进去的视图不动），写 `null` 什么都不做；写不是视图的值照样先抛 `TypeError`。拿下来时还留着这个页面替身的视图不在树上，下次挂上时 `build` 发现替身是别的页面的，丢掉重建。
- **最后一个页面关了运行时照常跑**：定时器、网络照旧，直到系统回收进程。从桌面再点开是同一个进程里的新页面，`main.js` 不再跑，界面要在 `activitycreate` 里建。进程也可能被别的原因拉起（以后的推送、广播），那时 `main.js` 跑了，一个页面都没有。
- **原生里「只有一个页面」的假设去掉了**：`DomainHost.activity` 换成 `app`（`Application`）。App 层（`AppDomain`）的返回、生命周期、配置、链接、内存告警的状态按页面分开存（`WeakHashMap`，`Page` 只弱引用着页面），包信息用 App 的；安全区域（`WindowInsetsDomain`）上次的边衬按页面分开存；动画读时长缩放、图片和文字读项目的 assets、建 `BitmapDrawable` 用 App 级的 `contentResolver`、`assets`、`resources`。只做了编得过、行为不变的最小改动，这几组的 API 没动。
- 走引擎现成的 `EmitAppEventWithObject`（iOS 的 `sceneconnect` 也走它），JNI 加了一个入口；`21-application.js` 装了 App 级事件的出口（`setEventSink`），原来 Android 上没装。出口的返回值是「有没有人 `preventDefault`」，返回 `false` 才是调了。`error`、`unhandledrejection` 返回 `true`：Android 上还没有派发给 `application`，照原来的样子打默认的日志。
- `ActivityEvent` 的 `activity` 必填，不是页面抛 `TypeError`。
- 验收：`steps/activity-lifecycle.js` 按返回让页面结束（adb 启动的页面按返回会结束），验 `activitydestroy` 和销毁的页面、没有页面时定时器照跑；再 `relaunch`，验新的 `activitycreate`，把旧页面上的树放进新页面点得到，拿下来时留着旧替身的视图也在新页面上重建、点得到。

### 关掉系统的视图状态恢复

运行时建的每个视图 `isSaveEnabled = false`（`NativeBridge.construct`）：进程被杀之后系统会按 id 把旧的滚动位置这类灌回新建的视图，和「状态以 JS 为准」冲突。做在运行时里不靠壳，以后换成 CLI 的模板也不会漏。验收里验不了（要杀掉进程再从最近任务回来），**没验过**。

### 顺手修的

`ViewDomain` 记「订 `click` 之前可不可点」的表原来是强引用，带着监听器的视图被丢掉时（没走取消订阅）这一项留着，连带视图和页面。改成 `WeakHashMap`。还原的是订阅那一刻的值，订阅期间 JS 写的 `isClickable` 会被盖掉，这一条留给触摸组（`isClickable` 变成登记的状态时一起改）。

### 过渡期

第一步改了所有组都依赖的机制，已经合进来的外观、布局、文字、图片、滚动和动画第二步按新总则重写之前：

- 它们的内置脚本照样加载，构造照样能用（多给的 `context` 不管）。
- 还没改的成员在挂着的视图上照样能用：`nativeGet` / `nativeSet` / `nativeCall` 这几个助手碰到公开的视图，挂着就走它的替身；自由或拿下来时抛 `InvalidStateError`。对象参数是自由的视图时传 `null`，原生按类型不对拒掉。
- 和新机制直接冲突的从 `31-layout.js` 里删了：`addView` 的五种写法、`removeView` / `removeViewAt` / `removeViews` / `removeAllViews`、`indexOfChild`、`bringChildToFront`、`updateViewLayout`（直接改原生的树，会和 JS 的对不上）、`View.parent`（读原生会把系统放内容的 `FrameLayout` 交出来）、`LinearLayout.orientation`（挪进了基础）。`LayoutDomain` 里对应的原生分支没动，现在走不到。
- 验收里这 7 步先注释掉（`acceptance-android/src/main.js`），哪组改完打开自己那几行。

### 验收

先在没有这一步的运行时上跑了一遍：`application.activities` 不存在、`activitycreate` 等不到，页面那几步一步都没跑，判为失败。做完之后 2026-11-26 在 Pixel 6（Android 17）上 Debug 和 Release 都是 1032 条通过、0 条失败（外观等 7 组的步骤没跑）。同一天改成运行时跟着 App 生死：先用改之前的实现跑新的页面那一步，销毁的页面写视图那 3 条失败，运行时跟着页面关了，后面的「没有页面」「再打开」一段都没跑到；改完之后 2026-11-27 Debug 和 Release 都是 1066 条通过、0 条失败。

- `slice.js`：`activitycreate` 的事件和时机、`activities`、不能 `new` 的、`Context` 和 `Button` 没有了、自由时加的监听器挂上之后收得到点击、只挂在树上的视图 GC 之后监听器还在。
- `inheritance.js`：子类不传参数、自由时写状态、在树里是同一个子类实例、系统不调 `onDraw`。
- `tree.js`：树的全部操作和报错、内边距和方向的转换和警告、挂上和拿下来（拿下来时写的字放回去点得到）、移来移去、像素和密度。也量了 `TextView` 带着系统主题建时的内边距：没写过的和四边写了 0 的宽高一样（148×54 像素），主题给的是 0。
- 验收脚本加了 `density <dpi>|restore`（`adb shell wm density`），和 `night` 一样，脚本退出时（含中途失败）一定还原。

## 安全区域（窗口边衬）

`targetSdk` 37 下系统强制内容铺满全屏，状态栏、导航条、摄像头开孔、键盘各占多少，由系统用「窗口边衬」分发给视图树。运行时把它交给 JS，由 JS 自己往里缩，不替 JS 做排版决定。

- `activity.windowInsets`：读的时候问页面最外层的视图（`decorView.rootWindowInsets`），按 `WindowInsets.Type` 的七类各取一份 `Insets`，拼成 `[左, 上, 右, 下]` 交给 JS，JS 建成 `WindowInsets` / `Insets` 两个值类（`09-insets.js`）。它们是快照，字段只读（私有字段加 getter，严格模式下赋值抛 `TypeError`），不能 `new`。
- **`activitycreate` 那一刻是 `null`**：页面的 `onCreate` 刚跑完，窗口还没挂到屏幕上，系统还没分发过。这是 Android 的事实，照实交出去，不编一个值。
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
| `classObject` / `classCall` / `classCallObject` | 类级的属性、方法、返回一个对象的方法 | `NOT_MINE` / `null` / `NOT_MINE` |

- **对象归哪个域问、用哪个 JS 类名**：按类的继承层级排，离对象最近的类先（`EditText` 的域排在 `TextView` 的前面），和登记的先后无关。
- **参数**：`args` 是解好的值（`null`、`Boolean`、`Double`、`String`、`List`、`Map`），对象参数按下标在 `objects` 里。JS 那一侧已经照 Web IDL 转好了类型，原生只校验，不对就抛 `NacreTypeError`（JS 是 `TypeError`）；Java 自己抛的异常在 JS 里是 `name` 为异常类名的 `Error`。
- **事件**：`host.emitter.plain`（不带数据）、`.json`（带一个 JSON 值和事件类名）、`.obj`（带一个原生对象）。都排到下一轮派发；带数据的按 `core` 的 `05-events.js` 登记的事件类建，要新的事件类就在自己的内置脚本里用 `ctx.defineEventClass` 定义。
- **枚举**：用 `Enums.kt` 的 `EnumTable`，属性写错抛 `NacreWarning`（JS 打警告、值不变），参数写错抛 `NacreTypeError`，见下面「外观」一节。
- **登记**：在 `Domains.kt` 的列表里加一行。

现有的域：`ViewDomain`（竖切的那几个类）、`WindowInsetsDomain`、`BlobDomain`、`WebSocketDomain`、`IntlDomain`、`AppearanceDomain`、`LayoutDomain`（布局）、`ScrollDomain`、`AnimationDomain`、`TextDomain`（文字）、`AppDomain`（App 层）、`ImageDomain`（图片）。

### JS：自己的内置脚本

在 `android/runtime/src/main/builtin/parts/` 加自己的文件（文件名的数字决定执行顺序，接在 `10-view.js` 之后的用 `3x`、`4x`……）。新类用 `ctx.defineNativeClass`；往已有的类（比如 `View`）上加成员，在自己的文件里往它的原型上加，不改 `10-view.js`。桥的助手（`nativeGet`、`nativeSet`、`nativeCall`、`nativeCallObject`、`nativeCallAsync`、`own` / `ownOne` / `disown`、`toInteger`、`toText`……）都在 `ctx` 上，见 `01-bridge.js`。持有关系（父视图持有子视图这类）要记所有权边。

### 验收和文档

- 验收：`acceptance-android/src/steps/` 加自己的步骤文件，`main.js` 加一行。先写用例、在没有实现的运行时上跑一遍看到失败，再写实现。要点击的用 `[acceptance] tap 视图上的字`。
- 跑验收：`bash android/scripts/run-device.sh`（加 `--release` 是 Release）。手机只有一台，脚本用一把锁（`$TMPDIR/nacre-android-device.lock`）让几个会话排队，别的会话占着时会打「手机正被别的验收占着」并等着。
- 文档：在这一页加自己的一节（怎么实现的、和 iOS 不同的地方、实测）。

### 规矩

`project.md` 第 4 节「接类的总则」（2026-11-26 定，取代原来的「接类的规矩」）。视图上的状态用 `ctx.defineViewState` 在自己的文件里登记，枚举表放进域的 `enums`，见上面[自由和挂上](#自由和挂上)。覆写点「能用属性就用属性」照旧。

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
- **属性里的枚举写错**走外观组补的那条路：域的 `write` 抛 `NacreWarning`，JS 那边打一条警告、值不变。简单的名字表用 `Enums.kt` 的 `EnumTable`；宽高（名字和像素混在一起）自己核，`Gravity`（每个方向一个取值）用几组共用的 `Gravity.kt`，措辞都和 `EnumTable` 一样。
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

## 文字

落在已有的 `TextView` 上，加一个新类 `Typeface`。除了字号、颜色、字体、对齐、行数、省略号、行高、字间距、可选中、测量，还有字体特性（`fontFeatureSettings`，比如等宽数字）、可变字体的轴、按基线定高、自动缩字号、下划线和删除线、文字阴影。原生是 `TextDomain.kt`（`View`、`TextView` 在 `ViewDomain` 里已经登记过，这里再登记一次，JS 类名一样，为的是问到它们的成员时也问这个域），JS 是 `32-text.js`：往 `TextView`、`View` 的原型上加成员，不改 `10-view.js`。验收是 `steps/text.js`。

### 成员怎么起名

照「getter 和 setter 名字对得上才合成一个属性，和 Kotlin 一样」，结果有几处和直觉不同，都是照 Java 来的：

- **`textSize` 只读，写走 `setTextSize()`**：唯一一处不照 Kotlin。`getTextSize()` 是像素，`setTextSize(16)` 是 sp，Kotlin 把它们合成一个属性，写 16 读出来是 42。所以属性只读（像素），写有两个方法，都和 Java 对得上：`setTextSize(size)`（sp）、`setTextSize(unit, size)`，单位是 `TypedValue.COMPLEX_UNIT_*` 去前缀：`'px' | 'dip' | 'sp' | 'pt' | 'in' | 'mm'`。`textSizeUnit` 只读。用户定的。
- 没有 `getTextColor()`，所以是 `setTextColor(color)` 加只读的 `currentTextColor`。
- `isTextSelectable()` 和 `setTextIsSelectable()` 名字对不上，所以是只读的 `isTextSelectable` 加方法。
- `lineSpacingExtra`、`lineSpacingMultiplier` 只读，两个一起用 `setLineSpacing(add, mult)` 设。
- `typeface` 的读走「返回对象的方法」那条通道（`getTypeface`）：Android 的桥上没有读对象属性的通道，也用不着加。
- `setFontVariationSettings()` 有返回值（有没有字体文件用上了），Kotlin 不把它合成属性，所以是只读的 `fontVariationSettings` 加方法；`fontFeatureSettings` 是普通的可空字符串属性。
- 自动缩字号：`autoSizeTextType` 只读（setter 叫 `setAutoSizeTextTypeWithDefaults`，名字对不上），另外两个方法照 Java 按位置传，单位和 `setTextSize` 一样。几个读数都是像素。

枚举：`gravity` 是 `Gravity` 的位掩码，用字符串数组，规则和布局组（`LinearLayout.gravity`、`LayoutParams` 的 gravity）一样：每个方向最多一个名字，外加两个裁切的开关；不收 `center`、`fill` 这种两个方向合起来的名字（读出来总是拆开的，收了就写进去和读出来不一样）；读出的顺序是横向、竖直、裁切。表和规则在 `Gravity.kt`，布局组的 `LayoutDomain` 也用它（一开始两组各写了一份，规则和文案一样，文字组后合进来时收成了一份）。TextView 自己会给没写的方向补默认（只写 `['bottom']` 读出 `['start', 'bottom']`）。一开始文字组的规则不同（收 `center`、同一方向的名字照 Java 位或、竖直在前），和布局组对过之后用户定了照布局组。`ellipsize` 是 `TextUtils.TruncateAt`（Java 的 enum，照同一条规矩），`null` 是不加省略号。`paintFlags` 是 `Paint.*_FLAG` 的位掩码，去掉 `_FLAG` 转驼峰（`'underlineText'`、`'strikeThruText'`……），写的时候只换表里的这几位，表外的位原样留着（免得清掉系统私下设的）；实测 TextView 默认是 `['antiAlias', 'filterBitmap', 'devKernText', 'embeddedBitmapText']`。`textAlignment` 在 `View` 上。

颜色照外观组：CSS 写法的字符串，用 `30-appearance.js` 放在 `ctx` 上的 `colorArgument` / `colorProperty` / `colorText` 解析和写回，原生收发 ARGB 的无符号数。枚举用 `Enums.kt` 的 `EnumTable`：属性位写错抛 `NacreWarning`（桥打警告、值不变），方法参数写错抛 `NacreTypeError`；文案里的名字是属性名或参数名，不带类名，和外观、布局两组一样。

### 补上的通道：类方法返回一个原生对象

`Typeface.create()` 这类静态工厂要它。引擎（`core/engine` 的 `classCall` → `host.call_class_object_method`）本来就有，iOS 在用，只是 Android 的 JNI 没接。补的四处都在 `android/` 里、只加不改：`NacreJni.cpp` 接上回调，`NativeBridge.callClassObjectMethod`，`Domain.classCallObject`（默认「不是我的」），`01-bridge.js` 的 `nativeClassCallObject`。

### 从项目的 assets/ 读字体

`Typeface.createFromAsset(path)` 同步，和 Java 一样，去掉了 `AssetManager` 参数（JS 里没有这个类），路径相对项目的 `assets/`。开发用的壳把项目的 `assets/` 拷到包里 assets 下的 `app/`（不和 `main.js`、`nacre/` 撞），`run-device.sh` 用 `-PnacreAssets` 把 `acceptance-android/assets/` 传进去。以后 CLI 生成 `android/` 时照这个位置放。

验收用的字体是自己拼的（`acceptance-android/scripts/make-test-font.py`，不带任何现成字体的许可）：一个 em 是 1000，上伸 2000、下伸 1000，ASCII 全映射到一个方块。实测 40 像素的字号下系统字体行高 47，换上它是 120，正好 3 倍，证明字体真的换上了。

### 实测到的 Android 的行为

- `textAlignment` 读出的是**解析后的值**（`getTextAlignment()`；能读回写进去的值的 `getRawTextAlignment()` 是隐藏 API）。`'inherit'` 没有父视图时读出默认的 `'gravity'`，挂上之后读出父视图的；别的值没挂上也读得到。和网页不同：网页有两层，`el.style.textAlign` 写什么读什么，`getComputedStyle()` 是算出来的，元素不在文档里时是空串（Chromium 实测）。照 Android 原样，用户定的。
- **App 不声明 `android:supportsRtl="true"`，`textAlignment` 完全不生效**：系统一律解析成 `'gravity'`。一开始壳没声明，验收里设什么都读出 `'gravity'`，加上之后才对。开发用的壳现在声明了，以后 CLI 生成 `android/` 也要写（Android Studio 新建的工程默认就有）。代价是系统语言从右往左时（阿拉伯语这类）start / end 对调、布局镜像，和网页的 `dir="rtl"` 一样。用户定的。
- 测量（`lineCount`、`baseline`）也要排过版：之前是 0 和 -1。
- `TextView` 的 `typeface` 默认不是 `null`。
- `setFontVariationSettings()` 的返回值看的是这个视图背后的全部字体文件，**包括系统的后备字体**：测试字体没有轴，但后面接着的 Roboto 有 `wght`，照样返回 `true`。要 `false` 得写一个谁都没有的轴。
- `firstBaselineToTopHeight`、`lastBaselineToBottomHeight` 是靠改上下内边距实现的，设了之后 `paddingTop`、`paddingBottom` 跟着变。
- Java 自己抛的：`Typeface.create(family, 1001, false)` 是 `IllegalArgumentException`；`lineHeight = -1` 是 `IllegalArgumentException`；`createFromAsset` 找不到文件是 `RuntimeException`。
- `letterSpacing`、`lineSpacingMultiplier` 这些是 Java 的 `float`，交给 JSON 时用 `Float.toString()` 的最短写法：写 0.1 读回 0.1，不是 0.10000000149011612。

**未验证**：
- `setLineHeight(unit, value)` 在 Android 14 以前没有带单位的版本，换成像素再设（之后用户改字体大小不会跟着变）。手机是 Android 17，这一支没跑过。
- 自动缩字号真的缩了没有：要视图的宽高是定的才生效，那要布局组的 `layoutParams`。这一步只验了配置的读写。
- 下划线、删除线、阴影在屏幕上的样子（只验了读写）。
- 壳声明了 `configChanges` 里的 `fontScale`，用户在系统设置里调字体大小时页面不重建，用 sp 设的字号跟不跟着变没验（要改手机的系统设置）。

### 没做的

富文本（`Spannable`）以后单独一组。要新类的：按状态变色（`ColorStateList`）、测量（`Layout`）、不上屏测文字（`Paint`、`StaticLayout`）、`Typeface.Builder`，建议另开「文字（二）」先讨论形状。`createFromFile` 等文件系统。`breakStrategy`、`hyphenationFrequency`、`justificationMode`、`lineBreakStyle`、`allCaps`、`singleLine`、`textScaleX`、`fallbackLineSpacing`、`elegantTextHeight` 这一步没做，照现有规矩就能接。

## App 层

2026-11-24 接的，2026-11-27 照[接类的总则](../project.md#接类的总则2026-11-26-定)重写。原生在 `AppDomain.kt`，JS 在 `33-app.js`，验收是 `acceptance-android/src/steps/app.js`。

### 成员

页面自己的事挂在 `activity` 上，整个 App 的事挂在 `application` 上。页面是系统建的，没有自由和挂上这回事，状态都在原生那边，JS 读写的就是原生的。按总则的四类过了一遍：

| | 成员 | 哪一类 |
| --- | --- | --- |
| `application` | `packageName`、`versionName`、`versionCode` | 只读的值。运行期间不变，没有变化事件 |
| | `openURL(url)` | 一次性的请求：`Promise<boolean>` |
| | `trimmemory`（`TrimMemoryEvent`：`level`） | 事件 |
| | `openurl`（`OpenURLEvent`：`url`、`activity`） | 事件 |
| `activity` | `lifecycleState` | 系统改的状态，只读；变化是 `start` / `resume` / `pause` / `stop` |
| | `handlesBack` | 状态：JS 设、JS 读（读回的就是写进去的）。只有 JS 自己改，没有变化事件 |
| | `back`、`backcancel`（`Event`）；`backstart`、`backprogress`（`BackEvent`：`progress`、`touchX`、`touchY`、`swipeEdge`） | 事件 |
| | `configuration`（`Configuration` 快照） | 系统改的状态，只读；变化是 `configurationchange` |

生命周期、返回、配置变化、被链接打开、内存告警都会反复发生，所以全是事件；一次性的只有 `openURL()`。系统的通知都延后一轮派发、不可取消。没有动作，所以没有「页面销毁了调动作」要抛的；销毁的页面 `lifecycleState` 读出 `'destroyed'`。

### 这一步定的

- **`openurl` 挪到 `application` 上，带着 `activity`**（收到链接的页面，必填）。`launchURL` 删了：页面建好时启动它的 intent 带着地址，也发一次 `openurl`，排在 `activitycreate` 后面，`activitycreate` 的监听器里订的收得到。这样冷启动、没有页面时被链接打开、运行中被链接打开是同一个事件。iOS 也是这样（`openurl` 在 `application` 上，带 `scene`，冷启动排在 `sceneconnect` 后面，见[被链接打开](open-url.md)）。
- **`openURL()`、`trimmemory` 不经过页面**，没有页面时也能用（下面「application 绑在 App 本身上」）。
- **`BackEvent.touchX` / `touchY` 是 dp**（小数）。按返回键这类没有手指的（`swipeEdge` 是 `'none'`）是 `null`，不是 0。`new BackEvent(type)` 不带 init 时也是 `null`。`swipeEdge` 的 `'none'` 是 Android 自己的常量（`EDGE_NONE`），不是哨兵，留着。
- **`Configuration` 的字段**：`screenWidth`、`screenHeight`、`smallestScreenWidth`（单位都是 dp，不在名字里说，去掉 `Dp` 后缀）；`density` 取代 `densityDpi`，是 1 dp 等于几个像素，和运行时换算视图长度用的是同一个数（`displayMetrics.density`），每英寸的点数是它乘 160；系统说「没定」的（`*_UNDEFINED`、`ORIENTATION_UNDEFINED`）给 `null`，不给 0 和 `'undefined'`。

### application 绑在 App 本身上

原来 `application` 是纯 JS 的对象，原生只能往原生对象的包装上发事件，内存告警就借页面发（内部的 `@trimmemory`），`openURL()` 也借页面调。页面可能一个都没有之后，这条路断了。

现在 `33-app.js` 启动时调一次 `native.construct('Application', …, application)`：`AppDomain` 的 `classes` 里登记了 `android.app.Application` → `'Application'`，`construct` 交回这个进程的 `Application` 对象，引擎把它绑到已有的 `application` 上（和 `new` 一个原生类时绑 `this` 是同一条路）。之后：

- 原生往 `host.app` 发的事件直接到 `application` 上。`trimmemory` 订的是 `Application.registerComponentCallbacks`，没有页面时也来。
- `openURL()` 用 App 的环境 `startActivity`（本来就带着 `FLAG_ACTIVITY_NEW_TASK`，App 的环境打开页面必须带它）。
- 包信息是 `application` 上的一次属性读，不再走类级调用。

`core/engine/`、`01-bridge.js`、`21-application.js` 都没改。`application` 是全局的，包装不会被回收，绑上之后一直是同一个。

### 被链接打开

- **运行中**：壳的页面是 `singleTask`，别的 App 打开一条指向它的链接，已经在跑的页面收到 `onNewIntent`（`addOnNewIntentListener`），intent 带着地址就发。
- **页面建好时**：`AppDomain` 自己订了 `registerActivityLifecycleCallbacks`，在 `onActivityPostCreated` 里看启动这个页面的 intent，带着地址就发。这时 JS 还没订（订是在 `activitycreate` 里），所以不看订没订：排到下一轮，`activitycreate`（当场派发）已经过去了；没人订 JS 那边就丢掉。系统把页面重建出来的不算：`savedInstanceState` 不是 `null`（进程被杀之后系统恢复的页面），或者 intent 带着 `FLAG_ACTIVITY_LAUNCHED_FROM_HISTORY`（从最近任务回来），带的还是原来那条链接，不是这一次被打开。
- **怎么到 `application` 上**：哪个页面收到的，原生就发在哪个页面上（内部的名字 `@openurl`，事件类 `@OpenURLNotice` 只登记在 `eventClasses` 里、不挂全局），`33-app.js` 转成 `application` 上的 `OpenURLEvent`，`activity` 是那个页面。`application` 上有人订 `openurl` 时，现在有的页面和以后建的页面（内置脚本自己的 `activitycreate` 监听器，排在 App 的前面）都订着 `@openurl`；没人订时都摘掉，原生的 `onNewIntent` 监听也跟着摘。
- 页面上订 `openurl` 不抛，当自定义事件，永远不会来。

### 用的是 AndroidX 的 ComponentActivity

运行时的依赖里有 `androidx.activity:activity`（和壳同一个版本）。Android 11、12 上的返回回调、`onNewIntent` 的监听、页面级的配置变化，平台的接口都给不了，只有 `ComponentActivity` 有：

| | 用的是 |
| --- | --- |
| 生命周期 | `lifecycle`（`LifecycleEventObserver`）。`addObserver` 会当场把已经发生过的事件补发给新的观察者，那些不是「现在发生了」，不发给 JS |
| 返回 | `onBackPressedDispatcher` 上一个 `OnBackPressedCallback`。`handlesBack` 就是它开没开 |
| 配置变化 | `addOnConfigurationChangedListener` |
| 运行中被链接打开 | `addOnNewIntentListener`，intent 带着地址才发 |

都是有人订了才装回调。页面级的状态按页面分开存（`WeakHashMap`，`Page` 只弱引用着页面）。内存告警不在这张表里：它订在 `Application` 上。

### 返回键：能用属性就用属性

`targetSdk` 37 下预测性返回是强制开着的：系统在手势**开始之前**就要知道 App 接不接返回，好决定播「回到桌面」还是「留在 App 里」的动画。这一刻来不及问 JS，所以照「能用属性就用属性」：JS 提前把 `handlesBack` 设好，原生照着答。

**按键也走预测性返回那一套**（实测，Pixel 6，Android 17）：按返回键（三键导航，或者 `input keyevent`）时先来一个 `backstart`，`swipeEdge` 是 `'none'`、`progress` 是 0、`touchX` / `touchY` 是 `null`，紧接着 `back`，中间没有 `backprogress`。从边缘滑是 `backstart`、一串 `backprogress`、`back`（松手）或 `backcancel`（放弃）。Android 13 及以前没有预测性返回，只有 `back`（没在手机上验过）。

`handlesBack` 为 `false` 时（默认）系统照它自己的做法处理，原生不替 JS 改：

- **从桌面启动的**：Android 12 起根页面按返回是把 App 退到后台，页面不结束。系统只对「从桌面启动的任务」这么做。**没验过**：要人从桌面点开 App、按返回、再点开，看是不是同一个页面。
- **adb 启动的（验收就是这样）**：按返回会把页面结束。实测过两种启动法都是这样：`am start -n`，和带上 `MAIN`、`LAUNCHER` 的 `am start`（调用方是 shell，不算桌面）。运行时不跟着页面关，再打开是同一个进程里的新页面，`main.js` 不再跑。
- Android 11 上根页面按返回也是结束页面（系统文档的说法，没验过）。

### 配置变化不重建页面

`project.md` 第 4 节定了配置变化不重建页面，改成给 JS 发事件。壳的 `configChanges` 声明了 `ActivityInfo` 里公开的全部 `CONFIG_`（`mcc`、`mnc`、`touchscreen`、`colorMode`、`fontWeightAdjustment`、`grammaticalGender`、`assetsPaths` 这几项原来漏了，没声明的配置一变，系统就重建页面）。

`configuration` 是一份快照（值类 `Configuration`，做法和 `WindowInsets` 一样：字段只读、不能 `new`、每次读是新的一份）：`orientation`（`'portrait'`、`'landscape'`，没定是 `null`）、`screenWidth`、`screenHeight`、`smallestScreenWidth`、`density`、`fontScale`、`isNightModeActive`、`locales`（BCP 47 写法，冻结的数组）、`layoutDirection`（`'ltr'`、`'rtl'`）。系统只有一个 `onConfigurationChanged`，所以事件也只有一个 `configurationchange`，JS 读新值自己比。`Float` 直接转 `Double` 会带出 `1.149999976` 这样的尾巴，按它写出来的样子转。

### openURL

`ACTION_VIEW` 加 `FLAG_ACTIVITY_NEW_TASK`：打开的 App 放进它自己的任务，不叠在这个 App 的页面上面，切回来时回到的还是这个 App。`startActivity` 没抛就兑现为 `true`；没有 App 能处理（`ActivityNotFoundException`）或者不让打开（`SecurityException`）兑现为 `false`，不拒绝。不带参数当场抛 `TypeError`。没有 `canOpenURL`：Android 11 起要先在清单里声明包可见性才查得到别的 App。

App 在后台时（没有看得见的页面）系统会拦下从后台打开页面，`startActivity` 不抛，兑现的还是 `true`，**没验过**。

### 内存告警

`level` 照 `ComponentCallbacks2` 的 `TRIM_MEMORY_` 常量，去掉前缀、首字母小写：`'uiHidden'`、`'background'`、`'moderate'`、`'complete'`、`'runningModerate'`、`'runningLow'`、`'runningCritical'`。系统以后加的级别按落在哪一档归过去。Android 14 起系统正常只发 `uiHidden`（界面全看不见了）和 `background`，别的级别要用 `am send-trim-memory` 才发得出来。

### 明确不做的

- 页面上的 `create`、`destroy` 事件：页面建好、销毁由 `application` 的 `activitycreate` / `activitydestroy` 报告，页面上不再发一份。订阅不抛，当 JS 自己的自定义事件，永远不会来。
- 能取消的返回：系统等不了，由 `handlesBack` 提前答。
- 进程级的前后台（`ProcessLifecycleOwner`）：壳现在只有一个页面，页面的 `start` / `stop` 就是前后台。以后有了几个页面，要不要加单独讨论。

### 和 iOS 的 application

- **一样的**：`openURL()` 返回 `Promise<boolean>`、失败给 `false` 不拒绝；`openurl` 在 `application` 上，`OpenURLEvent` 的 `url`，带着是哪个页面（iOS 是 `scene`，这里是 `activity`），冷启动的地址也走它、排在页面（场景）来了之后；系统通知都不可取消。
- **不一样的**：状态和事件照 Android 的 Lifecycle（不是 `active` / `background`），挂在页面上；包信息照 Android 起名；内存告警带级别、叫 `trimmemory`；多了 `handlesBack` 和返回的四个事件、`configuration`；没有场景、`info`、`state`；`OpenURLEvent` 没有 `sourceApplication`，`url` 不是必填（不带是空串，照原来的；iOS 不带抛 `TypeError`）。

### 验收怎么触发系统事件

JS 打「`[acceptance] <命令> <参数>`」，`run-device.sh` 照做，和 `tap` 并列：`key back`、`backswipe commit|cancel`（从左边缘注入一段手势）、`relaunch`（像从桌面点图标那样切回前台）、`open <网址>`（带着网址打开：有页面时触发 `onNewIntent`，没有页面时建一个新页面）、`trim-memory <级别>`、`night yes|no`（切深色模式；改的是手机的设置，脚本退出时还原）。参数要拼进手机上的 shell 命令，只放行网址里常见的字符。

这一步排在所有步骤之后：它会离开 App 一次（`openURL` 打开浏览器），最后还按返回把页面关掉、发 `trim-memory COMPLETE`（没有页面时内存告警照样来）、再 `open` 一个网址（新页面建好之后来 `openurl`）。做完之后 `ctx.activity` 是这个新页面。第一个页面（基础那几步的最后一步关掉的）和第二个页面的生命周期也在这一步里核：每个页面都是在 `activitycreate` 里订的。

撞到过的：

- **一下跳回边缘松手，系统当成返回。** 注入的手势要一步一步慢慢滑回边缘、在边缘停一下再松手，系统才认成放弃，发 `backcancel`。
- **`am send-trim-memory` 只能往高里发。** 进程已经收过某一级，再发同一级或者更低的，系统抛「Unable to set a higher trim level than current level」。所以没有页面时发的是最高的 `COMPLETE`。脚本里手机上的命令失败只打出来，不让整个脚本退出。
- **装新包时系统会把正在跑的 App 再打开一次**（Android 17 的 `PackageUpdateActivity`）。脚本装完包先强制停掉再打开，不受影响；但跑的时候进程要是被杀掉重来、`main.js` 从头再跑一遍，脚本是按「第几条请求」计数的，新的一遍发来的请求会被当成已经做过，JS 那边就一条条等到超时。页面结束不会这样：运行时不跟着页面关。

### 实测（Pixel 6，Android 17）

数是 Release 那一遍的日志里读的；Debug 那一遍断言一样，全过。

- 配置：竖屏 411×914 dp，`smallestScreenWidth` 411，`density` 2.625（420 dpi），`fontScale` 1，`locales` 是 `['zh-Hans-CN']`。
- 从左边缘滑：注入的手指走到第二个点（屏宽的 1/10，108 像素）时系统认成返回，`backstart` 的 `touchX` 是 41.14 dp、`touchY` 是 457.14 dp（屏幕高度的一半，1200 像素）。滑过去一次 16 个 `backprogress`，`progress` 从 0 到 0.435。按返回键的 `backstart` 两个都是 `null`。
- 运行中被链接打开（`am start` 带着网址）：页面先 `pause`，再来 `openurl`，再 `resume`。系统交新 intent 之前先把页面暂停，这是 Android 的做法。
- 带着网址新建页面：`activitycreate` 之后来 `openurl`，在这个页面的 `start`、`resume` 前面（系统在同一条消息里接着做 `onStart`、`onResume`，它们的事件排在后面）。只来一次。
- 按返回关掉最后一个页面：系统自己发了一个 `background`，派发时已经没有页面；接着发的 `COMPLETE` 也照样到了 `application` 上。页面的 `stop` 延后一轮派发，那时页面已经销毁，`lifecycleState` 读出 `'destroyed'`。离开 App 去浏览器时发的是 `uiHidden`，那时页面还在。
- 没有页面时包信息照样读得到，`openURL()` 不带参数照样抛 `TypeError`。

验收先在旧实现上跑了一遍：22 条失败，`watchApp` 和 `stepApp` 在旧的 `trimmemory`、`openURL()` 上中途抛了（它们用了删掉的 `application.activity`），`tree.js` 和安全区域读不到 `density`。改完之后 2026-11-27 Debug 1207 条、Release 1206 条通过，都是 0 条失败。

### 欠的验证

- 从桌面启动时，不接返回按返回键是退到后台、不结束（见上面「返回键」）。
- 转屏、改字号、改语言时的 `configurationchange`：验收只切了深色模式。
- Android 11 到 13 上的返回（没有预测性返回，只有 `back`）：手机只有 Android 17 的一台。
- 真正的冷启动（进程不在时被链接打开）：验收是在同一个进程里关掉页面、再带着网址打开的，走的是同一段代码（`onActivityPostCreated`），只是 `main.js` 先跑了。别的 App 里点一条链接打开本 App 也没试过：验收是 `am start -a VIEW -d` 带着网址打开的。
- 系统重建出来的页面不发 `openurl`（`savedInstanceState`、`FLAG_ACTIVITY_LAUNCHED_FROM_HISTORY` 那两条）：要杀掉进程再从最近任务回来，验收里做不了。
- App 在后台时 `openURL()` 被系统拦下的样子。

## 图片

`ImageDecoder`（来源、读头、解码成 `Bitmap` 或 `Drawable`）、`Bitmap`、`BitmapDrawable`、`AnimatedImageDrawable`（动图）、`ImageView`。原生在 `ImageDomain.kt`，JS 在 `34-image.js`，验收是 `steps/image.js`，测试图由 `acceptance-android/scripts/make-test-images.py` 自己拼（不带任何现成的图），放在 `acceptance-android/assets/images/`。

### 定下来的几条（2026-11-24）

| | 做法 | 理由 |
| --- | --- | --- |
| 解码用哪套 | 只接 `ImageDecoder`，不接 `BitmapFactory` | `ImageDecoder` 是 Android 9 起推荐的，格式全（含 HEIF、动图），能边解边缩。两套都接是同一件事两种写法 |
| 同步还是异步 | 解码（`decodeHeader`、`decodeBitmap`、`decodeDrawable`）放到后台线程，返回 Promise；只动内存里像素的（`createScaledBitmap`、`createBitmap` 裁切）照 Java 同步 | Java 的解码是同步的，可 JS 在主线程，解大图会卡。原则 4：异步只有 Promise |
| 解码时的设置 | Java 的回调 `OnHeaderDecodedListener` 换成第二个参数里的一个对象，键名是那些 `set…` 去掉 `set`：`targetSize`（`{ width, height }`）、`targetSampleSize`、`crop`（`{ left, top, right, bottom }`）、`allocator`、`mutableRequired`、`unpremultipliedRequired`、`memorySizePolicy`、`decodeAsAlphaMaskEnabled` | JS 不实现 Java 的接口；「能用属性就用属性」。回调里能先看到图多大，所以补了一个 Java 里没有的 `ImageDecoder.decodeHeader(source)`：只读头，结果是 `ImageDecoder.ImageInfo`（`size`、`mimeType`、`isAnimated`，快照） |
| 来源 | `ImageDecoder.createSource(来源)`，来源是 `Blob`、`ArrayBuffer`、typed array 或 assets 里的路径，得到 `ImageDecoder.Source`，能解很多次 | 照 Java。`AssetManager` 参数去掉，路径相对项目的 `assets/`，和文字组的 `Typeface.createFromAsset` 一样（包里的 `app/`）。`ArrayBuffer` 在 JS 里先拷成 `Blob` 再过桥（桥上没有传字节的格式） |
| 动图 | `decodeDrawable` 遇到动图得到 `AnimatedImageDrawable`：`start()`、`stop()`、只读的 `isRunning`、`repeatCount`（数或 `'infinite'`），事件 `animationstart`、`animationend`（名字借 Web 的，普通的 `Event`） | 一次一次发生的通知用事件。为此外观组的 `Drawable` 改成继承 `EventTarget`（`30-appearance.js` 一行，用户同意） |
| `recycle()` | 暴露，连同只读的 `isRecycled` | 图的内存大，JS 的 GC 不知道它多大。代价照 Java：放掉之后还挂在视图上，系统画它时整个 App 崩 |
| 着色 | 这一步只做 `ImageView.setColorFilter(color, mode = 'srcAtop')`、`clearColorFilter()` | `imageTintList` 要 `ColorStateList`，文字组也要它，等它单独定 |
| 出错 | Promise 以 Java 异常的简单类名被拒：`DecodeException`、`FileNotFoundException`、`IllegalStateException`…… | 和同步调用时 Java 抛的一样 |

照规矩接的：`Bitmap`（`width`、`height`、`config`、`density`、`byteCount`、`allocationByteCount`、`isMutable`、`isPremultiplied`、`isRecycled`、`hasAlpha()`、`getPixel()`）；`BitmapDrawable`（`new BitmapDrawable(bitmap)`，`Resources` 用页面的；`bitmap`、`tileModeX` / `tileModeY`、`setTileModeXY()`、`isFilterBitmap`）；`ImageView`（`setImageBitmap()`、`setImageDrawable()`、只读的 `drawable`、`scaleType`、`adjustViewBounds`、`maxWidth` / `maxHeight`、`imageAlpha`、`cropToPadding`）。`config`、`PorterDuff.Mode` 这些 Java 的枚举去掉下划线转驼峰（`ARGB_8888` → `'argb8888'`，`SRC_ATOP` → `'srcAtop'`）。表示「没设 / 不限」的哨兵读出 `null`、写 `null` 清掉：`density` 的 `DENSITY_NONE`、`maxWidth` 的 `Integer.MAX_VALUE`、平铺的不平铺。

### 实现

- **嵌套的类**：`ImageDecoder.Source` 照布局组的办法，`defineNativeClass` 之后从全局摘掉、挂成静态成员。`ImageDecoder` 自己不是原生类（没有 Java 对象），只挂在全局；`ImageInfo` 是纯 JS 的值类。
- **类方法的通道**：没用文字组补的「类方法返回对象」。`createSource` 走造对象的通道（和外观组的 `RenderEffect` 一样）；解码挂在来源对象上走返回 Promise 的通道；`createScaledBitmap`、`createBitmap` 挂在原图上走返回对象的方法：Java 可能把原图原样还回来，同一个对象要是同一个包装，造对象的通道做不到。
- **读头**：用 `decodeDrawable` 加回调，回调里把 `ImageInfo` 抄成 JSON（出了回调它就不能用了），再扔一个自己的异常中止，像素一个都不解。
- **两条解码线程**：几张图能同时解，又不至于占满所有核。
- **返回 Promise 的方法里不能往外抛**：一开始解码设置写错（`allocator: 'gpu'`）时，在原生的 `callAsync` 里抛了 `NacreTypeError`，Promise 就一直悬着，验收卡住等不到结束标记。改成在域里自己 `settle.reject`。这个坑在桥上是通的（`NativeBridge.callAsync` 不接异常），别的组写 `callAsync` 时也要自己拒。
- 视图持有它显示的 `Drawable`（`image` 那条边），`BitmapDrawable` 持有它的图。

### 实测到的 Android 的行为（Pixel 6，Android 17）

- **不透明的图 `isPremultiplied` 是 `false`**：方案里以为默认是 `true`，实测不是。带透明度的图默认是 `true`，`unpremultipliedRequired` 之后是 `false`。所以验收加了一张半透明的图（`alpha.png`）。
- `allocator: 'hardware'` 解出来 `config` 是 `'hardware'`、不可改、`getPixel` 抛 `IllegalStateException`。默认的 `allocator` 由系统定（文档：一般放显存，小图可能不是），验收不断言它。
- `allocator: 'hardware'` 加 `mutableRequired` 以 `IllegalStateException` 被拒；`targetSize` 是 0×0 以 `IllegalArgumentException` 被拒。
- `memorySizePolicy: 'lowRam'` 下不透明的图解成 `'rgb565'`；`decodeAsAlphaMaskEnabled` 对三通道的图不起作用。
- `assets/` 里没有的文件到解码时才以 `FileNotFoundException` 被拒；不是图片的字节是 `DecodeException`。
- `setImageBitmap(null)` 之后 `drawable` 不是 `null`，是一个不拿图的 `BitmapDrawable`：`ImageView` 一直用自己建的那一个。
- 动图：`NETSCAPE2.0` 写着无限循环的 GIF，`repeatCount` 读出 `'infinite'`；写 −5 是 `IllegalArgumentException`。`repeatCount = 0` 时播一遍，`animationstart`、`animationend` 都来；无限循环时 `stop()` 也来 `animationend`。挂在屏幕上的视图里才真的动。
- `BitmapDrawable` 默认 `isFilterBitmap` 是 `true`；密度没设（`null`）的图，固有宽就是像素宽。

先在没有实现的运行时上跑了一遍：前 5 条断言（几个类不在）失败，步骤在 `ImageDecoder is not defined` 处中途抛了，判为失败。实现之后 2026-11-24 在 Pixel 6（Android 17，API 37）上 Debug 和 Release 都是 1334 条通过、0 条失败（这一组 192 条）。

**没验的**：着色在屏幕上的样子、动图在屏幕上的样子（要人看）；`'decal'` 平铺在 Android 11 上没有（表里按版本去掉了），没有 11 的设备；动图 WebP（不好手拼，只验了 GIF）。

### 没做的

`imageTintList` / `imageTintMode`（等 `ColorStateList`）；`imageMatrix`（要 `Matrix` 类，所以 `scaleType = 'matrix'` 现在没用处）；`Bitmap.compress`（编码回 PNG / JPEG）、`copy`、读写一片像素；`BitmapDrawable.gravity`（要文字组的 `Gravity.kt`，合进来之后再接）、`antiAlias`、`mipMap`；`ImageDecoder` 的 `setTargetColorSpace`、`setPostProcessor`、`setOnPartialImageListener`（后两个是回调）；`ImageView` 的 `baseline` 一组。

## 构建

- Android Gradle 插件 9.5.2 自带 Kotlin 编译，不用另外加 Kotlin 插件。
- 第一次编译时，插件会自己装它默认要的 build-tools 36。
- **拷内置脚本用 `Sync` 不用 `Copy`**：`Copy` 不删目标目录里的旧文件，从 `corePartsInUse` 里拿掉的脚本还留在包里。实际撞到过：拿掉 `23-fetch.js` 想看验收失败，`fetch` 却还在。
- **两个模块都要写 `ndkVersion`。** 只在 `runtime` 里写时，Release 包里的 `libnacre.so` 没去掉调试符号，有 71 MB：打包时去符号的工具从 `shell` 的 NDK 里找，`shell` 没写版本就找不到，也不报错。两边都写之后是 45 MB。
- 45 MB 里大部分是 V8：这份带完整的 JIT 和 WebAssembly。iOS 那份是 lite mode、不带 WebAssembly。要不要换一份更小的构建，以后再量。
- **CI 在每个 PR 上编一遍。** `check.yml` 的 `android` 任务在 `ubuntu-latest` 上用 `sdkmanager` 装 `platforms;android-37.0`、`ndk;29.0.14206865`、`cmake;4.1.2`，取 V8 和 ada（V8 的下载缓存起来，哈希每次都校验），打包 `acceptance-android`，再用它当 `main.js` 编 `:shell:assembleDebug` 和 `:shell:assembleRelease`。只编不跑；仓库里的 `gradle-wrapper.jar` 由 Gradle 官方的 `wrapper-validation` 核对。

## 验收

`bash android/scripts/run-device.sh`（加 `--release` 是 Release，要先设 `ANDROID_HOME`）：打包 `acceptance-android/`，编壳时用 `-PnacreMainJs=` 把它换成壳执行的 `main.js`，装、打开，从 logcat 读 `Nacre` 标签的原文，交给 iOS 验收的 `report.mjs` 判定：等到结束标记、没有 ✗ 就是 0；期限内没等到、App 提前退出、有 ✗ 都是 1。

**日志从打开那一刻起一直存进文件**（后台的 `adb logcat`），不每秒用 `logcat -d` 现读。手机的日志缓冲只有 256 KiB，原来现读时，页面那一步关掉页面再打开，系统的日志一多，前面的内容就被挤掉：下面的点击、动作请求是按「日志里一共几条」认的，条数变少，新的请求就不再执行（实际撞到过：新页面上的两次点击没点，「通过」只数到 80 条）。

**点击是脚本点的。** JS 打一行「`[acceptance] tap 视图上的字`」，脚本用 `uiautomator dump` 找到写着这几个字的视图，用 `adb shell input tap` 点它的正中。App 忙的时候（网络用例同时在跑）`uiautomator` 可能等不到界面空闲、写不出新文件，所以每次先删旧文件，找不到就隔一秒再 dump，最多 5 次；不这样会读到上一次的界面，点不到。跑的时候手机要**解锁、亮屏、别碰**：锁屏时点到的是锁屏；人手点的也会被如实收到，监听器会多触发（实际撞到过）。可以在开发者选项里打开「不锁定屏幕」，插着线就不会息屏。

**划动也是脚本做的。** JS 打一行「`[acceptance] swipe <dx> <dy> 视图上的字`」，脚本同样用 `uiautomator dump` 找到那个视图，从它看得见的那一块的正中，用 `adb shell input swipe` 划到偏移 (dx, dy) 像素的地方，用 300 毫秒。滚动那一步用它验手指拖动时的 `scroll`。

`acceptance-android/` 是从 iOS 的验收拷过来的 8 步（`console-basics`、`url`、`crypto`、`events`、`errors`、`web-globals`、`timers`、`performance`），去掉了用到 iOS 的类、`application`、`fetch`、`Blob`、`Intl` 的断言，留下的断言名字和期望值和 iOS 一字不差。`web-globals` 里「和网页逐条比对」那一段要 WebView，没拷。

先在第 1 步的运行时上跑过 Web 标准那批：没有 `setTimeout`，一条 ✓ 都没有、到不了结束标记，判为失败；竖切那一步在没有桥的运行时上跑，`application is not defined`，也判为失败。2026-11-24 在 Pixel 6（Android 17，API 37）上，Debug 和 Release 都是 922 条通过、0 条失败（外观之前；加上外观是 1142 条，见「外观」一节）。
