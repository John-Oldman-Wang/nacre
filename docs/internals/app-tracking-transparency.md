# 跟踪授权和广告标识

← [实现原理](README.md)

能力包 `@nacrejs/app-tracking-transparency`：`ATTrackingManager` 和 `ASIdentifierManager`，对应系统的 AppTrackingTransparency 和 AdSupport 两个框架。怎么用见 [API 文档](../api/app-tracking-transparency.md)，能力包的通用机制见[能力包](capabilities.md)。这一页只记这个包自己的取舍。

它是第二个能力包，也是第一个在清单里用 `requires.infoPlist` 提要求的包。

## 为什么是包

判据是[项目说明 3.8 节](../project.md#38-核心和能力包)那一条：用户要不要因此在他自己的工程里写点什么。这两个框架被链接进来之后，App 的 Info.plist 里就得有 `NSUserTrackingUsageDescription`，而大多数 App 不读广告标识。

## 文件

```
ios/Capabilities/AppTrackingTransparency/
├─ NacreAppTrackingTransparency.mm              原生：一张 NacreDomain，三条通道
└─ Builtin/parts/app-tracking-transparency.js   JS：两个类
packages/app-tracking-transparency/             → @nacrejs/app-tracking-transparency
├─ index.d.ts
└─ nacre-ios.json                               requires.infoPlist 在这里
```

登记用的是 `NacreRegisterDomain`，不是钥匙串那两个单独的 handler。用到的通道：

| 通道 | 给谁用 |
| --- | --- |
| `classCall` | `ATTrackingManager.trackingAuthorizationStatus`、申请授权 |
| `classCallObject` | `ASIdentifierManager.sharedManager()` |
| `read` | `advertisingIdentifier` |

编出来的 framework 从核心拿的符号是四个（`nm -u` 实测）：`NacreRegisterDomain`、`NacreRegisterBuiltinParts`、`NacreCallBlockLater`、`JoinEnumNames`。

## API 的形状

两个类都在底层，按 ObjC 的原名暴露，没有另外设计上层对象：它们各只有一两个成员，再包一层没有可简化的东西。

| ObjC | JS | 依据 |
| --- | --- | --- |
| `@property(class, readonly) trackingAuthorizationStatus` | 类上的取值器 | 类属性做成静态取值器，和 `UIDevice.currentDevice` 一样 |
| `+requestTrackingAuthorizationWithCompletionHandler:` | `requestTrackingAuthorization()`，返回 Promise | 一次性的请求用 Promise（原则 4、5）。名字去掉了 `WithCompletionHandler`：那一段说的是回调，而回调换成了 Promise |
| `+sharedManager` | `sharedManager()`，带括号 | 头文件里它是**类方法**，不是类属性。无参的类方法做成方法，先例是 `CATransaction.disableActions()`、`UIListContentConfiguration.cellConfiguration()` |
| `advertisingIdentifier`（`NSUUID`） | 字符串 | 和 `UIDevice.identifierForVendor` 一样给 `UUIDString`，不为它暴露一个 `NSUUID` 类 |

`sharedManager` 这一条和最初的任务描述有出入（描述里写的是「类级单例」）。按「JS 里写的名字和 Apple 文档对得上」这条，照头文件做成了方法。它每次返回同一个对象，这一点是 JS 那一侧保住的，见下一节。

`ATTrackingManager` 的构造函数没有用 `nativeOnly`。那个助手的报错是「is created by the runtime, not by new」，而这个类根本没有实例（头文件里 `init` 和 `new` 都标了 `NS_UNAVAILABLE`）。报错单独写了一句，点名该用的两个类成员；是子类化时仍然先走 `finalCheck`。

## `sharedManager()`：系统每次给一个新对象

名字叫 shared，但系统给的不是同一个对象。不带界面的探针量的（iPhone Air 模拟器，iOS 27.2，命令行程序用 `xcrun simctl spawn` 运行）：

| | 结果 |
| --- | --- |
| 连调两次 `+sharedManager` | 指针不同（`0x1016868a0`、`0x1016861e0`），`isEqual:` 是 NO |
| 把三次的结果都拿着不放 | 三个不同的指针 |
| 每次取完就放掉，取五次 | 五次是同一个地址：前一个已经释放，地址被复用 |
| 刚取到的对象的引用计数 | 1，没有别人拿着它 |
| 这个类的实例变量 | 0 个，实例大小 8 字节（只有类指针） |
| 同一个实例读两次 `advertisingIdentifier` | 两个不同的 `NSUUID` 对象，每次现取 |

包装是按原生指针认的（同一个指针永远同一个 JS 对象），所以原样转给 JS 的话 `ASIdentifierManager.sharedManager() === ASIdentifierManager.sharedManager()` 是 `false`。第一版实现就是这样：它照 `UIPasteboard.generalPasteboard` 的写法用 `own(this, …)` 记了一条持有边，而那个写法只保证包装不被回收，前提是系统每次给同一个指针。合并后的验收里那一条断言挂了，才量出上面这张表。

定下来的做法是 **JS 那一侧记住第一次取到的包装，之后一直还它**，原生的 `+sharedManager` 整个 App 只调一次：

```js
let sharedManager = null;
…
static sharedManager() {
  if (sharedManager === null) {
    sharedManager = nativeClassCall('ASIdentifierManager', 'sharedManager', []);
  }
  return sharedManager;
}
```

- **为什么保住身份，而不是照实给「每次一个新对象」。** 这个名字承诺的就是一个共享的实例，JS 开发者会拿它做 `===`、当 `Map` 的键、往上面挂数据。每次换一个对象，这些都安静地失效。ObjC 里没人撞上，是因为没人比较这两个指针。
- **记住第一个没有代价。** 实例里什么都不存，`advertisingIdentifier` 每次读都是现取的，所以一直用同一个实例和每次新取一个读到的值一样。授权状态变了之后它读到的值会不会跟着变，按这个结构推断是会的，但**没有实际验证**（模拟器上这个值总是全零，要真机）。
- **记在闭包里，不用 `own(this, …)`。** 方法被摘下来单独调用（`const f = ASIdentifierManager.sharedManager`）时 `this` 不是类，记在类上就又漏了。验收里加了一条这样调的断言。

探针是命令行程序，不是 App；App 里的事实由合并后的验收给出，两边一致（那条断言读到的是 `false`）。

教训：用例里「每次同一个对象」这个期望来自对名字的理解，不是量出来的。名字里带 shared、current、default 的入口，接之前先量一次指针。

## 申请授权怎么变成 Promise

申请是类方法，而桥上返回 Promise 的通道（`callAsync`）是**实例**通道：它要一个原生对象的句柄。`ATTrackingManager` 没有实例。

没有为此加通道，用的是现成的两样东西，和 `UIView.animateWithDuration()` 的结束通知同一条路：

```
JS    registerBlock(fn, once)  →  一个号
JS    nativeClassCallValue('ATTrackingManager', 'requestTrackingAuthorizationWithCompletionHandler:', [号])
原生  调系统的方法；系统答复时  NacreCallBlockLater(号, '["authorized"]')
JS    fn('authorized')  →  兑现 Promise
```

被否掉的另一条路：造一个内部的单例对象当句柄，让申请走 `callAsync`。那样 JS 里会多出一个不对应任何原生类的对象，只为了凑通道的形状。

几处细节：

- **答复先回主线程，再延后一轮。** 头文件和 Apple 的文档都没说回调在哪个线程上来，所以先 `dispatch_async` 到主队列。再用 `NacreCallBlockLater` 而不是当场调：状态已经定了的时候，系统可能在申请的那次调用里面就答复，那时 JS 还在调原生的半路上。
- **失败从 Promise 出去，不同步抛。** 这个方法没有参数可以写错。剩下的失败是环境的问题（工程里缺权限文案），和钥匙串的原生失败一样走拒绝。`classCall` 填了 `error` 时引擎抛的是 `TypeError`，JS 那一侧接住、注销那个号、拒掉 Promise。
- **认不出的状态不编名字。** 系统以后新增了状态时，读属性抛 `TypeError`，申请的 Promise 被拒绝，报错里带系统给的数值。

### 缺权限文案：把终止换成报错

Info.plist 里没有 `NSUserTrackingUsageDescription` 时，申请的那一刻系统直接终止 App，JS 接不住。拦了两道：

| 在哪 | 做什么 |
| --- | --- |
| CLI 生成工程时 | 包的清单里写了 `requires.infoPlist`，项目没写就报错停下 |
| 原生，申请之前 | 读一次 Info.plist，没有就填 `error`，Promise 被拒绝 |

第二道是给不走 CLI、自己把 xcframework 拖进工程的情况。它没有验证过：验收的工程里有这句文案，走不到这个分支。

「没有文案系统会终止 App」这个前提来自 Apple 一贯的说法，这次没有实际触发过；Apple 的文档页上查到的原话只有「To use this method, add the NSUserTrackingUsageDescription key」。

## 广告标识：全零照实给

没有可用的标识时，系统给的不是 nil，是 `00000000-0000-0000-0000-000000000000`。原样交给 JS，没有换成 `null`。

理由是原则 7（运行时提供事实，JS 做判断）。换成 `null` 等于运行时替 JS 认定「全零就是没有」，而且类型会从 `string` 变成 `string | null`，每个读它的地方都要多判一次空。Apple 的文档列了六种全零的情况（模拟器、macOS、visionOS 上的兼容 App、没申请过、用户拒绝、配置限制），都是同一个值，JS 比一下就够。文档里给了这个写法。

`advertisingTrackingEnabled` 没有接：iOS 14 起废弃，头文件点名的替代品就是 `trackingAuthorizationStatus`。

## 读、写、变化通知

按原则 10 逐格看：

| | 授权状态 | 广告标识 |
| --- | --- | --- |
| 读 | `trackingAuthorizationStatus` | `advertisingIdentifier` |
| 写 | 只有用户能改。App 能做的是申请，`requestTrackingAuthorization()` | 不可写 |
| 变化通知 | 没有 | 没有 |

变化通知那一格是空的，原因是系统不提供：两个框架的头文件里没有通知名，也没有委托。变化只有两个来源，都有着落：App 自己的申请，结果从 Promise 得到；用户在系统的「设置」里修改，那要先离开 App，所以在 `active` 事件里重新读。

## iOS 27.2 新增的申请方法没有接

本机 SDK（iOS 27.2）的头文件里多了一个方法：

```objc
+ (void)requestTrackingAuthorizationPreferringExpandedInterface:(BOOL)preferExpandedInterface
                                    additionalInformationAction:(nullable void(^)(void))additionalInformationAction
                                              completionHandler:(void(^)(ATTrackingManagerAuthorizationStatus status))completion
    API_AVAILABLE(ios(27.2));
```

Apple 的文档说它在欧盟给提示框加一个可选的「更多信息」按钮。这一步没有接，三个原因：它只在 27.2 以上有，`#if __IPHONE_OS_VERSION_MAX_ALLOWED` 和 `@available` 两层都要写；`additionalInformationAction` 是一个可能被调多次的代码块，号什么时候注销要另外定；它的行为只能在欧盟地区的设备上看到。验收里有一条断言盯着它不存在。

## 给能力包的头里没有取参的宏

`NACRE_NUM` / `NACRE_INT` / `NACRE_BOOL` 在核心的内部头 `NacreBridge.h` 里，`NacreExtension.h` 里没有，能力包用不了。这个包只有一处要从 JS 取数（代码块的号），写成了先判类型再取：

```objc
id given = args.value(0);
if (![given isKindOfClass:NSNumber.class]) { *error = "…"; return true; }
const NSInteger completion = ((NSNumber*)given).integerValue;
```

意思和宏一样（类型不对就报错，不转换），`check-api.sh` 第 7 节的裸取值检查也不会拦它。但这是绕过去的：要取数的能力包多了之后，该把那三个宏搬进 `NacreExtension.h`。同样缺的还有 `EncodeJSON`，这里返回的 JSON 只有一个不含特殊字符的名字，是手拼的。两样都没有动核心，记在这里。

## 隐私清单

这个 framework 自己不带隐私清单。扫过它的二进制（`nm -u` 和 `__objc_methname`），没有碰到需要声明理由的系统 API。

「这个 App 跟踪用户」（`NSPrivacyTracking`）和「收集了设备标识」（`NSPrivacyCollectedDataTypes`）是 App 的声明，不是这个包的：包只把标识交给 JS，拿它做什么是 App 的事。CLI 现在没有让项目提供自己的隐私清单的口子，用到这个包的 App 上架前要自己处理，这一条没有解决。

## 验证

没有跑模拟器（一批能力包合并之后统一验收）。做过的：

| | 结果 |
| --- | --- |
| 先写用例 | 没有实现时 `tsc` 报 `Cannot find name 'ATTrackingManager'`，运行时这一步会在第一处用到它的地方抛 |
| `check-api.sh` | 一致，类从 100 个到 102 个。故意弄坏三处（类型里改一个枚举值、把只读改成可写、part 里改方法名）各报得出来 |
| `tsc` | 通过 |
| 只编译这个 target（模拟器，Debug） | 编过。产物里带着 part，链接了 AppTrackingTransparency 和 AdSupport |
| 只编译整个验收 App（不装、不运行） | 编过。App 里嵌着 `NacreAppTrackingTransparency.framework`，Info.plist 里有那句文案 |
| CLI 生成验收工程 | `能力包：@nacrejs/app-tracking-transparency、@nacrejs/keychain`；去掉文案再生成，报错点名这个包和这个键 |
| part 的 JS 逻辑 | 用假的 `ctx` 在 Node 里跑过：两个类不能 `new`、Promise 的兑现和两种拒绝、号用完注销 |
| 合并后的验收（模拟器，Debug，由合并的对话跑） | 这个包的断言里 1 条失败：`sharedManager()` 两次不是同一个对象。其余通过，包括没授权时广告标识是全零 |
| 修 `sharedManager()` | 探针量出系统每次给新对象（见上）。假的 `ctx` 改成每次给新对象之后，改之前的 part 两次不相等，改之后相等，原生只被调了一次 |

最后两行里，CLI 那一条是 `requires.infoPlist` 第一次被真的包走通；在这之前它只用临时目录里的假包测过。

没验证的：

- 修完 `sharedManager()` 之后还没有重新在 App 里跑。
- 系统的提示框：出不出来、文案对不对、点了之后 Promise 兑现成什么。这一段在验收界面的「申请跟踪授权」按钮上，要人点。
- 状态已经定了时，申请不弹框、直接兑现。验收里这种情况会自动验，但第一次安装时状态是 `notDetermined`，走不到。
- 缺权限文案时原生那一道拦截。
- 真机，以及真机上授权之后的真实标识。
- 预编译的 xcframework 没有打。
