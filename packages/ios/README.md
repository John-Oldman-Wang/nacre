# `@nacrejs/ios`

Nacre 的 iOS 交付物：「要放进 `ios/` 里的东西」。**这个包里没有命令**，它是给 [`@nacrejs/cli`](../cli/README.md) 读的——项目里装上它，`nacre generate` 就从项目的 `node_modules/@nacrejs/ios` 里取运行时、启动壳和清单，生成 `ios/`。

```
packages/ios/
├─ template/              生成的 ios/ 里那些文件的原本：启动壳
├─ nacre-ios.json         宿主工程必须满足的条件，机器可读
└─ Nacre.xcframework/     编译好的运行时（构建产物，不提交）
```

## 一个 Nacre 项目长什么样

```
<project>/
├─ package.json
├─ nacre.config.json      App 的名字和包名
├─ icon.png               App 图标（可选）；也可以是 icon.icon
├─ launch.png             启动屏上的图（可选）；也可以整个换成 launch.storyboard
├─ src/main.js            JS 入口
├─ assets/                图片等资源，会被放进 App 包的 JS/assets/
└─ ios/                   ← 生成的，不进版本库，随时可以删掉重建
```

`nacre.config.json` 现在只有两项是必填的：

```json
{ "name": "Hello", "bundleId": "com.example.hello" }
```

可选：`displayName`、`version`、`buildNumber`、`deploymentTarget`、`launchScreen`（启动屏的底色，见下面），以及 `ios` 下面的四项：

| 配置项 | 是什么 |
| --- | --- |
| `ios.languages` | App 支持哪些语言，第一个是默认语言。每种语言生成一个本地化目录 |
| `ios.urlSchemes` | App 认哪些自定义协议（`myapp://…`）。写成 Info.plist 的 `CFBundleURLTypes` |
| `ios.infoPlist` | 写进 Info.plist 的键值。文案可以按语言写 |
| `ios.entitlements` | App 的 entitlement |

`displayName` 也可以按语言写。用法和每一种写错时的报错见[配置 App](../../docs/guides/project-config.md)。

## App 图标

图标不写进 `nacre.config.json`，用约定的文件名，放在项目根目录：

| 文件 | 是什么 | 进了生成的工程 |
| --- | --- | --- |
| `icon.icon` | Icon Composer 的图标文件（一个目录） | `App/AppIcon.icon` |
| `icon.png` | 一张 1024×1024 的 PNG | `App/Assets.xcassets/AppIcon.appiconset/` |

- 两个都有用 `icon.icon`。文件名逐字比对，大小写不对的不认。
- **没放就不带图标**：不报错、不提示，模板里也没有默认的图。图标名的编译设置这时写成空串。
- 放了但不能用（`icon.png` 不是 1024×1024 或者不是 PNG，`icon.icon` 不是目录或者里面没有 `icon.json`），生成时报错。

