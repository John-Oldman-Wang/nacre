---
type: reference
native: "-[UIApplicationDelegate application:didRegisterForRemoteNotificationsWithDeviceToken:]"
---

# `RemoteNotifications`: `tokenchange` event

The **`tokenchange`** event fires when the device token received differs from the previous value of [`token`](token.md), including the first token received in this launch.

## Syntax

```
application.remoteNotifications.addEventListener('tokenchange', (event) => { })
```

## Event object

`Event`. It has only `type` and `target` (`application.remoteNotifications`) and doesn't carry the token: read `token` in the callback to get the new value. Not cancelable.

## When it fires

- It fires when the system gives a token that differs from the previous value of `token`. It doesn't fire when the token is the same.
- `token` starts as `null` on every launch, so the first token of every launch fires it once. It means "the token received in this launch differs from a moment ago", not "it differs from the one stored on the server": to know whether the server has the latest one, the app records the token it last gave the server and compares, see [Sending the token to your server](../../guides/push-notifications.md#sending-the-token-to-your-server).
- A failed registration doesn't fire it.
- It fires after the token arrives, once the currently running JS finishes.
- It doesn't fire when there are no listeners, and listeners added later don't get it retroactively. `token` always reads the latest value regardless.

All of the above has been verified in the acceptance tests. In the tests, the step where the system delivers the token is simulated.

## Examples

```js
const push = application.remoteNotifications;
push.addEventListener('tokenchange', () => {
  console.log('new token', push.token);
});
push.register().catch(() => {});
```

**Effect**: When the provisioning profile used for signing has push enabled, it prints one line: `new token` followed by the token received this time.

## Corresponding iOS API

The app delegate's `application:didRegisterForRemoteNotificationsWithDeviceToken:`. The system calls that method once each time it responds to a registration; here the event fires only when the token changed.

## See also

- [`token`](token.md), [`register()`](register.md)
- This class belongs to the `@nacrejs/push` package; see [Installation](../remote-notifications.md#installation)
