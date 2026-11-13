# Nacre

> Node.js for servers, browsers for the web, Nacre for apps.

App 端的 JavaScript 运行时：原生 API 完整暴露给 JS，用原生视图渲染，所有调度都由 JS 完成。先支持 iOS。

## 当前状态

早期开发，**还没发布到 npm**，但已经写得出一个真实的 App。

仓库里是一个**没有具体业务的 iOS App**（`acceptance/`），用来逐项覆盖常见 App 所需的功能；这个 App 里的运行时就是 Nacre。

**JS 现在能做的**：建窗口和页面、导航栈和模态、Auto Layout 和 `UIStackView`、滚动、文字图片颜色、圆角阴影和 Core Animation、控件事件和点按长按手势、输入框和键盘、深浅色、`fetch` / `WebSocket` / `URL`、WebView（含在网页里执行脚本、和网页互发消息、读写 cookie）、本地存储 / 文件读写 / Keychain、定时器、`crypto`、`performance`。JS 能碰到的类一共 64 个，全部列在 [API 文档](docs/api/README.md)里。

**还没有的**：可复用的列表（`UITableView` / `UICollectionView`）、JS 子类化原生类（所以覆写 `drawRect:`、页面生命周期还做不到）、从 SDK 头文件自动生成绑定（所以没列在 API 文档里的 iOS 类，JS 拿不到）、宿主 App 把自己的原生 SDK 暴露给 JS 的扩展点。

要自己建一个 App 跑起来，照着[《建一个自己的 App》](docs/guides/your-own-app.md)走一遍。改运行时本身看 [ios/README.md](ios/README.md)。

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
| `packages/types/` | TypeScript 类型定义（`@nacre/types`） | **是** |
| `packages/ios/` | [`@nacre/ios`](packages/ios/README.md)：模板 + 清单 + CLI + xcframework | **是** |
| `acceptance/` | 验收套件：一千七百多条断言，和跑它们的 App | 否 |
| `examples/hello/` | 最小示例 | **是** |
| `android/` | 以后支持 Android 时添加 | |

## 第一阶段约束

- 只支持 iOS 26+、iPhone、arm64（真机和 Apple Silicon 模拟器），Xcode 26+
- 渲染目标是 UIKit，按 iOS 原生方式排版。**DOM、CSS、flexbox 不是必须的**——运行时不提供，要的话在 JS 层自己做
- JS 引擎用 V8（lite mode，即 jitless）；**JS 跑在主线程**，和 UIKit 同线程，所以同步读布局和同步回调天然成立
- JS 在构建时打进 App Bundle，不通过 HTTP 加载
- 模块化和打包交给社区工具，运行时只负责执行 JS 文件
- 插槽、开发模式、热重载暂不考虑。CLI 有一个[参考实现](packages/ios/README.md)，真正的 CLI 由别人做，它只需要读同一份 `nacre-ios.json`
