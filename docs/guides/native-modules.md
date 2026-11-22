# 写自己的原生模块

App 里有些能力只能用原生代码做：公司自己写的原生库，或者只提供 iOS SDK 的第三方服务（风控、崩溃收集、支付）。把这样的代码包成一个**原生模块**，JS 就能调它。

一个原生模块是一个名字，下面有三样东西：

| | 原生这边 | JS 那边 |
| --- | --- | --- |
| 同步方法 | 一个处理函数，返回一个值 | `module.call('方法名', ...参数)`，当场拿到返回值 |
| 异步方法 | 一个处理函数，做完调 `resolve` 或 `reject` | `module.callAsync('方法名', ...参数)`，是一个 Promise |
| 事件 | `emitEvent:detail:` | `module.addEventListener('事件名', 回调)` |

这一页按步骤做一个模块，名字叫 `risk`，包着一个假想的第三方 SDK（`RiskSDK`）。做完之后它是一个 npm 包，别的 Nacre 项目装上就能用。JS 那一侧的完整说明见 [API 文档](../api/native-modules.md)。

仓库里有一个能直接看的例子：`ios/Capabilities/ExampleModule/`（Swift）和 `packages/example-module/`（包）。

## 一个模块的包里有什么

```
risk/                            → 一个 npm 包
├─ package.json
├─ nacre-ios.json                清单：告诉 Nacre 这个包带着原生代码
├─ index.js                      包自己的 JS：把模块的方法包成函数
├─ index.d.ts                    类型
├─ RiskModule.xcframework/       你的原生代码，预编译好的
└─ vendor/RiskSDK.xcframework/   第三方的 SDK（有的话）
```

使用这个包的项目执行 `npm install`，再重新生成一次 `ios/`，这两个 framework 就被嵌进 App。项目里不需要写任何原生代码，也不需要手改工程。

## 1. 建一个 framework 工程

在 Xcode 里新建一个工程，模板选 iOS 的 **Framework**，语言选 ObjC 或 Swift。下面假设它叫 `RiskModule`。

把 `Nacre.xcframework` 加进这个 target 的「Frameworks and Libraries」，嵌入方式选 **Do Not Embed**。`Nacre.xcframework` 在 `@nacrejs/ios` 这个包里。选「不嵌入」是因为运行时由 App 嵌入，模块只需要在编译时找到它的头文件。

第三方的 SDK 也加进同一个地方：

