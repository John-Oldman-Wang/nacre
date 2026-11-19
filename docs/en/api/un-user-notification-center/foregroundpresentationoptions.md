---
type: reference
native: "-[UNUserNotificationCenterDelegate userNotificationCenter:willPresentNotification:withCompletionHandler:]"
---

# `UNUserNotificationCenter`: `foregroundPresentationOptions` property

The **`foregroundPresentationOptions`** property determines how notifications that arrive while the app is in the foreground (the user is using it) are shown.

## Value

An array of names; several can be given at once:

| Name | Effect |
| --- | --- |
| `'banner'` | A banner slides down from the top of the screen |
| `'list'` | Kept in Notification Center |
| `'sound'` | Plays the content's `sound`. No sound when the content's `sound` is `null` |
| `'badge'` | Changes the number on the icon to the content's `badge`. Unchanged when the content's `badge` is `null` |

- Readable and writable.
- Defaults to `[]`: **not shown** — no banner, no sound, nothing in Notification Center. The app then learns of the notification from the [`notification`](notification-event.md) event and can handle it in its own UI.
- With some names set, notifications that arrive while the app is open are shown in those ways; the `notification` event still fires as usual.
- Reading returns a new array, ordered `badge`, `sound`, `list`, `banner`, regardless of the order written; names written more than once count once. Modifying the array you read does not affect the setting.
- Applies to all notifications; it cannot apply to only one notification or one kind.
- Only the app itself changes it, so there is no change notification.
- The value lives only in memory and is `[]` every time the app launches, so set it on every launch. Setting it in the `sceneconnect` callback of `application` is recommended: that is guaranteed to have run before the UI appears.
- The effect on screen is **not verified in the simulator**.

This property is **set in advance**: at the moment a notification arrives, the system acts on its value without waiting for JS event listeners. So you cannot decide in a `notification` listener whether that notification is shown; by then it has been decided. To decide based on the current UI, change this property when the UI changes.

### Invalid values

- When the array contains an unrecognized name (such as `['banner', 'popup']`), it does not throw: the whole assignment has no effect, the previous value is kept, and the console logs a warning. The correctly written names in the array are not applied separately:

  ```
  [Nacre] foregroundPresentationOptions has no value "popup"; expected one of: badge / sound / list / banner, ignored
  ```

- When the value is not an array, it throws `TypeError`, and the previous value is kept:

  | Written | Error message |
  | --- | --- |
  | Not an array, `'banner'` | `foregroundPresentationOptions must be an array of names, got "banner"` |
  | `null`, `undefined` | `foregroundPresentationOptions must be an array of names, got null` |

> **Note:** Put the assignment inside a function. At the top level of a JS file, type checking (TypeScript 5.9.3) treats the array on the right as a plain string array and reports `Type 'string[]' is not assignable to type 'UNNotificationPresentationOptions[]'`. Running is unaffected.

## Examples

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
application.addEventListener('sceneconnect', () => {
  center.foregroundPresentationOptions = ['banner', 'list', 'sound'];
  console.log(center.foregroundPresentationOptions.join(', '));
});
```

**Effect**: the console logs `sound, list, banner`. From then on, notifications that arrive while the app is open slide a banner down from the top, play a sound, and stay in Notification Center (**not verified in the simulator**).

## Corresponding iOS API

ObjC has no such property. At the moment a notification arrives, the system asks by calling the delegate's `userNotificationCenter:willPresentNotification:withCompletionHandler:`, in which the app calls `completionHandler(UNNotificationPresentationOptionBanner | UNNotificationPresentationOptionSound)`. In JS you set `center.foregroundPresentationOptions = ['banner', 'sound']` in advance, and the system's question is answered from it.

## See also

- [`notification`](notification-event.md): a notification arrived while the app was in the foreground
- [Sending local notifications](../../guides/local-notifications.md#deciding-based-on-the-current-screen)
- This class belongs to the `@nacrejs/user-notifications` package; see [Install first](../un-user-notification-center.md#installation)
