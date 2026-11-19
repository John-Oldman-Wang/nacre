---
type: reference
native: UNNotificationSettings.lockScreenSetting
---

# `UNNotificationSettings`: `lockScreenSetting` property

The **`lockScreenSetting`** property indicates whether the setting for showing on the lock screen is currently on.

## Value

A string, one of the three states (see [Three states](../un-notification-settings.md#three-states)): `'enabled'` (on), `'disabled'` (off), `'notSupported'` (this app doesn't have this setting: it was never requested, or the device doesn't support it).

- Read-only. Assigning to it throws `TypeError`: `lockScreenSetting is read-only`.
- This is a snapshot from the moment the settings were fetched. If the user later changes it in the system Settings app, this value doesn't change; there is no event when settings change either. Call `getNotificationSettings()` again when the user returns to the app (the `active` event on `application`).
- The values in each situation are **not verified in the simulator**.

## Examples

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
const settings = await center.getNotificationSettings();
console.log(settings.lockScreenSetting === 'enabled' ? 'On' : 'Off');
```

**Effect**: It prints `On` when this setting is on, otherwise `Off`. **Not verified in the simulator.**

## Corresponding iOS API

`UNNotificationSettings.lockScreenSetting`. `UNNotificationSettingEnabled` is written `'enabled'`, and the rest likewise.

## See also

- [`getNotificationSettings()`](../un-user-notification-center/getnotificationsettings.md): fetching the settings
- This class belongs to the `@nacrejs/user-notifications` package; for installation, see [Install first](../un-user-notification-center.md#installation)
