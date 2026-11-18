# 原生模块

（2026-11-16）App 团队和第三方把自己的原生代码接进来、给 JS 调的那一层。这一页记它为什么是现在的形状、和 `NacreDomain` 是什么关系、验证到了哪里。怎么用见[指南](../guides/native-modules.md)和 [API 文档](../api/native-modules.md)。

起因是第二份试用报告里最大的结构性缺口：凡是只提供原生 SDK、没有纯 JS 形态的能力（风控、推送、崩溃收集、人机验证），都用不了。运行时对外只有 `NacreRuntime` 的一个启动方法，没有登记自定义原生能力的口子。

## 为什么是两层

给能力包用的那套接口（`NacreExtension.h` 的 `NacreDomain`）早就有了，七个能力包都靠它。它不能直接拿来给第三方用：

| | `NacreDomain`（已有） | `NacreModule`（新增） |
| --- | --- | --- |
| 做的事 | 把一个原生**类**完整暴露给 JS：属性、方法、构造、类方法、对象参数、事件 | 把一组**函数**和事件暴露给 JS |
| 面有多大 | 十六条通道，外加所有权镜像、包装、`check-api.sh` 的三边核对 | 一个类、一个协议 |
| JS 那一半在哪 | 内置脚本的 part，用内部的 `ctx` | 普通的 npm 包代码，只用公开的 `application.nativeModules` |
| 头文件 | ObjC++（有 `std::string`），private，Swift 读不了 | 纯 ObjC，public，在 umbrella header 里 |
| 值 | JSON 加原生对象的指针 | JSON 加二进制 |
| 给谁 | 我们自己：接类、做能力包 | App 团队、第三方 |

第三方要的几乎都是右边那一列：调一个 SDK 的几个方法，收它的几个回调。让他们为此去学十六条通道和所有权镜像，是把我们自己的实现细节变成别人的负担；而且左边那一列里有一半是随时会变的（`ctx` 里有什么没有机械检查）。

两层并存，不互相替代。能力包继续用 `NacreDomain`：它们要暴露的是 `CLLocationManager` 这样的原生类，要和 Apple 的文档一一对上，那正是 `NacreDomain` 做的事。

## 它不是新的过桥通道

对桥来说，原生模块只是又一个域（`Bridge/NacreModules.mm`）：

- 一个原生对象 `NacreModuleHub`，JS 那边是 `application.nativeModules`（类名 `NativeModules`）。
- `classObject` 通道交出这个对象。
- `call` 通道认四个 selector：`names`、`describe:`、`call:method:arguments:bytes:`、`listen:type:on:`。
- `callAsync` 通道认一个名字 `callAsync`。
- 事件用现成的事件出口发在 hub 上，名字是 `@nativemodule`；`@` 开头的是内部事件，由 part 里登记的处理函数转给对应的模块对象。

所有模块的调用都经过这一个对象，模块名和方法名是参数。所以**引擎、`NacreRuntime.mm`、核心的分发器、内部头的声明都没有改**，新增的是一个 `.mm`、一个 part、一个公开头。

模块对象（`NativeModule`）是纯 JS 的 `EventTarget`，没有对应的原生对象。名字到模块对象的那张表放在 part 的闭包里，不挂在 hub 的包装上：包装万一被回收重建，表和监听器都还在。

## 接口为什么这么定

### 登记：`+load`，和给 Swift 的主类

ObjC 用 `+load` 登记，和能力包一样：framework 被嵌进 App 就会走到，宿主不写代码。

Swift 没有 `+load`。量过的几条路：

| 路 | 为什么没选 |
| --- | --- |
| 模块的 framework 里放一个 ObjC 文件，`+load` 里调 Swift | 能用，但「用 Swift 写模块」变成了「用 Swift 加一个 ObjC 文件」，工程要配成混编 |
| 启动时扫进程里所有的类，找遵守协议的 | 要把 App 里每个类都过一遍。第三方 SDK 动辄几千个类 |
| 清单里写类名，CLI 写进 App 的 Info.plist，运行时照着找 | 不用 CLI 的宿主要手写这个键；清单和代码两处要对上 |
| 运行时里加公开的 Swift 接口 | 公开的 Swift 声明会进交付物的接口文件，是另一份要维护稳定性的面 |

选的是 **framework 的主类**：模块的 framework 把 `NSPrincipalClass` 设成一个遵守 `NacreModuleProvider` 的类，运行时在 JS 第一次读 `application.nativeModules` 时，把 App 的 `Frameworks` 目录下的 framework 挨个看一遍（按文件名排序），主类遵守协议的就调一次 `+nacreModules`。

