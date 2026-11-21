---
type: reference
native: "-[UIApplication registerForRemoteNotifications]"
---

# `RemoteNotifications`: `register()` method

The **`register()`** method registers this app on this device with Apple's push service and resolves to the device token.

## Syntax

```
register()
```

### Parameters

None.

### Return value

`Promise<string>`.

It **resolves** to the device token: a lowercase hexadecimal string. The server must include it when sending a push to this device.

- The measured token is 32 bytes, written as 64 characters. Apple's documentation says token length is not fixed, so don't validate it against a fixed length.
- After it resolves, [`token`](token.md) is this token and [`isRegistered`](isregistered.md) is `true` (measured).
- When called several times at once, the system registers only once, and all the Promises resolve to the same result (measured).
- Each time the app is reinstalled, the token received is different (measured).

When **rejected**, it gives an `Error` whose `message` is the reason the system gives, in the phone's language. The most common cause is that the provisioning profile used for signing lacks the push capability; on a Chinese-language system the measured text is:

```
未找到应用程序的“aps-environment”的授权字符串
```

A failed registration doesn't change `token` (measured).

If the system never responds, the Promise keeps waiting; the runtime sets no timeout (from reading the code).

### Exceptions

None.

## Description

- Registering shows no prompt and doesn't need the user's consent.
- Getting a token only means the server can send pushes to this device. For visible pushes (banners, sounds) to be shown, the user must also allow this app to send notifications; request that with [`requestAuthorizationWithOptions()`](../un-user-notification-center/requestauthorizationwithoptions.md) from `@nacrejs/user-notifications`. Silent pushes don't need the user's consent. These two points come from Apple's documentation and are **not verified on a device**.
- The token exists only from this launch on; the runtime doesn't save it for the app. Call `register()` on every launch and give the token you get to your server.

## Examples

```js
const push = application.remoteNotifications;
push.register().then(
  (token) => {
    console.log(token.length, token === push.token);
  },
  (err) => {
    console.log('registration failed', err instanceof Error ? err.message : String(err));
  },
);
```

**Effect**: When the provisioning profile used for signing has push enabled, it prints `64 true` (measured). Without the push capability, it prints `registration failed` followed by the reason the system gives.

## Corresponding iOS API

`-[UIApplication registerForRemoteNotifications]`. In ObjC the result is reported by two app delegate methods: `application:didRegisterForRemoteNotificationsWithDeviceToken:` gives the token as `NSData`, and `application:didFailToRegisterForRemoteNotificationsWithError:` gives the error. Here they are combined into one Promise, and the token is converted to a hexadecimal string.

## See also

- [`token`](token.md), [`tokenchange`](tokenchange-event.md)
- [Remote notifications](../../guides/push-notifications.md#sending-the-token-to-your-server): giving the token to your server
- This class belongs to the `@nacrejs/push` package; see [Installation](../remote-notifications.md#installation)
