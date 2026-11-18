# `@nacrejs/cli`

Nacre 的命令行工具。命令叫 `nacre`，现在只有一个子命令：从一个 Nacre 项目生成它的 `ios/`。

```bash
npx nacre generate .
```

**效果**：项目目录下多出（或者整个重建）一个 `ios/`，里面是启动壳、运行时、项目装了的能力包、图标和启动屏，以及一份 XcodeGen 的工程描述 `project.yml`。

生成的 `ios/` 不进版本库，随时可以删掉重建，所以不要手改它里面的东西。

## 它要项目里装着什么

这个包里**只有命令**，没有任何要放进 `ios/` 的东西。运行时、启动壳和清单都在 [`@nacrejs/ios`](../ios/README.md) 里，命令去项目的 `node_modules/@nacrejs/ios` 里找：

```bash
npm install @nacrejs/ios @nacrejs/cli @nacrejs/types
```

| 包 | 给什么 |
| --- | --- |
| `@nacrejs/ios` | 运行时、启动壳、清单 |
| `@nacrejs/cli` | `nacre` 这个命令 |
| `@nacrejs/types` | 写代码时的类型 |

能力包（钥匙串、定位这些）装了就会被嵌进工程，没装就没有，不用另外声明。

## 用法

```
nacre generate <项目目录> [--runtime=framework|source] [--runtime-path=<目录>]
```

| 选项 | 含义 |
| --- | --- |
| `--runtime=framework` | 默认。工程引 `@nacrejs/ios` 里预编译的 `Nacre.xcframework` |
| `--runtime=source` | 工程引运行时的 Xcode 工程当子工程。改运行时的人用，改一行 C++ 重新编就生效 |
| `--runtime-path=<目录>` | `source` 方式下运行时的源码在哪。在这个仓库里可以不写，默认是仓库的 `ios/` |

生成之后还要两步：打包 JS（写进 `ios/JS/main.js`），然后在 `ios/` 里跑 `xcodegen generate`。

项目的配置（名字、包名、语言、权限文案、图标、启动屏）写在 `nacre.config.json` 里，见[配置 App](../../docs/guides/project-config.md)。

## 出错时

命令的输出是英文的，报错以 `nacre:` 开头。**有错就在改动任何文件之前停下。**

| 情况 | 报错 |
| --- | --- |
| 项目没装 `@nacrejs/ios` | `@nacrejs/ios is not installed in <项目目录>. …  Run: npm install @nacrejs/ios` |
| `@nacrejs/ios` 的清单是这个命令不认识的格式 | `the installed @nacrejs/ios uses manifest version 2, but this @nacrejs/cli reads manifest version 1. Update @nacrejs/cli and @nacrejs/ios so that they match` |
| 包里没有预编译的运行时 | `@nacrejs/ios: Nacre.xcframework is missing from <目录>. The package is incomplete; reinstall it` |
| 写了依赖但没装 | `dependency <包名> is not installed. Run npm install in the project first` |
| 配置写错 | 见[配置 App](../../docs/guides/project-config.md#写错时的报错)里的那张表 |

## 清单的格式版本

`@nacrejs/ios` 的清单 `nacre-ios.json` 是它和这个命令之间的约定，里面有一项 `manifestVersion`。这个命令现在读得懂的是 `1`。清单的格式以后变了，旧的命令会停下来明说读不了，而不是生成一个坏的工程。

## 测试

```bash
cd packages/cli && npm test
```

用例在 `test/` 下：`split.test.js`（它怎么找 `@nacrejs/ios`、清单的格式版本、用法和输出的语言）、`generate.test.js`（工程配置和能力包）、`icon.test.js`（App 图标）、`launch.test.js`（启动屏）。每条在临时目录里建一个最小的项目，跑一次命令，看生成的文件和报错。改了命令就跑。

## 还不能做的

| 想做的事 | 现在怎么样 |
| --- | --- |
| 建一个新项目 | 没有这个命令，照[《建一个自己的 App》](../../docs/guides/your-own-app.md)手动建 |
| 一条命令打包 JS、生成工程、编译、装到模拟器 | 没有。生成之后的几步要自己跑 |
| 生成 Android 的工程 | 没有，Nacre 现在只支持 iOS |