- 只读那个目录里每个 framework 的 Info.plist，不扫类。
- 声明在模块自己的 framework 里，不依赖 CLI，不依赖 App 的配置。
- 让 Xcode 生成 Info.plist 的工程用构建设置 `INFOPLIST_KEY_NSPrincipalClass` 就能写，不用自己带一个 plist 文件。
- 发生在第一次读 `application.nativeModules` 时，不在启动路径上。不用原生模块的 App 没有这笔开销。

主类不遵守协议的 framework 直接跳过，不算错：别的 framework 有自己的主类。

### 同步方法报错：返回一个 `NSError`

Cocoa 的惯例是 `NSError **` 出参。它在 Swift 里的样子是 `NSErrorPointer`，要写 `error?.pointee = …`；而 Swift 的 `throws` 只对方法成立，对 block 不成立。所以两种语言里最顺手的写法不一样。

返回值和错误共用一个出口就没有这个问题：处理函数返回一个值，返回的是 `NSError` 就是报错。`NSError` 本来就不是一个能交给 JS 的值，所以不会混淆。ObjC 和 Swift 写出来是同一个形状。

异步方法照任务说明给了 `resolve` 和 `reject` 两个回调。

### 错误就是 `NSError`

JS 那边的 `Error` 有 `name`、`message`、可选的 `code`，外加 `domain`。它们从 `NSError` 来：

| | `name` | `message` | `code` | `domain` |
| --- | --- | --- | --- | --- |
| `+errorWithName:message:` | 给的 | 给的 | 没有这个属性 | 没有 |
| `+errorWithName:message:code:` | 给的 | 给的 | 给的（0 也带） | 没有 |
| 别处来的 `NSError` | `'Error'` | `localizedDescription` | 它的 `code` | 它的 `domain` |

第三行是这样定的理由：模块包着的 SDK 报的就是 `NSError`，让模块作者逐个翻译成名字是白费功夫，直接 `reject(error)` 就该是对的。`code` 加 `domain` 是运行时里文件读写的错误已经在用的那一对（「上层给好用的分类，底层不丢事实」）。

`name` 是 `TypeError` / `RangeError` 时建成那个类的实例，和引擎的 `RejectCall` 对 `TypeError` 的处理一致。

**报错不走通道自己的报错出口。** `call` 通道的 `error` 只会变成 `TypeError`，带不了 `name` 和 `code`；`callAsync` 通道的拒绝总是带上 `code` 和 `domain`。所以同步和异步都改成交一个「信封」（`{ ok, value, bytes }` 或 `{ ok: false, error }`），由 part 里同一个函数造 `Error`。同步和异步报出来的错因此是同一个形状。

### 事件要先声明

