---
type: reference
native: "-[UIApplication unregisterForRemoteNotifications]"
---

# `RemoteNotifications`: `unregister()` method

The **`unregister()`** method cancels this app's registration for remote notifications on this device. After that, this device receives no remote notifications for this app until [`register()`](register.md) is called again.

## Syntax

```
unregister()
```

### Parameters

None.

### Return value

None (`undefined`).

After the call, [`isRegistered`](isregistered.md) is `false` (measured). [`token`](token.md) doesn't change; it is still the most recently received token (from reading the code).

### Exceptions

None.

## Description

Apple's documentation recommends calling it only in rare cases, such as when a new version of the app no longer uses pushes at all. When the user signs out and shouldn't receive an account's pushes anymore, the common approach is to have the server delete this device's token while the app stays registered. Users who don't want to see notifications can turn them off in the system Settings.

## Examples

```js
const push = application.remoteNotifications;
push.unregister();
console.log(push.isRegistered);
```

**Effect**: Prints `false` (measured).

## Corresponding iOS API

`-[UIApplication unregisterForRemoteNotifications]`.

## See also

- [`register()`](register.md), [`isRegistered`](isregistered.md)
- This class belongs to the `@nacrejs/push` package; see [Installation](../remote-notifications.md#installation)
