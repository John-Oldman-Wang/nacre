---
type: reference
native: UNNotificationSettings
status: partial
---

# `UNNotificationSettings`

**`UNNotificationSettings`** 表示这个 App 的通知设置在某一刻的样子：用户同不同意发通知，声音、角标、锁屏、通知中心等各项开没开。

它只能从 [`getNotificationSettings()`](un-user-notification-center/getnotificationsettings.md) 来，是一份快照：用户之后在系统的「设置」里改了，这个对象不会变，要再取一次。用户改设置时没有事件：改设置要离开 App，回来时在 `application` 的 [`active` 事件](application.md)里重新取一次。

字段全部只读，写了抛 `TypeError`。它是普通的 JS 值，不继承 `NSObject`。

要先装 `@nacrejs/user-notifications`，装法见 [`UNUserNotificationCenter`](un-user-notification-center.md#要先安装)，也可以看[核心和能力包](capabilities.md)。

**继承关系**：`UNNotificationSettings`

## 构造函数

不能用 `new` 创建。`new UNNotificationSettings()` 抛 `TypeError`：

```
Illegal constructor: UNNotificationSettings comes from UNUserNotificationCenter.getNotificationSettings()
```

## 实例属性

全部只读。

| 属性 | 说明 |
| --- | --- |
| [`authorizationStatus`](un-notification-settings/authorizationstatus.md) <small>只读</small> | 用户同不同意这个 App 发通知 |
| [`alertSetting`](un-notification-settings/alertsetting.md) <small>只读</small> | 展示通知的总开关 |
| [`soundSetting`](un-notification-settings/soundsetting.md) <small>只读</small> | 声音 |
| [`badgeSetting`](un-notification-settings/badgesetting.md) <small>只读</small> | 图标上的数字 |
| [`notificationCenterSetting`](un-notification-settings/notificationcentersetting.md) <small>只读</small> | 留在通知中心里 |
| [`lockScreenSetting`](un-notification-settings/lockscreensetting.md) <small>只读</small> | 在锁屏上展示 |
| [`carPlaySetting`](un-notification-settings/carplaysetting.md) <small>只读</small> | 在 CarPlay 上展示 |
| [`criticalAlertSetting`](un-notification-settings/criticalalertsetting.md) <small>只读</small> | 紧急通知 |
| [`announcementSetting`](un-notification-settings/announcementsetting.md) <small>只读</small> | 由 Siri 念出来 |
| [`timeSensitiveSetting`](un-notification-settings/timesensitivesetting.md) <small>只读</small> | 时效性通知 |
| [`scheduledDeliverySetting`](un-notification-settings/scheduleddeliverysetting.md) <small>只读</small> | 定时摘要 |
| [`directMessagesSetting`](un-notification-settings/directmessagessetting.md) <small>只读</small> | 作为直接消息穿过专注模式 |
| [`alertStyle`](un-notification-settings/alertstyle.md) <small>只读</small> | 手机没锁时通知怎么出现 |
| [`showPreviewsSetting`](un-notification-settings/showpreviewssetting.md) <small>只读</small> | 通知的内容什么时候显示 |
| [`providesAppNotificationSettings`](un-notification-settings/providesappnotificationsettings.md) <small>只读</small> | 申请授权时有没有带 `'providesAppNotificationSettings'` |

## 三态

`alertSetting` 到 `directMessagesSetting` 这十一项的取值都是下面三个之一：

| 取值 | 含义 |
| --- | --- |
| `'enabled'` | 开着 |
| `'disabled'` | 关着 |
| `'notSupported'` | 这个 App 没有这一项：没申请过，或者设备不支持 |

从没申请过授权时各项的值**未在模拟器验证**。

## 示例

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
const settings = await center.getNotificationSettings();
console.log(settings.authorizationStatus, settings.soundSetting, settings.alertStyle);
```

**效果**：输出授权状态、声音这一项的状态和通知的出现方式，比如 `authorized enabled banner`。具体的值**未在模拟器验证**。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `settings.authorizationStatus == UNAuthorizationStatusAuthorized` | `settings.authorizationStatus === 'authorized'` |
| `settings.soundSetting == UNNotificationSettingEnabled` | `settings.soundSetting === 'enabled'` |

## 参见

- [`getNotificationSettings()`](un-user-notification-center/getnotificationsettings.md)
- [发本地通知](../guides/local-notifications.md#申请之前先看状态)
