# Android 的运行时

← [实现原理](README.md)

Android 这一侧现在只有最小的壳：引擎能起来、能执行一个 JS、`console` 的输出进 logcat。方向和顺序见 [`project.md` 第 4 节](../project.md#4-android2026-11-21-定的方向)。

## 目录

```
android/
├─ settings.gradle.kts、build.gradle.kts、gradle.properties、gradlew   Gradle 工程（用仓库里的 wrapper）
├─ runtime/      运行时本身，以后打成交付的库
│  └─ src/main/
│     ├─ cpp/CMakeLists.txt   编 core/engine/ 加上 JNI，链 V8
│     ├─ cpp/NacreJni.cpp     Kotlin 经 JNI 调到这里，再交给 core/engine
│     └─ kotlin/nacre/runtime/NacreRuntime.kt   Kotlin 这一侧的入口
├─ shell/        开发用的最小壳：一个页面，启动时建运行时、执行包里的 assets/main.js
├─ scripts/
│  ├─ fetch-v8.sh     下载预编译的 V8，放到 Vendor/v8（不提交）
│  └─ run-device.sh   在连着的真机上编、装、打开壳，按 logcat 判定
└─ Vendor/       下载的东西，不提交
```

`shell/` 只是现在用来验运行时的。以后有了 CLI，它挪进 CLI 的模板，和 iOS 的启动壳一样由 CLI 放进项目的 `android/`。

## V8：用 NativeScript 的预编译库

NativeScript 的 v8-buildscripts 每次发布都带 Android 的四种架构，我们只取 arm64-v8a。用的是和 iOS **同一次构建**（`v8-14.9.207.39-7`），两端的 V8 源码和补丁完全相同。预期的哈希写死在 `fetch-v8.sh` 里，理由和 iOS 那份一样。

这份 Android 包和 iOS 包的打法不一样（照它的 `scripts/matrix/build-android.sh`）：

| | Android 这份 | iOS 那份 |
| --- | --- | --- |
| JIT | 开着，完整的编译器 | 关着（lite mode） |
| 指针压缩 | **开着** | 关着 |
| WebAssembly | 开 | 关 |
| 国际化（ICU） | 不带 | 不带 |
| 沙箱 | 关 | 关 |

两件要对上的事：

- **NDK 必须是 r29。** 发布说明写明它是用 r29 编的。V8 和我们的代码静态链接同一份 libc++，大版本不同 ABI 就对不上。两个模块的 `ndkVersion` 都写死成 `29.0.14206865`。
- **编译宏要和指针压缩一致。** 构建脚本里没写这一项，按 V8 的默认，arm64 上是开的；库里定义了 `v8::internal::MainCage::base_`，证实是开的。所以 `CMakeLists.txt` 定义 `V8_COMPRESS_POINTERS` 和 `V8_31BIT_SMIS_ON_64BIT_ARCH`。对不上时 V8 在初始化时就会报 `Embedder-vs-V8 build configuration mismatch`，不会悄悄出错。iOS 那份是关的，所以 iOS 一个也不定义（见[运行时](runtime.md)）。

V8 不带 RTTI，所以和 iOS 一样加 `-fno-rtti`。

## JNI 这一层

- **字符串用字节数组过 JNI。** 脚本名和源码在 Kotlin 那边编成 UTF-8 字节，C++ 原样当 `std::string`。不用 `GetStringUTFChars`：它给的是 Java 的「改良 UTF-8」，emoji 这类四字节的字符会被拆成两个代理项。
- **logcat 一条最多约 4 KB。** `console` 的输出按行切开写，一行超过 4000 字节再切，切点不落在 UTF-8 的多字节字符中间。级别对应：`debug` → D，`log` 和 `info` → I，`warn` → W，`error` → E，标签都是 `Nacre`。
- **引擎只能在主线程用。** `NacreRuntime` 的每个方法先查当前线程是不是主线程，不是就抛。

## 构建

- Android Gradle 插件 9.5.2 自带 Kotlin 编译，不用另外加 Kotlin 插件。
- 第一次编译时，插件会自己装它默认要的 build-tools 36。
- **两个模块都要写 `ndkVersion`。** 只在 `runtime` 里写时，Release 包里的 `libnacre.so` 没去掉调试符号，有 71 MB：打包时去符号的工具从 `shell` 的 NDK 里找，`shell` 没写版本就找不到，也不报错。两边都写之后是 45 MB。
- 45 MB 里大部分是 V8：这份带完整的 JIT 和 WebAssembly。iOS 那份是 lite mode、不带 WebAssembly。要不要换一份更小的构建，以后再量。

## 验收

`bash android/scripts/run-device.sh`（加 `--release` 是 Release）。壳里的 `main.js` 打出 5 行，覆盖 `console` 的四个级别、对象的格式化，还有严格模式；脚本在 20 秒内从 logcat 里找齐这 5 行就是通过，缺哪行就列出来、退出码 1。

2026-11-23 在 Pixel 6（Android 17，API 37）上，Debug 和 Release 都通过。
