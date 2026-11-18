# `@nacrejs/app-tracking-transparency`

Nacre 的跟踪授权和广告标识：`ATTrackingManager` 和 `ASIdentifierManager`，对应系统的 AppTrackingTransparency 和 AdSupport 两个框架。**装了才有这两个类。**

```
packages/app-tracking-transparency/
├─ index.d.ts                                 类型：两个类和授权状态
├─ nacre-ios.json                             清单：framework 叫什么、要项目写哪一句权限文案
└─ NacreAppTrackingTransparency.xcframework/  预编译的 framework（构建产物，不提交）
```

源码不在这里，在 `ios/Capabilities/AppTrackingTransparency/`：`ios/` 下是源码，`packages/` 下是交付出去的东西。

## 怎么用

见 [API 文档](../../docs/api/app-tracking-transparency.md)。三步：

1. 装这个包。
2. 在 `nacre.config.json` 的 `ios.infoPlist` 里写 `NSUserTrackingUsageDescription`，内容是显示在系统提示框里的那句话。
3. 在入口文件顶上加一行 `/// <reference types="@nacrejs/app-tracking-transparency" />`。

## 它要项目写什么

清单里声明了 `requires.infoPlist: ["NSUserTrackingUsageDescription"]`。装了这个包而 `nacre.config.json` 里没写这一句，生成工程时就报错并点名这个键。

文案由项目写，包里不带：为什么这个 App 要跟踪用户，只有写 App 的人知道，而且要按 App 支持的语言各写一句。

## 没装的时候

| | |
| --- | --- |
| 生成的工程 | 不嵌 `NacreAppTrackingTransparency.framework`，App 不链接 AppTrackingTransparency 和 AdSupport |
| 运行时 | 全局没有 `ATTrackingManager` 和 `ASIdentifierManager` |
| 类型检查 | 用到这两个名字报 `Cannot find name` |

这张表里的三行**未在模拟器验证**；机制和 `@nacrejs/keychain` 相同，那边三行都是跑出来的。

---

← 返回[项目说明](../../docs/project.md) ・ [能力包是怎么搭的](../../docs/internals/capabilities.md) ・ [这个包的实现原理](../../docs/internals/app-tracking-transparency.md)
