---
type: reference
native: UNNotificationSettings.authorizationStatus
---

# `UNNotificationSettings`：`authorizationStatus` 属性

**`authorizationStatus`** 属性表示用户同不同意这个 App 发通知。

## 值

字符串，下面五个之一：

| 取值 | 含义 |
| --- | --- |
| `'notDetermined'` | 还没问过用户 |
| `'denied'` | 用户拒绝了 |
| `'authorized'` | 用户同意了 |
| `'provisional'` | 临时授权，通知只安静地进通知中心 |
| `'ephemeral'` | 只给轻 App（App Clip）的限时授权 |

- 只读。给它赋值抛 `TypeError`：`authorizationStatus is read-only`。
- 这是取设置那一刻的快照。用户之后在系统的「设置」里改了，这个值不会变；改设置时也没有事件，回到 App 时（`application` 的 `active` 事件）再调一次 `getNotificationSettings()`。

## 示例

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
const settings = await center.getNotificationSettings();
if (settings.authorizationStatus === 'notDetermined') {
  await center.requestAuthorizationWithOptions(['alert', 'sound', 'badge']);
}
```

**效果**：还没问过用户时弹提示框申请；已经同意或拒绝过时什么都不做，不弹提示框。提示框**未在模拟器验证**。

## 对应的 iOS API

`UNNotificationSettings.authorizationStatus`。`UNAuthorizationStatusAuthorized` 写成 `'authorized'`，其余同理。

## 参见

- [`requestAuthorizationWithOptions()`](../un-user-notification-center/requestauthorizationwithoptions.md)：申请授权
- 这个类属于 `@nacrejs/user-notifications` 包，装法见[要先安装](../un-user-notification-center.md#要先安装)