为什么是这样、量到的事实，见[能力包](../../docs/internals/capabilities.md#app-图标约定的文件名)。

## 启动屏

一个底色加一张居中的图，两样各自可有可无：

| 给什么 | 写在哪 | 进了生成的工程 |
| --- | --- | --- |
| 底色 | `nacre.config.json` 最外层的 `launchScreen`：`"#0A84FF"`，或者 `{ "light": "#FFFFFF", "dark": "#000000" }` | 资源目录里的颜色集 `LaunchBackground` |
| 图 | 项目根目录的 `launch.png`，按 3 倍图算 | 资源目录里的图片集 `LaunchLogo`（只有 3x 一项） |
| 自己的启动屏 | 项目根目录的 `launch.storyboard` | `App/LaunchScreen.storyboard`（原样拷） |

- 给了底色或图：生成一份 `App/LaunchScreen.storyboard`（图居中，比屏幕大时等比缩到放得下），Info.plist 用 `UILaunchStoryboardName` 指它。
- 有 `launch.storyboard`：整个用它，另外两样不看。它引用的图放在 `assets/` 里，图名写 `JS/assets/名字`。
- 都没给：和以前一样，Info.plist 里一个空的 `UILaunchScreen`。不报错、不提示。
- `launchScreen` 认不出来的，当没写，不报错、不提示：色值不是 `#` 加 6 位或 3 位十六进制数、带了透明度、`light` / `dark` 少一个、写在了 `ios` 下面。对象里多出来的键不看。
- `launch.png` 不能用的，生成时报错：不是 PNG、超过 400 万像素（图太大时系统不画启动屏，整屏是黑的）。

量到的事实见[能力包](../../docs/internals/capabilities.md#启动屏一个底色加一张图)。

## 能力包的清单

能力包根目录也有一份 `nacre-ios.json`，CLI 靠它认出这是一个能力包：

```json
{
  "capability": "local-authentication",
  "target": "NacreLocalAuthentication",
  "xcframework": "NacreLocalAuthentication.xcframework",
  "requires": {
    "runtimeVersion": "0.1.0",
    "infoPlist": ["NSFaceIDUsageDescription"],
    "entitlements": []
  }
}
```

`requires.infoPlist` 和 `requires.entitlements` 列的是**键名**：这个包要项目在 `nacre.config.json` 里写上这些键。内容由项目自己写，包不带——权限文案是一句给最终用户看的话，包替不了。项目没写时生成报错并点名。

第三方的原生模块是同一种包（怎么写见[写自己的原生模块](../../docs/guides/native-modules.md)）。清单另外认这几项：

| 项 | 是什么 |
| --- | --- |
| `target` | 运行时工程里的 target 名，引运行时源码时用。**只有运行时仓库里的包才有**；第三方的包不写，两种方式都用它的 `xcframework` |
| `vendoredFrameworks` | 随包带的第三方预编译 framework：包目录里的 `.xcframework`，一组相对路径。生成时拷进 `ios/`，和包自己的 framework 一样嵌进 App 并签名。只收动态的，静态库要在编包自己的 framework 时链进去 |
| `systemFrameworks` | 要 App 链接的系统框架（`名字.framework`）和系统库（`lib名字.tbd`）。几个包要同一个只写一次 |

这几项写错（不是数组、路径不存在、指到包的外面、不是 `.xcframework`、里面是静态库、两个包带了同名的 framework、系统框架的写法不对），生成时报错并点名是哪个包。

## 生成

命令在 [`@nacrejs/cli`](../cli/README.md) 里，用例也在那边。在装了这两个包的项目里：

```bash
npx nacre generate . [--runtime=framework|source]
```

在这个仓库里直接跑的话：

```bash
node packages/cli/bin/nacre.js generate <项目目录> [--runtime=framework|source]
```

| `--runtime` | 工程引什么 | 谁用 |
| --- | --- | --- |
| `framework`（默认） | 预编译的 `Nacre.xcframework` | 用户 |
| `source` | 运行时的 Xcode 工程当子工程 | 我们自己，改一行 C++ 重新编就生效 |

生成之后还要两步：打包 JS（写进 `ios/JS/main.js`），然后在 `ios/` 里跑 `xcodegen generate`。`ios/scripts/run-sim.sh` 把这几步串起来了。

## `nacre-ios.json` 里是什么

CLI 读它去配工程。**它是数据不是文档**，因为 CLI 不会读散文。

| 字段 | 是什么 |
| --- | --- |
| `deploymentTarget`、`architectures`、`excludedArchitectures` | 运行时支持到哪 |
| `appSettings` | **宿主必须照做的 build settings**，framework 替不了，见下 |
| `projectSettings` | 项目级的 build settings |
| `js` | JS 怎么打包、打到哪、资源目录叫什么 |

`appSettings` 里那三条，哪一条漏了都会出事：

- `OTHER_LDFLAGS` 的 `-Wl,-stack_size,0x800000`：JS 跑在主线程，而真机主线程栈默认只有 1MB，V8 按约 1MB 算栈上限，没有余量。这个参数写进 `LC_MAIN`，而 **`LC_MAIN` 只有主可执行文件有**，所以 framework 带不了它。
- `ENABLE_DEBUG_DYLIB: NO`：不关掉的话，上面那条链接器直接报 `-stack_size option can only be used when linking a main executable`。
- `TARGETED_DEVICE_FAMILY: 1`：只支持 iPhone。

## 能力包

核心里没有的能力各是一个单独的包（现在只有 `@nacrejs/keychain`），里面是它自己的清单、类型和预编译的 framework。**这个包里没有它们**——`Nacre.xcframework` 只是核心。

CLI 生成工程时会看项目的 `package.json`：**直接依赖**里哪个包带着有 `capability` 字段的 `nacre-ios.json`，就把它的 framework 加进工程。装了就是声明，不用再在别处写一遍。

```json
{
  "capability": "keychain",
  "requires": { "runtimeVersion": "0.1.0" },
  "target": "NacreKeychain",
  "xcframework": "NacreKeychain.xcframework"
}
```

| 字段 | 是什么 |
| --- | --- |
| `capability` | 能力的名字。有这个字段才被认作能力包 |
| `requires.runtimeVersion` | 它要的运行时版本。和这个包的 `runtimeVersion` 对不上时，**生成时就报错** |
| `target` | 引运行时源码时用：运行时工程里的 target 名 |
| `xcframework` | 引预编译产物时用：能力包目录下的文件名 |

三种情况 CLI 会停下来而不是悄悄跳过：依赖写了却没装（没法知道它是不是能力包）、清单缺 `target` 或 `xcframework`、版本对不上。

能力包怎么搭的见[能力包](../../docs/internals/capabilities.md)。

## 隐私清单跟着 xcframework 走

`Nacre.xcframework` 的每个切片里自带一份 `PrivacyInfo.xcprivacy`，声明运行时用到的 required reason API（UserDefaults、文件时间戳、系统启动时间三类）。

**这件事宿主替不了。** Apple 明说第三方 SDK 不能靠宿主 App 的清单来报自己，而且清单必须在那个 dynamic library 自己的包根。所以用户的 App **不需要**为运行时补任何东西——实测过 App 主可执行文件一个 required reason 符号都没碰。

他可能仍要一份自己的清单来声明 `NSPrivacyTracking` 和 `NSPrivacyCollectedDataTypes`，但那说的是他的 App 收集什么数据，和运行时无关。

三类是怎么定的、理由码为什么选那几个、`check-api.sh` 怎么核对，见[隐私清单](../../docs/internals/privacy-manifest.md)。

## 清单是这个包和命令之间的约定

命令（`@nacrejs/cli`）只读清单，不对模板做假设。清单带一个格式版本 `manifestVersion`：清单的格式变了就升它，命令遇到不认识的版本会停下并说明要升级哪个包，不去猜。

模板和运行时在同一个包里、同一个版本。这样模板天天被用：验收 App 和 `examples/hello/` 的 `ios/` 都是从它生成的，模板一旦漂了，当天就会被验收发现。Expo 在这件事上吃过亏：他们的模板能换但不推荐，因为生成器对模板文件有「未文档化的假设」。

别的工具也可以读同一份 `nacre-ios.json` 来生成工程，不是非用 `@nacrejs/cli` 不可。

## 还不能做的

| 想做的事 | 现在怎么样 |
| --- | --- |
| 每种外观一张 PNG 的图标、调试包单独的图标、运行时切换的备用图标 | 没做。图标只认 `icon.icon` 和 `icon.png` |
| 深色模式下换一张启动屏的图、控制启动屏何时消失 | 没做 |
| 不装 XcodeGen 也能用 | 生成的是 `project.yml`，还要跑一次 `xcodegen`。真正的 CLI 该直接产出 `.xcodeproj` |
| 让宿主 App 把自己的原生代码暴露给 JS | 没有扩展点。这是交付模型里缺的一大块，见[项目说明](../../docs/project.md) |
| 发布到 npm | `private: true`，`Nacre.xcframework` 也还没进包。**现阶段不打算发**，等第一个版本把基础能力补全 |

---

← 返回[项目说明](../../docs/project.md) ・ [API 文档](../../docs/api/README.md)
