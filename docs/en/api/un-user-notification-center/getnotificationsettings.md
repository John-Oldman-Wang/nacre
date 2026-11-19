---
type: reference
native: "-[UNUserNotificationCenter getNotificationSettingsWithCompletionHandler:]"
---

# `UNUserNotificationCenter`: `getNotificationSettings()` method

The **`getNotificationSettings()`** method reads this app's current notification settings. It shows no alert.

## Syntax

```
getNotificationSettings()
```

### Parameters

None.

### Return value

A `Promise` that fulfills with a [`UNNotificationSettings`](../un-notification-settings.md). Its [`authorizationStatus`](../un-notification-settings/authorizationstatus.md) is `'notDetermined'` (not asked yet), `'denied'`, `'authorized'`, and so on.

What you get is a snapshot: if the user later changes the settings in the system Settings app, it does not change; call it again.

### Exceptions

None.

## Examples

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
const settings = await center.getNotificationSettings();
console.log(settings.authorizationStatus, settings.soundSetting);
```

**Effect**: logs the authorization status and the status of the sound setting. The values when authorization has never been requested are **not verified in the simulator**.

## Corresponding iOS API

`-[UNUserNotificationCenter getNotificationSettingsWithCompletionHandler:]`. The completion handler is replaced by a promise.

## See also

- [`UNNotificationSettings`](../un-notification-settings.md): what each setting means
- [`requestAuthorizationWithOptions()`](requestauthorizationwithoptions.md): requesting authorization
- This class belongs to the `@nacrejs/user-notifications` package; see [Install first](../un-user-notification-center.md#installation)
