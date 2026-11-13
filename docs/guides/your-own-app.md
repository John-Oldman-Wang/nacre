# 建一个自己的 App

从零建一个用 Nacre 的 iOS App：三个文件，跑一条命令，模拟器上就能看到。

> **注意**：Nacre 还没发布到 npm，所以这一篇里的依赖都指向你 clone 下来的那份仓库。等发布之后，那几行换成普通的包名就行，别的不变。

## 需要什么

| | |
| --- | --- |
| macOS | Apple Silicon |
| Xcode | 26 或更新，并装一个 iOS 26 或更新的模拟器（Xcode → Settings → Components） |
| [XcodeGen](https://github.com/yonaskolb/XcodeGen) | `brew install xcodegen` |
| Node | 20 或更新 |

## 1. 拿到 Nacre

```bash
git clone <Nacre 仓库地址> nacre
```

**效果**：得到一个 `nacre/` 目录。下面假设你的项目和它并排放。

## 2. 建项目目录

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
    "check": "tsc --noEmit"
  },
  "devDependencies": {
    "@nacre/types": "file:../nacre/packages/types",
    "esbuild": "0.28.2",
    "typescript": "5.9.3"
  }
}
```

`build` 那一行的四个参数不能改，见[打包的硬约束](#打包的硬约束)。

`nacre.config.json`：

```json
{
  "name": "MyApp",
  "bundleId": "com.example.myapp"
}
```

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
/// <reference types="@nacre/types" />

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

## 3. 装依赖

```bash
npm install
```

**效果**：`node_modules/` 里有 `@nacre/types`、`esbuild` 和 `typescript`。类型装上之后，编辑器里 `UIWindow`、`UILabel` 这些就有补全了。

```bash
npm run check
```

**效果**：没有输出，就是没问题。把 `weight: 'semibold'` 改成 `'semibld'` 再跑，它会告诉你：

```
src/main.js(12,46): error TS2820: Type '"semibld"' is not assignable to
type 'UIFontWeight | undefined'. Did you mean '"semibold"'?
```

类型检查是第一道防线，很多错**只有它查得出来**——属性名拼错了运行时不会报（见[原生类](../api/native-classes.md)），所以别跳过这一步。

## 4. 跑起来

```bash
bash ../nacre/ios/scripts/run-sim.sh "$PWD" --runtime=framework
```

**效果**：模拟器打开，屏幕中间显示「你好」，终端里打出 `[JS][log] 起来了`。按 Ctrl+C 退出。

第一次会慢几分钟——它要下载 V8，还要把运行时编译成 `Nacre.xcframework`。之后就只编译你的 App。

指定模拟器：

```bash
NACRE_SIM=<模拟器 UDID> bash ../nacre/ios/scripts/run-sim.sh "$PWD" --runtime=framework
```

## 5. 改一行再跑

把 `src/main.js` 里的 `'你好'` 改成别的，再跑一次第 4 步那条命令。

**效果**：模拟器上的文字跟着变。

改 JS 不需要重新编译原生代码，但目前**每次都要重新打包、重装、重启 App**——没有热重载。

## 项目里每样东西是什么

```
my-app/
├─ package.json           依赖和打包命令
├─ nacre.config.json      App 的名字和包名
├─ src/main.js            JS 入口
├─ assets/                图片等资源（可选）
└─ ios/                   ← 生成的，不要手改，也不要提交
```

`assets/` 下的文件会被放进 App 包的 `JS/assets/`，JS 里这样用：

```js
const icon = UIImage.imageNamed('JS/assets/icon');
```

**效果**：`assets/icon.png`（以及 `icon@2x.png`、`icon@3x.png`）被加载，系统按屏幕倍率自己挑。详见 [`UIImage`](../api/ui-image.md)。

## `ios/` 是生成的，随时可以删掉

`ios/` 整个目录由 Nacre 的 CLI 从模板生成。**手改它没有意义**——下次生成就被盖掉。

```bash
rm -rf ios && bash ../nacre/ios/scripts/run-sim.sh "$PWD" --runtime=framework
```

**效果**：和没删一样，照常跑起来。

所以它不该进版本库。在 `.gitignore` 里加一行：

```
ios/
```

## 那条命令做了什么

它不是黑盒，四步而已。要接进自己的流程可以分开调。

```bash
# 1. 生成 ios/：启动壳、工程描述、资源，以及预编译的运行时
node ../nacre/packages/ios/bin/nacre-ios.js generate "$PWD" --runtime=framework

