---
type: reference
native: "-[UNUserNotificationCenter requestAuthorizationWithOptions:completionHandler:]"
---

# `UNUserNotificationCenter`: `requestAuthorizationWithOptions()` method

The **`requestAuthorizationWithOptions()`** method asks the user whether this app may send notifications.

## Syntax

```
requestAuthorizationWithOptions(options)
```

### Parameters

**`options`**

An array of names. Required; can be an empty array. What to request:

| Name | What it requests |
| --- | --- |
| `'alert'` | Showing notifications: banners, lock screen, Notification Center |
| `'sound'` | Playing sounds |
| `'badge'` | Changing the number on the icon |
| `'carPlay'` | Showing on CarPlay (the in-car screen) |
| `'provisional'` | Provisional authorization: no alert is shown and the promise fulfills with `true` directly, but notifications go quietly into Notification Center with no banner or sound, where the user chooses to keep or turn them off. **Not verified in the simulator** |
| `'criticalAlert'` | Critical alerts: ignore the mute switch and Do Not Disturb. Requires a permission approved separately by Apple; without it this option has no effect. **Not verified in the simulator** |
| `'providesAppNotificationSettings'` | Tells the system this app has its own notification settings screen; the system adds a button in the app's notification settings. This package does not yet handle the notification for when that button is tapped |

Usually `['alert', 'sound', 'badge']`.

### Return value

A `Promise` that fulfills with a boolean: `true` means allowed, `false` means denied.

- **The alert appears only once.** On the first call the system shows an alert and the promise fulfills after the user chooses. Later calls do not show it again and fulfill directly with the current result. So calling it every time before sending a notification is safe. **Not verified in the simulator.**
- **After the user denies, the app has no way to show the alert again.** Only the user can change it, in the system Settings app.
- When the system reports a failure, the promise is rejected; see [Errors](../un-user-notification-center.md#errors).

### Exceptions

**`TypeError`**

Invalid arguments throw synchronously, without returning a rejected promise or showing the alert:

| Written | Error message |
| --- | --- |
| No argument | `requestAuthorizationWithOptions: options must be an array of names, got undefined` |
| An unrecognized name, `['alert', 'popup']` | `requestAuthorizationWithOptions has no value "popup"; expected one of: badge / sound / alert / carPlay / criticalAlert / providesAppNotificationSettings / provisional` |

## Description

When to request is up to the app. Request it when the user has done something that clearly calls for notifications (set a reminder, placed an order), not right at launch: the user does not yet know what this app will send and will most likely refuse, and after refusing you cannot ask again.

To learn the current status without showing an alert, use [`getNotificationSettings()`](getnotificationsettings.md).

## Examples

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
const granted = await center.requestAuthorizationWithOptions(['alert', 'sound', 'badge']);
console.log(granted);
```

**Effect** (**not verified in the simulator**): if not asked yet, the system shows an alert, and after the user chooses, logs `true` or `false`. If already asked, logs the current result right away.

## Corresponding iOS API

`-[UNUserNotificationCenter requestAuthorizationWithOptions:completionHandler:]`. In ObjC the options are the bitmask `UNAuthorizationOptionAlert | UNAuthorizationOptionSound`; here they are written as the array `['alert', 'sound']`. The completion handler is replaced by a promise.

## See also

- [`getNotificationSettings()`](getnotificationsettings.md): reading the status only, without an alert
- [Sending local notifications](../../guides/local-notifications.md#whether-the-user-allows-it)
- This class belongs to the `@nacrejs/user-notifications` package; see [Install first](../un-user-notification-center.md#installation)
