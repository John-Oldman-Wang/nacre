# `@nacrejs/user-notifications`

Nacre 的通知能力：发本地通知，App 在前台时收到通知、用户点了通知的事件。**装了才有 `UNUserNotificationCenter`。**

```
packages/user-notifications/
├─ index.d.ts                            类型：UNUserNotificationCenter，和内容、触发器、请求那一组值
├─ nacre-ios.json                        清单：这是一个能力包、它的 framework 叫什么
└─ NacreUserNotifications.xcframework/   预编译的 framework（构建产物，不提交）
```

源码不在这里，在 `ios/Capabilities/UserNotifications/`：`ios/` 下是源码，`packages/` 下是交付出去的东西。

## 怎么用

见 [API 文档](../../docs/api/un-user-notification-center.md)。两步：

1. 装上这个包。
2. 在入口文件顶上加一行 `/// <reference types="@nacrejs/user-notifications" />`。

不用在 `nacre.config.json` 里写权限文案：问用户同不同意发通知时，提示框里的话是系统自己的。

## 它为什么是一个包

它不要权限文案，也不要 entitlement。单独成包是因为它一被加载就把自己装成通知中心的委托：系统要求委托在 App 启动完成之前就在，否则「点通知把 App 启动起来」的那一次点击收不到。这个位置整个进程只有一个，不发通知的 App 不该占着它。见[实现原理](../../docs/internals/user-notifications.md#它为什么是一个包)。

App 里已经有别的原生代码装了通知中心的委托时，这个包不会把它换掉：每一次回调都原样转给它。

## 没装的时候

| | |
| --- | --- |
| 生成的工程 | 不嵌 `NacreUserNotifications.framework`，产物里没有它，通知中心的委托也没有人动 |
| 运行时 | 全局上没有 `UNUserNotificationCenter`、`UNMutableNotificationContent`、`UNNotificationRequest` 这一组类 |
| 类型检查 | `UNUserNotificationCenter.currentNotificationCenter()` 报 `Cannot find name 'UNUserNotificationCenter'` |

---

← 返回[项目说明](../../docs/project.md) ・ [能力包是怎么搭的](../../docs/internals/capabilities.md) ・ [通知的实现原理](../../docs/internals/user-notifications.md)
