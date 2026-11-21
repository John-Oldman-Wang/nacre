---
type: reference
native: UIApplication.isRegisteredForRemoteNotifications
---

# `RemoteNotifications`: `isRegistered` property

The **`isRegistered`** property indicates whether this device is currently registered for this app's remote notifications.

## Value

A boolean.

| Value | Meaning |
| --- | --- |
| `true` | Registered. This is the value after [`register()`](register.md) resolves (measured) |
| `false` | Not registered. This is the value after [`unregister()`](unregister.md) (measured) |

- Read-only. Assigning to it throws `TypeError`.
- Each read returns the system's state at that moment.

### How to know when it changes

There is no change event. It changes with the app's own calls to `register()` and `unregister()`: read it after `register()` resolves or after `unregister()` returns, and you get the new value.

Don't use it to decide whether to call `register()`. Call `register()` on every launch to get this launch's token.

## Examples

```js
const push = application.remoteNotifications;
push.register().then(() => {
  console.log(push.isRegistered);
}, () => {});
```

**Effect**: When the provisioning profile used for signing has push enabled, it prints `true` (measured).

## Corresponding iOS API

`UIApplication.isRegisteredForRemoteNotifications`.

## See also

- [`register()`](register.md), [`unregister()`](unregister.md)
- This class belongs to the `@nacrejs/push` package; see [Installation](../remote-notifications.md#installation)
