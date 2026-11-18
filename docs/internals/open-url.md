# 被链接打开：`openurl` 是怎么接的

别的 App 或者一条链接打开这个 App 时，`application` 派发 `openurl`。用法见 [API 文档](../api/application.md#被别的-app-或一条链接打开时)，协议和域名怎么声明见[配置 App](../guides/project-config.md#声明自定义协议)。

文件：`ios/Runtime/Bridge/NacreOpenURL.mm`（原生那一半）、`ios/Runtime/Builtin/parts/21-application.js`（`OpenURLEvent` 和事件的落点）、`packages/ios/bin/nacre-ios.js`（`ios.urlSchemes`）、`packages/types/nacre.d.ts`、`acceptance/src/steps/openurl.js`。

**这一页里凡是讲系统行为的，都还没有在模拟器或真机上跑过。** 做这一步的时候模拟器被别的工作占着。依赖的每一条系统行为列在[要验证的假设](#要验证的假设)里。

跑过的只有这些：

| | 结果 |
| --- | --- |
| 验收工程只编译（模拟器 SDK，Debug 和 Release 各一次） | 通过 |
| CLI 的用例（`cd packages/cli && npm test`） | 先写用例，没有实现时新加的 21 条里 19 条不过；实现后 59 条全过 |
| 类型检查、`check-api.sh`、链接检查 | 通过。文档里的示例代码单独过了一遍严格模式的类型检查 |
| 补方法的那段逻辑 | 把 `NacreOpenURL.mm` 里 `Patch` 的原文抽出来，在 macOS 上对着几个假的委托类跑：没实现的类加上后转发一次；实现了的先调原来的再转发；父类子类都补过、子类调 `super` 只转发一次；`willConnect` 里自己调 `scene:openURLContexts:` 只转发一次；方法是继承来的只转发一次 |
| 内置脚本那一半 | 在 Node 里带桩跑 `00-core.js` 和 `21-application.js`：`@openurl` 变成 `application` 上的 `OpenURLEvent`，字段、必填的报错都对 |

后两行验的是我们自己的代码，系统会不会按假设来调，它们证明不了。

## 系统怎么把链接交过来

系统把链接交给**场景的委托**，没有通知可接。三个入口：

| 情况 | 系统调委托的哪个方法 | 地址在哪 |
| --- | --- | --- |
| App 在运行（前台或者挂在后台），自定义协议 | `scene:openURLContexts:` | 每个 `UIOpenURLContext` 的 `URL`，来源在 `options.sourceApplication` |
| App 在运行，通用链接 | `scene:continueUserActivity:` | 活动类型是 `NSUserActivityTypeBrowsingWeb` 时的 `webpageURL` |
| App 没在运行 | `scene:willConnectToSession:options:` | `connectionOptions.URLContexts` 和 `connectionOptions.userActivities` |

第三行是容易漏的：App 是被链接启动的时候，前两个方法都不调，地址只在连接选项里。场景接入的通知（`UISceneWillConnectNotification`，运行时靠它派发 `sceneconnect`）不带连接选项，场景对象上也没有公开的属性能事后读到它，所以冷启动的地址只能从委托的这个方法里拿。

## 怎么接的：运行期给场景委托的类补方法

场景委托是启动壳里的类（`SceneDelegate.swift`），模板里它是空的。两条路：

| | 做法 | 结果 |
| --- | --- | --- |
| 改启动壳的模板 | 在 `SceneDelegate.swift` 里写三个转发方法，调运行时新增的公开接口 | 不依赖任何没写进文档的系统行为。但公开头要多三个接口；不是从模板来的启动壳（宿主自己写的、旧版本生成的）收不到事件，而且不报错 |
| **运行期补方法**（用的这种） | 运行时启动时找到场景委托的类，给它加上这三个方法；它已经实现了的，换成「先调原来的，再转发」 | 启动壳不用动，公开头不用加接口，整个能力在一个新文件里。依赖几条系统行为，见下面的清单 |

选第二条，理由是项目定过的那一条：启动壳要设计成不需要被改的（[`project.md` 3.7 节](../project.md#37-交付物)）。页面的出现和消失是同一种做法（[实现原理](appearance.md#怎么接的替换基类上的四个方法)），区别是那边替换的是 UIKit 的基类，这边动的是宿主自己的一个类。

如果合并后的实测发现清单里有哪条不成立、又绕不过去，退路是第一条，或者两条都留（模板显式转发，运行时发现委托的类没有转发才补）。

### 哪个类是场景委托

两处来源，都在 `InstallOpenURLForwarding()` 里，运行时启动（`startWithScriptsDirectory:`）时调一次：

1. **Info.plist 的场景配置**。`UIApplicationSceneManifest` → `UISceneConfigurations` → 每个角色 → 每条配置的 `UISceneDelegateClassName`，用 `NSClassFromString` 找到类，当场补。CLI 生成的工程走这一条。运行时是在 `didFinishLaunching` 里启动的，那时还没有场景接入，委托的实例还没建，所以冷启动的那一次 `willConnect` 一定落在补过的方法上。
2. **场景实际的委托**。场景接入的通知到的时候，看 `scene.delegate` 是哪个类，没补过就补。这是给不走 Info.plist、在 `application:configurationForConnectingSceneSession:options:` 里用代码指定委托类的宿主准备的。它对运行中的链接有效；**能不能赶上冷启动的那一次调用不确定**：要看系统是先发通知还是先问委托，以及它问「委托实现了没有」是在调用时问还是在更早的时候问。

类名在 Info.plist 里找不到对应的类时，运行时打一行日志（`scene delegate class "…" from Info.plist was not found`），不崩。

为什么不在 `+load` 里做：运行时的 framework 比 App 的可执行文件先加载，那时 App 里的 Swift 类还没登记，`NSClassFromString` 找不到。

### 补上去的方法做什么

每个方法补上去的版本做两件事：先调原来的实现（这个类自己的，或者从父类继承的；没有就跳过），再把地址交给 JS。

- 类自己没有这个方法：`class_addMethod` 加上。方法的类型编码从 `UISceneDelegate` 协议里取。
- 类自己有：`method_setImplementation` 换掉，原来的实现留在闭包里。

一个类只补一次。父类和子类都被补过、子类又调了 `super` 时，同一次系统调用会经过两层补上去的方法；用一个计数只让最外面那一层转发，免得一条链接派发两次。三个方法共用这个计数，所以「委托在 `willConnect` 里自己调一次 `scene:openURLContexts:` 来复用处理逻辑」这种常见写法也只派发一次。

原生这一侧只转发。它不解析地址，不看协议是不是自己声明过的，不决定跳到哪。只过滤两样：不是通用链接的用户活动（接力那一类，不归这个事件），和不是公开角色的场景（`sceneconnect` 没给过 JS 的场景，判据和 `NacreRuntime.mm` 的 `IsAppFacingScene` 相同，那个函数是文件内的，这里照抄了一份）。

## 冷启动：为什么多排一轮

要求是冷启动带着的链接在那个场景的 `sceneconnect` **之后**派发，JS 用同一个事件，不用另外的「取启动链接」的方法。`main.js` 在顶层注册的监听器来得及，理由和 `sceneconnect` 的一样：启动的三个任务先入队，主队列是先进先出的（[`project.md`](runtime.md#js-为什么跑在主线程) 里讲启动顺序的那一段）。

`sceneconnect` 是运行时收到通知后排进主队列的一个任务。冷启动时系统在主线程的同一轮里做两件事：发场景接入的通知、调委托的 `willConnect`。哪个在前没有查证。所以 `willConnect` 里拿到地址后**不直接交给事件出口，先往主队列多排一轮**：

| 系统的顺序 | 这一轮结束时队列里 | 结果 |
| --- | --- | --- |
| 先通知，后 `willConnect` | `sceneconnect`，多排的那一轮 | `sceneconnect` 派发；多排的那一轮把 `openurl` 排到队尾；`openurl` 派发 |
| 先 `willConnect`，后通知 | 多排的那一轮，`sceneconnect` | 多排的那一轮把 `openurl` 排到 `sceneconnect` 后面；`sceneconnect` 派发；`openurl` 派发 |

两种顺序下 `openurl` 都在 `sceneconnect` 后面。多排一轮还解决了另一件事：运行时的事件出口是它启动的第一个任务里接上的，冷启动时那个任务这时可能还在队列里，直接交会被丢掉。

运行中的两个入口走同一条路，也多排一轮。它们不需要，只是不为此分两条路。

一次带多个地址时每个地址一个事件。系统给的是集合（`NSSet`），本身没有先后，按集合枚举的顺序派发。冷启动时先自定义协议的那一组，再通用链接的那一组。

## JS 这一侧

原生把每个地址作为一个内部事件 `@openurl` 派发在它的场景上，负载是 `{ url, sourceApplication }`。走的是登记进来的域用的那个事件出口（`NacreEmitEventWithJSON`），引擎和 `NacreRuntime.mm` 的事件代码都没改。

`21-application.js` 在内部事件表（`ctx.internalEventHandlers`，列表那一步加的）里登记 `@openurl`：建一个 `OpenURLEvent`，派发在 `application` 上。场景的包装从 `sceneconnect` 起由 `application` 拿着，所以 `e.scene` 和 `sceneconnect` 给的是同一个对象。

`application` 没有「认识的事件名」这张表。它是纯 JS 的 `EventTarget`，任何名字都能监听（自定义事件靠这个），所以加 `openurl` 不需要登记名字，只在类型定义的 `ApplicationEventType` 里加了一项。

`OpenURLEvent` 可以自己构造，`url` 和 `scene` 必填，缺了抛 `TypeError`。必填是为了类型：`e.scene` 的类型是 `UIWindowScene`，监听器里不用判空。`PromiseRejectionEvent.promise` 当初定成可选，结果类型里带着一个只有自己构造时才会出现的 `undefined`。

## 协议怎么声明

`nacre.config.json` 的 `ios.urlSchemes` 是协议名的数组。CLI 把它写成 Info.plist 的 `CFBundleURLTypes`，一组：

```
CFBundleURLTypes: [{ CFBundleTypeRole: Editor, CFBundleURLName: <包名>, CFBundleURLSchemes: [...] }]
```

- `CFBundleURLName` 用 App 的包名，`CFBundleTypeRole` 写 `Editor`（这些协议是 App 自己定义的）。这两项和 Xcode 的界面里填出来的一样。
- `CFBundleURLTypes` 进了保留键表，写在 `ios.infoPlist` 里报错，指到 `ios.urlSchemes`。两处都能写的话，谁盖谁要另外定规矩。
- 名字按 RFC 3986 校验（字母开头，后面是字母、数字、`+`、`-`、`.`）。系统对写错的名字不报错，只是那个协议永远打不开 App。
- 重复的报错，比较时不分大小写（协议名本来就不分）。
- 系统自己的七个协议（`http`、`https`、`mailto`、`tel`、`sms`、`facetime`、`facetime-audio`）报错：App 声明了也收不到。这张表来自 Apple 的文档，没有实测。写 `https` 的人多半想要的是通用链接，报错里指了过去。
- 空数组等于没写。

通用链接不需要 CLI 加东西：关联域名是一条 entitlement，`ios.entitlements` 已经能写。

## 要验证的假设

模拟器用验收 App（包名 `nacre.acceptance`，协议 `nacre-acceptance`）。验收的 `openurl.js` 在脚本顶层注册了监听器，每收到一个事件打一行 `[openurl]`，里面有地址、来源、场景、`sceneconnect` 到了没有。App 不是从终端启动的时候看不到标准输出，日志用下面这条看：

```bash
xcrun simctl spawn <设备> log stream --predicate 'subsystem == "nacre"' --style compact
```

| | 假设 | 不成立的后果 | 怎么验 |
| --- | --- | --- | --- |
| 1 | 运行时启动时，Info.plist 里写的场景委托类 `NSClassFromString` 找得到（Swift 类，名字是「模块名.类名」） | 冷启动和运行中都收不到，日志里有一行 `was not found` | 启动 App，看日志里有没有那一行 |
| 2 | 给这个类加上的三个方法系统会调到：系统是用 ObjC 的消息发送调委托的，而且判断「实现了没有」不早于委托实例的创建 | 收不到事件，没有报错 | 下面 3、4 任何一条收到事件就成立 |
| 3 | App 在运行时用自定义协议打开，系统调 `scene:openURLContexts:` | 运行中收不到 | App 开着时 `xcrun simctl openurl <设备> 'nacre-acceptance://warm?n=1'`，日志里出现一行 `[openurl]`，地址一字不差 |
| 4 | App 没在运行时用自定义协议打开，地址在 `connectionOptions.URLContexts` 里，并且系统**不再**另外调 `scene:openURLContexts:` | 前半不成立：冷启动收不到。后半不成立：冷启动的链接派发两次 | `xcrun simctl terminate <设备> nacre.acceptance` 之后 `xcrun simctl openurl <设备> 'nacre-acceptance://cold?n=1'`，日志里这个地址正好出现一行 |
| 5 | 冷启动时，场景接入的通知和 `willConnect` 在主线程的同一轮里 | `openurl` 可能排到 `sceneconnect` 前面 | 第 4 条那一行里「这个场景的 sceneconnect 已经到了=true」「是 application.scenes 里的那个=true」 |
| 6 | 运行时的事件出口在多排的那一轮执行之前已经接上（启动的三个任务先入队） | 冷启动的事件被丢掉，没有报错 | 同第 4 条 |
| 7 | App 自己调 `application.openURL()` 打开自己的协议，系统会送回来 | 验收里那一组自动的断言报未验证，不算失败 | 跑验收，看 `自己打开自己的协议` 那一段是一组 ✓ 还是一行 `!` |
| 8 | `sourceApplication` 只在来源 App 和本 App 同一个开发者团队时有值，`simctl openurl` 打开的是 `null` | 只影响文档里的说法 | 第 3 条那一行里的 `sourceApplication=` |
| 9 | 通用链接：运行中走 `scene:continueUserActivity:`，冷启动在 `connectionOptions.userActivities` 里，活动类型是 `NSUserActivityTypeBrowsingWeb`，地址在 `webpageURL` | 通用链接收不到 | 模拟器上验不了：要关联域名的 entitlement（显式包名的描述文件）和一个放了关联文件的真实域名 |
| 10 | 场景接入的通知到的时候 `scene.delegate` 已经设好；在那时补方法，系统之后的调用认 | 只影响用代码指定委托类的宿主 | 验收工程走的是 Info.plist，测不到。要测得改一份启动壳 |
| 11 | 验收那一步在运行中打开自己的协议，不会打断排在它后面的步骤（所有权、GC、三张 `Intl` 比对） | 后面的断言时过时不过 | 跑完整验收，和基线比 |

实测（iOS 27.2 模拟器）：用 `simctl openurl` 从外面打开，冷启动和运行中各收到一次 `openurl`，都排在 `sceneconnect` 之后。模拟器会先弹一个「在“Nacre”中打开？」的确认框，要人点，所以第 3、4 两条进不了自动验收。

第 2 条如果不成立，表现是 3、4 都收不到而日志里没有 `was not found`。先在 `NacreOpenURL.mm` 的 `Patch` 里打日志确认方法加上了，再考虑退到改模板。

## 没做的

- 推送通知的点击。它走的是通知中心的委托，不是场景委托。
- 通用链接以外的用户活动（接力、Spotlight 的搜索结果）。`scene:continueUserActivity:` 里别的活动类型现在直接忽略。
- `UISceneOpenURLOptions` 的其余字段（`annotation`、`openInPlace`、`eventAttribution`）。
- 用代码指定委托类的宿主在冷启动时的保证（见第 10 条）。
- `application.openURL()` 没动。
