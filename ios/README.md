# Nacre for iOS

当前进度：**启动层**。App 启动（空白页面）→ 在独立的 JS 线程上初始化 V8 → 准备全局对象（`console`）→ 加载并执行 `JS/main.js`。界面要到下一步才由 JS 创建。

## 环境要求

- macOS（Apple Silicon）
- Xcode 26 或更新，并安装 iOS 26 或更新的模拟器（Xcode → Settings → Components）
- XcodeGen：`brew install xcodegen`

已实际验证的组合：Xcode 27.2 + iOS 27.2 模拟器（iPhone 18 Pro）。

> Xcode 27 起不再附带 `Simulator.app`，模拟器窗口改由 `DeviceHub.app` 承担。`run-sim.sh` 对两者都兼容，找不到也不影响运行（`simctl` 不需要 GUI）。

## 运行

```bash
cd ios
bash scripts/run-sim.sh
```

脚本依次执行：下载并校验 V8 → 生成 Xcode 工程 → 编译 → 安装到模拟器并启动。JS 的 `console` 输出直接显示在终端里（按 Ctrl+C 退出）。

脚本默认挑列表里第一台可用的 iPhone 模拟器。要指定设备：

```bash
NACRE_SIM=<模拟器 UDID> bash scripts/run-sim.sh
```

也可以分步执行，用 Xcode 调试：

```bash
bash scripts/fetch-v8.sh   # 下载预编译 V8 到 Vendor/v8（只需一次）
xcodegen generate          # 根据 project.yml 生成 Nacre.xcodeproj
open Nacre.xcodeproj       # 在 Xcode 中选择 iPhone 模拟器运行
```

在 Xcode 中运行时，JS 输出出现在 Xcode 控制台。

## 目录

```
ios/
├─ project.yml              XcodeGen 工程描述（Nacre.xcodeproj 由它生成，不提交）
├─ App/                     iOS 壳：AppDelegate、SceneDelegate、空白根页面
├─ Runtime/
│  ├─ NacreRuntime.h/.mm    运行时入口（ObjC++）：创建 JS 线程、注入自动释放池、
│  │                        加载 main.js、输出日志
│  └─ Engine/               纯 C++，只依赖 V8
│     ├─ Engine.h/.cpp      V8 初始化、Isolate/Context、全局对象、执行脚本、
│     │                     异常报告、未处理的 Promise 拒绝
│     └─ JSThread.h/.cpp    JS 专用线程（8MB 栈）和任务队列
├─ JS/                      打进 App Bundle 的脚本
│  └─ main.js
└─ scripts/
   ├─ fetch-v8.sh           下载并校验 V8
   └─ run-sim.sh            一键构建并在模拟器运行
```

## V8

- 版本 14.9.207.39，来自 [NativeScript/v8-buildscripts](https://github.com/NativeScript/v8-buildscripts) 发布的预编译静态库（lite mode，即 jitless）
- 只用 arm64：真机 `Vendor/v8/lib/iphoneos`，模拟器 `Vendor/v8/lib/iphonesimulator`
- 不需要也不能传 `--jitless`：lite mode 已隐含，且该标志是只读的
- `fetch-v8.sh` 用**写死在脚本里的 SHA256** 校验下载内容。不使用 release 自带的 `SHA256SUMS`：校验锚点和被校验文件同源，防不了资产被替换。升级 V8 时要同时更新脚本里的哈希
- 不需要给 V8 预设编译宏：`v8config.h` 自己就能推导出 `V8_TARGET_ARCH_ARM64` 和 `V8_TARGET_OS_IOS`，而决定对象布局的 `V8_COMPRESS_POINTERS`、`V8_ENABLE_SANDBOX` 在这个预编译包里是关闭的，使用方也不定义，两边一致。**换 V8 构建时必须重新核对这两个宏**

## JS 线程

- 独立 pthread，8MB 栈（iOS 子线程默认只有 512KB，V8 按约 1MB 计算栈上限）
- 裸任务队列，不挂 run loop。判据和理由见[项目说明](../docs/project.md)
- 每一轮任务（任务本身 + V8 消息循环）由 iOS 层包一个 `@autoreleasepool`

## 全局对象

| 名称 | 说明 |
| --- | --- |
| `globalThis` | V8 自带的全局对象和 ECMAScript 标准库 |
| `console.log / info / warn / error / debug` | 输出到 stdout 和系统日志 |

`console` 的格式化分三层，**保证永不向 JS 抛异常**：

1. 按类型分发，不执行任何用户代码：`undefined`、`null`、布尔、数字（区分 `-0`）、BigInt（带 `n` 后缀）、字符串（顶层不加引号）、`Symbol(描述)`、`[Function: 名字]`、Error 打调用栈
2. 其余对象和数组走 `JSON.stringify`
3. 上面都失败（循环引用、抛异常的 getter 或 `toJSON`）则退回字符串转换，再失败打 `<unprintable>`

未处理的 Promise 拒绝会在微任务队列排空后输出 `Uncaught (in promise) …`；在那之前补上的 handler 不会误报。