模块用 `addEvent:` 声明它会发哪些事件。没声明的名字：原生这边发了被丢掉，打一条警告（同一句只打一次）；JS 那边监听它不报错，当自定义事件，原生不会派发（2026-11-17 起；在这之前是抛 `TypeError`，见[事件](events.md#不认识的事件名不拒绝)）。

声明的用处现在只剩原生这一侧：发一个没声明的名字会有警告。JS 那一侧名字打错没有提示，监听器只是不被调用。

### 没人听的事件不过桥

JS 那边某个事件名的监听器从无到有、从有到无时告诉原生（`listen:type:on:`），原生记在 hub 上。发事件时先看有没有人听，没有就不编码、不过桥。和控件事件的惰性订阅是同一个理由：有的事件每帧都发。

这同时避开了一个问题：JS 从来没碰过 `application.nativeModules` 的时候，hub 没有包装；这时把事件发过去，事件汇入口会现建一个包装并报一条「包装被回收之后还在发事件」的警告。

### 登记之后不能再加

JS 那边 `get()` 时把方法表和事件表抄走了，之后再加的它看不到。所以登记之后 `addMethod` / `addEvent` 被忽略并打警告，不半生效。

同名登记两次：后一次失败并打警告，先登记的留着。`+load` 的先后由链接顺序决定，谁覆盖谁没有道理可讲。

### 回调只认一次，一次都不调也有结局

`resolve` 和 `reject` 共用一个对象（`NacreModuleSettler`）。它用一个原子标志保证只认第一次，后面的打警告并忽略。

两个 block 都被放掉了还没人调过时，它的 `dealloc` 把 Promise 拒掉。不这样做的话，模块里一条忘了调回调的分支在 JS 那边是一个永远不结束的 Promise，没有任何报错。

### `callAsync` 用错时当场抛

方法不存在、同步异步用反了、参数传不过去，`callAsync` 是当场抛 `TypeError`，不是返回一个被拒绝的 Promise。Web IDL 的规矩是返回 Promise 的操作不同步抛；这里照的是运行时里已有的异步接口（`fileSystem.writeText`、`keychain.set` 都是参数不对当场抛）。

## 值怎么过桥

桥上走的是 JSON 文本。JSON 能表示的那几种直接过；要另外处理的只有二进制。

### 二进制：位置表加 base64

树里是二进制的那个位置留 `null`，另外一张表记「哪个位置、base64 的内容」：

```json
{ "value": { "head": null, "list": [null, "x"] },
  "bytes": [[["head"], "AQID"], [["list", 0], "BA=="]] }
```

两个方向用同一种写法。没有用「树里放一个带特殊键的对象」的写法，是因为那样用户自己的数据里出现同名的键就会被认错；位置表没有这个问题。

base64 在 JS 那边用引擎自带的 `Uint8Array.prototype.toBase64` / `Uint8Array.fromBase64`（C++ 实现）；引擎没有时退回 part 里一份 JS 的实现。

**一处不走 base64**：异步方法直接 `resolve` 一块非空的 `NSData`。这时走 `callAsync` 通道现成的字节那条路（`SettleBytes`），不经过 base64。交出去之前把字节复制到一块新的内存里（`initWithBytes:length:`），JS 拿到的 `ArrayBuffer` 用的是这块新内存。

这里原来写的是 `copy`，2026-11-17 外部审查指出它不够：不可变的 `NSData` 被 `copy` 时返回的是它自己，而 `ArrayBuffer` 是可写的。模块如果留着那份 `NSData`（缓存、常量），JS 改缓冲区就改到了模块的数据；同一份交出去两次，两个 `ArrayBuffer` 还会互相影响。验收里用示例模块复现过：改之前，JS 把第 0 个字节改成 200，模块留着的那份读出来也是 200。这和 `blob.arrayBuffer()` 要复制是同一个道理，见[网络](network.md#blobarraybuffer-拷一份)。读文件和读钥匙串交出去的 `NSData` 是当场新建的、没有第二个使用者，那两处仍然不复制。

考虑过让参数里的二进制走 `Blob`（JS 侧建一个 `Blob`，句柄按对象参数过桥）。没选：它同样要复制一次，而且只能放在顶层参数上，嵌在对象里的还是得另想办法，两套写法不如一套。

JS 这边二进制的类型选 `ArrayBuffer`：字节那条路给的就是它，`fetch` 和文件读写给的也是它。传给原生时 `ArrayBuffer` 和它的视图都收，视图只传它盖住的那一段。

### JS 这一侧在过桥之前查

`JSON.stringify` 会把 `NaN` 写成 `null`、把函数和 `undefined` 直接丢掉、对 `Date` 调 `toJSON`。到了原生已经看不出原来是什么。所以 part 自己走一遍参数，碰到过不去的就抛 `TypeError`，报错里写明是第几个参数的哪个位置。

定得比 `JSON.stringify` 严：只收普通对象（原型是 `Object.prototype` 或者没有原型）和数组，`Date`、`Map`、类的实例一律不收，不调 `toJSON`。理由是「不替使用者做他没要求的转换」：`Date` 变成字符串之后原生那边拿到的是什么格式，使用者未必知道。

`undefined` 照[原则 13](../project.md#原则)：作对象的成员时等于没写；作参数或数组元素时是 `null`（位置要留着）。

环是用「当前这条路径上的祖先」判的，不是「见过的对象」：同一个对象出现在两处不是环，可以传。

含不成对代理项的字符串也在这里拦：它编不成 UTF-8，原生那边会把整个参数数组解成空的。

### 原生这一侧同样不替换

原生交回来的值里有过不了桥的东西（`NSDate`、自己的类、`NaN`、键不是字符串的字典）时：同步方法让 JS 抛 `TypeError`，异步方法拒绝，事件丢掉并打警告。报错里写明是哪个位置的哪个类。

核心的 `EncodeJSON` 对这类值的做法是换成它的 `description`。那是给 Info.plist 用的（里面可能有日期），放在这里就成了「悄悄把值换掉」，所以这里先自己查一遍，查过了才交给 `EncodeJSON`。

### 已知的两处

- **对象成员的顺序不保证。** 原生那边是不保证顺序的字典，和网页的 `executeJavaScript` 是同一个问题。

## 线程

处理函数在主线程上被调：JS 在主线程，`call` 和 `callAsync` 两条通道都是从 JS 同步调过来的，没有另外切线程。

`resolve` / `reject` 可以在任何线程调：它们最后调的是 `callAsync` 通道的 `done`，那个 block 本来就是给后台线程用的（文件读写就在后台调它），回主线程兑现是 `NacreRuntime` 那边的事。

`emitEvent:detail:` 可以在任何线程调：数据在调用的线程上编好（`detail` 可能是可变的容器），然后到主线程上看有没有人听、交给事件出口。已经在主线程上时不再绕一圈，所以同一个线程上先后发的事件保持先后；不同线程之间不保证。

登记表有一把锁：登记可能发生在 `+load` 里、主类被找到时，或者宿主自己在任何线程调。

## 包和 CLI

原生模块的包和能力包是同一种包，CLI 走的是同一段代码。清单多认两样，外加一处放宽：

| | 做什么 |
| --- | --- |
| `vendoredFrameworks` | 包目录里的 `.xcframework`。生成时拷进 `ios/`，和模块的 framework 一样嵌进 App 并签名 |
| `systemFrameworks` | 系统框架（`名字.framework`）或系统库（`lib名字.tbd`）。App 的 target 上多一条 `sdk:` 依赖；几个包要同一个只写一次 |
| `target` 变成可选 | 它是运行时工程里的 target 名，只有运行时仓库里的包才有。第三方的包没有，引运行时源码时（`--runtime=source`）也用它预编译的 framework |

几条取舍：

- **`vendoredFrameworks` 只收动态的。** 静态库不是嵌进 App 的东西，它应该在编模块自己的 framework 时链进去。CLI 看每个切片里有没有 `.a`、framework 里的二进制是不是归档（文件开头是 `!<arch>`），是就报错并说明该怎么做。把静态的 framework 嵌进 App，要到装机时才被拒。
- **只收 `.xcframework`，不收单独的 `.framework`。** 后者只对应真机或模拟器中的一种。
- **嵌进 App 的 framework 不能同名。** 它们拷进 `ios/` 之后在同一层。两个包带了同名的，或者和某个包自己的 framework 同名，报错并把两个包都点出来。
- **`systemFrameworks` 的用处比看上去窄。** 动态 framework 用到的系统框架记在它自己的二进制里，App 不用再声明（这是当初没做 `ios.frameworks` 的理由，仍然成立）。真要它的是另一类：SDK 在运行时按名字找系统的类，那个系统框架要有人链接才会被加载。SDK 的接入文档里「请添加以下系统库」多半是这种。
- **CocoaPods 和 SPM 不支持。** 支持它们等于在生成工程这一步引入另一个依赖解析器。

写错的情况（不是数组、路径不存在、指到包外、不是 `.xcframework`、是静态库、同名、系统框架的写法不对）都在生成时报错并点名是哪个包，用例在 `packages/ios/test/generate.test.js`。

## 顺带：取参的宏和 `EncodeJSON` 搬进了给能力包的头

`NACRE_NUM` / `NACRE_INT` / `NACRE_BOOL`（连同它们用的 `RequireNumber` / `RequireInteger` / `RequireBool` 和 `NacreFail`）以及 `EncodeJSON` 的声明，从内部头 `NacreBridge.h` 搬到了 `NacreExtension.h`。核心自己照常用（内部头引着那个头）。

能力包里之前各自绕过去的写法没有改，这几处以后可以换：

| 文件 | 现在的写法 | 可以换成 |
| --- | --- | --- |
| `Camera/NacreCamera.mm` | 自己调 `NSJSONSerialization` 编事件的数据；`BoolFromJS` | `EncodeJSON`；`NACRE_BOOL` |
| `Contacts/NacreContacts.mm` | 自己调 `NSJSONSerialization` | `EncodeJSON` |
| `CoreLocation/NacreCoreLocation.mm` | 自己编 JSON；自己判「是数不是布尔」 | `EncodeJSON`；`RequireNumber` |
| `LocalAuthentication/NacreLocalAuthentication.mm` | `IsBoolean`、`IsFiniteNumber`；自己调 `NSJSONSerialization` | `RequireBool` / `RequireNumber`；`EncodeJSON` |
| `Photos/NacrePhotos.mm` | `IsBoolean`、`NonNegativeInteger` | `RequireBool`、`NACRE_INT` 加范围判断 |

## 验证

这一步是在不能跑模拟器的条件下做的（模拟器被别的对话占着）。验证分三层：

**能跑的检查。** 核心加全部能力包加示例模块，Debug 和 Release 各编译通过（模拟器 SDK，只编译）。`check-api.sh` 一致（类 118 个）。`npm run check`、`npm run build` 通过。CLI 的用例从 38 条到 64 条，新加的 26 条里 24 条先看到失败（另外两条盯的是原来就有的行为）。Release 的产物里：公开头有三个（`Nacre.h`、`NacreRuntime.h`、`NacreModule.h`）；示例模块从核心拿的符号只有 `NacreModule` 这一个类；Swift 的主类在类列表里，没有被裁掉。指南里的 ObjC 和 Swift 例子抽出来单独编译过。

**不经过模拟器的探针。** 在 macOS 上把四样真的东西串起来跑：`NacreModules.mm`、Swift 写的示例模块、`28-native-modules.js`、验收步骤 `native-modules.js`。替掉的是它们周围的东西：V8 换成 JavaScriptCore，`01-bridge.js` 换成几十行只有这几条通道的 JS，核心的 `EncodeJSON`、事件出口、兑现那几段照着抄了一份。验收步骤的 195 条断言全过，包括主类的发现（探针旁边放了一个带 `NSPrincipalClass` 的 framework 目录）、后台线程上兑现、回调调两次、回调一次都不调、从后台线程发事件。探针没有进仓库。

**没有验证的**，都要等合并后的模拟器验收：

- 接到真的桥上的那一段：`classObject` / `call` / `callAsync` 三条通道在真的分发器里被问到；`callAsync` 通道的 JSON 兑现和字节兑现；`@nativemodule` 经过真的事件汇入口。
- V8 上的行为。探针用的是 JavaScriptCore：`Uint8Array.fromBase64`、`isWellFormed`、错误对象的细节可能不同。
- iOS 上主类的发现。探针里那个目录是按 macOS 的布局摆的（`Resources/Info.plist`）；iOS 的 framework 是扁平的。
- 生成的工程：`vendoredFrameworks` 和 `systemFrameworks` 写出来的那几行 XcodeGen 认不认（CLI 的用例只核对文本）；`CryptoKit.framework` 作为 `sdk:` 依赖能不能链接。
- 没有 `target` 的包在 `--runtime=source` 下用 xcframework：仓库里没有这样的真包。
- 处理函数里抛 ObjC 异常：示例模块是 Swift 写的，抛不出来，这一支没有用例。
- 真机；预编译的 xcframework 没打。

## 还没做的

| | 现在怎么样 |
| --- | --- |
| 模块收应用委托的回调（推送令牌、打开 URL、后台任务） | 没做。另一处在定同一类问题的做法。模块这边到时需要的东西：一个在启动壳转发系统回调时能被通知到的口子（多半是 `NacreModule` 上按回调名登记的处理函数，或者一个 `NacreModuleProvider` 的可选方法）；回调带的数据怎么变成能交给 JS 的值（推送令牌是 `NSData`，已经能过）；系统要求当场答复的那几个回调怎么办（处理函数在主线程上同步返回是能做到的，要等 JS 答就得用同步回调那套）；以及 JS 还没起监听器时到达的回调要不要留着（现在事件不留） |
| App 自己目录里的原生源码直接编进 App | 没做，只是建议。现在模块必须是一个带预编译 framework 的 npm 包；App 团队只想写两个 Swift 文件时这太重。可行的形状：项目里一个约定的目录（比如 `native/ios/`），CLI 把它作为源码加进 App 的 target；登记走宿主在启动运行时之前调 `NacreModule.register`，或者让运行时也看主包里某个约定的键。要先定的是启动壳的模板怎么不被改 |
| 把 JS 的函数传给原生 | 没做。用事件代替 |
| 模块收发原生对象、提供视图 | 没做。那是 `NacreDomain` 那一层的事；真有需要时再看要不要开一个口子 |
| 方法的参数声明 | 没做。模块不声明参数的个数和类型，全靠处理函数自己查。有了声明就能在 JS 那边先查、还能生成类型 |
| 包自己的类型和原生登记的方法对不对得上 | 没有机械检查。示例包的 `index.d.ts` 是手写的 |

---

← 返回[实现原理](README.md) ・ [项目说明](../project.md)
