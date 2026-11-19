---
type: reference
native: UNNotificationSettings.authorizationStatus
---

# `UNNotificationSettings`: `authorizationStatus` property

The **`authorizationStatus`** property indicates whether the user allows this app to send notifications.

## Value

A string, one of these five:

| Value | Meaning |
| --- | --- |
| `'notDetermined'` | The user hasn't been asked yet |
| `'denied'` | The user declined |
| `'authorized'` | The user agreed |
| `'provisional'` | Provisional authorization: notifications go quietly into Notification Center only |
| `'ephemeral'` | Time-limited authorization given only to App Clips |

- Read-only. Assigning to it throws `TypeError`: `authorizationStatus is read-only`.
- This is a snapshot from the moment the settings were fetched. If the user later changes it in the system Settings app, this value doesn't change; there is no event when settings change either. Call `getNotificationSettings()` again when the user returns to the app (the `active` event on `application`).

## Examples

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
const settings = await center.getNotificationSettings();
if (settings.authorizationStatus === 'notDetermined') {
  await center.requestAuthorizationWithOptions(['alert', 'sound', 'badge']);
}
```

**Effect**: When the user hasn't been asked yet, it shows the prompt to request authorization; when the user has already agreed or declined, it does nothing and shows no prompt. The prompt is **not verified in the simulator**.

## Corresponding iOS API

`UNNotificationSettings.authorizationStatus`. `UNAuthorizationStatusAuthorized` is written `'authorized'`, and the rest likewise.

## See also

- [`requestAuthorizationWithOptions()`](../un-user-notification-center/requestauthorizationwithoptions.md): requesting authorization
- This class belongs to the `@nacrejs/user-notifications` package; for installation, see [Install first](../un-user-notification-center.md#installation)
