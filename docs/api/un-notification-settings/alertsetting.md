---
type: reference
native: UNNotificationSettings.alertSetting
---

# `UNNotificationSettings`：`alertSetting` 属性

**`alertSetting`** 属性表示展示通知的总开关：横幅、锁屏、通知中心合在一起现在开没开。

## 值

字符串，三态之一（见[三态](../un-notification-settings.md#三态)）：`'enabled'`（开着）、`'disabled'`（关着）、`'notSupported'`（这个 App 没有这一项：没申请过，或者设备不支持）。

- 只读。给它赋值抛 `TypeError`：`alertSetting is read-only`。
- 这是取设置那一刻的快照。用户之后在系统的「设置」里改了，这个值不会变；改设置时也没有事件，回到 App 时（`application` 的 `active` 事件）再调一次 `getNotificationSettings()`。
- 对应申请授权时的 `'alert'`。
- 各种情况下的取值**未在模拟器验证**。

## 示例

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
const settings = await center.getNotificationSettings();
console.log(settings.alertSetting === 'enabled' ? '开着' : '没开');
```

**效果**：这一项开着时输出 `开着`，否则输出 `没开`。**未在模拟器验证。**

## 对应的 iOS API

`UNNotificationSettings.alertSetting`。`UNNotificationSettingEnabled` 写成 `'enabled'`，其余同理。

## 参见

- [`getNotificationSettings()`](../un-user-notification-center/getnotificationsettings.md)：取设置
- 这个类属于 `@nacrejs/user-notifications` 包，装法见[要先安装](../un-user-notification-center.md#要先安装)
