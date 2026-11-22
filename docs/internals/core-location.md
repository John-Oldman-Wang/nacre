# 定位怎么搭的

定位是一个能力包（`@nacrejs/core-location`），源码在 `ios/Capabilities/CoreLocation/`：原生一个 `.mm`，JS 一个 part。能力包这个形状本身见[能力包](capabilities.md)，这一页只记定位自己的取舍。

怎么用见 [API 文档](../api/cl-location-manager.md)。

**这一页里的结论哪些量过、哪些没有，先说在前面。** 做这个包的对话不跑模拟器（只有一台，由合并的对话统一跑），所以：

| 来源 | 有哪些 |
| --- | --- |
| Mac 上的命令行探针（macOS 27，同一个框架，不是 iOS） | 精度几个常量的数值、属性写了读回来是什么、委托什么时候装才收得到第一次授权回调 |
| 头文件和 Apple 的文档 | 负数表示无效、`requestLocation` 和连续更新不能同时用、几种「系统什么都不做」的情况、默认值 |
| 合并之后的验收（模拟器，Debug 和 Release） | 全部用例通过。用命令给模拟器里的验收 App 预先授权并设了一个位置，自动跑的验收里真的取到了：`37.33490, -122.00900 ±5 m`，位置更新的事件也收到了 |
| 用假的桥在 Node 里跑 | JS 那一半自己的逻辑：两个值类型、事件字段的转换、持有、Promise 的传递 |

## 它为什么是一个包

