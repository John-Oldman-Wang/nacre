---
type: reference
native: UNNotificationSettings.alertStyle
---

# `UNNotificationSettings`: `alertStyle` property

The **`alertStyle`** property indicates how notifications appear when the phone is unlocked.

## Value

A string, one of these three:

| Value | Meaning |
| --- | --- |
| `'none'` | They don't appear |
| `'banner'` | A banner that disappears by itself after a few seconds |
| `'alert'` | Stays on screen until the user deals with it |

- Read-only. Assigning to it throws `TypeError`: `alertStyle is read-only`.
- Chosen by the user in the system Settings app. This is a snapshot from the moment the settings were fetched; after the user changes it, call `getNotificationSettings()` again.
- The values in each situation are **not verified in the simulator**.

## Examples

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
const settings = await center.getNotificationSettings();
console.log(settings.alertStyle);
```

**Effect**: It prints `none`, `banner`, or `alert`. **Not verified in the simulator.**

## Corresponding iOS API

`UNNotificationSettings.alertStyle`. `UNAlertStyleBanner` is written `'banner'`, and the rest likewise.

## See also

- [`getNotificationSettings()`](../un-user-notification-center/getnotificationsettings.md)
- This class belongs to the `@nacrejs/user-notifications` package; for installation, see [Install first](../un-user-notification-center.md#installation)
