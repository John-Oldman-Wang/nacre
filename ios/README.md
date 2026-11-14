# Nacre 运行时（iOS）

这个目录是**运行时本身**，它就是交付物 `Nacre.xcframework` 的源。这里没有 App——验收 App 在 [`acceptance/`](../acceptance/)，示例在 `examples/`。

运行时能做什么、怎么用，看 [API 文档](../docs/api/README.md)；桥是怎么搭的，看[实现原理](../docs/internals/README.md)。

## 环境要求

- macOS（Apple Silicon）
- Xcode 26 或更新，并安装 iOS 26 或更新的模拟器（Xcode → Settings → Components）
- XcodeGen：`brew install xcodegen`

已实际验证的组合：Xcode 27.2 + iOS 27.2 模拟器（iPhone Air）、真机 iPhone 14（iOS 27.0.1）。

## 跑验收

```bash
bash ios/scripts/run-sim.sh
```

动了原生代码的话，再用 Release 配置跑一遍：

```bash
bash ios/scripts/run-sim.sh --release
```

**两遍都要过。** 交付出去的 `Nacre.xcframework` 是 Release，而有一类问题只在开了优化之后才出现——比如把对象交成裸指针时没保活，Debug 下那个对象碰巧还在自动释放池里，Release 下已经没了。这条真的咬过一次。

脚本依次做：下载并校验 V8 → 生成运行时工程 → 用 [`@nacre/ios`](../packages/ios/README.md) 的 CLI 生成验收 App 的 `ios/` → 打包验收 JS → 生成 App 工程 → 编译 → 装进模拟器并启动。JS 的 `console` 输出直接显示在终端（Ctrl+C 退出）。

跑示例（引的是预编译的 `Nacre.xcframework`，用户拿到的就是这个）：

```bash
bash ios/scripts/run-sim.sh examples/hello --runtime=framework
```

指定模拟器：

```bash
NACRE_SIM=<模拟器 UDID> bash ios/scripts/run-sim.sh
```

要在 Xcode 里调试，打开验收工程（它把运行时的工程当子工程引进去，改一行 C++ 重新编就生效）：

```bash
bash ios/scripts/fetch-v8.sh                 # 下载预编译 V8 到 Vendor/v8（只需一次）
(cd ios && xcodegen generate)
node packages/ios/bin/nacre-ios.js generate acceptance --runtime=source
bash ios/scripts/build-js.sh acceptance
(cd acceptance/ios && xcodegen generate)
open acceptance/ios/Nacre.xcodeproj
```

## 目录

```
ios/
├─ project.yml              XcodeGen 工程描述，只有一个 framework target
├─ Runtime/
│  ├─ Nacre.h               umbrella header —— **公开面就是它**
│  ├─ NacreRuntime.h/.mm    运行时入口：启动 V8、接线、事件转发
│  ├─ Bridge/               能力暴露，一个能力域一个 .mm（内部）
│  ├─ Engine/               纯 C++，只依赖 V8（内部）
│  └─ Builtin/nacre.js      内置脚本，打进 framework 自己的包
├─ Vendor/v8/               由 fetch-v8.sh 下载，不提交
└─ scripts/
   ├─ fetch-v8.sh             下载并校验 V8
   ├─ build-js.sh             打包某个项目的 JS
   ├─ build-xcframework.sh    构建交付物 Nacre.xcframework
   ├─ check-api.sh            三边符号核对
   └─ run-sim.sh              一键构建并在模拟器运行
```

公开面只有 `Nacre.h` 和它 `#import` 的那些头。加一个公开接口要改两处：umbrella 里写一行，`project.yml` 里把那个头标成 public。详见[项目说明](../docs/project.md)。

## V8

- 版本 14.9.207.39，来自 [NativeScript/v8-buildscripts](https://github.com/NativeScript/v8-buildscripts) 发布的预编译静态库（lite mode，即 jitless）
- 只用 arm64：真机 `Vendor/v8/lib/iphoneos`，模拟器 `Vendor/v8/lib/iphonesimulator`
- 不需要也不能传 `--jitless`：lite mode 已隐含，且该标志是只读的
- `fetch-v8.sh` 用**写死在脚本里的 SHA256** 校验下载内容。不使用 release 自带的 `SHA256SUMS`：校验锚点和被校验文件同源，防不了资产被替换。升级 V8 时要同时更新脚本里的哈希
- 不需要给 V8 预设编译宏：`v8config.h` 自己就能推导出 `V8_TARGET_ARCH_ARM64` 和 `V8_TARGET_OS_IOS`，而决定对象布局的 `V8_COMPRESS_POINTERS`、`V8_ENABLE_SANDBOX` 在这个预编译包里是关闭的，使用方也不定义，两边一致。**换 V8 构建时必须重新核对这两个宏**

## JS 跑在主线程

和 UIKit 同一个线程，所以同步读布局和同步回调天然成立。主线程栈由宿主用 `-Wl,-stack_size,0x800000` 设成 8MB（真机默认 1MB，不够 V8 用）。理由、代价和连带的变化见[项目说明](../docs/project.md)和[实现原理](../docs/internals/runtime.md)。
