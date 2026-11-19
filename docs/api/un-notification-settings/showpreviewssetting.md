---
type: reference
native: UNNotificationSettings.showPreviewsSetting
---

# `UNNotificationSettings`：`showPreviewsSetting` 属性

**`showPreviewsSetting`** 属性表示通知的内容什么时候显示。

## 值

字符串，下面三个之一：

| 取值 | 含义 |
| --- | --- |
| `'always'` | 总是显示 |
| `'whenAuthenticated'` | 手机解锁之后才显示 |
| `'never'` | 从不显示，只显示「通知」 |

- 只读。给它赋值抛 `TypeError`：`showPreviewsSetting is read-only`。
- 由用户在系统的「设置」里选。这是取设置那一刻的快照，用户改了之后要再调一次 `getNotificationSettings()`。
- 各种情况下的取值**未在模拟器验证**。

## 示例

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
const settings = await center.getNotificationSettings();
if (settings.showPreviewsSetting !== 'always') {
  console.log('锁屏上可能看不到通知的正文');
}
```

**效果**：用户设成解锁后才显示或从不显示时，输出这一句。**未在模拟器验证。**

## 对应的 iOS API

`UNNotificationSettings.showPreviewsSetting`。`UNShowPreviewsSettingWhenAuthenticated` 写成 `'whenAuthenticated'`，其余同理。

## 参见

- [`getNotificationSettings()`](../un-user-notification-center/getnotificationsettings.md)
- 这个类属于 `@nacrejs/user-notifications` 包，装法见[要先安装](../un-user-notification-center.md#要先安装)
