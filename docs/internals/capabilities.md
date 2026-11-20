# 能力包

一个能力（现在是 Keychain，以后是 Face ID、相机、定位这些）从核心里拆出去之后，是一个单独的 framework。这一页记它是怎么搭的、核心给了它什么、边界在哪。为什么要拆、哪些该拆，见[项目说明 3.8 节](../project.md#38-核心和能力包)。

第一个拆出去的是 Keychain，下面的数字都是拿它量的。

## 一个能力包由什么组成

```
ios/Capabilities/Keychain/
├─ NacreKeychain.mm              原生那一半
└─ Builtin/parts/keychain.js     JS 那一半
```

工程里是一个 framework target（`NacreKeychain`），产物里是 `NacreKeychain.framework`，里面带着 `Builtin/parts/keychain.js`。

交付出去的是另一个目录，一个 npm 包：

```
packages/keychain/               → @nacrejs/keychain
├─ index.d.ts                    类型
├─ nacre-ios.json                清单：这是一个能力包、它的 framework 叫什么
└─ NacreKeychain.xcframework/    预编译的 framework（构建产物，不提交）
```

`ios/` 下是源码，`packages/` 下是交付物——和核心的 `ios/Runtime/` 对 `packages/ios/` 是同一种关系。

它靠三样东西接进核心，全在自己文件末尾的 `+load` 里登记：

```objc
@implementation NacreKeychainRegistration
+ (void)load {
  nacre_bridge::NacreRegisterAsyncMethodHandler(nacre_bridge::KeychainCallAsync);
  nacre_bridge::NacreRegisterClassObjectHandler(nacre_bridge::KeychainClassObject);
  nacre_bridge::NacreRegisterBuiltinParts(self);
}
@end
```

| 登记的 | 核心拿它做什么 |
| --- | --- |
| 异步方法的处理函数 | JS 调 `nativeCallAsync(…)` 时挨个问「认不认领」 |
| 类对象的处理函数 | JS 调 `nativeClassObject('Keychain', 'default')` 时挨个问 |
| 内置脚本所在的包（传一个类当锚点） | 核心的 part 跑完之后，执行这个包 `Builtin/parts/` 下的 part |

**核心一个字都不认识它。** `ios/Runtime` 下的 `.mm`、`.h` 和 part 里 grep 不到 Keychain 的任何声明或调用。

## 核心给它的面：两块

### 原生：`NacreExtension.h`

能力包的原生代码只 `#import <Nacre/NacreExtension.h>`，不碰核心的内部头 `NacreBridge.h`——那里面是核心自己的分发表，七百行声明，随时在变。

这个头是从内部头里**划出来的最小一组**。划多大不是设计出来的，是量出来的：Keychain 的原生代码用到核心的东西一共就这些。

（后来这个头里多了一组东西：`NacreDomain` 和 `NacreRegisterDomain`、参数包 `NacreArgs`、事件出口 `NacreEmitEvent…`。那是给核心里新接的类用的登记机制，见[接入一组类](adding-classes.md)；能力包以后也用得上，Keychain 现在没用。）

| | 是什么 |
| --- | --- |
| `nacre::NativeObjectRef` | 「指针 + JS 类名」，把自己的对象交给引擎用 |
| `NacreKeep(obj)` | 造 ref 时让对象活过交接，见[包装机制](wrapper.md#交接的那一段没人持有只在-release-下崩的悬空指针) |
| `NacreAsyncResult`、`NacreAsyncDone` | 异步调用的结果和回调 |
| `NacreBlob` | 字节的载体（`setBytes` 收的是它） |
| `DecodeJSON`、`EncodeJSON` | 解开过桥的参数；把结果和事件的数据编成 JSON |
| `NACRE_NUM` / `NACRE_INT` / `NACRE_BOOL`、`RequireNumber` 一组 | 取 JS 给的值，类型不对就报错。2026-11-16 从内部头搬过来的，在那之前能力包各自绕过去了，哪几处可以换见[原生模块](native-modules.md#顺带取参的宏和-encodejson-搬进了给能力包的头) |
| `NACRE_ENUM_MAP` / `NACRE_ENUM_DECL`、`JoinEnumNames`、`EnumError` | 枚举的名字 ↔ 数值，和写错时的报错 |
| `NacreRegister…` 三个 | 登记 |

实测能力包的二进制从核心拿的符号正好是这些：2 个 ObjC 类、6 个函数（`NacreKeep` 是内联的、`NativeObjectRef` 是结构体、宏不产生符号）。

**它在 framework 里的可见性是 private**：进 `PrivateHeaders/`，不进 umbrella header。它是 ObjC++ 的头（有 `std::string`），Swift 读不了；普通宿主也不该看见它。公开头还是只有 `Nacre.h` 和 `NacreRuntime.h`。

**可空性标全了**（2026-11-20）：整个头包在 `NS_ASSUME_NONNULL` 里，可能为空的逐个标 `_Nullable`：`DecodeJSON` 的返回值、`EncodeJSON` / `Require…` / `EnumError` 收的值、`NacreArgs` 的两个成员和两个取值函数、`NacreDomain` 里的名字和每个函数指针（用不到的通道留空）、`read` 的返回值、两个 `write` 收的值、事件出口带的 json 和负载、`NacreKeep` 的返回值。原来只标了几处，而一个头里只要有一处标了，编译器就要求全部都标：引这个头的每个文件都把没标的指针报一遍，8 个能力包各编一次是 8288 条警告，`run-sim.sh` 之外看不见真正要紧的警告。标全之后是 0 条，也没冒出别的警告。标注只给编译器看，不改变生成的代码。

`NativeObjectRef` 为此单独成了一个头（`Engine/NativeObjectRef.h`）：引擎和能力包都要它，而它什么都不依赖——不认识 V8，也不认识 iOS。`NacreExtension.h` 用引号 include 它（`#include "NativeObjectRef.h"`），这样在核心自己的工程里和在 `PrivateHeaders/` 里都找得到。

**这个头不是给第三方用的。** 当初设想它是宿主扩展点的雏形；后来（2026-11-16）第三方和 App 团队接自己的原生代码有了单独的一层，公开的 `NacreModule.h`，见[原生模块](native-modules.md)。这个头留给「把一个原生类完整暴露给 JS」的场合，形状没定死；枚举宏只搬了数字枚举那一对，字符串枚举和位掩码的还在内部头里，谁用到再搬。

### JS：`ctx`

能力包的 part 和核心的 part 写法一样——整个文件是一个函数表达式，用同一个 `ctx` 调一次：

```js
(function (ctx) {
  'use strict';
  const { Application, defineNativeClass, has, nativeCallAsync,
          nativeClassObject, nativeOnly, own } = ctx;

  defineNativeClass('Keychain', class Keychain extends NSObject { … });
  …
})
```

`ctx` 里的东西是核心各个 part 末尾 `Object.assign(ctx, {…})` 放进去的。**它原来只是「哪些名字被别的 part 用到了」的结果，现在成了核心给能力包的接口**——有人清理核心里某个 part 的导出，能力包就会在解构时拿到 `undefined`，调用时才抛。这一条还没有机械检查，靠验收兜着。

原生类不走 `ctx`：`defineNativeClass` 把类挂在 `globalThis` 上，所以 `class Keychain extends NSObject` 里的 `NSObject` 是全局变量。

## 加载顺序

```
[nacre] builtin script ready in 19.3 ms (25 parts + 1 from NacreKeychain)
```

先跑核心的 part，再跑各能力包的。顺序反过来不行：能力要往 `Application` 上挂属性，那时 `Application` 得已经定义出来。

能力包之间按**包名**排序，不按登记的先后——`+load` 的顺序由链接顺序决定、不确定，而 part 的执行顺序应当每次一样。

能力包登记了却一个 part 都没带，和 part 执行失败一样是致命的：那是打包出了错，装一半比不装更难查。

脚本名是 `nacre:<包名>/parts/<文件>`，所以调用栈里看得出一帧来自哪个包。

## 往核心对象上挂属性

`application.keychain` 原来是 `Application` 类体里的一个取值器。那样核心就认识 Keychain。现在由能力包的 part 自己挂：

```js
Object.defineProperty(Application.prototype, 'keychain', {
  configurable: true,
  enumerable: false,
  get() { return own(this, 'keychain', nativeClassObject('Keychain', 'default')); },
});
```

描述符照着类体里的取值器写：不可枚举、可配置、没有 setter。验收里有三条断言盯着这个。

**没装能力包时，这个属性不存在**（`'keychain' in application` 为 `false`）。没有做成「一个读了才抛的占位」——那样类型检查是绿的，运行时才炸，正是这个项目一路在拒绝的那种错。

类型那一侧是声明合并，和 Keychain 类写在同一个 `.d.ts` 里：

```ts
interface Application {
  readonly keychain: Keychain;
}
```

实测去掉这一段，`tsc` 立刻报 `Property 'keychain' does not exist on type 'Application'`。

## 装了才有

「按需」是这样实现的：**项目装了哪个能力包，生成的工程就嵌哪个 framework。**

CLI 生成工程时读项目的 `package.json`，在 `dependencies` 和 `devDependencies` 里挨个找：`node_modules/<包>/nacre-ios.json` 存在、而且里面有 `capability` 字段的，就是能力包。找到了就把它的 framework 加进工程（引源码时加 target，引产物时把 xcframework 拷进 `ios/`）。

| | 装了 `@nacrejs/keychain` | 没装 |
| --- | --- | --- |
| CLI 打的 | `能力包：@nacrejs/keychain` | `能力包：没有（只有核心）` |
| App 里嵌的 | `Nacre.framework`、`NacreKeychain.framework` | 只有 `Nacre.framework` |
| 启动日志 | `25 parts + 1 from NacreKeychain` | `25 parts` |
| `'keychain' in application` | `true` | `false` |
| `typeof Keychain` | `function` | `undefined` |
| `tsc` 对 `application.keychain` | 通过 | `TS2339: Property 'keychain' does not exist on type 'Application'` |

六行都是跑出来的。右边那一列三处是一致的——工程里没有、运行时没有、类型里也没有。

定下来的几条：

- **装了就是声明，不另设一份能力清单。** 那样「装了但忘了写」这个状态会存在。
- **只认直接依赖。** 某个库自己依赖了一个能力包，不让用它的 App 悄悄多嵌一个 framework——带来的可能是一条隐私声明、一句权限文案，那是替用户做选择。要用就自己装，和 npm 的 peerDependencies 是同一种约定。
- **三种情况停下来，不悄悄跳过**：依赖写了却没装（没法知道它是不是能力包，跳过就成了「装了但没接入」）、清单缺 `target` 或 `xcframework`、能力包要的运行时版本和核心对不上。
- **卸掉的能力要清干净。** 上一次生成时装过、这一次不装了，`ios/` 里留下的 xcframework 要删——实测 `examples/hello` 里上一步留下的 `NacreKeychain.xcframework` 被清掉了。
- **类型跟着包走。** 没装就没有类型；装了之后在入口文件顶上加一行 `/// <reference types="@nacrejs/keychain" />`。

### 能力包的类型不自己引核心的类型

`index.d.ts` 用到 `NSObject` 和 `Application`，它们是 `@nacrejs/types` 声明的全局类型。第一版在文件顶上写了 `/// <reference types="@nacrejs/types" />`，`tsc` 当场报：

```
../packages/keychain/index.d.ts(11,23): error TS2688: Cannot find type definition file for '@nacrejs/types'.
```

包是用 `file:` 链接进来的（一个符号链接），TypeScript 从这个文件的**真实路径**往上找 `node_modules`，而 `packages/keychain/` 上面没有。workspace 链接的包也是这个情形。

去掉那一行就对了：用 Nacre 的入口文件本来就引了 `@nacrejs/types`，全局类型都在同一个程序里。两个包的关系写在 `peerDependencies` 里。

## 拆不拆：量过的代价

拆一个能力出去不是免费的，留一个能力在核心也不一定有代价。两边都量过（2026-11-15，起因是要不要拆 WebView）。

三个除了一处之外完全相同的最小 App，在 `main()` 第一行算「进程创建 → 这里」用了多久——dyld 加载、绑定、初始化器都算在里面：

| | 是什么 | 代表 |
| --- | --- | --- |
| A | 只链 UIKit | 拆了之后、不装那个能力的 App |
| B | A + 链接 WebKit（只引用类，不创建网页） | 能力留在核心时的所有 App |
| C | A + 多嵌一个小的动态库（一个带 `+load` 的类） | 拆包这件事本身的成本 |

真机（iPhone 14，iOS 27.0.1），每种 15 轮，取中位数：

| | 进程创建 → `main()` | → `didFinishLaunching` | 进程里的镜像数 |
| --- | --- | --- | --- |
| A | 10.4 ms | 30.5 ms | 652 |
| B | 11.4 ms | 32.1 ms | 920 |
| C | 10.9 ms | 31.5 ms | 653 |

| | 代价 |
| --- | --- |
| 核心多链一个系统框架（B − A） | 约 **+1.0 ms** |
| 多嵌一个动态库（C − A） | 约 **+0.5 ms** |

链 WebKit 让进程多加载 268 个镜像，但它们全在系统的共享缓存里，几乎不花钱。取最小值比也是同一个数（10.2 对 11.2），不是噪声。

所以拆 WebView：不用网页的 App 省约 1 ms，用网页的 App 多花约 0.5–1 ms，**净收益约等于零**——WebView 留在核心。

三条要记住：

- **「核心多链一个系统框架」不是拆的理由。** 是拆的理由只有一种：用户要因此在他自己的工程里写点什么（权限文案、entitlement）。
- **模拟器上的启动数字不能代表真机。** 同一组探针在模拟器上 B − A 是 **+100 ms**（315 ms 对 416 ms）——模拟器的动态加载没有真机那套共享缓存的优化。只在模拟器上量会得出相反的结论。
- **UIKit 自己就带着网页的东西。** 只链 UIKit 的 A，进程里已经有 4 个网页相关的镜像。

这次量的局限：量的是系统缓存已经热了的启动，**重启设备后的第一次启动没量**；C 里那个动态库只有一个类，真的能力包会大一些；量的是「链接」的代价，不是创建网页的代价——后者只在真的 `new WebView()` 时才有，拆不拆都一样。

探针是一次性的，没有进仓库。它有一处值得记：iOS 27 对不采用场景生命周期的 App 直接 trap（`_UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption`），再小的探针也得带一个场景委托。

## 注册为什么这么写

- **用 `+load`，不让宿主调。** framework 被嵌进 App 就一定会走到，宿主不用写任何代码。「启动壳要设计成不需要被改的」是交付模型里定过的。
- **注册表用函数内的静态局部变量，不用文件级的全局对象。** `+load` 比全局对象的构造早，用全局对象会注册进一个还没构造的 `vector`，构造时又被清空，而且一声不吭。
- **Release 下注册类不会被裁掉。** `NacreKeychainRegistration` 没有任何人引用它的符号，而工程开着 `DEAD_CODE_STRIPPING`。实测它还在：符号表里有，`__objc_nlclslist`（带 `+load` 的类登记的那个段）里有条目。
- **枚举没有「注册」一说。** `NACRE_ENUM_MAP` 直接定义出那三个函数，同一个文件里定义在前、用在后就够了。

## 两条机械检查

| `check-api.sh` | 盯什么 |
| --- | --- |
| 三边核对的输入 | 加上了 `ios/Capabilities/` 下的 part 和 `.mm`，和核心的拼在一起看 |
| 第 10 节 | 能力包挂的属性（`Object.defineProperty(X.prototype, '名字'`）和类型里的声明合并（`interface X { 名字 }`）要对得上 |

第 10 节是为这次新出现的 API 面加的：挂上去的属性不在任何 class 体里，前面按 class 核对的那几节**全都看不见它**。三种弄坏法都验过——类型里去掉声明、part 里改属性名、类型里多声明一个没人挂的。

## 验证

| | 结果 |
| --- | --- |
| 两个 target 单独编译 | 一次编过——Keychain 只靠 `NacreExtension.h` 就够 |
| 核心二进制里的 Keychain 符号 | **0**（Debug 的产物和 Release 的 xcframework 都量过） |
| 能力包从核心拿的符号 | 2 个类、6 个函数，正好是 `NacreExtension.h` 里的那些 |
| 模拟器 Debug | 1749 条通过，和拆之前的断言集合**一字不差** |
| 模拟器 Release | 1752 条通过，多的 3 条是这一步新加的（盯 `application.keychain` 的描述符） |
| 真机（iPhone 14）Release | 1739 条通过，两个 framework 都嵌在 App 里 |
| `examples/hello` + 两个预编译的 xcframework | 跑起来，`25 parts + 1 from NacreKeychain` |

做成包之后（验收装了这个包，示例不装）：

| | 结果 |
| --- | --- |
| 模拟器 Debug | 1752 条通过，和 Release **一字不差** |
| 模拟器 Release | 1752 条通过，和做成包之前的 Release **一字不差** |
| 真机（iPhone 14）Release | 1738 条通过，App 里嵌着两个 framework |
| `examples/hello`（不装） | 跑起来，`25 parts`，App 里只嵌 `Nacre.framework` |
| 探针：不装 / 装上 | 见上面「装了才有」那张表 |

模拟器 Debug 第一遍只跑出 1731 条：少的 21 条是帧回调、动画事件、键盘和 first responder 那一类，验收自己打了四条「8 秒内没等到第一帧，这一组未验证」——它是整轮验证的第一步，模拟器的屏幕那时还没在刷新。重跑得到 1752。**「看着像环境问题」不算数，要重跑一遍拿到数。**

各处验收都只剩那 2 条原有的图片下载网络失败。Keychain 自己的断言全过，包括跨进程那条（`Keychain 记到的启动次数`，上一次存的还在）。

体积：`Nacre.xcframework` 26 MB，`NacreKeychain.xcframework` 172 KB（Release，各两个切片）。

## 工程配置：包提要求，项目写内容

（2026-11-16 定并实现。起因是一份客户反馈：面容 ID、相机、相册、定位这些都该是包，而它们每一个都要往工程里写东西。）

需要权限的能力都要在 Info.plist 里有一句给用户看的话，有的还要 entitlement。在这之前 CLI 没有这个口子：`nacre.config.json` 只认名字和包名，Info.plist 由模板写死，entitlement 连文件都没有。钥匙串能先做成包，是因为它什么都不用写。

### 分工

| 谁 | 写什么 | 写在哪 |
| --- | --- | --- |
| 能力包 | 它**要哪些键**：`requires.infoPlist`、`requires.entitlements`，都是键名的数组 | 包的 `nacre-ios.json` |
| 项目 | 这些键的**内容** | `nacre.config.json` 的 `ios.infoPlist`、`ios.entitlements` |
| CLI | 核对项目写了没有；写进生成的工程 | — |

包不带内容，是因为权限文案是一句给最终用户看的话：为什么这个 App 要用相机，只有写这个 App 的人知道，而且要按 App 支持的语言各写一句。

**没写就在生成时停下**，报错点名是哪个包要哪个键。缺权限文案的 App 编译和运行都正常，要到用户第一次用那个功能时崩溃，或者上传 App Store 时被拒（ITMS-90683）。把这个错从「上传才知道」提到了「生成就知道」。几个包同时缺时一次全报出来。

### 语言是一起定的

权限文案要支持多语言，这是用户提的要求。做的时候发现它带出一件更大的事，探针量的（模拟器，iPhone Air，iOS 27.2，用启动参数指定 App 的语言）：

| 工程里声明的语言 | 手机语言 | 系统给的报错文字 |
| --- | --- | --- |
| 没有 | 简体中文 | 英文 |
| 没有 | 日文 | 英文 |
| 英文、简体中文 | 简体中文 | 中文 |
| 英文、简体中文 | 日文 | 英文（退回第一个） |

**不声明语言的 App，系统给的文字一律是英文，不跟手机的语言走。** 在这之前 CLI 生成的工程都是这个状态。所以 `ios.languages` 独立成一项，和有没有权限文案无关。

`Intl` 的默认地区不受影响：四种情况下它都跟着手机的语言。它用的是系统的首选语言列表，不是 App 选中的那一种本地化。

落到工程上：每种语言一个 `<语言>.lproj/InfoPlist.strings`，里面是这种语言的 App 名和权限文案；Info.plist 里放默认语言的那一句。几条实现上的事：

- **每种语言的文件里都写一份 App 的名字**，哪怕各语言的名字相同。本地化目录是空的话就不会被生成，系统也就不认这种语言。
- **只有一句的文案不往各语言的文件里写**，系统找不到时用 Info.plist 里的。
- 某种语言缺一句：不写进那种语言的文件，系统退回 Info.plist 里的默认语言。生成时提示一行。
- XcodeGen 会自己把 `App/` 下面的 `.lproj` 目录认成本地化资源，工程描述里只多了 `developmentLanguage` 和 `CFBundleLocalizations` 两处。
- `App/` 每次生成都是重铺的，去掉一种语言之后它的目录不会留下。

### 「按语言写的文案」和「字典」怎么分

`ios.infoPlist` 的值可以是任何 Info.plist 认的类型，其中对象有两种意思：按语言写的文案（`{ "en": "…", "zh-Hans": "…" }`），或者一个普通的字典（`NSAppTransportSecurity`）。判据是：值全是字符串，而且至少有一个键是声明过的语言。

由此定了三种报错：对象里夹着没声明的语言（多半是把 `zh-Hans` 写成了 `zh-CN`）；默认语言的那一句没写；长得像按语言写的、却没有声明 `ios.languages`。最后一种不拦的话，它会被当成一个字典悄悄写进 Info.plist，系统读不出文案。

### 和原来设想的不一样的地方

`project.md` 里原来记的建议是三个口子，实际做了两个半：

- **`ios.frameworks` 没做。** 能力包是各自独立的 framework，它用到的系统框架记在它自己的二进制里，App 不用再声明。
- **「包先、用户最后，数组取并集」的合并没做。** 包现在不带内容，只提要求，没有东西要合并。包自带固定的值（推送要的后台模式）等第一个真需要的能力再定，那时才知道合并规则该是什么样。
- **`name` 不能按语言写，按语言写的是 `displayName`。** `name` 是工程和产物的名字，编译脚本靠它找产物；图标下面显示的名字本来就有 `displayName` 这一项。

六个键不让写在 `ios.infoPlist` 里（包名、显示名、版本号、构建号、自定义协议、场景配置），它们各有专门的配置项，两处都能写就会打架。自定义协议那一项（`CFBundleURLTypes`，改用 `ios.urlSchemes`）是做 `openurl` 时加的，见[被链接打开](open-url.md#协议怎么声明)。

### 验证

- CLI 的用例 38 条（`packages/cli/test/generate.test.js`），先写的用例，没有实现时 36 条不过。能力包的要求是用临时目录里的假包测的，第一个真的包来了再走一遍。
- 用探针项目真的生成、编译、装进模拟器：包里有两个本地化目录，Info.plist 和各语言的文件内容对；entitlement 文件生成了，模拟器的可执行文件里带着写的值。
- **没验证的**：真机上带 entitlement 的签名（通配的描述文件签不了推送和关联域名）；权限提示框和桌面图标名在屏幕上的样子。

### App 图标：约定的文件名

（2026-11-18 定并实现。在这之前图标是模板里写死的三张图，所有生成的 App 都带着它。）

定下来的形状：

- 图标**不写进 `nacre.config.json`**，用约定的文件名，放在项目根目录，和 `nacre.config.json` 并排。
- 认两种，二选一：`icon.png`（一张 1024×1024 的图）、`icon.icon`（Icon Composer 的图标文件，Xcode 26 起的格式，浅色、深色、着色几种外观都在这一个文件里）。两个都有用 `icon.icon`，不报错。
- 不做「每种外观一张 PNG」那一档，不认 `icon-dark.png`、`icon-tinted.png`。要分外观就用 `icon.icon`。
- **没放：不报错、不提示，也没有默认图标。** 模板里那三张图拿掉了，主图挪去当 `examples/hello/` 的 `icon.png`。
- 不放在 `assets/` 里：那个目录会整个拷进 App 包给 JS 用。
- 调试包单独的图标、运行时切换的备用图标，这一次不做。

落到工程上，两种文件进了生成的工程都叫 `AppIcon`，编译设置 `ASSETCATALOG_COMPILER_APPICON_NAME` 只指这一个名字：

| 项目里放的 | 生成的工程里 | 图标名的设置 |
| --- | --- | --- |
| `icon.icon` | `App/AppIcon.icon`（整个目录拷过去） | `"AppIcon"` |
| `icon.png` | `App/Assets.xcassets/AppIcon.appiconset/`：这张图加一份只有一项的 `Contents.json` | `"AppIcon"` |
| 没放 | 没有资源目录，没有 `.icon` | `""` |

下面的事实都是用不带运行时的探针工程量的（Xcode 27.2，XcodeGen 2.46.0，模拟器 iPhone Air，iOS 27.2）。

**不带图标能编译、能运行，桌面上是系统的占位图标**（白底灰色网格）。但图标名不能留着不管：

| 工程里的资源目录 | 图标名的设置 | 结果 |
| --- | --- | --- |
| 没有 | 不写 | 编过。Info.plist 里没有图标的键 |
| 空的 `Assets.xcassets` | 不写 | **编译失败**：`None of the input catalogs contained a matching stickers icon set, app icon set, or icon stack named "AppIcon".` |
| 空的 `Assets.xcassets` | `""` | 编过 |

第二行是因为 **XcodeGen 给 App target 默认加 `ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon`**，工程描述里不写也有。没有资源目录时资源编译器不跑，这个名字指着什么都无所谓；只要有资源目录，它就必须是空串或者真的存在。所以不带图标时明确写成 `""`，模板里也不留空的资源目录——少一种状态。

**`.icon` 不用任何特殊办法。** XcodeGen 把 `App/` 下的 `.icon` 认成 `wrapper.icon`，放进资源阶段；Xcode 把它编进 App 的 `Assets.car`，另外生成两张给旧系统用的后备 PNG。要配的只有图标名等于文件名去掉扩展名。文件叫 `icon.icon`、放在 `App/` 外面在 `sources` 里单列一行，这两种也都编得过；拷的时候改名成 `AppIcon.icon` 只是为了让两种文件用同一个图标名。`assetutil --info` 看编出来的 `Assets.car`：`.icon` 的有浅色、深色、着色三套，单张 PNG 的只有一张图。

这台机器上没有现成的 `.icon`，探针用的是手写的：`icon.json`（`fill`、`groups[].layers[]`、`supported-platforms`）加 `Assets/` 里一张透明底的图层图。Icon Composer 自带的 `ictool`（在它的 App 包里）只会把 `.icon` 渲染成 PNG，不能从 PNG 造 `.icon`；`xcrun --find ictool` 找到的是资源编译器的另一个名字，不是它。

**「没放」不报错，「放了但不能用」在生成时报。** 后一种不拦的话：

| 文件的问题 | 编译时 |
| --- | --- |
| `icon.png` 不是 1024×1024（量了 512×512、1000×1000、2048×2048、1024×512） | 失败。错误那一行是 `The stickers icon set, app icon set, or icon stack named "AppIcon" did not have any applicable content.`，看不出原因；原因在另一条**警告**里（`icon.png is 512x512 but should be 1024x1024`），指的还是生成的工程里的路径 |
| `.icon` 是一个普通文件 | **通过，没有图标，什么都不报** |
| `.icon` 里没有 `icon.json`、`icon.json` 不是 JSON、引用的图层图片不在 | 失败，`Failed to create a catalog from the Icon Studio document: <路径>`，点得出是哪个文件 |

所以 CLI 查四样：`icon.png` 是文件、开头是 PNG 的签名、宽高是 1024×1024（都从文件头的 24 个字节读）；`icon.icon` 是目录、里面有 `icon.json`。`.icon` 里面的内容不查，编译报得清楚。只查用上的那一个：两个都在时 `icon.png` 有问题不报。带 alpha 通道的 1024×1024 编得过，不拦。

**文件名逐字比对，不能问「在不在」。** macOS 的文件系统默认不分大小写，`fs.existsSync('icon.png')` 对 `Icon.png` 也答在。CLI 列出项目目录里实际的名字来比。大小写不对的当作没放，按「没放不提示」处理，所以它是静默的——这是形状带来的代价，文档里用提示块写了。

**深色模式下的样子没量到。** `xcrun simctl ui <设备> appearance dark` 之后桌面上所有图标（包括系统自己的）都没变：桌面图标的样式是桌面自己的一项设置，不跟系统的深浅色走，命令行切不了。量到的只有编译产物里有哪几套（上面那一条）。

验证：

- CLI 的用例 37 条（`packages/cli/test/icon.test.js`），先写的，没有实现时全部不过。
- 三个项目真的生成（引预编译的运行时）、编译、装进模拟器：`examples/hello`（`icon.png`）桌面上是那张图；带 `icon.icon` 的是那个图标；不带的是占位图标，App 能启动。
- **没验证的**：Icon Composer 实际存出来的 `.icon`（只验了手写的）；桌面切到深色、着色、透明样式时两种图标的样子；透明的 PNG 在桌面上的样子和上传 App Store 时会不会被拒；真机上的 `icon.icon`；比 2.46.0 旧的 XcodeGen 认不认 `.icon`。
- 真机（iPhone 14，2026-11-18）：带 `icon.png` 的项目用预编译的运行时生成、打 Release 包装上去，桌面上是那张图。

### 启动屏：一个底色加一张图

（2026-11-18 定并实现。在这之前启动屏是 Info.plist 里一个空的 `UILaunchScreen` 字典，空白，不能配置。）

定下来的形状：

- 一个底色，加一张居中的图，两样各自可有可无。
- 底色：`nacre.config.json` **最外层**的 `launchScreen`。一个色值（`"#0A84FF"`），或者按深浅色分的 `{ "light": …, "dark": … }`。
- 图：项目根目录的 `launch.png`，透明底，按 3 倍图算（360×360 像素显示成 120×120 pt），深浅色用同一张。图多大就显示多大，不照 Android 那套固定大小的规矩。
- 都没给和以前一样（空的 `UILaunchScreen`）。「没给」不报错、不提示。
- `launchScreen` 认不出来的当没写，也不报错、不提示；`launch.png` 不能用的在生成时报。见下面「`launchScreen` 写错了不拦」。
- 出口：项目根目录的 `launch.storyboard`。有它就整个用它，`launch.png` 和 `launchScreen` 不看，不报错（和 `icon.icon` 优先于 `icon.png` 一个道理）。
- 这一次不做：`launch-dark.png`、控制启动屏何时消失的接口。
- 讨论里否掉的：把底色画进图里、生成器从图的角上读颜色（绕了一圈，大家手上的本来就是色值）；让用户写 HTML（启动屏在代码运行之前由系统画，只能是静态声明）；自己定一套描述启动屏的 XML。图标的名字不用 `favicon`：它在 Web 上指浏览器标签页的小图标，含义不同。

**`launchScreen` 写错了不拦**（2026-11-18 改的；原来每一种写错都在生成时报错）。理由是写错的结果在屏幕上看得到，不值得为它拦住生成。规则只有一条：认得出的是一个 `#RGB` / `#RRGGBB` 的色值，或者 `light` 和 `dark` 两项都是这种色值的对象（多出来的键不看）；其余的——颜色名、带透明度的、不是字符串、少一项、写在 `ios` 下面——一律当没写，底色是系统默认的。有 `launch.storyboard` 时根本不读它。

「当没写」是 CLI 自己判的，不能把认不出来的值原样交给 Xcode。实测（`actool`，Xcode 27）：颜色集里的分量写成 `0xNaN` 或者 `red`，编译不报错也不警告，编出来是**纯白**；写 `0x1FF` 编出来是另一个颜色；带透明度的原样编进去。也就是说交给 Xcode 的话，写错的人得到的是一个和深浅色无关的白底，比系统默认的底色更难看出是哪里错了。

仍然在生成时报的两处，都不是看得出来的那一类：`ios.infoPlist` 里写 `UILaunchScreen` 或 `UILaunchStoryboardName`（生成的工程描述里同一个键会出现两次，和 `bundleId`、`version` 那几个键在同一张表里拦）；`launch.png` 超过 400 万像素（整屏变黑，光看黑屏猜不到是图太大）。

落到工程上：

| 项目里给的 | 生成的工程里 | Info.plist |
| --- | --- | --- |
| `launch.storyboard` | `App/LaunchScreen.storyboard`（原样拷） | `UILaunchStoryboardName: LaunchScreen` |
| 底色或 `launch.png`（至少一样） | `App/LaunchScreen.storyboard`（生成的）；底色是资源目录里的颜色集 `LaunchBackground`，图是只有 3x 一项的图片集 `LaunchLogo` | 同上 |
| 都没给 | 什么都不多 | `UILaunchScreen: {}` |

`UILaunchScreen` 和 `UILaunchStoryboardName` 加进了不让写在 `ios.infoPlist` 里的键。

下面的事实是探针量的（Xcode 27.2，模拟器 iPhone Air，iOS 27.2，屏幕 420×912 pt、3 倍）。探针在启动回调里睡几秒，启动屏停住了再截图。

**为什么生成 storyboard，不用 `UILaunchScreen` 字典。** 字典（`UIImageName` 加 `UIColorName`）做得到底色按深浅色取、图居中按原尺寸画，但它**不缩放**：

| 包里的图 | 字典画出来 |
| --- | --- |
| 120×120 px，或者 `@3x` 的 360×360 px | 120×120 pt，正中 |
| 3000×3000 px | 只看得见中间 420×912 pt，四周裁掉 |
| 1200×300 px | 高 300 pt 全在，左右裁掉 |
| 300×1500 px | 宽 300 pt 全在，上下裁掉 |

`UIImageRespectsSafeAreaInsets` 只是把居中改成在安全区里居中（小图下移 17 pt），大图照样裁。所以「图比屏幕大时等比缩到放得下」字典做不到，storyboard 做得到，两条路在这一点上结果不同，就只留 storyboard 这一条。

**生成的 storyboard 长什么样。** 一个页面，底色，一个 `scaleAspectFit` 的图片视图加四条约束：横竖居中，宽高都不超过屏幕。图自己的大小是优先级低一档的要求，放得下就按它；放不下时「不超过」先满足，再由等比缩放在框里缩小。量到的：

| `launch.png`（3 倍） | 屏幕上 |
| --- | --- |
| 360×360 px（120 pt） | 120×120 pt，正中，不放大 |
| 3600×900 px（1200×300 pt） | 420×105 pt |
| 900×4500 px（300×1500 pt） | 182×912 pt |
| 2400×2400 px（800 pt） | 420×420 pt |
| 1500×3000 px（500×1000 pt） | 420×840 pt |

底色不能在 storyboard 里写死：写死的颜色不跟深浅色变。所以底色做成资源目录里的颜色集，storyboard 按名字引用；只有一个色值时颜色集里只有一项，两种写法走同一条路。没给底色时用 `systemBackgroundColor`，浅色白、深色黑，和空白的启动屏一样。storyboard 里对象的 id 用的是可读的名字（`launch`、`root`、`logo`），编译器认。

**图太大时整个启动屏是黑的。** 不报错，编译也过，系统就是不画：

| `launch.png` | 像素数 | 结果 |
| --- | --- | --- |
| 2000×2000 | 400 万 | 正常 |
| 900×4500 | 405 万 | 正常 |
| 1500×3000 | 450 万 | 正常 |
| 2400×2400 | 576 万 | 正常 |
| 2600×2600 | 676 万 | **黑屏** |
| 1300×5200 | 676 万 | **黑屏** |
| 2700×2700、3000×3000 | 729 万、900 万 | **黑屏** |

只看像素数，和长宽无关。界限在 576 万和 676 万之间，没有再往细里找。CLI 把上限定在 400 万像素，超了在生成时报错——这是「悄悄显示成别的样子」那一类。这个界限只在一台模拟器上量过，换屏幕小的机型是不是同一个数不知道。

**用户的 storyboard 引用得到哪里的图。** 原来以为系统按名字找图只找包的根和资源目录，而 `assets/` 是拷到包里 `JS/assets/` 下面的，引用不到。量出来都引用得到：

| storyboard 里写的图名 | 图在包里的位置 | 结果 |
| --- | --- | --- |
| `catlogo` | 资源目录里的图片集 | 显示 |
| `rootlogo`、`rootlogo.png` | 包的根 | 显示 |
| `JS/assets/logo`、`JS/assets/logo.png` | 子目录 `JS/assets/logo.png` | 显示 |
| `JS/assets/logo3` | 子目录 `JS/assets/logo3@3x.png` | 显示，按 3 倍算 |
| 一个不存在的名字 | — | 不报错，那个位置空着 |

所以规矩定成最简单的一条：**有 `launch.storyboard` 时别的都不管，它要的图放在 `assets/` 里，用 `JS/assets/名字` 引用**——和 JS 里 `UIImage.imageNamed('JS/assets/名字')` 是同一个写法，没有新的目录约定。`launch.png` 这时不进工程，也不查。`launchScreen` 的语法照样查：它是配置文件里的一个错，和用不用得上无关。用户的 storyboard 里用不了自己定的动态色（项目没有地方放颜色集）；要不要把 `launchScreen` 的颜色集留给它引用，没定，现在不留。

写坏的 storyboard 编译时都报得出是哪个文件：不是 XML 是 `Interface Builder can’t determine the type of “LaunchScreen.storyboard”`；用了自定义类是 `Launch screens may not set custom classnames`。CLI 只查它不是目录。

**启动屏什么时候消失。** 两次量到的是同一件事：

- App 一直不建窗口：启动屏在启动后约 2 秒消失（0.8–1.9 秒还在，2.1 秒起全黑），之后一直是黑屏，量到 60 秒；进程活着，场景也连上了。
- 真的 Nacre App，`main.js` 开头忙等 7 秒再建窗口：启动屏同样在一两秒后消失，黑屏到第 7 秒窗口出现。运行时是在启动回调返回之后才执行 `main.js` 的（排成一个任务），所以 JS 忙着的时候系统已经认为 App 启动完了。

也就是说**启动屏留不到「JS 把界面准备好」**，JS 慢的代价是黑屏而不是启动屏多停一会儿。定了不动运行时（2026-11-18）：原生 App 也是在启动回调里先把窗口建好、慢的东西之后再加载，文档里写的「`main.js` 一开始就建窗口」是同一个做法。要让启动屏在 JS 慢的时候多停一会儿，得让 `main.js` 和 `sceneconnect` 都在启动回调返回之前同步跑完，那是改启动顺序的事，等真有 App 撞上再说。

量的时候踩的一个坑：想用「JS 忙等」把启动屏留住来截图，截到的是黑屏，一度以为是启动屏坏了。最后的验证是在 CLI 生成的工程里给启动壳临时加一句睡眠，别的都是原样的输出。

验证：

- CLI 的用例 58 条（`packages/cli/test/launch.test.js`），先写的。没有实现时 46 条不过；另外 12 条是「和以前一样」那一类（不认的文件名、都没给），实现之前本来就成立，实现之后把逐字比对换成「在不在」确认了其中查大小写的那几条会挂。
- 七个项目用 CLI 生成（引预编译的运行时）、编译、装进模拟器，浅色和深色各截一遍：只有色值、色值按深浅色分、只有图、两样都有、都没有、1800×1800 的大图、自己的 `launch.storyboard`（引用 `JS/assets/` 里的图，同时放着 `launch.png` 和 `launchScreen`）。十四张都对。
- 真机（iPhone 14，3 倍屏，2026-11-18）：一个项目，底色按深浅色分（`#0A84FF` / `#101826`）加一张 360×360 的 `launch.png`。浅色是蓝底，深色是深蓝底，图都在正中、没有变形。启动屏一闪就过看不清，是在生成的工程里给启动壳加了 6 秒睡眠看的。
- **没验证的**：2 倍屏的机型（图片集里只有 3x 一项，系统应该自己缩，没量）；屏幕更小或更大的机型上大图的界限；真机上只有图、只有底色、自己的 `launch.storyboard` 这几种；Xcode 里新建存出来的 storyboard（只验了手写的）；系统缓存启动屏这件事（每次都是删掉重装的）；iOS 26。

## 还没做的

| | 现在怎么样 |
| --- | --- |
| 包自带固定的工程配置 | 包现在只能声明「要项目写哪些键」（见[工程配置](#工程配置包提要求项目写内容)）。包自己带一个固定的值（推送要的后台模式那一类）还没有口子，等第一个真需要它的能力 |
| 发布 | 包都标着 `private`，xcframework 也还没进包 |
| `ctx` 的契约 | 能力包依赖核心放进 `ctx` 的名字，没有机械检查，靠验收兜着 |
| 隐私清单按包核对 | `check-api.sh` 第 8 节只扫核心的二进制。Keychain 不碰 required reason API，所以现在没漏；带隐私类别的那两个能力（文件读写、本地存储）定了留在核心，所以暂时也不会漏。哪天有能力包自己碰到 required reason API，这一节要改成每个包各核各的 |
| 能力之间的依赖 | 没考虑。现在按包名排序执行，默认它们互不依赖 |

---

← 返回[实现原理](README.md) ・ [项目说明](../project.md)

---

（下面这一段是 2026-11-17 从 `project.md` 搬过来的：那份文件不再放实现原理。）

## 为什么要拆：起因

（2026-11-14 定。起因是一个具体的问题：Face ID 这种能力要不要我们提供？它要求 App 的 Info.plist 里有 `NSFaceIDUsageDescription`，而不是每个 App 都用得到。）

### 为什么不能把所有能力混在一个包里

Apple 上传时的自动检查（ITMS-90683）扫的是**二进制里的符号**，不是源码。它的错误文案原话：

> If you're using external libraries or SDKs, they may reference APIs that require a purpose string. **While your app might not use these APIs, a purpose string is still required.**

所以只要 `Nacre.framework` 链接了 `LocalAuthentication`，**每一个**用 Nacre 的 App 都得写那句给用户看的话，哪怕它根本没有登录功能。这等于我们替用户做了选择。

（隐私清单**不是**同一个道理，这一点一开始想错了：那几条声明写在我们自己 framework 的清单里，用户的工程里什么都不用写。见下面的判据。）

## WebView 为什么留在核心

**WebView 为什么留核心**（2026-11-15 量过之后定的）：它不需要用户声明任何东西；拆了之后不用网页的 App 省约 1 ms、用网页的 App 多花约 0.5–1 ms，净收益约等于零；而代价是一个要维护的包、一套要撑大的注册接口、一次解开核心事件入口的重构。起网页进程的开销只在真的创建 `WebView` 时才有，拆不拆都一样。

## 声明的单位是包，不是能力清单

`npm i @nacrejs/local-authentication` 本身就是声明。不另设一份 `"capabilities": ["faceID"]`——那样「装了但忘了写」这个状态会存在，编译过、上传才被拒。包作单位时这个状态根本不存在：没装就没有那个类，类型检查当场报。

**不做代码推断**（扫 JS 看用没用 `LAContext`）：JS 是动态的，`globalThis['LA' + 'Context']` 抓不到；而且 usage description 的文案推断不出来，那是一句给用户看的话，只能开发者自己写。Expo 也是声明式的。

## 拆的顺序：三刀

拿 Keychain 先走通。它是最干净的一个——251 行原生、65 行 JS、没有任何别的能力依赖它。

| | 做什么 | 状态 |
| --- | --- | --- |
| 1 | 内置脚本 part 化（见[下面那一节](runtime.md#nacrejs-怎么拆已拆2026-11-14)） | 已做 |
| 2 | 原生侧的注册点：核心不再认识 Keychain 的名字 | 已做 |
| 3 | Keychain 真的挪成第二个 framework target，带自己的 part | 已做 |
| 4 | 做成包：按项目装了哪些包来接入，类型也跟着拆出去 | 已做 |

**Keychain 拆出去并不会让核心少链一个框架**：`Security.framework` 被 `crypto.getRandomValues` 占着（`SecRandomCopyBytes`），而 crypto 留核心。所以拆 Keychain 是练机制，不是拿收益。（当时接着写的是「真正能让核心变小的是 WebView」——后来量了，核心少链一个 WebKit 只省约 1 ms，WebView 留核心。）

## 注册机制（第 2 刀）

核心原来在六个地方写死了 Keychain（全是 grep 出来的）。第 2 刀处理原生那三处：

| 原来 | 现在 |
| --- | --- |
| `NacreRuntime.mm`：`if (KeychainCallAsync(…)) return;` | `NacreDispatchAsyncMethod(…)` 挨个问注册进来的 |
| `NacrePropsResource.mm`：`KeychainClassObject(className, name)` | `NacreDispatchClassObject(…)` |
| `NacreBridge.h` 的接口和 typedef、`NacreEnumsScene.mm` 的枚举表 | 全部搬进 `NacreKeychain.mm` |

能力在自己文件末尾用一个 `+load` 登记：

```objc
@implementation NacreKeychainRegistration
+ (void)load {
  nacre_bridge::NacreRegisterAsyncMethodHandler(nacre_bridge::KeychainCallAsync);
  nacre_bridge::NacreRegisterClassObjectHandler(nacre_bridge::KeychainClassObject);
}
@end
```

定下来的几条：

- **用 `+load`，不让宿主调**。framework 被 embed 就一定会走到，宿主不用写任何代码——「启动壳要设计成不需要被改的」是 3.7 节定过的。
- **注册表用函数内的静态局部变量，不用文件级的全局对象**。`+load` 比全局对象的构造早，用全局对象会撞上静态初始化顺序问题：注册进了一个还没构造的 `vector`，构造时又被清空，而且一声不吭。
- **顺序自由**。注册顺序由链接顺序决定、不确定，但各能力域认的类互不重叠。和属性分发表拆开时的结论一样。
- **枚举没有「注册」一说**。`NACRE_ENUM_MAP` 直接定义出那三个函数，同一个文件里定义在前、用在后就够了，连 `NACRE_ENUM_DECL` 都不用写。
- ~~**注册表只给拆出去的能力用。**~~ **2026-11-15 改了：新接的类一律走登记。** 当时的理由是核心认识自己的域没有问题，改成注册只是多一层间接。这在一个人顺序做的时候成立；要几个对话同时接类，写死的 if 链就成了每一步都要改的共享文件。现在登记的单位是「域」（`NacreRegisterDomain`，一张表装它在所有通道上的处理函数），分发器先问登记进来的域、再走原来的 if 链。旧的域留在 if 链里，碰到哪个再迁。见[接入一组类](adding-classes.md)。

JS 那一侧的第五处（`application.keychain` 写在 `Application` 的类体里）留给了第 3 刀。

## 拆成第二个 framework（第 3 刀）

```
ios/Capabilities/Keychain/
├─ NacreKeychain.mm              原生那一半
└─ Builtin/parts/keychain.js     JS 那一半：Keychain 类，和 application.keychain
```

它是工程里的第二个 target `NacreKeychain`，只**链接**核心、不嵌它；两个 framework 都由宿主 App 嵌进去。搭法和实测见[能力包](capabilities.md)，这里只记定下来的几条：

- **给能力包单独划一个头**（`Runtime/NacreExtension.h`）。能力不能再 `#import` 核心的内部头——那里面是核心自己的分发表、几百个声明。划出来的是 Keychain 实际用到的那一组，一共 8 个符号加一个宏。它的可见性是 private：进 `PrivateHeaders`，不进 umbrella header。**这个头就是宿主扩展点的雏形**——第三方原生 SDK 要接进来，用的是同一套。
- **能力自己带 JS**，放在它自己包里的 `Builtin/parts/`，用第三种注册 `NacreRegisterBuiltinParts` 登记。运行时**先跑核心的 part、再跑能力包的**，用同一个 `ctx`。
- **`application.keychain` 由能力包自己挂**：`Object.defineProperty(Application.prototype, 'keychain', …)`。装了才有；没装的时候 `'keychain' in application` 是 `false`，而不是一个读了才抛的占位——那样类型是绿的、运行时才炸。类型那一侧用声明合并（`interface Application { readonly keychain: Keychain }`），和 Keychain 类写在一起。
- **`ctx` 因此成了核心给能力包的接口。** 它里面有什么，原来只是「哪些名字被别的 part 用到了」的结果；现在能力包依赖它。这一条**还没有机械检查**，靠验收兜着。
- **核心的 part 编号留了一个空**（19 之后是 21）。20 原来是 Keychain。不重新编号：顺序只看文件名的先后，而改名会让一串文档和提交记录里的名字对不上。
