# 面容 ID 认证：`@nacrejs/local-authentication`

← [实现原理](README.md)

`LAContext` 是第二个能力包，第一个带工程配置要求的。这一页记它为什么是包、每个成员为什么是这个形状、在 Mac 上量到了什么、哪些还没有验证。能力包这套机制本身见[能力包](capabilities.md)，用法见 [API 文档](../api/la-context.md)。

## 为什么是一个包

判据是 [project.md 3.8 节](../project.md#38-核心和能力包)那一条：用户要不要因此在他自己的工程里写点什么。

用面容 ID 的 App 必须在 Info.plist 里有 `NSFaceIDUsageDescription`。上传时的检查扫的是二进制里的符号，核心只要链接了 LocalAuthentication，每一个用 Nacre 的 App 都得写这句话，哪怕它没有认证功能。

所以它编进单独的 framework（`NacreLocalAuthentication`），包的清单里声明：

```json
"requires": { "infoPlist": ["NSFaceIDUsageDescription"] }
```

项目装了包而没写这个键，CLI 生成工程时停下。这是工程配置做完之后第一个真的用上 `requires.infoPlist` 的包；那套机制当时是用假包测的。实测：验收工程装上这个包、在 `nacre.config.json` 里写了文案，`generate` 打出 `能力包：@nacrejs/keychain、@nacrejs/local-authentication`，生成的工程描述里有 `NacreRuntime/NacreLocalAuthentication` 这个 target，Info.plist 那一段里有 `NSFaceIDUsageDescription` 和写的那句话。

## 属于哪一层

底层：按 ObjC 的类名裸暴露 `LAContext`，成员名照 Apple 的。没有另外定一个上层对象（比如 `application.authenticate()`）。理由是 `LAContext` 本身的面已经很小，一次认证就是「建对象、调一个方法」，上层包一层省不下什么；而上层的形状要等看到几个 App 怎么用它之后再定。

## 每个成员的决定

### `canEvaluatePolicy:error:` 拆成两个方法

原生是 `canEvaluatePolicy:error:`，返回 `BOOL`，同时用出参给出「为什么不行」（没录入、被锁定、设备不支持、没设密码）。JS 里是两个方法：

| JS | 给什么 |
| --- | --- |
| `canEvaluatePolicy(policy)` | 原生的返回值，布尔 |
| `canEvaluatePolicyError(policy)` | 原生的出参：能认证时 `null`，不能时一个 `Error`（返回，不抛） |

规矩里有「出参可以改成返回值或抛异常」，但这个方法两样都占了：返回值已经是布尔，再把 `NSError` 改成返回值就得返回一个对象；改成抛异常，一个叫 `can…` 的方法在答案是「不能」时抛，`if (!context.canEvaluatePolicy(p))` 永远走不到。考虑过的几种：

| 形状 | 问题 |
| --- | --- |
| 返回 `{ ok, error }` | 对象恒为真，`if (context.canEvaluatePolicy(p))` 永远成立，而且类型检查不报。正是这个项目一路在拒绝的静默错误 |
| 不能时抛 | 见上 |
| 返回布尔，原因不给 | 少一项能力。这个包最初是这么做的 |
| **返回布尔，另加一个方法给原因** | 在底层的类上多一个 ObjC 没有的方法名 |

最初选的是「原因不给」，记在 API 文档的「还不能做的」里等 review。2026-11-16 review 时定了要给，改成最后一种。几条细节：

- **名字**是 selector 的两段拼起来的：`canEvaluatePolicy` + `error`。照着 Apple 文档里的 `canEvaluatePolicy:error:` 能找到它。
- **返回的是 `Error` 对象，不抛。** 它和 `evaluatePolicy()` 拒绝的错误是同一套字段（`name` / `message` / `code` / `domain`），名字走同一个映射函数，JS 两处可以共用一段判断。
- **每次调用过一次桥、问一次系统。** 两个方法各问各的，不缓存上一次的答案：头文件写的是这个结果要现问现用。
- **系统返回 `NO` 却没给 `error`** 时给一个 `name` 是 `'LAError'`、`code` 是 0 的对象。头文件没有承诺这种情况不发生；没有实测到过。

为什么不让 JS 用 `evaluatePolicy()` 的拒绝来代替：设备不支持、没录入、没设密码时，`evaluatePolicy()` 不显示界面、直接以对应的原因拒绝，可以当探针用；但生物认证被锁定时，头文件写的是只认生物认证的策略也会先要求输锁屏密码，也就是会显示界面。

对照过 Expo 的 `expo-local-authentication`（文档是 SDK 58，iOS 源码是 `main` 分支）：它没有把原因直接给 JS，而是拆成两个布尔的函数，内部都是调 `canEvaluatePolicy:error:` 再看错误码——`hasHardwareAsync()` 是「错误码不是设备不支持」，`isEnrolledAsync()` 是「没有错误，或者错误码是被锁定」。被锁定和没设密码，它不显示界面就分不出来。那两个函数用 `canEvaluatePolicyError()` 各两三行能写出来，所以底层给完整的原因。

**这一条仍然是这个包自己的答案，没有升成通用的规矩**：返回布尔同时带一个 `NSError` 出参的方法，以后别的框架里还会遇到（`NSFileManager` 一类），那时再看这个形状合不合适。

模拟器上实测（iPhone Air，iOS 27.2，没有录入面容）：

| 问什么 | 结果 |
| --- | --- |
| 只认生物认证的策略 | `BiometryNotEnrolledError`，`code` -7，`message` 是 `Biometry is not enrolled.` |
| 生物认证或密码的策略 | `null`（`canEvaluatePolicy()` 是 `true`） |
| 调过 `invalidate()` 的对象 | `InvalidContextError` |

### `evaluatePolicy()` 通过时兑现 `true`

`reply` 给的是 `(BOOL success, NSError* error)`。没通过一律拒绝，所以兑现的值只可能是「通过」。兑现成 `undefined` 更像 Web 的写法，但 `if (await context.evaluatePolicy(…))` 会因此永远不成立，而且不报错。兑现 `true`，两种写法（`try`/`catch` 和 `if (await …)`）都对。类型写成 `Promise<true>`，让人看得出它不会是 `false`。Swift 的异步版本返回的也是 `Bool`。

### 错误的名字

`err.name` 是 `LAError` 的常量去掉 `LAError` 前缀、加 `Error` 后缀：`LAErrorUserCancel` → `'UserCancelError'`。`err.code` 和 `err.domain` 是 `NSError` 的原值。这和 Keychain、文件读写的做法一致：上层给名字，底层不丢事实。

没有借 Web 的名字（`NotAllowedError`、`AbortError`）。WebAuthn 把用户取消、超时、不支持全归进 `NotAllowedError`，那是为了不向网页泄露设备状态；App 需要分清这几种（任务里要求分得清用户取消、没录入、被锁定、不可用），而且名字和 Apple 文档对得上才查得到。

表里只列 iOS 上、这两种策略会出现的十一个，其余的统一叫 `'LAError'`。macOS 专有的（`BiometryNotPaired`、`BiometryDisconnected`、`InvalidDimensions`、`WatchNotAvailable`）和配套设备的 `CompanionNotAvailable` 不在表里。

名字只能经 `NacreAsyncResult.errorName` 一个字段带出去，所以没有另加别的字段。

### 参数写错一律同步抛

`evaluatePolicy()` 返回 Promise，参数错误有两种放法：同步抛，或者拒绝 Promise（Web IDL 对返回 Promise 的操作规定的是后者）。Keychain 两种都有：键的类型在 JS 里验、同步抛，访问级别在原生验、拒绝。

这里统一成同步抛，文档上可以写成一条规则：**抛的是参数写错，拒绝的是认证没通过**。代价是策略的名字只有原生认得（名字到数值的映射只能放在原生），所以 `evaluatePolicy()` 在走异步通道之前先过一次桥验策略（内部 selector `nacre:checkPolicy:`）。多一次过桥是微秒级的，后面跟着的是一次要用户看屏幕的认证。

异步通道里原生仍然自己再验一遍策略和 `localizedReason`：这两样不合法时系统的做法是抛 `NSInvalidArgumentException`（Mac 上实测），不能指望 JS 一侧永远先验过。

### `localizedReason` 是空串时在 JS 里拦

系统对空串抛 ObjC 异常。核心的入口有保底（接住后拒掉 Promise），但那样报出来的是一句系统的英文异常说明。在 JS 里拦，报的是 `evaluatePolicy: localizedReason must not be empty`。

### 负的复用时长由运行时拒

`touchIDAuthenticationAllowableReuseDuration` 系统自己不拦负数（Mac 上实测写 -5 读回 -5）。负的时长没有含义，按「取值范围由各 API 自己拒」拦掉。超过 300 秒的不拦：头文件写的是「超过了也不会更久」，那是系统的事实，不是错误。

### 没有暴露的成员

| 成员 | 为什么没有 |
| --- | --- |
| `localizedReason` 属性 | 它只在「调用方没有自己给理由」时用，也就是钥匙串操作引出认证界面的时候。钥匙串包现在不接受认证上下文，这个属性没有地方起作用 |
| `evaluateAccessControl:…` | 要 `SecAccessControlRef`，和钥匙串那一侧一起做 |
| `setCredential:type:`、`isCredentialSet:` | 要 `NSData` 参数，用处窄 |
| `domainState`、`evaluatedPolicyDomainState` | 前者是一组新的类，后者已废弃 |
| `maxBiometryFailures` | 已废弃，头文件写明设了没有效果 |
| 配套设备的两种策略 | 没有能验的设备 |
| `LATouchIDAuthenticationMaximumAllowableReuseDuration` | C 常量，值是 300。文档里写了这个数 |

验收里每一项都有一条断言：成员不存在（`name in context` 是 `false`），策略写了抛 `TypeError`。

## 原生那一侧

`ios/Capabilities/LocalAuthentication/NacreLocalAuthentication.mm`，一个文件，用 `NacreRegisterDomain` 登记一张表，外加 `NacreRegisterBuiltinParts`。Keychain 用的是更早的两个单独的处理函数；这是第一个用域的表登记的能力包。用到的通道：`read`、`write`、`construct`、`call`、`callAsync`。

**`callAsync` 是登记表里第一次有域在用。** 接入点重构时它接了线，迁过去的三个域都用不到（Keychain 走的是旧的 `NacreRegisterAsyncMethodHandler`）。它在这里只编译过，没有运行过。

三件实现上的事：

- **能力包拿不到核心的取参宏。** `NACRE_NUM` / `NACRE_BOOL` 在内部头 `NacreBridge.h` 里，能力包只能引 `NacreExtension.h`。所以这个文件自己写了三个小的校验函数（是不是布尔、是不是有限的数、报错文案），规矩不变：转换在 JS 一侧做完，原生只校验。几个能力包多半各写了一份，值得搬进扩展头，那要改核心，没有在这一步做。
- **认证期间由 block 持有 `LAContext`。** 头文件写明：认证进行中对象被释放，认证会被取消。JS 的包装是弱的，`new LAContext().evaluatePolicy(…)` 这种写法里包装随时可能被回收，所以 `reply` 的 block 捕获了它。
- **`reply` 不在主线程。** Mac 上实测是系统的私有队列。`done` 可以在任何线程调，回主线程兑现是核心做的。头文件警告不要在 `reply` 里调 `canEvaluatePolicy`（可能死锁）；JS 的 `.then` 是回到主线程之后才执行的，不在 `reply` 里。

枚举用了两张 `NACRE_ENUM_MAP`（`LAPolicy`、`LABiometryType`），`check-api.sh` 按 ObjC 的类型名自动和类型定义里同名的联合类型核对。故意弄坏两处都报得出来：类型里去掉 `'opticID'`、把 `interactionNotAllowed` 改成只读。

## 在 Mac 上量到的

LocalAuthentication 在 macOS 上也有。用一个命令行探针量了不显示界面的那部分（macOS 27.2.1，带触控 ID 的 Mac）。**这是 macOS 的数，不是 iOS 的**；验收里拿它当期望的地方都标了出处。

| | 结果 |
| --- | --- |
| 默认值 | `localizedFallbackTitle` 和 `localizedCancelTitle` 是 nil，复用时长 0，`interactionNotAllowed` 是 NO |
| `biometryType` | 没调过 `canEvaluatePolicy` 也读得到（1，触控 ID） |
| `canEvaluatePolicy` 的耗时 | 第一次 22 ms，第二次 46 ms。它是同步的进程间调用 |
| 复用时长写 1000、写 -5 | 原样读回，系统不裁剪 |
| `localizedFallbackTitle` 写空串 | 读回空串，不是 nil |
| `interactionNotAllowed = YES` 之后认证 | 不显示界面，`LAErrorNotInteractive`（-1004），`reply` 不在主线程 |
| `invalidate` 之后 | `canEvaluatePolicy` 返回 NO（-10）；认证以 -10 结束；再 `invalidate` 一次没有效果；之后写的属性不生效（写 `localizedCancelTitle` 读回 nil） |
| `localizedReason` 传空串 | 抛 `NSInvalidArgumentException`：`Non-empty localizedReason must be provided.` |
| 策略传一个不存在的数值 | 抛 `NSInvalidArgumentException` |
| 错误域 | `com.apple.LocalAuthentication` |

`canEvaluatePolicy` 的那两个数要留意：它在主线程上同步执行，Mac 上是几十毫秒。iOS 上是多少没有量，验收的日志里会打出一次的耗时。

## 产物

Release 配置、模拟器 SDK，只编译不运行：

| | 结果 |
| --- | --- |
| 编译 | 通过，这个文件没有警告 |
| 能力包从核心拿的符号 | 1 个类（`NacreAsyncResult`）、5 个函数（`DecodeJSON`、`JoinEnumNames`、`EnumError`、`NacreRegisterDomain`、`NacreRegisterBuiltinParts`），都在 `NacreExtension.h` 里 |
| 能力包链接的系统框架 | LocalAuthentication、Foundation、CoreFoundation |
| 核心二进制里的 LocalAuthentication | 符号 0 个，也不链接这个框架 |
| 登记类 | 没有被裁掉：符号表里有，`__objc_nlclslist` 里有一个条目 |
| framework 里的 part | `Builtin/parts/local-authentication.js` 在 |
| 大小 | 84 KB（模拟器一个切片） |

## 验收怎么分的

自动跑的部分不显示任何系统界面：

- 建对象、不能继承、`biometryType` 的取值和只读
- `canEvaluatePolicy` 两种策略都返回布尔；策略写错、不带、给数字、给配套设备的策略都抛 `TypeError`，并列出可选值
- `canEvaluatePolicyError` 两种策略都不抛；它是不是 `null` 和 `canEvaluatePolicy` 的布尔对得上；不是 `null` 时是 `Error`，`name` 是「开始不了」的四种之一，`code` 是数，`domain` 和 `message` 都有；每次问得到新的对象；参数写错的四种情况和 `canEvaluatePolicy` 一样抛
- 四个可写属性的默认值、读写、转换、写错时抛什么；被拒之后原值不动
- 没暴露的七个成员不存在
- `evaluatePolicy` 的八种参数错误都是同步抛
- `invalidate` 之后：`canEvaluatePolicy` 是 `false`，`canEvaluatePolicyError` 的原因是 `InvalidContextError`；`evaluatePolicy` 被拒绝，`err.name` 是 `'InvalidContextError'`，`code` 是数，`domain` 是 `'com.apple.LocalAuthentication'`
- 只在模拟器上：`interactionNotAllowed = true` 之后认证被拒绝，名字是 `NotInteractiveError` 或 `PasscodeNotSetError`（没设密码的模拟器在需要显示界面之前就失败了，两种都算对）

最后一条不在真机上自动跑：真机上第一次用面容 ID，系统会先问用户是否允许；`interactionNotAllowed` 挡不挡得住那个提示框，没有验证过。

要人点的在系统能力面板上，一排三个按钮：

| 按钮 | 做什么 | 日志里看什么 |
| --- | --- | --- |
| 面容/指纹 | 只认生物认证，备用按钮叫 `Use PIN`，取消按钮叫 `Not now` | 通过时兑现的值；点备用按钮是 `UserFallbackError`；点取消是 `UserCancelError` |
| 或密码 | 生物认证或锁屏密码 | 同上 |
| 认证中作废 | 发起认证，1.5 秒后 `invalidate()` | 应该是 `AppCancelError` |

模拟器上要先在菜单里把面容 ID 设成已录入（Features → Face ID → Enrolled），再用 Matching Face / Non-matching Face 模拟识别结果；没录入时第一个按钮直接得到 `BiometryNotEnrolledError`。

## 没有验证的

- **整个包没有在模拟器或真机上运行过。** 做的时候约定不跑模拟器，由合并的对话统一跑。运行过的只有：`check-api.sh`、类型检查、打包、CLI 生成工程、Release 只编译。
- 登记表里的 `callAsync` 通道第一次有域用。
- 验收里两条期望来自头文件和 Mac 上的探针，iOS 上是第一次跑：作废之后 `canEvaluatePolicy` 是 `false`、作废之后认证的 `err.name` 是 `InvalidContextError`。
- 认证界面的样子、三个按钮各自的结果、第一次用面容 ID 时的权限提示、`localizedFallbackTitle` 写空串是否隐藏按钮、复用时长是否起作用。
- 同一个 `LAContext` 通过认证之后再次认证时系统还问不问用户。文档里的建议是每次用新的对象，不依赖这一条。
- 真机；预编译的 xcframework 没有打。

## 合并时要留意的

系统能力面板（`acceptance/src/steps/pasteboard.js` 的 `systemPanel`）是固定 106 pt 高、里面的排平分高度。原来有三排，每排 26 pt。几个能力包各加一排之后每排只剩几个点高，点不到。要把那个区块加高或者改成不固定高度。这个文件属于别的步骤，这一步没有改它。
