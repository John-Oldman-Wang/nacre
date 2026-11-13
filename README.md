# Nacre

> Node.js for servers, browsers for the web, Nacre for apps.

App 端的 JavaScript 运行时：原生 API 完整暴露给 JS，用原生视图渲染，所有调度都由 JS 完成。先支持 iOS。

## 当前状态

早期开发，尚不可用。

仓库里是一个**没有具体业务的 iOS App**，用来逐项覆盖常见 App 所需的功能；这个 App 里的运行时就是 Nacre。

已完成：App 启动 → 在独立的 JS 线程上初始化 V8 → 提供全局 `console` → 执行打进 App Bundle 的 `main.js`。运行方式见 [ios/README.md](ios/README.md)。

## 硬性约束

原生层不调度任何 API，只通过 V8 把能力暴露给 JS。原生层只允许三类代码：

- **启动壳**：只负责启动运行时，并把系统事件转发给 JS
- **运行时**：V8 初始化、JS 线程、线程切换、内存管理
- **能力暴露**：把 iOS API 暴露给 JS 的桥接代码

界面创建、页面跳转、网络请求、数据处理等任何决定「App 做什么」的代码，都必须在 JS 里。

## 目录

| 目录 | 内容 | 交付？ |
| --- | --- | --- |
| `docs/` | [项目说明](docs/project.md)、[API 文档](docs/api/README.md)、[实现原理](docs/internals/README.md) | API 文档交付 |
| `ios/` | iOS 运行时源码，也就是 `Nacre.xcframework` 的源 | **是** |
| `packages/types/` | TypeScript 类型定义（`@nacre/types`） | **是** |
| `packages/ios/` | `@nacre/ios`：模板 + 清单 + xcframework（还没做） | **是** |
| `acceptance/` | 验收套件：一千七百多条断言，和跑它们的 App | 否 |
| `examples/` | 示例 App（还没做） | **是** |
| `android/` | 以后支持 Android 时添加 | |

## 第一阶段约束

- 只支持 iOS 26+、iPhone、arm64（真机和 Apple Silicon 模拟器），Xcode 26+
- 渲染目标是 UIKit，按 iOS 原生方式排版。**DOM、CSS、flexbox 不是必须的**——运行时不提供，要的话在 JS 层自己做
- JS 引擎用 V8（lite mode，即 jitless）
- JS 在构建时打进 App Bundle，不通过 HTTP 加载
- 模块化和打包交给社区工具，运行时只负责执行 JS 文件
- CLI、插槽、开发模式等暂不考虑
