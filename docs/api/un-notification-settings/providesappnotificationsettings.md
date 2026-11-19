---
type: reference
native: UNNotificationSettings.providesAppNotificationSettings
---

# `UNNotificationSettings`：`providesAppNotificationSettings` 属性

**`providesAppNotificationSettings`** 属性表示 App 申请授权时有没有告诉系统「这个 App 有自己的通知设置页」。

## 值

布尔。

- `true`：App 调 [`requestAuthorizationWithOptions()`](../un-user-notification-center/requestauthorizationwithoptions.md) 时带了 `'providesAppNotificationSettings'`。
- `false`：没带。
- 只读。给它赋值抛 `TypeError`：`providesAppNotificationSettings is read-only`。
- 这是取设置那一刻的快照，没有变化通知。

## 示例

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
const settings = await center.getNotificationSettings();
console.log(settings.providesAppNotificationSettings);
```

**效果**：申请授权时带了 `'providesAppNotificationSettings'` 输出 `true`，否则输出 `false`。**未在模拟器验证。**

## 对应的 iOS API

`UNNotificationSettings.providesAppNotificationSettings`。

## 参见

- [`requestAuthorizationWithOptions()`](../un-user-notification-center/requestauthorizationwithoptions.md)
- 这个类属于 `@nacrejs/user-notifications` 包，装法见[要先安装](../un-user-notification-center.md#要先安装)
