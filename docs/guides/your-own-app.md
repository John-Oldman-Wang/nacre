# 建一个自己的 App

从零建一个用 Nacre 的 iOS App：四个文件，装几个包，跑两条命令，模拟器上就能看到。

## 需要什么

| | |
| --- | --- |
| macOS | Apple Silicon |
| Xcode | 26 或更新，并装一个 iOS 26 或更新的模拟器（Xcode → Settings → Components）。这一篇的命令是在 Xcode 27.2 上实测的，Xcode 26 上还没有验证过 |
| [XcodeGen](https://github.com/yonaskolb/XcodeGen) | `brew install xcodegen`。Nacre 生成的是一份工程描述，由它变成 Xcode 工程 |
| Node | 20 或更新 |

## 1. 建项目目录

一个 Nacre 项目只有三个文件是必须的，加上一个管类型检查的。

```bash
mkdir my-app && cd my-app && mkdir src
```

`package.json`：

```json
{
  "name": "my-app",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "esbuild src/main.js --bundle --format=iife --platform=neutral --charset=utf8 --outfile=ios/JS/main.js",
    "check": "tsc --noEmit",
    "ios": "nacre generate . && npm run build && cd ios && xcodegen generate"
  }
}
```

`build` 那一行的四个参数不能改，见[打包的硬约束](#打包的硬约束)。`ios` 那一行把生成工程的三步串在了一起，下面第 3 步会用到。

`nacre.config.json`：

```json
{
  "name": "MyApp",
  "bundleId": "com.example.myapp"
}
```

这是最少要写的两项。App 的显示名、支持的语言、权限文案也写在这个文件里，见[配置 App](project-config.md)。

`tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["ESNext"],
    "module": "Preserve",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "allowJs": true,
    "checkJs": true,
    "types": []
  },
  "include": ["src/**/*.js"]
}
```

两项值得解释：`"lib": ["ESNext"]` 里**没有 `DOM`**——这个运行时没有 `window`、`document`、`location`，带上 DOM 会让它们在编辑器里看着存在。`"checkJs": true` 让 `.js` 文件也被真的检查，不只是有补全。

`src/main.js`：

```js
/// <reference types="@nacrejs/types" />

application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const label = new UILabel();
  label.text = '你好';
  label.font = UIFont.systemFontOfSize(28, { weight: 'semibold' });
  label.textColor = 'label';
  label.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(label);

  const safe = page.view.safeAreaLayoutGuide;
  NSLayoutConstraint.activateConstraints([
    label.centerXAnchor.constraintEqualToAnchor(safe.centerXAnchor),
    label.centerYAnchor.constraintEqualToAnchor(safe.centerYAnchor),
  ]);

  console.log('起来了');
});
```

**效果**：目录里有 `package.json`、`nacre.config.json`、`tsconfig.json` 和 `src/main.js`。

`sceneconnect` 是 App 的入口：系统接入一个场景时派发，窗口和页面全由 JS 建，原生层不替你做任何决定。详见 [`application`](../api/application.md)。

## 2. 装依赖

```bash
npm install -D @nacrejs/ios @nacrejs/cli @nacrejs/types esbuild typescript
```

**效果**：`node_modules/` 里多了这五样，`package.json` 里多出 `devDependencies`。

| 包 | 给什么 |
| --- | --- |
| `@nacrejs/ios` | 编译好的运行时（`Nacre.xcframework`）和启动壳 |
| `@nacrejs/cli` | 命令 `nacre`：从你的项目生成 iOS 工程 |
| `@nacrejs/types` | 类型。装上之后，编辑器里 `UIWindow`、`UILabel` 这些就有补全了 |
| `esbuild` | 把你的 JS 打成一个文件 |
| `typescript` | 类型检查 |

```bash
npm run check
```

**效果**：没有输出，就是没问题。把 `weight: 'semibold'` 改成 `'semibld'` 再跑，它会告诉你：

```
src/main.js(12,46): error TS2820: Type '"semibld"' is not assignable to
type 'UIFontWeight | undefined'. Did you mean '"semibold"'?
```

类型检查是第一道防线，很多错**只有它查得出来**——属性名拼错了运行时不会报（见[原生类](../api/native-classes.md)），所以别跳过这一步。

## 3. 生成工程

```bash
npm run ios
```

**效果**：项目里多出一个 `ios/` 目录，里面有 `MyApp.xcodeproj`。终端最后几行是：

```
Generated ios (runtime: framework)
Capability packages: none (core only)
…
Created project at …/my-app/ios/MyApp.xcodeproj
```

这条命令是三步串起来的，要接进自己的流程可以分开调：

```bash
# 1. 生成 ios/：启动壳、工程描述、资源，以及预编译的运行时
npx nacre generate .

# 2. 打包 JS → ios/JS/main.js
npm run build

# 3. 把工程描述变成 Xcode 工程
(cd ios && xcodegen generate)
```

## 4. 跑起来

用 Xcode：

```bash
open ios/MyApp.xcodeproj
```

**效果**：Xcode 打开工程。顶上选一个模拟器，点运行。模拟器上屏幕中间显示「你好」，Xcode 的控制台里打出 `[JS][log] 起来了`。（命令行那条路是实测的，在 Xcode 里点运行这一步未在模拟器验证。）

不开 Xcode、全用命令行也行。先要有一个开着的模拟器，然后：

```bash
xcodebuild -project ios/MyApp.xcodeproj -scheme App -sdk iphonesimulator \
  -destination 'generic/platform=iOS Simulator' -derivedDataPath ios/build -quiet build
```

```bash
xcrun simctl install booted ios/build/Build/Products/Debug-iphonesimulator/MyApp.app
```

```bash
xcrun simctl launch --console-pty booted com.example.myapp
```

**效果**：第一条编译，没有 `error` 就是成功（会打两行以 `[MT]` 开头的提示，可以不管）；第二条装到开着的那个模拟器上；第三条启动 App，并把它的输出接到终端：

```
[nacre] V8 14.9.207.39 initialized in 9.1 ms, context ready in 14.3 ms
[nacre] builtin script ready in 32.0 ms (40 parts)
[nacre] main.js finished in 0.4 ms
[JS][log] 起来了
```

按 Ctrl+C 退出。最后一条命令里的 `com.example.myapp` 是 `nacre.config.json` 里写的 `bundleId`。

## 5. 改一行再跑

把 `src/main.js` 里的 `'你好'` 改成别的，然后：

```bash
npm run build
```

再在 Xcode 里点一次运行（或者重跑第 4 步的三条命令）。

**效果**：模拟器上的文字跟着变。

只改 JS 时不用重新生成工程，`npm run build` 就够。但目前**每次都要重新编译、重装、重启 App**——没有热重载。改了 `nacre.config.json`、换了图标、装了或者卸了能力包，要重新跑 `npm run ios`。

## 项目里每样东西是什么

```
my-app/
├─ package.json           依赖和打包命令
├─ nacre.config.json      App 的名字和包名
├─ icon.png               App 图标（可选）
├─ launch.png             启动屏上的图（可选）
├─ src/main.js            JS 入口
├─ assets/                图片等资源（可选）
└─ ios/                   ← 生成的，不要手改，也不要提交
```

`icon.png` 是桌面上的 App 图标：一张 1024×1024 像素的 PNG，文件名固定，放在项目根目录。没放时 App 照常能跑，桌面上是系统的占位图标。另一种图标文件和各项细节见[配置 App 的「App 图标」](project-config.md#app-图标)。

`launch.png` 是启动屏正中的那张图。启动屏是 App 的界面出现之前系统显示的画面，它的底色写在 `nacre.config.json` 的 `launchScreen` 里。两样都可以不给，见[配置 App 的「启动屏」](project-config.md#启动屏)。

`assets/` 下的文件会被放进 App 包的 `JS/assets/`，JS 里这样用：

```js
const icon = UIImage.imageNamed('JS/assets/icon');
```

**效果**：`assets/icon.png`（以及 `icon@2x.png`、`icon@3x.png`）被加载，系统按屏幕倍率自己挑。详见 [`UIImage`](../api/ui-image.md)。

## 用一个核心里没有的能力

有些能力不在核心里，各是一个单独的包，要用就装。全部的包见[核心和能力包](../api/capabilities.md)。下面以 Keychain（`@nacrejs/keychain`）为例；它不需要权限文案，需要的包还要在 `nacre.config.json` 里写一句，见[配置 App](project-config.md)。

装上：

```bash
npm install -D @nacrejs/keychain
```

`src/main.js` 顶上加一行，让类型进来：

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/keychain" />
```

再跑一次 `npm run ios`，然后照第 4 步跑起来。

**效果**：生成时多一行 `Capability packages: @nacrejs/keychain`，启动日志变成 `… (40 parts + 1 from NacreKeychain)`，JS 里可以用 [`application.keychain`](../api/keychain.md) 了。

要权限文案的包（比如面容 ID 的 `@nacrejs/local-authentication`），装了但没在 `nacre.config.json` 里写那一句的话，生成会停下并告诉你缺什么，什么文件都不动：

```
nacre: @nacrejs/local-authentication needs NSFaceIDUsageDescription in Info.plist: a sentence shown to the user explaining why the app needs this permission. Put it in ios.infoPlist in nacre.config.json
```

**装了哪个包，生成的工程就嵌哪个 framework；没装的，产物里没有它。** 没装的时候 `application.keychain` 这个属性不存在，类型检查也会报——不会出现「写的时候没事、跑起来才发现用不了」。

只认你自己写进 `package.json` 的包。某个库依赖了一个能力包，不会让你的 App 悄悄多嵌一个 framework——要用，自己装。

## `ios/` 是生成的，随时可以删掉

`ios/` 整个目录由 `nacre generate` 从 `@nacrejs/ios` 里的启动壳生成。**手改它没有意义**——下次生成就被盖掉。

```bash
rm -rf ios && npm run ios
```

**效果**：`ios/` 重新出现，里面的东西和删之前一样，照常能编、能跑。

所以它不该进版本库。在 `.gitignore` 里加一行：

```
ios/
```

## 打包的硬约束

`package.json` 里 `build` 那条命令有四个参数不能改：

| 参数 | 为什么 |
| --- | --- |
| `--format=iife` | 运行时编译的是 classic script，ESM 的 `import` 会直接抛 |
| `--platform=neutral` | 不能让打包器注入 `process`、`Buffer` 这些 Node 的垫片，运行时里没有它们 |
| 不加 `--minify` | 运行时没有 source map，报错的行号只能靠人去产物里对 |
| `--charset=utf8` | 同上，压成转义序列就没法读了 |

用别的打包器也行，满足这四条即可。这几条也写在 `node_modules/@nacrejs/ios/nacre-ios.json` 里，机器可读。

## 装到真机上

和模拟器的区别只在签名，所以没有一键脚本。大致是：

1. `npm run ios` 生成工程
2. 在 Xcode 里打开 `ios/MyApp.xcodeproj`，在 Signing & Capabilities 里选你的开发者账号
3. 选真机运行

> **注意**：生成的工程里 `ENABLE_DEBUG_DYLIB` 是关的，这是必须的——运行时要 8MB 的主线程栈，而设置栈大小的链接器参数和 Xcode 的 debug dylib 冲突。不要打开它。

要上架的话还有两件事。

**带上第三方声明。** 运行时里编进了 V8 和它依赖的库，你的 App 把 `Nacre.framework` 嵌进去，就也在分发这些代码。它们的许可要求分发时附上声明，全文在 `node_modules/@nacrejs/ios/THIRD-PARTY-NOTICES.md`。通常的做法是在 App 里放一个「致谢」或者「开源许可」页，把它显示出来。

**隐私清单。** App Store 要求声明你的 App 收集什么数据（`PrivacyInfo.xcprivacy` 里的 `NSPrivacyTracking` 和 `NSPrivacyCollectedDataTypes`），这份得你自己写，我们替你填反而是错的。**运行时那部分不用你管**——`Nacre.framework` 自带一份，声明了它自己用到的系统 API。

## 不用 CLI、自己建 Xcode 工程

也可以把 `Nacre.xcframework`（在 `node_modules/@nacrejs/ios/` 下）拖进一个已有的工程。核心里没有的能力各是一个单独的 xcframework，在它自己的包里（比如 `node_modules/@nacrejs/keychain/NacreKeychain.xcframework`），要用哪个就一起拖进去并嵌入——**没嵌的能力，对应的属性就不存在**，比如 `'keychain' in application` 会是 `false`。

另外有三条**必须自己配**的，漏了会出问题：

| 配什么 | 漏了会怎样 |
| --- | --- |
| `Other Linker Flags` 加 `-Wl,-stack_size,0x800000` | 真机上主线程栈只有 1MB，V8 没有余量 |
| `ENABLE_DEBUG_DYLIB` 设成 `NO` | 上面那条链接器直接报错 |
| 把 JS 目录（含 `main.js`）作为**文件夹引用**加进 App 包 | 运行时找不到 `main.js`，启动后一片空白 |

另外启动壳要在 `AppDelegate` 里起运行时：

```swift
import Nacre

let runtime = NacreRuntime()
if let scripts = Bundle.main.url(forResource: "JS", withExtension: nil) {
    runtime.start(withScriptsDirectory: scripts)
}
```

完整的清单在 `node_modules/@nacrejs/ios/` 里：`nacre-ios.json` 是机器可读的那份，启动壳的原本在它旁边的 `template/`。

## 还不能做的

| 想做的事 | 现在怎么样 |
| --- | --- |
| 一条命令编译、装到模拟器并启动 | 没有。生成工程之后的几步要自己跑，或者用 Xcode |
| 不装 XcodeGen | 生成的是 `project.yml`，还要跑一次 `xcodegen` |
| 改一行 JS 立刻看到（热重载） | 每次都要重新打包、重装、重启 |
| Android | 还没开始 |

## 接下来

- [配置 App](project-config.md)：显示名、语言、权限文案、图标、启动屏
- [原生模块](native-modules.md)：把你自己的或者第三方的原生 SDK 接进来给 JS 调
- [API 文档](../api/README.md)：运行时提供的全部能力
- [运行时怎么工作](../api/how-it-works.md)：JS 和界面在同一个线程上，这对所有 API 都成立
- [`application`](../api/application.md)：App 实例、场景、全局错误出口