# 2. 打包 JS → ios/JS/main.js
npm run build

# 3. 生成 Xcode 工程
(cd ios && xcodegen generate)

# 4. 编译、安装、启动（或者直接 open ios/MyApp.xcodeproj 用 Xcode 跑）
```

第 4 步也可以在 Xcode 里做：

```bash
open ios/MyApp.xcodeproj
```

**效果**：Xcode 打开工程，选一个模拟器点运行就行。JS 的 `console` 输出出现在 Xcode 的控制台里。

## 打包的硬约束

`package.json` 里 `build` 那条命令有四个参数不能改：

| 参数 | 为什么 |
| --- | --- |
| `--format=iife` | 运行时编译的是 classic script，ESM 的 `import` 会直接抛 |
| `--platform=neutral` | 不能让打包器注入 `process`、`Buffer` 这些 Node 的垫片，运行时里没有它们 |
| 不加 `--minify` | 运行时没有 source map，报错的行号只能靠人去产物里对 |
| `--charset=utf8` | 同上，压成转义序列就没法读了 |

用别的打包器也行，满足这四条即可。这几条也写在 `packages/ios/nacre-ios.json` 里，机器可读。

## 装到真机上

和模拟器的区别只在签名，所以没有一键脚本。大致是：

1. 按上面「那条命令做了什么」的 1–3 步生成工程
2. 在 Xcode 里打开 `ios/MyApp.xcodeproj`，在 Signing & Capabilities 里选你的开发者账号
3. 选真机运行

> **注意**：生成的工程里 `ENABLE_DEBUG_DYLIB` 是关的，这是必须的——运行时要 8MB 的主线程栈，而设置栈大小的链接器参数和 Xcode 的 debug dylib 冲突。不要打开它。

要上架的话还有一件事：App Store 要求声明你的 App 收集什么数据（`PrivacyInfo.xcprivacy` 里的 `NSPrivacyTracking` 和 `NSPrivacyCollectedDataTypes`），这份得你自己写，我们替你填反而是错的。**运行时那部分不用你管**——`Nacre.framework` 自带一份，声明了它自己用到的系统 API。

## 不用 CLI、自己建 Xcode 工程

也可以把 `Nacre.xcframework` 拖进一个已有的工程。那样有三条**必须自己配**的，漏了会出问题：

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

完整的清单在 [`packages/ios/`](../../packages/ios/README.md) 里：`nacre-ios.json` 是机器可读的那份，模板在它旁边的 `template/`。

## 还不能做的

| 想做的事 | 现在怎么样 |
| --- | --- |
| `npm i nacre` 就开工 | 还没发布到 npm，依赖要指向 clone 下来的仓库 |
| 不装 XcodeGen | 生成的是 `project.yml`，还要跑一次 `xcodegen` |
| 换 App 图标 | 模板里写死了 |
| 改一行 JS 立刻看到（热重载） | 每次都要重新打包、重装、重启 |
| 把自己的原生 SDK（推送、风控、支付）暴露给 JS | 没有扩展点 |
| Android | 还没开始 |

## 接下来

- [API 文档](../api/README.md)：运行时提供的全部能力
- [运行时怎么工作](../api/how-it-works.md)：JS 和界面在同一个线程上，这对所有 API 都成立
- [`application`](../api/application.md)：App 实例、场景、全局错误出口
