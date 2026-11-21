# core

两个平台的运行时共用的代码。iOS（`ios/`）和以后的 Android（`android/`）都编它、都带它。

| 目录 | 是什么 | 依赖 |
| --- | --- | --- |
| `engine/` | 引擎：V8 的封装、事件循环、定时器、`TextEncoder` 这类算法 | 只依赖 V8 和 C++ 标准库 |
| `builtin/parts/` | Web 标准那批内置脚本：`fetch`、`URL`、定时器、`crypto`、`Intl`、`WebSocket`、`structuredClone`、`TextEncoder` | 平台提供的原生入口和 `ctx`，见 [builtin/README.md](builtin/README.md) |

共用的是引擎和 Web 标准的实现，**不是 API 的统一**：两个平台的原生类、`application` 这一层各按各平台的事实定。

规矩：

- 这里的代码不认识任何平台：不 `#include` 平台的头，内置脚本里不出现平台的类名。平台相关的东西从平台那一侧交进来（例如 `structuredClone` 认的结构体名单，由平台放进 `ctx.platformCloneClasses`）。
- 改这里的东西，两个平台都要跑一遍完整的验收。
