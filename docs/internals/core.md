# 拆出 core

2026-11-21，开始做 Android 之前，把两端共用的代码从 `ios/` 里拆到仓库根的 `core/`。要求是「一次拆干净，对 iOS 没影响」。

## 拆了什么

| 搬了什么 | 从 | 到 |
| --- | --- | --- |
| 引擎（7 个文件，纯 C++，只依赖 V8 和标准库） | `ios/Runtime/Engine/` | `core/engine/` |
| Web 标准那批内置脚本：`06-websocket`、`22-url`、`23-fetch`、`24-timer`、`25-crypto`、`26-intl`、`27-intl-date`、`28-web-globals` | `ios/Runtime/Builtin/parts/` | `core/builtin/parts/` |

都是 `git mv`，历史跟着走。它们要平台提供的原生入口和 `ctx` 上的东西，列在 `core/builtin/README.md`，Android 照着提供。

## 没拆的，以及为什么

- **桥的 JS 那一半**（`00-core` 里的包装和所有权、`01-bridge`）。形状上和平台无关，但 Android 的桥怎么管 Java 对象的所有权还没定（Android 那五件要先定的事之一），现在搬等于替 Android 定了桥的形状。`00-core` 里的 `Event`、`EventTarget` 和包装机制缠在一起，一起留下。`00-core` 后来在 2026-11-28 搬进来了，见下面[后来搬进来的](#后来搬进来的)；`01-bridge` 两端各写各的，不搬。
- 其余 iOS 的内置脚本、`Bridge/`、`NacreRuntime.mm`：本来就是 iOS 的。
- `ios/scripts/` 下的 `fetch-v8.sh`、`build-js.sh`：下的是 iOS 的 V8 包、产物放进 iOS 的工程，Android 会有自己的。
- `android/`、`acceptance-android/`、`packages/android/` 不建空目录，等第一份文件要放进去时再建。

## 为了对 iOS 没影响，开的口子

**加载内置脚本时两处合在一起排序。** `core/builtin/parts/` 在 `project.yml` 里是一个文件夹资源，打进 `Nacre.framework` 是根上的 `parts/`。`NacreRuntime.mm` 读核心的脚本时，把 `Builtin/parts/` 和 `parts/` 的文件合在一起，按文件名排序再执行。执行顺序和拆之前一样，脚本名（`nacre:internal/parts/xx.js`，调用栈里看得到）也一样。没把 `core` 的目录叫 `builtin/` 再整个当文件夹资源引：它会和框架里的 `Builtin/` 在不区分大小写的 macOS 上撞名。

**`structuredClone` 认的类名单拆成两半。** 原来写在 `28-web-globals.js` 里的一张表，前半是 Web 的类（`URL`、`Headers`……），后半是 iOS 的（`CGPoint`、`NSRange`、`CLLocation`……）。Web 的留在 `core`；iOS 的由 iOS 的 `02-struct.js` 放进 `ctx.platformCloneClasses`。这张表本来就是第一次克隆时才收，那时所有 part 都跑完了，收到的名字和拆之前一模一样。check-api 的「ctx 上的名字」因此从 93 变成 94。

**`25-crypto.js` 拆成两个文件。** 它原来一半是 `crypto`，一半是「把 `Event`、`EventTarget`、`Application`、`application` 挂到全局，再把 `__nacre_native` 从全局摘掉」。后一半是平台的事，挪进 iOS 新的 `25-globals.js`。文件名排在 `25-crypto` 后面，执行顺序和原来同一个文件里的先后一样。内置脚本因此从 52 个变成 53 个。

**`Blob` 不继承 `NSObject`。** 这是单独的一个 PR、在拆之前修的（它本来就违反「上层的类」那条规矩），所以拆的这一步里 `23-fetch.js` 一个字没改。

**头文件**：`core/engine` 加进 `HEADER_SEARCH_PATHS`，三处 `#include` 改成 `"Engine.h"`。给能力包用的私有头 `NativeObjectRef.h` 换了源路径，打进框架的 `PrivateHeaders` 还是同一个名字，能力包的 `#import <Nacre/NacreExtension.h>` 不受影响。

## 怎么验证的

改之前（`Blob` 那一步之后、拆之前），真机上跑完整的 Debug 和 Release，记下每条断言的名字；改之后同样跑一遍，逐条比对。

| | 拆之前 | 拆之后 |
| --- | --- | --- |
| Debug（真机） | 6398 通过，0 失败 | 6398 通过，0 失败 |
| Release（真机） | 6398 通过，0 失败 | 6398 通过，0 失败 |
| 内置脚本 | 52 个 | 53 个（多出的是 `25-globals.js`） |
| check-api 三边核对 | 类 134、标量读写 476/321、对象读写 132/61、ctx 上的名字 93 | 只有 ctx 上的名字变成 94（`platformCloneClasses`），其余一字不差 |

断言名单逐条比：直接比有几条不同，都是名字里带着的实测数字（耗时、下载的字节数、httpbin 限流放过了几个），每次跑都不一样；把数字抹掉再比，Debug 和 Release 都是 0 条不同。

另外跑过的：类型检查、CLI 的用例（205）、发布脚本的用例（25）、bindgen 的用例（77），都过。

## 后来搬进来的

### `00-core`（2026-11-28）

`Event`、`EventTarget`，和各处都用的几样：`define`、`defineField`、`has`、`initWrapper`、`kHandle`、`kListeners`、`kSubscribe`、原生入口 `native`。

**为什么现在搬。** 拆 `core/` 时它留在 iOS，理由是 Android 的桥还没定。Android 接 Web 标准那批时要用这些东西，就从 iOS 拷了一份 `00-core.js`，去掉 iOS 导航栈用的 `kSyncStack`，加上 `has` 和 `kHandle`（iOS 的这两个在 `01-bridge.js`）。两份里的事件代码一字不差。2026-11-26 照新总则重写的 Android 桥用的就是这几样，桥定了，拷贝就没有理由留着：以后改事件的行为要改两处，迟早改漏一处。

**怎么搬的。**

- iOS 那份是原件，先原样 `git mv` 进 `core/builtin/parts/`，单独一个提交：内容不改，git 认得出是改名，查历史接得上 iOS 原来的提交。下一个提交再补上 `has` 和 `kHandle`、删掉 Android 的拷贝，注释里提到平台的地方改成不认平台的说法。
- iOS 的 `01-bridge.js` 不再自己定义 `has` 和 `kHandle`，改从 `ctx` 拿，也不再往 `ctx` 上放它们。
- `kSyncStack` 只有 iOS 的 `17-scene.js` 用，改成它自己的局部名字，不再放在 `ctx` 上。
- 把 `Event`、`EventTarget` 挂上全局的两行从两边的 `25-globals.js` 挪进 `00-core.js`：core 里别的文件都自己挂自己定义的全局名字。
- Android 的 `runtime/build.gradle.kts` 在 `corePartsInUse` 里加上 `00-core.js`。

**对 iOS 有什么变化。**

- 执行顺序不变：`00-core` 还是第一个。脚本名不变：iOS 把两处的脚本合在一起排序，名字都是 `nacre:internal/parts/00-core.js`。
- `Event`、`EventTarget` 挂上全局的时刻从第 25 号脚本提前到第一个。App 的代码在全部内置脚本跑完之后才跑，看不出差别。
- check-api 的「ctx 上的名字」从 103 变成 102，少的是 `kSyncStack`；别的数字一个没变。
