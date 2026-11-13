# `@nacre/ios`

Nacre 的 iOS 交付物。**它不是给写 App 的人直接用的，是给 CLI 用的**——CLI 约定一个项目目录，用户在里面写 JS，CLI 从它生成 `ios/`，而这个包就是「要放进那个 `ios/` 里的东西」。

```
packages/ios/
├─ template/              生成的 ios/ 里那些文件的原本：启动壳和图标
├─ nacre-ios.json         宿主工程必须满足的条件，机器可读
├─ Nacre.xcframework/     编译好的运行时（构建产物，不提交）
└─ bin/nacre-ios.js       参考实现的 CLI
```

## 一个 Nacre 项目长什么样

```
<project>/
├─ package.json
├─ nacre.config.json      App 的名字和包名
├─ src/main.js            JS 入口
├─ assets/                图片等资源，会被放进 App 包的 JS/assets/
└─ ios/                   ← 生成的，不进版本库，随时可以删掉重建
```

`nacre.config.json` 现在只有两项是必填的：

```json
{ "name": "Hello", "bundleId": "com.example.hello" }
```

可选：`displayName`、`version`、`buildNumber`、`deploymentTarget`。

## 生成

```bash
node packages/ios/bin/nacre-ios.js generate <项目目录> [--runtime=framework|source]
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

## 这个 CLI 是参考实现，不是产品

它存在的理由有两个：

1. **证明这个包里的东西齐不齐。** `examples/hello/` 整个 `ios/` 都是它生成的，不用手改一行就能跑——跑得起来，说明交付物是完整的。
2. **让模板天天被用一遍。** 验收 App 的 `ios/` 也由它生成，所以模板一旦漂了，当天就会被一千七百多条断言发现。Expo 在这件事上吃过亏：他们的模板能换但不推荐，因为生成器对模板文件有「未文档化的假设」。

真正的 CLI 由别人做。它不需要用我们这个，只需要读同一份 `nacre-ios.json`。

## 还不能做的

| 想做的事 | 现在怎么样 |
| --- | --- |
| 换 App 图标 | 模板里写死了。要换得改 `template/App/Assets.xcassets` |
| 不装 XcodeGen 也能用 | 生成的是 `project.yml`，还要跑一次 `xcodegen`。真正的 CLI 该直接产出 `.xcodeproj` |
| 让宿主 App 把自己的原生代码暴露给 JS | 没有扩展点。这是交付模型里缺的一大块，见[项目说明](../../docs/project.md) |
| 发布到 npm | `private: true`，`Nacre.xcframework` 也还没进包 |

---

← 返回[项目说明](../../docs/project.md) ・ [API 文档](../../docs/api/README.md)
