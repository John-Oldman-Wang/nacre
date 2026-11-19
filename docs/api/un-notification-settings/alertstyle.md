---
type: reference
native: UNNotificationSettings.alertStyle
---

# `UNNotificationSettings`：`alertStyle` 属性

**`alertStyle`** 属性表示手机没锁时通知怎么出现。

## 值

字符串，下面三个之一：

| 取值 | 含义 |
| --- | --- |
| `'none'` | 不出现 |
| `'banner'` | 横幅，几秒后自己消失 |
| `'alert'` | 留在屏幕上，直到用户处理 |

- 只读。给它赋值抛 `TypeError`：`alertStyle is read-only`。
- 由用户在系统的「设置」里选。这是取设置那一刻的快照，用户改了之后要再调一次 `getNotificationSettings()`。
- 各种情况下的取值**未在模拟器验证**。

## 示例

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
const settings = await center.getNotificationSettings();
console.log(settings.alertStyle);
```

**效果**：输出 `none`、`banner` 或 `alert`。**未在模拟器验证。**

## 对应的 iOS API

`UNNotificationSettings.alertStyle`。`UNAlertStyleBanner` 写成 `'banner'`，其余同理。

## 参见

- [`getNotificationSettings()`](../un-user-notification-center/getnotificationsettings.md)
- 这个类属于 `@nacrejs/user-notifications` 包，装法见[要先安装](../un-user-notification-center.md#要先安装)
