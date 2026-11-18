# 交付物、工程和类型检查

← [实现原理](README.md)

交付什么、交给谁、工程怎么分 target，以及类型定义和运行时怎么保持一致。结论在 [`project.md`](../project.md) 的 3.5 和 3.7 节，这一页是推导、实测和踩过的坑。内容是 2026-11-17 从 `project.md` 搬过来的。

（2026-11-13 定。在这之前，想用 Nacre 的人只能 fork 这个仓库，把验收断言删掉换成自己的代码——**等于没有交付物**。两份试用报告里的人都是靠读我们的 `project.yml` 拼出来的。）

## 交给谁

**不是直接交给写 App 的人，是交给 CLI。** 模型对标 Expo 的 Continuous Native Generation：

| Expo | 我们 |
| --- | --- |
| 模板包 `expo-template-bare-minimum`（含 `AppDelegate.swift`） | **启动壳 + 工程配置 ← 我们的产物** |
| config plugins（JS 函数，改 Info.plist / xcodeproj / Podfile） | CLI 团队 + 第三方 SDK |
| `app.json` | 用户的 `nacre.config.json` |
| `npx expo prebuild` 生成 `ios/` | CLI |

CLI 约定一个项目目录，用户在里面写 JS，CLI 从它生成 `ios/`。**我们的产物就是要放进那个 `ios/` 里的东西。**

一个 Nacre 项目长这样，验收和示例都是这个形状：

```
<project>/
├─ package.json
├─ nacre.config.json      App 名字、包名
├─ src/main.js            JS 入口
├─ assets/                图片等资源
└─ ios/                   ← CLI 生成，gitignore
```

## 产物是 `@nacrejs/ios`

```
packages/ios/                 → 发布成 @nacrejs/ios
├─ template/                  生成的 ios/ 里那些文件的原本
├─ nacre-ios.json             机器可读的清单：必须的 build settings、链接参数、资源和打包约定
└─ Nacre.xcframework/         编译好的运行时，构建产物，不提交

packages/cli/                 → 发布成 @nacrejs/cli
└─ bin/nacre.js               命令 nacre
```

加上 `@nacrejs/types`（给用户的 JS 侧）。

**模板和运行时同包同版本发。** 这躲掉了 Expo 的一个已知坑：他们的模板能换但不推荐，因为生成器 `@expo/prebuild-config` 对模板文件有「未文档化的假设」。我们的 CLI 只读清单、不对模板做假设。

**清单必须是机器可读的**——CLI 不会读散文。

**命令原来放在 `@nacrejs/ios` 里，叫「参考实现」；2026-11-19 拆成了单独的包 `@nacrejs/cli`。** 原来的想法是真正的 CLI 由别人做，我们这个只用来证明交付物齐不齐。拆的理由有三条：

- **生成工程是命令的活，不是交付物的一部分。** 「要放进 `ios/` 里的东西」和「把它们放进去的工具」是两样东西，放在一个包里，包就说不清自己是什么。
- **第一次发布定下的是对外的形状。** 命令先跟着 `@nacrejs/ios` 发出去、以后再挪，用户的安装命令和用法都得改；发布之前拆，没有人受影响。
- **命令不属于任何一个平台。** 以后做 Android 是多一个平台的包，命令还是同一个。

拆了之后命令不再靠「我就在这个包里」找东西，改成去项目的 `node_modules/@nacrejs/ios` 里找，和它找能力包是同一种找法。所以验收和示例的项目都把 `@nacrejs/ios` 写进了依赖——它们和真实用户的项目长得一样了。

两个包可以各自升级，所以清单要有格式版本：`nacre-ios.json` 里的 `manifestVersion`。命令只认它读得懂的那个数，别的一律停下，报错里说明要升级哪个包。没有这一项的清单也算不认识。

同一次把命令的输出从中文改成了英文（70 处）。它叫「参考实现」的时候没管这件事；作为正式的包发出去，就归「暴露出去的一切用英文」管。文档里引用报错的地方是把每种情况用真的命令跑一遍、照实际输出改的，不是照着代码抄的。

## 三条从 Expo 学到的

