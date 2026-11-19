---
type: reference
native: UNNotificationSettings.showPreviewsSetting
---

# `UNNotificationSettings`: `showPreviewsSetting` property

The **`showPreviewsSetting`** property indicates when the content of notifications is shown.

## Value

A string, one of these three:

| Value | Meaning |
| --- | --- |
| `'always'` | Always shown |
| `'whenAuthenticated'` | Shown only after the phone is unlocked |
| `'never'` | Never shown; only "Notification" is shown |

- Read-only. Assigning to it throws `TypeError`: `showPreviewsSetting is read-only`.
- Chosen by the user in the system Settings app. This is a snapshot from the moment the settings were fetched; after the user changes it, call `getNotificationSettings()` again.
- The values in each situation are **not verified in the simulator**.

## Examples

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
const settings = await center.getNotificationSettings();
if (settings.showPreviewsSetting !== 'always') {
  console.log('The notification body may not be visible on the lock screen');
}
```

**Effect**: When the user has set it to show only after unlocking, or never, it prints this line. **Not verified in the simulator.**

## Corresponding iOS API

`UNNotificationSettings.showPreviewsSetting`. `UNShowPreviewsSettingWhenAuthenticated` is written `'whenAuthenticated'`, and the rest likewise.

## See also

- [`getNotificationSettings()`](../un-user-notification-center/getnotificationsettings.md)
- This class belongs to the `@nacrejs/user-notifications` package; for installation, see [Install first](../un-user-notification-center.md#installation)
