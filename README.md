# Nacre

> Node.js for servers, browsers for the web, Nacre for apps.

App 端的 JavaScript 运行时：原生 API 完整暴露给 JS，用原生视图渲染，所有调度都由 JS 完成。先支持 iOS。

## 当前状态

早期版本，已经写得出一个真实的 App。

**JS 现在能做的**：建窗口和页面、导航栈、标签栏和模态、Auto Layout 和 `UIStackView`、滚动和列表（`UICollectionView`）、文字图片颜色和富文本、圆角阴影和 Core Animation、控件和手势、输入框和键盘、深浅色、弹窗和分享、`fetch` / `WebSocket` / `URL`、WebView（含在网页里执行脚本、和网页互发消息、读写 cookie）、本地存储和文件读写、定时器、`crypto`、`performance`、按地区格式化数字和日期。JS 能碰到的原生类一共 126 个，全部列在 [API 文档](docs/api/README.md)里。

**核心之外的能力各是一个包，装了才有**：钥匙串、面容 ID、跟踪授权、选图和存图、拍照、定位、选联系人、本地通知，见[核心和能力包](docs/api/capabilities.md)。你自己的和第三方的原生 SDK 通过[原生模块](docs/guides/native-modules.md)接进来。

**还没有的**：JS 子类化原生类（所以覆写 `drawRect:` 这类做不到）、改一行 JS 立刻看到的热重载、没列在 API 文档里的 iOS 类、Android。

## 开始用

```bash
npm install -D @nacrejs/ios @nacrejs/cli @nacrejs/types
```

| 包 | 给什么 |
| --- | --- |
| `@nacrejs/ios` | 编译好的运行时、启动壳 |
| `@nacrejs/cli` | 命令 `nacre`：从你的项目生成 iOS 工程 |
| `@nacrejs/types` | 写代码时的类型 |

从零建一个 App 跑起来，照着[《建一个自己的 App》](docs/guides/your-own-app.md)走一遍。改运行时本身看 [ios/README.md](ios/README.md)。

## 硬性约束

原生层不调度任何 API，只通过 V8 把能力暴露给 JS。原生层只允许三类代码：

- **启动壳**：只负责启动运行时，并把系统事件转发给 JS
- **运行时**：V8 初始化、事件循环、内存管理
- **能力暴露**：把 iOS API 暴露给 JS 的桥接代码

界面创建、页面跳转、网络请求、数据处理等任何决定「App 做什么」的代码，都必须在 JS 里。

## 目录

| 目录 | 内容 | 交付？ |
| --- | --- | --- |
| `docs/` | [项目说明](docs/project.md)、[指南](docs/guides/README.md)、[API 文档](docs/api/README.md)、[实现原理](docs/internals/README.md) | 指南和 API 文档交付 |
| `ios/` | iOS 运行时源码，也就是 `Nacre.xcframework` 的源 | **是** |
| `packages/types/` | TypeScript 类型定义（`@nacrejs/types`） | **是** |
| `packages/ios/` | [`@nacrejs/ios`](packages/ios/README.md)：模板 + 清单 + xcframework | **是** |
| `packages/cli/` | [`@nacrejs/cli`](packages/cli/README.md)：命令 `nacre` | **是** |
| `packages/<能力>/` | 能力包，一个能力一个目录，比如 `packages/keychain/` | **是** |
| `acceptance/` | 验收套件：约六千条断言，和跑它们的 App | 否 |
| `scripts/` | 发布 npm 包用的脚本 | 否 |
| `examples/hello/` | 最小示例 | **是** |
| `android/` | 以后支持 Android 时添加 | |

## 第一阶段约束

- 只支持 iOS 26+、iPhone、arm64（真机和 Apple Silicon 模拟器），Xcode 26+
- 渲染目标是 UIKit，按 iOS 原生方式排版。**DOM、CSS、flexbox 不是必须的**——运行时不提供，要的话在 JS 层自己做
- JS 引擎用 V8（lite mode，即 jitless）；**JS 跑在主线程**，和 UIKit 同线程，所以同步读布局和同步回调天然成立
- JS 在构建时打进 App Bundle，不通过 HTTP 加载
- 模块化和打包交给社区工具，运行时只负责执行 JS 文件
- 插槽、开发模式、热重载暂不考虑。命令行工具在 [`@nacrejs/cli`](packages/cli/README.md)，现在只有生成工程这一个命令

## 许可

源码公开，许可是 [FSL-1.1-MIT](LICENSE.md)（Functional Source License）：

- 可以用 Nacre 做任何事，包括做商业 App 上架。
- 不可以把 Nacre 本身做成和它竞争的商业产品或服务。
- 每个版本发布满两年后，自动变成 MIT。

运行时里编进了 V8 和它依赖的库，它们各有各的许可，见[第三方声明](packages/ios/THIRD-PARTY-NOTICES.md)。用 Nacre 做的 App 也在分发这些代码，要把那份声明带上。