1. **模板是上游的产物，不是 CLI 团队去猜。** 只有我们知道工程必须有 `-Wl,-stack_size,0x800000` 这些，让别人从文档里抄，抄错了是线上崩。
2. **生成的 `ios/` 随时会被删重建**（Expo 原文：手改了生成目录，下次 `prebuild --clean` 就丢）。所以我们的东西必须能被机械地重新放进去，不能有「装完手动改一下」的步骤。
3. **不要让 CLI 用正则改启动壳。** Expo 文档自己警告改 AppDelegate 那类 plugin「依赖正则，可能把构建弄坏」，建议「用代码改代码」。这把**宿主扩展点**从「以后再说的能力」提升成交付模型的必要组成：启动壳要设计成不需要被改的，第三方原生 SDK 通过注册机制接进来。

## static 还是 dynamic：等数据

用户不碰集成（CLI 碰），所以「手动集成成本」不再是判据，回到技术指标：启动时间、包大小、符号隔离。先做 dynamic 跑通并量了一轮：拆成 dynamic framework 之后启动没变慢（真机上 V8 初始化和 context 是 1.4 / 3.2 ms，改之前 1.2 / 2.7；模拟器冷启动 7.9–9.6 / 11.6–19.2 ms，改之前 6.8–9.7 / 10.6–34.5），framework 14 MB（Debug 未 strip）。那一步没量到 dyld 加载 framework 的成本，它发生在第一行日志之前；后来量了，见[能力包](capabilities.md#拆不拆量过的代价)，static 的对比要等真做了 static 才有。

无论哪种，`-Wl,-stack_size,0x800000` 和 `ENABLE_DEBUG_DYLIB: NO` 都得由宿主自己设——framework 包不住，SPM 也禁止从 URL 引入的包用 `unsafeFlags`。**交付面上一定有一份「宿主必须照做的配置」**，它必须写进文档并且被示例工程证明过。

## 四步

| | 做什么 | 验收标准 | |
| --- | --- | --- | --- |
| 1 | 运行时拆成 framework target，目录不动 | 断言一字不差；拿到大小和启动数据 | 已做 |
| 2 | 搬目录成第 5 节那棵树 | 纯机械，断言一字不差 | 已做 |
| 3 | `packages/ios/` + 简单 CLI；验收和示例的 `ios/` 都改成 CLI 生成 | **两个工程都不用手改一行就能跑** | 已做 |
| 4 | `docs/guides/` 入门文档 | 照着做一遍能跑通 | 已做 |

## 第 3 步定下来的形状

`@nacrejs/ios` 里四样东西：`template/`（启动壳；2026-11-18 起不再带图标，图标由项目自己放，见[能力包](capabilities.md#app-图标约定的文件名)）、`nacre-ios.json`（机器可读的清单）、`Nacre.xcframework`（构建产物，不提交）、`bin/nacre-ios.js`（参考实现的 CLI；2026-11-19 拆成了单独的包 `@nacrejs/cli`，见上面）。

CLI 只有一个命令：`generate <项目目录> [--runtime=framework|source]`。两种运行时都要通，少一条就有问题——

| `--runtime` | 工程引什么 | 谁用 | 为什么要有 |
| --- | --- | --- | --- |
| `source` | 运行时的 Xcode 工程当子工程 | 我们 | 改一行 C++ 重新编就生效，不用先打包 |
| `framework` | 预编译的 `Nacre.xcframework` | 用户 | 用户拿到的就是这个，不验等于没交付 |

**验收 App 的 `ios/` 也由 CLI 生成**，所以模板天天被用一遍，漂了当天就会被一千七百多条断言发现。这是这一步最值钱的地方——Expo 正是在这里吃过亏（模板能换但不推荐，因为生成器对模板文件有「未文档化的假设」）。

清单里 `appSettings` 那三条是**宿主必须照做的**，哪条漏了都会出事：`-Wl,-stack_size,0x800000`（`LC_MAIN` 只有主可执行文件有，framework 带不了）、`ENABLE_DEBUG_DYLIB: NO`（不关上一条就报错）、`TARGETED_DEVICE_FAMILY: 1`。

## 打包脚本看 `xcodebuild` 自己的退出码

（2026-11-16，来自一份外部审查。）`ios/scripts/build-xcframework.sh` 看的是 `xcodebuild` 自己的退出码；中间目录每次用独立的；合成成功才换掉旧产物。

用故障注入验的：一个把产物目录建出来、但以失败退出的假 `xcodebuild`。原来的脚本照样报「构建完成」，还把旧产物删成空的；改过的在第一处失败就停，旧产物还在。

## `ios/` 里是两个 target：运行时和宿主

交付物定成 `Nacre.xcframework`（2026-11-13 定），所以工程拆成两个 target，**这条线就是交付面**：

| target | 是什么 | 交付？ |
| --- | --- | --- |
| `Nacre` | framework，装 `Runtime/` 的全部代码和内置脚本 | **是**，它就是 `Nacre.xcframework` 的源 |
| `NacreApp` | 验收 App，装 `App/`（启动壳）和 `JS/`（验收的产物和资源） | 否。这几个文件将来变成模板，由 CLI 铺进生成的工程 |

拆出来之后定下的几条：

- **公开面就是 `Runtime/Nacre.h` 这个 umbrella header**。今天它只 `#import` 了 `NacreRuntime.h`；`Bridge/` 和 `Engine/` 的头都是 project 可见性（它们带 C++，Swift 也读不了）。加一个公开接口 = 在 umbrella 里写一行 + 在 `project.yml` 里把那个头标成 public，**两处都做了才算暴露出去**。
- **系统框架必须在 framework 上显式声明**：UIKit、QuartzCore、CoreGraphics、ImageIO、WebKit、Security。以前不用写——App target 里的 Swift 文件 `import UIKit` 顺带把它们链进来了；运行时里一个 Swift 文件都没有，而 ObjC++ 的 `#import` 不触发自动链接，第一次编 framework 直接撞了一屏 `Undefined symbols`。这张表是交付清单的一部分，用户的工程不用再写。
- **`-Wl,-stack_size,0x800000` 留在 App target 上**，framework 替不了：它写进的是 `LC_MAIN`，而 `LC_MAIN` 只有主可执行文件有。真机上验过，二进制里 `stacksize 8388608`。`ENABLE_DEBUG_DYLIB: NO` 同理。**这两条是宿主必须照做的配置**，要写进交付文档。
- **App 的 `PRODUCT_MODULE_NAME` 必须和 framework 的模块名区分开**。产物还叫 `Nacre.app`，但模块名设成了 `NacreApp`——不然 App 里的 `import Nacre` 变成导入它自己，Swift 报 `cannot find 'NacreRuntime' in scope`。
- **内置脚本从运行时自己的包读**：`[NSBundle bundleForClass:NacreRuntime.class]`，不再是 `NSBundle.mainBundle`。`Builtin/parts/` 跟着 framework 走。
- **隐私清单也跟着 framework 走**：`Runtime/PrivacyInfo.xcprivacy` 打进包根。Apple 不许第三方 SDK 靠宿主 App 的清单报自己，所以这一份替不了。里面三类是 `nm` 扫二进制扫出来的——`_mach_absolute_time` 和 `_fstat` 来自 **V8**，我们一行相关代码都没写。详见[隐私清单](privacy-manifest.md)。

先做的是 **dynamic framework**：资源跟着 framework 走，定位是确定的。static 的启动和体积可能更好，但得有数据才能比——量到的数在上面「static 还是 dynamic」那一节。

`ios/` 内部（**只有运行时和拆出去的能力**，验收 App 的壳和资源在 `acceptance/ios/`）：

| 目录 | 内容 | 是否提交 |
| --- | --- | --- |
| `project.yml` | XcodeGen 工程描述（两个 target） | 提交 |
| `.gitignore` | 平台相关的忽略规则（根目录的 `.gitignore` 里不能出现平台目录名，所以放这里） | 提交 |
| `Runtime/Nacre.h` | framework 的 umbrella header，**公开面** | 提交 |
| `Runtime/` | `Nacre` target：`NacreRuntime`（ObjC++ 启动壳与接线）、`Bridge/`（能力暴露，按能力域分文件）、`Engine/`（纯 C++）、`Builtin/parts/`（内置脚本，按能力域分 part） | 提交 |
| `Capabilities/` | 从核心里拆出来的能力，一个能力一个目录、一个 framework target（现在只有 `Keychain/`）。各带自己的 `.mm` 和 `Builtin/parts/` | 提交 |
| `scripts/` | `fetch-v8.sh`、`build-js.sh`、`build-xcframework.sh`、`check-api.sh`、`run-sim.sh` | 提交 |
| `Nacre.xcodeproj/` | 由 `project.yml` 生成 | 不提交 |
| `Vendor/` | 由 `fetch-v8.sh` 下载的 V8 | 不提交 |
| `build/` | 构建产物 | 不提交 |

## 类型包的现状

**还没按平台拆导出。** 只有 iOS 的时候那条路验证不到，形状多半会定歪；文件已经分开，将来加 `android.d.ts` 时再定，那时有真实需求。

**2026-11-19 开始发布**，见下面[发布](#发布)一节。原来定的是「等第一个版本，先把基础能力补全」，所以在那之前 npm 的前缀、版本号、发布流程都没碰过。

无前缀的 `nacre` 被一个 2022 年的 "Intuitive Shell" 占着，`nacre` 这个组织名也注册不了，所以前缀是 `@nacrejs`。项目名不跟着改：npm 上的前缀和项目名不一样是常事（Nest 是 `@nestjs`，Redux 是 `@reduxjs`），而整个项目改名要动五千多处、九十多个文件名。

## 怎么保证三边不漂

同一套 API 现在有三个面：

| | 角色 |
| --- | --- |
| `NacreRuntime.mm` 的分发表 | 真相，决定运行时实际能做什么 |
| `Builtin/parts/` 的取值器 | 桥，JS 能碰到的东西 |
| `types/*.d.ts` | 契约，开发者看到的东西 |

手写绑定的时期这三份只能分别维护，所以必须有东西盯着。`ios/scripts/check-api.sh` 比对类是否齐、成员是否对得上、只读/读写是否一致、枚举可选值是否相同。**脚本本身验证过**：故意删一个属性、把只读改成读写、枚举少一个值，三种都能抓到。

**每个提取点都要能说出「是我自己失效了」。** 这个脚本靠正则从三份源码里抽名字，正则一旦对不上就会**安静地返回空集合**，于是报出一屏看着像真 diff 的假阳性——拆 `NacreProperties.mm` 时就是这么被咬了一次，报了一百多条假的「nacre.js 有但原生层没有」。

所以每个提取点都走统一的 `extract()`：定位不到或抽出来是空的，就报「`<什么>` 定位不到，check-api.sh 要更新」，并且**由它推出来的那条 diff 不再报**（`compare()` 对 `None` 直接跳过，取值器的并集 `js_union()` 任何一个成员失效就整个返回 `None`）。

这一条同样**验证过**，在仓库的沙盒副本里逐类弄坏：d.ts 的联合类型改名、原生的 `NACRE_ENUM_MAP` 改名、手写表的函数改名、颜色表的定位注释改掉、取值器改名、`defineNativeClass` 改名、域函数签名改名——**七类各报一条「脚本要更新」，一条噪音都没有**；同时「d.ts 删一个枚举值」「nacre.js 删一个 getter」这两种真实 diff 照样精确报出来。

**它只比对符号，不比对类型。** 参数类型写错了、返回类型写反了，脚本看不出来——那一层靠 `main.js` 的实际使用和 `tsc` 兜着。所以两件事都要做，缺一个都有漏网的。

等 bindgen 从 SDK 头文件生成，三份都变成产物，这个脚本就可以退休。

## `main.js` 是第一个用户

（这一段写的是当时的做法：`ios/JS/tsconfig.json` 直接 include 仓库里的类型定义。现在是 `acceptance/tsconfig.json`，类型作为依赖装进来。）开了 `checkJs`，所以 `main.js` 的每一行都被检查。

验收用例里那些**故意写错**的地方（枚举给错值、写只读属性、构造不可构造的类）全部标了 `@ts-expect-error`，于是它们变成了类型定义的测试——**双向的**：

- 类型定义写错了 → 正常报错
- 类型定义漏了某条 → `@ts-expect-error` 报 `Unused '@ts-expect-error' directive`

实测确认：把 `UIViewContentMode` 放宽成 `string`、把 `superview` 改成可写，两种都会被反过来抓到。

## 运行时没有什么

实测 `globalThis` 得到的事实，类型定义据此配 `lib`：

（这是当时的实测；定时器、`fetch` / `URL`、`Intl.NumberFormat` 后来都由运行时补上了。当时同样没有的 `TextEncoder` / `TextDecoder`、`atob` / `btoa`、`structuredClone` 也补上了，见[实现原理](web-globals.md)。）

**没有**：定时器（`setTimeout` / `setInterval` / `queueMicrotask` 一个都没有）、`Intl`、`fetch` / `URL`、`WebAssembly`、DOM 的一切。

**有**：ECMAScript 的新特性基本是全的，`Float16Array`、`Iterator` 辅助方法、`DisposableStack`、`SuppressedError` 都在，所以 `lib` 用 `ESNext` 而不是 `ES2023`。

`Intl` 比较特殊：TypeScript 的 ES lib 自带它的类型，**没办法从 `lib` 里减掉**，所以类型上整个都在，而运行时现在只有 `Intl.NumberFormat`。这是已知的不对齐，记在 `types/README.md` 里。

## 发布

### 二进制放在 npm 包里

预编译的 framework 随 npm 包一起发，不在生成工程时另外下载。另外下载的做法 Electron 在用，但对我们有三样代价：国内从 GitHub 的发布页拉东西不稳，而 npm 有现成的镜像；「包的版本」和「二进制的版本」成了两样要对齐的东西，校验、缓存、重试都得自己写；要新写一套下载的机制。放在包里，`package-lock.json` 就锁住了版本和校验值，装过一次之后离线也能生成。

体积不构成问题：`@nacrejs/ios` 压缩后 9 MB，能力包各不到 0.1 MB。

npm 打包会丢掉符号链接（NativeScript 因此把 framework 压成 zip 放进包里）。我们的 framework 里一个符号链接都没有，iOS 的 framework 没有 macOS 那种 `Versions/` 结构，所以不受影响。

### 发布前在仓库外走一遍

验收一直是直接指向仓库里的目录跑的，「打成 npm 包再装出来还完好吗」从没验过，直到 2026-11-19 做了一次演练：

- `scripts/release.mjs pack` 打出 11 个压缩包。
- 在仓库外建一个新项目，只 `npm install` 这些压缩包，加上 esbuild 和 typescript。
- 装出来的是真目录，执行权限还在，`Nacre` 那个二进制和仓库里的逐字节相同。
- 类型检查 → `npx nacre generate .` → 打包 JS → `xcodegen generate` → `xcodebuild` → 装到模拟器 → 启动，日志里打出 `[JS][log] 起来了`。
- 再装钥匙串和面容 ID 两个能力包：没写权限文案时生成在动任何文件之前停下；写了之后三个 framework 都嵌进了 App，启动日志是 `40 parts + 1 from NacreKeychain + 1 from NacreLocalAuthentication`，钥匙串写进去的值读了回来。
- 删掉 `ios/` 重新生成，照常能编。

这次演练还带出一件事：《建一个自己的 App》原来整篇靠仓库里的 `run-sim.sh` 跑，从 npm 装的人手里没有它，照文档走不通。那一篇按演练里实际跑通的命令重写了。

### 许可是 FSL-1.1-MIT

要的是「源码公开，谁都能用它做 App，但不能拿它本身去卖」。开源许可做不到这一条——「开源」的定义里就有不得限制商用。能做到的是源码可见的那一类，其中分两种：禁一切商用（PolyForm Noncommercial），和只禁做竞争的产品（FSL、PolyForm Shield）。上架的 App 几乎都算商用，选前一种等于在还没有用户的时候把门关上，所以选后一种。

FSL 里选它而不是 PolyForm Shield，是因为每个版本满两年自动变成 MIT，这对使用者是个定心丸。条文原样用官方模板，只填了年份和版权人，一个字没改——改了就不再是 FSL。对外的说法是「源码公开，许可是 FSL-1.1-MIT」，不写「开源」。

闭源也考虑过，没选：桥的 JS 那一半（40 个内置脚本、一万三千多行）必须明文跟着 framework 发出去，藏不住；而一个看不到源码的运行时，别人不敢嵌进自己的产品。

### 第三方声明照二进制核对，不照文档抄

`packages/ios/THIRD-PARTY-NOTICES.md` 的清单不是照 V8 的 `LICENSE` 抄的。做法是把 V8 这个版本带的每一个第三方库过一遍（它自己 `third_party/` 下的，和 `DEPS` 拉进来的），在我们链进运行时的 16 个静态库里按符号查它在不在：

| 结论 | 有哪些 |
| --- | --- |
| 在，有符号为证 | V8 本体、Abseil、simdutf、Highway、fast_float、Dragonbox、cpu_features、调试协议（crdtp）、zlib、SipHash、utf8-decoder、fdlibm、glibc 的 `sin` / `cos` |
| 只有头文件，查不出符号，V8 标着会随产品发出，按「在」处理 | rapidhash、FP16、LLVM libc |
| 编进快照里，查不出符号，按「在」处理 | 数组排序那段来自 CPython 的代码（`third_party/v8/builtins`） |
| 不在 | ICU、WebAssembly 的 C 接口、protobuf、perfetto、partition_alloc、re2、Chromium 自己的 libc++（用的是系统的） |

多列没有坏处，漏列才有，所以查不出符号的都按「在」算。许可原文都是从各自的官方仓库取的，逐字放进去。

**里面有一项是 LGPL-2.1**：`_glibc_sin` 和 `_glibc_cos` 这两个符号在 `libv8_libbase.a` 里，V8 的说明里也写着这段代码会随产品发出。LGPL 要求让使用者能把这段代码换成自己改过的版本。对 Nacre 本身，源码和构建脚本都是公开的，可以重新编；对上了 App Store 的 App，用户换不了里面的库，这是 iOS 上用 LGPL 代码公认的灰色地带，所有在 iOS 上用 V8 的项目都一样。现在的处理是如实声明。要去掉它得自己编 V8、关掉 `v8_use_libm_trig_functions`，现成的包改不了这个开关。

### 发出去的包打算用 Xcode 26 来打

预编译包里的 Swift 接口文件是哪个编译器写的，就带着哪个编译器的版本。用户的启动壳里有一句 `import Nacre`，新编译器读老接口没问题，反过来是这类预编译包最常出问题的地方。所以发出去的 framework 该用我们支持的最老的 Xcode 来编。本地只有 Xcode 27，GitHub 的 `macos-26` 机器上是 Xcode 26.0 到 26.6，正好拿来打发布的包。我们的代码还从没在 Xcode 26 上编过。

### 合并到 `main` 就发布，但要版本号是新的

npm 上同一个版本只能发一次，所以「每次合并都发」第二次就会失败。规则是：合并到 `main` 时问 npm 每个包的这个版本在不在（`release.mjs pending`），有缺的才发。于是发一个新版本就是合并一个改了版本号的 PR，平时的合并什么都不触发。

`publish` 因此做成了可以重跑的：它逐个问、在的跳过。发到一半断了，再跑一次接着发剩下的。

认证走 npm 的可信发布，不存令牌——绕过两步验证的令牌 2027 年 1 月起不能直接发布。每个包要在 npmjs.com 上登记「这个仓库的 `release.yml` 可以发布」，而包得先存在才能登记，所以第一个版本是手动发的。

两个工作流写下的时候一次都没在 GitHub 上跑过。手动触发 `release` 默认是演练（`npm publish --dry-run`），用它可以先把「Xcode 26 上编不编得过」这一关单独过掉，不和「发布通不通」搅在一起。

### 演练做成了脚本

2026-11-19 那次手动的演练后来写成了 `scripts/smoke.sh`，CI 里每个 PR 和每次发布之前都跑。它比手动那次多查几样：装出来的不是链接、二进制没丢执行权限、许可和第三方声明在包里、用例没有跟着发出去、没写权限文案时生成在动任何文件之前停下。加 `--run` 还会装到开着的模拟器上启动，核对 JS 打出来的日志；CI 里不带这个参数，只编译。
