---
type: reference
native: UNNotificationSettings
status: partial
---

# `UNNotificationSettings`

**`UNNotificationSettings`** represents this app's notification settings at a given moment: whether the user allows notifications, and whether each setting — sound, badge, lock screen, Notification Center, and so on — is on.

It only comes from [`getNotificationSettings()`](un-user-notification-center/getnotificationsettings.md) and is a snapshot: if the user later changes things in the system Settings app, this object doesn't change; fetch it again. There is no event when the user changes settings: changing settings means leaving the app, so fetch again in the [`active` event](application.md) on `application` when the user comes back.

All fields are read-only; writing to them throws `TypeError`. It is an ordinary JS value and doesn't inherit from `NSObject`.

Install `@nacrejs/user-notifications` first; for how, see [`UNUserNotificationCenter`](un-user-notification-center.md#installation), or see [Core and capability packages](capabilities.md).

**Inheritance**: `UNNotificationSettings`

## Constructor

It can't be created with `new`. `new UNNotificationSettings()` throws `TypeError`:

```
Illegal constructor: UNNotificationSettings comes from UNUserNotificationCenter.getNotificationSettings()
```

## Instance properties

All read-only.

| Property | Description |
| --- | --- |
| [`authorizationStatus`](un-notification-settings/authorizationstatus.md) <small>read-only</small> | Whether the user allows this app to send notifications |
| [`alertSetting`](un-notification-settings/alertsetting.md) <small>read-only</small> | The master switch for showing notifications |
| [`soundSetting`](un-notification-settings/soundsetting.md) <small>read-only</small> | Sound |
| [`badgeSetting`](un-notification-settings/badgesetting.md) <small>read-only</small> | The number on the app icon |
| [`notificationCenterSetting`](un-notification-settings/notificationcentersetting.md) <small>read-only</small> | Staying in Notification Center |
| [`lockScreenSetting`](un-notification-settings/lockscreensetting.md) <small>read-only</small> | Showing on the lock screen |
| [`carPlaySetting`](un-notification-settings/carplaysetting.md) <small>read-only</small> | Showing on CarPlay |
| [`criticalAlertSetting`](un-notification-settings/criticalalertsetting.md) <small>read-only</small> | Critical alerts |
| [`announcementSetting`](un-notification-settings/announcementsetting.md) <small>read-only</small> | Read aloud by Siri |
| [`timeSensitiveSetting`](un-notification-settings/timesensitivesetting.md) <small>read-only</small> | Time-sensitive notifications |
| [`scheduledDeliverySetting`](un-notification-settings/scheduleddeliverysetting.md) <small>read-only</small> | Scheduled summary |
| [`directMessagesSetting`](un-notification-settings/directmessagessetting.md) <small>read-only</small> | Breaking through Focus as direct messages |
| [`alertStyle`](un-notification-settings/alertstyle.md) <small>read-only</small> | How notifications appear when the phone is unlocked |
| [`showPreviewsSetting`](un-notification-settings/showpreviewssetting.md) <small>read-only</small> | When the content of notifications is shown |
| [`providesAppNotificationSettings`](un-notification-settings/providesappnotificationsettings.md) <small>read-only</small> | Whether `'providesAppNotificationSettings'` was included when requesting authorization |

## Three states

The eleven settings from `alertSetting` to `directMessagesSetting` all take one of these three values:

| Value | Meaning |
| --- | --- |
| `'enabled'` | On |
| `'disabled'` | Off |
| `'notSupported'` | This app doesn't have this setting: it was never requested, or the device doesn't support it |

The values of each setting when authorization has never been requested are **not verified in the simulator**.

## Examples

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
const settings = await center.getNotificationSettings();
console.log(settings.authorizationStatus, settings.soundSetting, settings.alertStyle);
```

**Effect**: It prints the authorization status, the state of the sound setting, and how notifications appear, such as `authorized enabled banner`. The specific values are **not verified in the simulator**.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `settings.authorizationStatus == UNAuthorizationStatusAuthorized` | `settings.authorizationStatus === 'authorized'` |
| `settings.soundSetting == UNNotificationSettingEnabled` | `settings.soundSetting === 'enabled'` |

## See also

- [`getNotificationSettings()`](un-user-notification-center/getnotificationsettings.md)
- [Sending local notifications](../guides/local-notifications.md#checking-the-status-before-requesting)