判据是[项目说明 3.8 节](../project.md#38-核心和能力包)那一条：用定位的 App 要在自己的 Info.plist 里写 `NSLocationWhenInUseUsageDescription`。只要二进制里有 CoreLocation 的符号，上传时就会被要求写这一句，所以它不能在核心里。

包的清单里用 `requires.infoPlist` 声明了这个键。验收工程是第一个带着真的能力包走这条路的项目：写了这一句，生成通过，那句话进了生成的 Info.plist；把它去掉，生成停下并报

```
nacre: @nacrejs/core-location needs NSLocationWhenInUseUsageDescription in Info.plist: a sentence shown to the user explaining why the app needs this permission. Put it in ios.infoPlist in nacre.config.json
```

（[能力包](capabilities.md#工程配置包提要求项目写内容)那一页记着「能力包的要求是用假包测的，第一个真的包来了再走一遍」，这就是那一遍。只到生成为止，没有编译运行验收工程。）

## 属于哪一层

底层：按 ObjC 的类名暴露 `CLLocationManager`，成员照已有的规矩映射。没有另外设计一个上层的 `application.location` 之类的对象。上层该长什么样，等真有 App 用过这一层再定。

「能力对齐，不是形状一致」在这里落了四处，下面各有一节：两个没有返回值的方法成了 Promise；委托成了三个事件；位置成了只读的值；负数和哨兵常量换了表示。

## 位置是值，不是原生对象的包装

`CLLocation` 没有走包装机制（指针进句柄表、属性一个个过桥读）。原生把它的字段编成一个 JSON 对象交过来，JS 那一侧建成一个字段只读的对象。

理由：

- **它不可变。** 头文件里全是 `readonly`，没有任何方法会改它。包装机制要解决的事（同一个原生对象在 JS 里是同一个包装、谁拿着谁）在一个不可变的值上没有意义。
- **事件延后一轮才派发。** `locationupdate` 带着一批位置；做成包装的话每个位置各建一个包装、读每个字段各过一次桥，而它们的内容在交出来的那一刻就定了。
- **和结构体、`NSIndexPath` 是同一类东西。** 已有的规矩是「JS 类 + 只读字段，写入即抛」，照着做。

代价是身份：每次读 `manager.location` 得到一个新的对象，`===` 不成立。原生那边 `location` 属性标的是 `copy`，本来也不保证是同一个对象。

`CLLocation` 不能 `new`：系统的五个初始化方法没有接，现在也没有任何 API 收一个 `CLLocation`（算距离的 `distanceFromLocation:` 没做）。构造函数用一个模块里的私有记号挡住，外面调它得到 `Illegal constructor`。`CLLocationCoordinate2D` 是结构体，照结构体的规矩可以 `new`。

`timestamp` 每次读给一个新的 `Date`：`Date` 是可变的，位置里存一个共用的 `Date` 的话，改它就等于改了位置。过桥的是毫秒数，和日期选择器一样。

## 负数表示无效：给 JS 的是 `null`

头文件对六个量写的是同一句话，负数表示这个量无效：

| 量 | 头文件原话 |
| --- | --- |
| `horizontalAccuracy` | Negative if the lateral location is invalid |
| `verticalAccuracy` | Negative if the altitude is invalid |
| `course` | Negative if course is invalid |
| `courseAccuracy` | Returns negative if course is invalid |
| `speed` | Negative if speed is invalid |
| `speedAccuracy` | Returns -1 if invalid |

负数在这里不是一个量，是「没有」的记号。JS 里「没有」是 `null`，所以过桥时换掉了。换完之后没有丢信息：负数除了「无效」不带别的意思。

这是照「哨兵常量不让 JS 写数」那条规矩的精神定的，但那条规矩原文说的是字符串（`spacing = 'system'`），这里用的是 `null`。2026-11-16 review 过，维持 `null`，并对照 Web 的定位接口补了海拔那一处，见下一小节。

### 海拔跟着垂直精度走

`altitude` 和 `ellipsoidalAltitude` 自己没有「无效」的记号（海拔本来就可以是负数），头文件把这件事写在 `verticalAccuracy` 上：它为负表示海拔无效。所以垂直精度无效时，两个海拔也给 `null`，三个量总是一起有值或者一起是 `null`。

最初只换了精度、速度、方向那六个量，海拔原样给数，在类型的注释里提醒「垂直精度是 `null` 时这个数没有意义」。实测模拟器上用命令设的位置就是这种情况：垂直精度无效，海拔是 0。JS 拿到的 0 看起来是一个量出来的海拔，其实不是。

改的依据是 W3C 的定位规范（查的是 2026-11-05 那一版，Chrome 实现的就是它）。规范里没有负数或 `NaN` 这类记号，取不到的量一律是 `null`：

| 规范里的量 | 规范的类型 | 对应我们的 |
| --- | --- | --- |
| `altitude` | 数或 `null` | `altitude`、`ellipsoidalAltitude` |
| `altitudeAccuracy` | 数或 `null` | `verticalAccuracy` |
| `heading` | 数或 `null`，静止时也是 `null` | `course` |
| `speed` | 数或 `null` | `speed` |
| `accuracy` | 非负的数，不可空 | `horizontalAccuracy` |

和规范还剩一处不同，是有意留的：规范里 `accuracy` 不可空，因为浏览器不会把水平位置无效的结果交给网页；我们照样交出来，`horizontalAccuracy` 是 `null`，要不要用由 JS 判断。在原生层把这种位置丢掉，是原生替 JS 做判断。

iOS 上设备静止时 `course` 是不是负数，没有实测。

## 精度的几个名字

`desiredAccuracy` 和 `distanceFilter` 的类型是「米，或者一个名字」。名字背后是系统的常量，在 Mac 上量到的数：

| 常量 | 数值 | JS |
| --- | --- | --- |
| `kCLLocationAccuracyBestForNavigation` | -2 | `'bestForNavigation'` |
| `kCLLocationAccuracyBest` | -1 | `'best'` |
| `kCLLocationAccuracyReduced` | 6380000 | `'reduced'` |
| `kCLLocationAccuracyNearestTenMeters` | 10 | 直接写 `10` |
| `kCLLocationAccuracyHundredMeters` | 100 | 直接写 `100` |
| `kCLLocationAccuracyKilometer` | 1000 | 直接写 `1000` |
| `kCLLocationAccuracyThreeKilometers` | 3000 | 直接写 `3000` |
| `kCLDistanceFilterNone` | -1 | `'none'` |

前三个和最后一个是记号不是数量，照已有的规矩用名字，映射留在原生（数值换个系统版本可能变）。中间四个就是米数，没有另外起名字：`manager.desiredAccuracy = 100` 比一个名字更直接，而且它们之间的任何数系统都收。

负数只能用名字写。直接写 `-1` 被拒：让它过的话，`desiredAccuracy = -1` 读回来是 `'best'`，写进去的和读出来的不是一种东西。

写进去的数原样读回来（Mac 上量的：100、50、1234.5、0 都是）。所以读的时候拿值和三个常量比，相等就给名字，否则给数。

## 两个 Promise

系统的 `requestWhenInUseAuthorization` 和 `requestLocation` 都没有返回值，结果从委托来。它们是一次性的请求，照原则 5 是 Promise。原生把结算用的回调存在委托对象上，委托的方法被调到时结算。

把「调一个没有返回值的方法」变成 Promise，就多了一条必须守住的事：**每一条路都要结算**。头文件写了几种系统什么都不做、也不回调的情况，一个都不能漏，否则就是一个永远不结算的 Promise。

`requestWhenInUseAuthorization()`：

| 情况 | 系统的行为（头文件） | 这里怎么做 |
| --- | --- | --- |
| 状态已经不是 `notDetermined` | this method will do nothing | 不调系统，当场兑现成现在的状态 |
| Info.plist 里没有那句说明 | this method will do nothing | 不调系统，拒绝 `InvalidStateError`，信息里写明缺哪个键、写在哪 |
| App 不在使用中 | this method will do nothing | App 在后台时不调系统，拒绝 `InvalidStateError` |
| 提示框弹出，用户选了 | 回调授权变化 | 状态不再是 `notDetermined` 时兑现 |
| 系统说提示框没有展示（`kCLErrorPromptDeclined`） | 回调出错 | 拒绝，`name` 是 `CLError` |

「App 不在使用中」只判了后台这一种状态。启动过程中 App 的状态是「不活跃」，那时申请授权是常见的写法，不拦。**不活跃时申请、提示框到底弹不弹，没有量过。**

为了判后台，这个包多链了 UIKit（`UIApplication.applicationState`）。

`requestLocation()`：

| 情况 | 这里怎么做 |
| --- | --- |
| 没有授权（三种状态） | 不调系统，当场拒绝 `NotAllowedError`，`code` 和 `domain` 用系统在被拒绝时给的那一对 |
| 这个 manager 正在连续更新 | 不调系统，拒绝 `InvalidStateError`。头文件：this method can not be used concurrently with startUpdatingLocation |
| 上一次还没结算 | 不再调系统，和上一次一起结算。头文件：There can only be one outstanding location request |
| 等的时候调了 start 或 stop | 拒绝 `AbortError`。头文件：start 会 immediately cancel the location request，stop can be used to explicitly cancel the request；两种情况系统都不再回调 |
| 委托收到位置 | 兑现成这一批里最后一个 |
| 委托收到错误 | 拒绝，`name` 按错误码分 |

没有授权时不去调系统再等它回调，是因为三种状态下系统各自会不会回调没有量过，不依赖它。

**没有自己加超时。** 系统定不出位置时会回调「位置未知」，头文件是这么写的；它要等多久没有量过。真出现「既不给位置也不报错」的情况，这里就是一个不结算的 Promise，那时要补超时。

## 委托在建对象时就装上

别的域的委托都是惰性的：第一个监听器来了才装。这里在 `new CLLocationManager()` 时就装，原因是量出来的（Mac 上的探针）：

| 做法 | 第一次授权回调 |
| --- | --- |
| 建好对象，马上装委托 | 收到 |
| 建好对象，过 1.5 秒再装 | 没收到 |
| 已经有委托，换一个 | 没收到 |

系统在对象建好之后主动通知一次当前的授权状态，只通知那一刻已经装上的委托。惰性地装的话，这一次回调有没有就取决于监听器加得早不早，而且晚装的那个 manager 上，申请授权的 Promise 也指望着这个委托。

委托一直装着，有没有监听器只决定派不派发事件：三个事件各记一个开关，`subscribe` 通道来了就改它。没人听的事件不派发。

所以 `authorizationchange` 的第一次能不能收到，看监听器是不是和 `new` 在同一段同步代码里加的。这一条写进了 API 文档。

## 三个事件的名字

| 委托方法 | 事件 | 带什么 |
| --- | --- | --- |
| `locationManager:didUpdateLocations:` | `locationupdate` | `locations`：这一批位置 |
| `locationManager:didFailWithError:` | `locationerror` | `error` |
| `locationManagerDidChangeAuthorization:` | `authorizationchange` | 不带 |

名字照已有的那一类起（`scopechange`、`traitchange`）。

**出错的事件没有叫 `error`。** 核心的事件落点里有一张「事件名 → 字段名」的表，`error` 这个名字在表里对应 `message`：负载整个被挂成 `event.message`。定位的错误要带 `name`、`code`、`domain`，叫 `error` 的话 JS 拿到的是 `event.message` 等于一个对象。那张表在核心的 part 里，这个包不能改，所以换了名字。监听 `error` 会抛并列出三个可用的名字，验收里有一条盯着。

带不带数据的判据是「回头读不到才带」：

- `locations` 带。事件延后一轮派发，那时 `manager.location` 可能已经是更新的一个；一批里前面的几个之后再也读不到。
- 授权状态不带。派发时从 manager 上读得到，读到的是那时的值。

事件带的字段过桥时是普通对象，用核心给的 `eventFieldConverters` 换成 `CLLocation` 和错误。这张表原来按事件名登记，不分类，所以名字要是别的域不会用的；2026-11-22 起按事件类（`CLLocationUpdateEvent`、`CLLocationErrorEvent`）登记，见[事件类](events.md#事件类一种字段组合是一个类2026-11-22)。

## 谁拿着 manager

系统不持有 `CLLocationManager`。原生 App 里一个局部变量里的 manager，出了作用域就释放，更新也就停了。

照所有权镜像的规矩（原生谁持有谁，JS 就照着记一条边），这里应该一条边都没有。但那样的话：

```js
function track() {
  const manager = new CLLocationManager();
  manager.addEventListener('locationupdate', onUpdate);
  manager.startUpdatingLocation();
}
```

这段代码能工作一阵子，到某一次垃圾回收之后不声不响地停掉。原生 App 里同样的写法是立刻不工作，写的人当场就知道；这里是「有时候工作」，而且类型检查和运行时都报不出来。

所以多记了两条边，都挂在 `CLLocationManager` 这个类上：

| 边 | 什么时候有 |
| --- | --- |
| `updating` | `startUpdatingLocation()` 之后，`stopUpdatingLocation()` 之前 |
| `waiting` | 这个 manager 上有 Promise 还没结算 |

第二条是必须的：`await new CLLocationManager().requestLocation()` 里没有任何变量指着 manager，没有这条边 Promise 可能永远不结算。同一个 manager 上可以有几个 Promise 在等，所以记了个数，数到 0 才放开。

第一条是取舍。它和「加监听器不改变对象的寿命」不冲突（只挂监听器的 manager 没人拿着），但它确实不是原生的真相：一个开始了更新又丢掉引用的 manager 会一直更新下去。按「保活只会多留一份引用，不会给错答案」选了拿着。**这一条是这个包自己定的，等 review**；要改回去是 part 里的两行。

拿着 manager 的 Promise 结算之后把结果原样传下去（兑现还是兑现，拒绝还是拒绝），所以没人接的拒绝照常被报成未处理的拒绝。不能写成 `promise.then(release, release)` 再把原来的 `promise` 还给调用方：那样原来的 Promise 上已经有了处理函数，没人接的拒绝就不报了。

## 能力包拿得到什么、拿不到什么

这是第一个用 `NacreRegisterDomain` 登记的能力包（钥匙串用的是旧的两个 handler），也是第一个走 `callAsync` 那条登记通道的域。只用 `NacreExtension.h` 写下来，缺的有两样：

| 缺什么 | 这里怎么办的 |
| --- | --- |
| 取参的宏（`NACRE_NUM` 一类，在核心的内部头里） | 自己写了一个校验（`MetersFromJS`）：是字符串就查名字，是数就要有限、不小于 0，否则填报错。规矩是同一条：只校验，不转换 |
| 把值编成 JSON 文本（`EncodeJSON`） | 自己用 `NSJSONSerialization` 编。事件的负载要它 |

第二个接这条路的能力包会再写一遍同样的东西。把这两样划进 `NacreExtension.h` 要改核心，不是这个包能做的事，记在这里。

`check-api.sh` 盯着原生不许对 JS 给的值直接取数，它认的是 `[value doubleValue]` 那种写法；这里取数之前先判了类型，写的是点语法，没有撞上那条检查。

## 二进制里多一条加载命令

编出来的 `NacreCoreLocation` 除了 CoreLocation，还直接加载 `_LocationEssentials.framework`。SDK 里 `CLLocation.h` 只剩一行 `#import <_LocationEssentials/CLLocationEssentials.h>`，`CLLocation`、精度的常量都挪到了那个框架里。

它的 `.tbd` 里有一条 `$ld$previous$…/CoreLocation$$7$2.0$19.0$$`：最低版本低于 19.0 时，这些符号记在 CoreLocation 名下。这个工程的最低版本是 26.0，所以链接器用了新名字。19.0 是这个框架拆出来的版本；iOS 26 之前的那个版本号是 18，所以推断 19.0 对应的就是 iOS 26。**iOS 26 的设备上这个框架在不在、App 起不起得来，没有验证**（验收只跑 iOS 27）。

## 验证

| 做了的 | 结果 |
| --- | --- |
| 先写验收用例，没有实现时跑类型检查 | 报错，找不到 `CLLocationManager`、`CLLocation`、`CLLocationCoordinate2D` 这几个名字 |
| 只编译（Release，模拟器的切片），连核心一起 | 编过，这个文件没有警告 |
| 产物 | `Builtin/parts/core-location.js` 在包里；登记用的类还在；从核心拿的符号是 1 个类、6 个函数 |
| `check-api.sh` | 一致。类从 100 个到 101 个，标量读写从 310 / 221 到 315 / 223，正好是这里的一个原生类、五读两写 |
| 验收工程的类型检查 | 通过 |
| 文档里的 13 段示例代码 | 抽出来过了一遍严格的类型检查 |
| 用假的桥在 Node 里跑 part | 28 条都对 |
| CLI 给验收工程生成 | 认出了这个包；那句说明进了 Info.plist；去掉它生成报错 |

用假的桥跑的时候撞了一次：三条「写只读的值要抛」不过，原因是测试脚本自己不是严格模式。抛不抛由写的那一方的模式决定，运行时给每个脚本都开了严格模式，脚本补上之后都过。

**没有验证的**：

- 申请授权的提示框（要在验收界面上点「申请定位」）；真机上的定位。
- 系统的行为：提示框、位置多久来一次、`requestLocation` 多久超时、各种状态下系统回不回调。
- 第一次授权回调在 iOS 上是不是和 Mac 上量到的一样。验收里有一条断言盯着（建好之后 6 秒内收到 `authorizationchange`）。
- 默认值（`best` 和 `none`）在 iOS 上是不是这两个。验收里有断言。
- `callAsync` 这条登记通道是第一次有域用。
- 真机；iOS 26。

## 还没做的

| | 为什么先不做 |
| --- | --- |
| 始终定位、后台定位 | 要多一句权限文案，后台定位还要包自带一个固定的工程配置（后台模式），那个口子还没有，见[能力包](capabilities.md#还没做的) |
| 地理围栏 | 旧接口（`startMonitoringForRegion:`）在头文件里标了将废弃，新接口是另一组类（`CLMonitor`、`CLCondition`）。接哪一套要单独定 |
| 指南针 | 不在这一步的范围里。模拟器给不给方向没有查过 |
| 临时的精确位置 | 要项目在 Info.plist 里写一个字典（每个用途一句话），清单的 `requires` 现在只能要求键名 |
| 地理编码 | 另一组类（`CLGeocoder`、`CLPlacemark`），和定位本身是两件事 |
| 两个位置之间的距离 | 系统的算法是椭球面上的测地线。在 JS 里重写一个结果会有出入；过桥去算要先能把 JS 的值变回 `CLLocation` |
| `+locationServicesEnabled` | 不在这一步的范围里。整个系统的定位服务关着时，`authorizationStatus` 读出来是 `denied`（头文件对这个状态的说明里写了） |

---

← 返回[实现原理](README.md) ・ [能力包](capabilities.md) ・ [项目说明](../project.md)
