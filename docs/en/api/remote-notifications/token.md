---
type: reference
native: "-[UIApplicationDelegate application:didRegisterForRemoteNotificationsWithDeviceToken:]"
---

# `RemoteNotifications`: `token` property

The **`token`** property is the device token most recently received since this launch.

## Value

A string or `null`.

| Value | Meaning |
| --- | --- |
| A string | The most recently received token, in lowercase hexadecimal, the same as the value [`register()`](register.md) resolves to (measured) |
| `null` | No token has been received since this launch |

- Read-only. Assigning to it throws `TypeError`.
- It only holds values from this launch. Each time the app launches, it starts as `null` until `register()` gets a token.
- A failed registration doesn't change it (measured). [`unregister()`](unregister.md) doesn't change it either (from reading the code).

### How to know when it changes

When a token is received that differs from its previous value, [`tokenchange`](tokenchange-event.md) fires.

## Examples

```js
const push = application.remoteNotifications;
console.log(push.token);
push.register().then(() => {
  console.log(push.token);
}, () => {});
```

**Effect**: First prints `null`. When the provisioning profile used for signing has push enabled, it then prints the token, 64 lowercase hexadecimal characters.

## Corresponding iOS API

The `deviceToken` given to the app delegate's `application:didRegisterForRemoteNotificationsWithDeviceToken:`. In ObjC it is `NSData`; here it is its hexadecimal form. `UIApplication` has no property for reading the token.

## See also

- [`register()`](register.md), [`tokenchange`](tokenchange-event.md)
- This class belongs to the `@nacrejs/push` package; see [Installation](../remote-notifications.md#installation)
