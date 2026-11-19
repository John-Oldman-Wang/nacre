---
type: reference
native: "-[UNUserNotificationCenter getNotificationSettingsWithCompletionHandler:]"
---

# `UNUserNotificationCenter`：`getNotificationSettings()` 方法

**`getNotificationSettings()`** 方法读这个 App 现在的通知设置。它不弹任何提示框。

## 语法

```
getNotificationSettings()
```

### 参数

无。

### 返回值

`Promise`，兑现成一个 [`UNNotificationSettings`](../un-notification-settings.md)。其中 [`authorizationStatus`](../un-notification-settings/authorizationstatus.md) 是 `'notDetermined'`（还没问过）、`'denied'`、`'authorized'` 等。

得到的是一份快照：用户之后在系统的「设置」里改了，它不会变，要再调一次。

### 异常

无。

## 示例

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
const settings = await center.getNotificationSettings();
console.log(settings.authorizationStatus, settings.soundSetting);
```

**效果**：输出授权状态和声音这一项的状态。从没申请过授权时各项的值**未在模拟器验证**。

## 对应的 iOS API

`-[UNUserNotificationCenter getNotificationSettingsWithCompletionHandler:]`。完成回调换成了 Promise。

## 参见

- [`UNNotificationSettings`](../un-notification-settings.md)：各项设置的含义
- [`requestAuthorizationWithOptions()`](requestauthorizationwithoptions.md)：申请授权
- 这个类属于 `@nacrejs/user-notifications` 包，装法见[要先安装](../un-user-notification-center.md#要先安装)
