---
type: reference
native: application.remoteNotifications
---

# `Application`：`remoteNotifications` 属性

**`remoteNotifications`** 属性是远程推送的入口：向 Apple 注册、拿设备令牌、收到静默推送。**它只在装了 `@nacrejs/push` 的项目里有。**

## 值

[`RemoteNotifications`](../remote-notifications.md)。它的成员见 [`RemoteNotifications`](../remote-notifications.md)。

- 只读。给它赋值抛 `TypeError`。
- 每次读到的都是同一个对象（实测）。
- 没装 `@nacrejs/push` 时这个属性不存在：`'remoteNotifications' in application` 是 `false`，类型里也没有它。
- 装了之后，入口文件顶上要加一行 `/// <reference types="@nacrejs/push" />`，类型里才有它。

## 示例

```js
/// <reference types="@nacrejs/push" />
console.log('remoteNotifications' in application);
```

**结果**：装了 `@nacrejs/push` 的项目输出 `true`，没装的输出 `false`。

## 对应的 iOS API

`UIApplication` 上注册远程推送的几个成员，和 App 委托里报告结果的几个方法，见 [`RemoteNotifications`](../remote-notifications.md#对应的-ios-api)。

## 参见

- [`RemoteNotifications`](../remote-notifications.md)
- [远程推送](../../guides/push-notifications.md)
- [能力包](../capabilities.md)：装了才有