- SDK 是动态的 framework：同样选 **Do Not Embed**，之后随包带上（见[第 6 步](#6-带上第三方的-sdk)）。
- SDK 是静态库（`.a`，或者静态的 framework）：正常链接。它的代码会被编进 `RiskModule` 里，包里不用再带它。

最低系统版本设成 iOS 26.0，和运行时一致。

## 2. 写模块

模块的代码只用到一个头文件，`#import <Nacre/Nacre.h>`（Swift 是 `import Nacre`）。里面有两样东西：`NacreModule` 类，和 Swift 登记用的 `NacreModuleProvider` 协议。

### ObjC

```objc
// RiskModule.m
#import <Nacre/Nacre.h>
#import <RiskSDK/RiskSDK.h>

@interface RiskModuleLoader : NSObject
@end

@implementation RiskModuleLoader

// framework 被加载时系统调这个方法。App 嵌了这个 framework 就会走到，
// 不需要 App 写任何代码
+ (void)load {
  NacreModule *module = [[NacreModule alloc] initWithName:@"risk"];

  // 同步方法：当场返回一个值
  [module addMethod:@"sdkVersion" handler:^id _Nullable(NSArray *arguments) {
    return [RiskSDK version];
  }];

  // 同步方法：参数不对时返回一个错误，JS 那边 call() 会把它抛出来
  [module addMethod:@"setUserId" handler:^id _Nullable(NSArray *arguments) {
    id userId = arguments.firstObject;
    if (![userId isKindOfClass:NSString.class]) {
      return [NacreModule errorWithName:@"TypeError" message:@"setUserId needs a string"];
    }
    [RiskSDK setUserId:userId];
    return nil;
  }];

  // 异步方法：SDK 做完之后调 resolve 或 reject
  [module addAsyncMethod:@"collect"
                 handler:^(NSArray *arguments, NacreModuleResolve resolve,
                           NacreModuleReject reject) {
    id scene = arguments.firstObject;
    if (![scene isKindOfClass:NSString.class]) {
      reject([NacreModule errorWithName:@"TypeError" message:@"collect needs a scene name"]);
      return;
    }
    [RiskSDK collectForScene:scene completion:^(NSString *token, NSError *error) {
      if (error != nil) {
        reject(error);               // SDK 给的 NSError 可以原样交出去
      } else {
        resolve(@{@"token": token});
      }
    }];
  }];

  // 事件：先声明名字。JS 调了 watch 之后，SDK 每次回调就发一个事件
  [module addEvent:@"levelchange"];
  __weak NacreModule *weakModule = module;   // 处理函数由模块持有，这里不反过来持有模块
  [module addMethod:@"watch" handler:^id _Nullable(NSArray *arguments) {
    [RiskSDK setLevelHandler:^(NSInteger level) {
      [weakModule emitEvent:@"levelchange" detail:@{@"level": @(level)}];
    }];
    return nil;
  }];

  [NacreModule registerModule:module];
}

@end
```

### Swift

Swift 没有「被加载时自动执行」的方法，所以登记的写法不一样：写一个遵守 `NacreModuleProvider` 的类，在 `nacreModules()` 里把模块建好交出去。这个类怎么被找到，见[第 3 步](#3-登记)。

```swift
// RiskModule.swift
import Foundation
import Nacre
import RiskSDK

// @objc(…) 里的名字是第 3 步要填的名字
@objc(RiskModuleProvider)
final class RiskModuleProvider: NSObject, NacreModuleProvider {
  static func nacreModules() -> [NacreModule] {
    let module = NacreModule(name: "risk")

    // 同步方法：当场返回一个值
    module.addMethod("sdkVersion") { _ in
      RiskSDK.version()
    }

    // 同步方法：参数不对时返回一个错误，JS 那边 call() 会把它抛出来
    module.addMethod("setUserId") { arguments in
      guard let userId = arguments.first as? String else {
        return NacreModule.error(name: "TypeError", message: "setUserId needs a string")
      }
      RiskSDK.setUserId(userId)
      return nil
    }

    // 异步方法：SDK 做完之后调 resolve 或 reject
    module.addAsyncMethod("collect") { arguments, resolve, reject in
      guard let scene = arguments.first as? String else {
        reject(NacreModule.error(name: "TypeError", message: "collect needs a scene name"))
        return
      }
      RiskSDK.collect(forScene: scene) { token, error in
        if let error = error {
          reject(error)                // SDK 给的错误可以原样交出去
        } else {
          resolve(["token": token ?? ""])
        }
      }
    }

    // 事件：先声明名字。JS 调了 watch 之后，SDK 每次回调就发一个事件
    module.addEvent("levelchange")
    module.addMethod("watch") { [unowned module] _ in
      RiskSDK.setLevelHandler { level in
        module.emit("levelchange", detail: ["level": level])
      }
      return nil
    }

    return [module]
  }
}
```

两种写法做的事相同。几条规矩：

- **方法和事件都要在登记之前加好。** 登记之后再加会被忽略，运行时输出一条警告。
- **同步方法报错的方式是返回一个 `NSError`**，不是抛异常。返回 `nil` 表示没有返回值，JS 那边得到 `null`。
- **异步方法的 `resolve` 和 `reject` 只调其中一个，只调一次。** 调第二次会被忽略，运行时输出一条警告。两个都没调就结束了，JS 那边的 Promise 会被拒绝。
- **事件名要先用 `addEvent` 声明。** 发一个没声明的事件会被丢掉，运行时输出一条警告；JS 那边监听没声明的名字不报错，它只是一个自定义事件，原生不会派发。所以名字写错时只有原生那一侧有警告。
- **模块名在整个 App 里要唯一。** 两个模块登记同一个名字时，后登记的那个登记失败，运行时输出一条警告，先登记的不受影响。所以名字里带上公司或产品的名字。

## 3. 登记

**ObjC**：上面的 `+load` 已经完成了登记，不需要再做什么。

**Swift**：把第 2 步那个类设成 framework 的主类。主类是 framework 的 Info.plist 里 `NSPrincipalClass` 这一项的值。

- 工程让 Xcode 自动生成 Info.plist 时（新建的 framework 工程默认如此）：在 target 的 Build Settings 里加一项 `INFOPLIST_KEY_NSPrincipalClass`，值填 `RiskModuleProvider`。
- 工程有自己的 Info.plist 文件时：在里面加一项 `NSPrincipalClass`，值填 `RiskModuleProvider`。

填的名字必须和 `@objc(…)` 括号里的一样。JS 第一次用到 `application.nativeModules` 时，运行时查看嵌在 App 里的每个 framework 的主类，遵守 `NacreModuleProvider` 的就调一次 `nacreModules()`，把返回的模块登记上。

ObjC 写的模块也可以用这种方式登记，不是一定要用 `+load`。

## 4. 值、报错和线程

### 值怎么对应

参数、返回值、事件的 `detail` 只能是下面这几种，可以互相嵌套：

| JS | ObjC | Swift 里拿到的 |
| --- | --- | --- |
| `null`、`undefined` | `NSNull` | `NSNull` |
| `true` / `false` | `NSNumber`（布尔） | `NSNumber`，可以 `as? Bool` |
| 数 | `NSNumber` | `NSNumber`，可以 `as? Double`、`as? Int` |
| 字符串 | `NSString` | `String` |
| 数组 | `NSArray` | `[Any]` |
| 对象 | `NSDictionary`，键是 `NSString` | `[String: Any]` |
| `ArrayBuffer`、`Uint8Array` 等 | `NSData` | `Data` |

要注意的几处：

- **参数个数不固定。** JS 传几个，`arguments` 里就有几个。取之前先看个数，或者用 `arguments.firstObject`（Swift 是 `arguments.first`）。
- **`null` 是 `NSNull`，不是 `nil`。** 数组和字典里不能放 `nil`。判断一个参数有没有值时，`NSNull` 和「没传」都要算上。
- **布尔和数都是 `NSNumber`。** `boolValue` 对 `1` 和 `true` 都返回 `YES`；Swift 里 `as? Bool` 对 `0` 和 `1` 也会成功。要区分时用 `[NacreModule isBoolean:value]`（Swift 是 `NacreModule.isBoolean(value)`）。
- **不要相信参数的类型。** JS 那边可能传任何能传的值。先判断类型，不对就报错。
- **别的类型交不过去。** 返回 `NSDate`、`NSURL`、自己的类的对象，JS 那边会得到一个 `TypeError`。先转成表里的类型（日期转成时间戳，URL 转成字符串）。数里的 `NaN` 和无穷大也交不过去。
- **大块的二进制作为异步方法的返回值直接交。** `resolve(data)` 这种写法不经过编码，运行时只把字节复制一次。JS 拿到的 `ArrayBuffer` 是独立的一份：JS 改它不会改到你手里的 `data`，同一个 `data` 可以反复交出去。二进制放在字典或数组里、作为同步方法的返回值、放在事件的数据里时，每一块都要编码再解码一次。

### 报错

用 `NacreModule` 的两个方法造错误：

```objc
[NacreModule errorWithName:@"NotLoggedIn" message:@"log in first"];
[NacreModule errorWithName:@"Rejected" message:@"too many requests" code:429];
```

JS 那边得到一个 `Error`，`name`、`message`、`code` 就是这里给的。没给 `code` 时错误对象上没有 `code` 这个属性。`name` 写成 `TypeError` 或 `RangeError` 时，JS 那边得到的是对应的那个类的错误。

别处来的 `NSError`（系统的、SDK 的）可以原样返回或者传给 `reject`。JS 那边得到的 `Error`：`name` 是 `'Error'`，`message` 是它的 `localizedDescription`，`code` 和 `domain` 是它的错误码和错误域。

处理函数里抛出的 ObjC 异常会被运行时接住，变成 JS 那边的一个错误，App 不退出。但不要依赖这一点来报错：异常抛出时 SDK 内部的状态可能已经不一致。Swift 里的 `fatalError`、数组越界、强制解包失败接不住，App 会直接退出。

### 线程

- **处理函数一律在主线程上被调用。** 同步方法和异步方法都是。
- **同步方法要快。** 它执行期间 JS 和界面都停着等它。只把马上能答的事做成同步方法。
- **耗时的事做成异步方法，在处理函数里自己切到后台。** 运行时不会替你切线程。

  ```swift
  module.addAsyncMethod("hashFile") { arguments, resolve, reject in
    guard let path = arguments.first as? String else {
      reject(NacreModule.error(name: "TypeError", message: "hashFile needs a path"))
      return
    }
    DispatchQueue.global(qos: .utility).async {
      // 这里是后台线程
      guard let data = FileManager.default.contents(atPath: path) else {
        reject(NacreModule.error(name: "NotFound", message: "no such file"))
        return
      }
      resolve(data.count)
    }
  }
  ```

- **`resolve`、`reject`、`emit` 可以在任何线程调。** 运行时负责把结果送回 JS 所在的线程。
- **在同一个线程上先后发的事件，JS 按同样的先后收到。** 从不同的线程发的事件，先后不保证。
- **JS 那边没有人监听的事件不会被送过去，也不保留。**

## 5. 做成包

### 编出 xcframework

真机和模拟器各编一份，再合成一个 `.xcframework`：

```bash
xcodebuild archive -project RiskModule.xcodeproj -scheme RiskModule -configuration Release -destination 'generic/platform=iOS' -archivePath build/device SKIP_INSTALL=NO BUILD_LIBRARY_FOR_DISTRIBUTION=YES
```

```bash
xcodebuild archive -project RiskModule.xcodeproj -scheme RiskModule -configuration Release -destination 'generic/platform=iOS Simulator' -archivePath build/simulator SKIP_INSTALL=NO BUILD_LIBRARY_FOR_DISTRIBUTION=YES
```

```bash
xcodebuild -create-xcframework -framework build/device.xcarchive/Products/Library/Frameworks/RiskModule.framework -framework build/simulator.xcarchive/Products/Library/Frameworks/RiskModule.framework -output RiskModule.xcframework
```

把得到的 `RiskModule.xcframework` 放进包的根目录。

### 清单 `nacre-ios.json`

```json
{
  "capability": "risk",
  "requires": { "runtimeVersion": "0.1.0" },
  "xcframework": "RiskModule.xcframework"
}
```

| 项 | 必填 | 含义 |
| --- | --- | --- |
| `capability` | 是 | 这个包的名字。有这一项，生成工程时才会把这个包当成带原生代码的包 |
| `xcframework` | 是 | 包根目录下预编译的 framework 的文件名 |
| `requires.runtimeVersion` | 否 | 这个包是照哪个版本的运行时编的。和项目里的运行时版本不一样时，生成工程会报错 |
| `requires.infoPlist` | 否 | 要项目在 `nacre.config.json` 里写的 Info.plist 键（权限文案），见[配置 App](project-config.md) |
| `requires.entitlements` | 否 | 要项目写的 entitlement 键 |
| `vendoredFrameworks` | 否 | 随包带的第三方 framework，见[第 6 步](#6-带上第三方的-sdk) |
| `systemFrameworks` | 否 | 要 App 链接的系统框架，见[第 6 步](#6-带上第三方的-sdk) |

### 包自己的 JS

推荐把模块的方法包成函数再导出。这样用包的人不需要知道模块名和方法名，参数和返回值也有类型。

```js
// index.js
const native = () => application.nativeModules.get('risk');

/** @returns {string} */
export function sdkVersion() {
  return /** @type {string} */ (native().call('sdkVersion'));
}

/**
 * @param {string} scene
 * @returns {Promise<{ token: string }>}
 */
export function collect(scene) {
  return /** @type {Promise<{ token: string }>} */ (native().callAsync('collect', scene));
}

/**
 * 开始监听风险等级的变化。返回一个函数，调用它就停止监听。
 * @param {(level: number) => void} listener
 */
export function onLevelChange(listener) {
  const module = native();
  /** @param {CustomEvent} event */
  const handler = (event) => {
    const detail = /** @type {{ level: number }} */ (event.detail);
    listener(detail.level);
  };
  module.addEventListener('levelchange', handler);
  module.call('watch');
  return () => module.removeEventListener('levelchange', handler);
}
```

这是普通的 npm 包代码，由使用它的项目的打包器打进 App。它能用的只有 `application.nativeModules` 这样公开的 API。

`package.json` 里用 `exports` 指明入口：

```json
{
  "name": "@example/risk",
  "version": "1.0.0",
  "type": "module",
  "exports": {
    ".": { "types": "./index.d.ts", "default": "./index.js" }
  },
  "peerDependencies": { "@nacrejs/types": "*" }
}
```

要写 `exports` 而不是只写 `main`：Nacre 项目的打包配置是 `--platform=neutral`，这种配置下打包器不读 `main`。

### 在项目里用

```bash
npm install @example/risk
```

装好之后重新生成 `ios/`（用 `run-sim.sh` 运行时它每次都会重新生成）。然后在 JS 里：

```js
import { collect, onLevelChange, sdkVersion } from '@example/risk';

console.log('SDK 版本', sdkVersion());

const stop = onLevelChange((level) => {
  console.log('风险等级变成', level);
});

collect('login').then(
  (result) => { console.log('拿到令牌', result.token); },
  (/** @type {NativeModuleError} */ err) => { console.log('采集失败', err.name, err.message); },
);
```

**效果**（未在模拟器验证；`RiskSDK` 是假想的）：控制台输出 SDK 的版本号；采集完成后输出令牌，失败时输出错误的名字和说明；风险等级每变一次输出一行。调用 `stop()` 之后不再输出等级。

只有项目**直接依赖**的包才会被接进工程。一个包如果是被别的包带进来的，它的原生代码不会被嵌进 App。

## 6. 带上第三方的 SDK

### 动态的 framework：随包带上

SDK 是动态的 `.xcframework` 时，App 里必须有它：你的模块在启动时要加载它，没有的话 App 一启动就退出。把它放进包里，在清单里列出来：

```json
{
  "capability": "risk",
  "requires": { "runtimeVersion": "0.1.0" },
  "xcframework": "RiskModule.xcframework",
  "vendoredFrameworks": ["vendor/RiskSDK.xcframework"]
}
```

写的是包目录里的相对路径。生成工程时，列出的每一个都和你的模块一起被嵌进 App 并签名。

| 写错的情况 | 生成工程时的报错 |
| --- | --- |
| 不是数组，或者有一项不是字符串 | 点名这个包，说明要写成一组路径 |
| 不是 `.xcframework` | 点名这个包和这一项。单独的 `.framework` 不收：它只对应真机或者模拟器中的一种 |
| 路径不存在，或者指到了包的外面 | 点名这个包和这一项 |
| 里面是静态库 | 点名这个包和这一项。静态库不放在这里，见下面 |
| 和别的包带的 framework 同名 | 两个包都点名 |

### 静态库：链进你自己的 framework

SDK 是静态库（`.a`，或者静态的 `.xcframework`）时，不要列在 `vendoredFrameworks` 里。在第 1 步的工程里正常链接它，它的代码就在 `RiskModule.xcframework` 里面了，包里不用再带。

### SDK 要求添加的系统框架

你的 framework 直接用到的系统框架不用声明，编译时已经记在它里面了。

需要声明的是 SDK 的接入文档里「请在工程里添加以下系统库」的那一类。这类 SDK 在运行时按名字查找系统的类，对应的系统框架要有人链接才会被加载。把它们列在清单里，生成的 App 会链接它们：

```json
{
  "capability": "risk",
  "requires": { "runtimeVersion": "0.1.0" },
  "xcframework": "RiskModule.xcframework",
  "systemFrameworks": ["CoreTelephony.framework", "libz.tbd"]
}
```

系统框架写成 `名字.framework`，系统库写成 `lib名字.tbd`，只写名字，不带路径。写成别的样子时，生成工程会报错并点名这个包。

### 不支持的

用 CocoaPods 或 Swift Package Manager 分发的 SDK 不能直接引用。先把它编成 `.xcframework`（多数 SDK 的发布页也直接提供），再按上面的方式带上。

SDK 需要权限文案（Info.plist 里的 `NS…UsageDescription`）时，在清单的 `requires.infoPlist` 里列出键名。使用这个包的项目没写对应的文案时，生成工程会报错，见[配置 App](project-config.md)。

## 模块没有出现时怎么查

JS 里 `application.nativeModules.get('risk')` 抛 `no native module named "risk"` 时，报错的最后列出了已经登记的模块。按下面的顺序查：

1. **包装了没有。** 包要在项目 `package.json` 的 `dependencies` 或 `devDependencies` 里，并且根目录有 `nacre-ios.json`，里面有 `capability`。生成 `ios/` 时输出的「能力包：」那一行里应该有这个包的名字。
2. **重新生成了没有。** 装包之后要重新生成 `ios/` 并重新编译 App。
3. **Swift：主类的名字对不对。** `NSPrincipalClass` 的值要和 `@objc(…)` 里的名字完全一样，类要遵守 `NacreModuleProvider`。
4. **名字被占了没有。** 运行时的日志里有没有 `a module named "risk" is already registered`。
5. **运行时的警告。** 模块相关的警告都以 `[nacre] native module warning:` 开头。

---

← 返回[指南](README.md)
