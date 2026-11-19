---
type: reference
native: UNNotificationSettings.providesAppNotificationSettings
---

# `UNNotificationSettings`: `providesAppNotificationSettings` property

The **`providesAppNotificationSettings`** property indicates whether, when requesting authorization, the app told the system "this app has its own notification settings screen".

## Value

A boolean.

- `true`: the app included `'providesAppNotificationSettings'` when calling [`requestAuthorizationWithOptions()`](../un-user-notification-center/requestauthorizationwithoptions.md).
- `false`: it didn't.
- Read-only. Assigning to it throws `TypeError`: `providesAppNotificationSettings is read-only`.
- This is a snapshot from the moment the settings were fetched; there are no change notifications.

## Examples

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
const settings = await center.getNotificationSettings();
console.log(settings.providesAppNotificationSettings);
```

**Effect**: It prints `true` if `'providesAppNotificationSettings'` was included when requesting authorization, otherwise `false`. **Not verified in the simulator.**

## Corresponding iOS API

`UNNotificationSettings.providesAppNotificationSettings`.

## See also

- [`requestAuthorizationWithOptions()`](../un-user-notification-center/requestauthorizationwithoptions.md)
- This class belongs to the `@nacrejs/user-notifications` package; for installation, see [Install first](../un-user-notification-center.md#installation)
