---
type: reference
native: RemoteNotifications
status: partial
---

# `RemoteNotifications`

**`RemoteNotifications`** represents this app's remote notifications: registering with Apple's push service, getting this device's token, and receiving silent pushes. Its only instance is the [`remoteNotifications`](application/remotenotifications.md) property of [`application`](application.md).

A **remote notification** (push) is a message sent by a server and delivered to the phone through Apple's push service (APNs, Apple Push Notification service). The server identifies which app on which device to send to by a **device token**. The device token is a string of characters the app gets after registering with Apple. The app gives the token to its own server, and the server includes it when sending a push.

There are two kinds of remote notifications, and the app learns about them in different places:

| | What it is | Where the app learns about it |
| --- | --- | --- |
| Visible push | Banners, sounds, and badges shown by the system, looking the same as local notifications | The [`notification`](un-user-notification-center/notification-event.md) and [`notificationclick`](un-user-notification-center/notificationclick-event.md) events of `@nacrejs/user-notifications` |
| Silent push | The push content contains `"content-available": 1`. The system shows nothing; it wakes the app in the background to do one thing, such as fetching data | This class's [`push`](remote-notifications/push-event.md) event |

It belongs to the `@nacrejs/push` package.

Registering and getting the token have been measured on a real device. Actually sending a push from a server to a phone has not been verified; system behavior after a push arrives is marked "**not verified on a device**" on each member page.

**Inheritance**: [`EventTarget`](event-target.md) → `RemoteNotifications`

For how to sign the app, give the token to your server, and handle silent pushes, see the guide [Remote notifications](../guides/push-notifications.md).

## Installation

Remote notifications aren't in the core; they are available only after installing the `@nacrejs/push` package. Without it, the `application.remoteNotifications` property doesn't exist (`'remoteNotifications' in application` is `false`), and there are no global `RemoteNotifications` or `PushEvent`.

This package needs no usage description: registering for pushes shows no prompt. It needs one entitlement. An entitlement is a special capability the app requests from the system, written into the app when it is signed.

**1. Install the package.**

```bash
npm install @nacrejs/push
```

**Effect**: The next time `ios/` is generated, the project embeds an extra `NacrePush.framework`. Projects that don't install it have no such framework in their output.

**2. Write the entitlement in `nacre.config.json`.**

```json
{
  "ios": {
    "entitlements": { "aps-environment": "development" }
  }
}
```

**Effect**: The generated app carries the `aps-environment` entitlement. Write `development` during development and `production` for the version you ship. If the package is installed but this entry is missing, generation stops with an error:

```
nacre: @nacrejs/push needs the entitlement aps-environment. Put it in ios.entitlements in nacre.config.json
```

**3. Sign with a provisioning profile that has push enabled.** A provisioning profile is a file issued by Apple that specifies which bundle identifier's app can be installed on which devices and which capabilities it can use. If the profile used for signing doesn't include the push capability, [`register()`](remote-notifications/register.md) is rejected. For how to prepare one on the Apple Developer website, see [Signing with a provisioning profile that has push enabled](../guides/push-notifications.md#signing-with-a-provisioning-profile-that-has-push-enabled) in the guide.

**4. Bring in the types.** Add a line at the top of your entry file:

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/push" />
```

**Effect**: `application.remoteNotifications` gets completion and checking in the editor. Without this line, `tsc` reports `Property 'remoteNotifications' does not exist on type 'Application'`.

## Constructor

It can't be created with `new`: `new RemoteNotifications()` throws `TypeError` with the message `Illegal constructor: RemoteNotifications is created by the runtime, not by new`. The only instance is obtained from the [`remoteNotifications`](application/remotenotifications.md) property of [`application`](application.md); every read returns the same object.

## Instance properties

| Property | Description |
| --- | --- |
| [`isRegistered`](remote-notifications/isregistered.md) <small>read-only</small> | Whether this device is currently registered for this app's remote notifications |
| [`token`](remote-notifications/token.md) <small>read-only</small> | The device token most recently received since this launch. `null` if none has been received yet |

## Instance methods

| Method | Description |
| --- | --- |
| [`register()`](remote-notifications/register.md) | Registers with Apple and resolves to the device token |
| [`unregister()`](remote-notifications/unregister.md) | Unregisters |

It also inherits [`addEventListener()`](event-target/addeventlistener.md), [`removeEventListener()`](event-target/removeeventlistener.md), and [`dispatchEvent()`](event-target/dispatchevent.md) from [`EventTarget`](event-target.md), used to listen for the events below.

## Events

| Event | When it fires |
| --- | --- |
| [`tokenchange`](remote-notifications/tokenchange-event.md) | The token received differs from the previous value of `token`, including the first token of this launch. Not cancelable |
| [`push`](remote-notifications/push-event.md) | A silent push arrived. The event object is a [`PushEvent`](push-event.md); not cancelable |

Listening for other names doesn't throw: they are treated as custom events and fire only when you dispatch them yourself with `dispatchEvent()`.

## Examples

Registering for pushes doesn't involve the interface, so this code runs as-is at the top level of `main.js`.

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/push" />

const push = application.remoteNotifications;

push.register().then(
  (token) => {
    console.log('token', token);
  },
  (err) => {
    console.log('registration failed', err instanceof Error ? err.message : String(err));
  },
);
```

**Result**

- When the provisioning profile used for signing has push enabled, it prints `token` followed by 64 lowercase hexadecimal characters (measured).
- When the profile lacks the push capability, it prints `registration failed` followed by the reason the system gives. On a Chinese-language system the measured message is `未找到应用程序的“aps-environment”的授权字符串` (which translates to "the aps-environment entitlement string for the application was not found").

This code hasn't been run as a whole. Every API it uses has been run in the acceptance tests.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[UIApplication sharedApplication] registerForRemoteNotifications]` | `push.register()`, returns a Promise |
| The app delegate's `application:didRegisterForRemoteNotificationsWithDeviceToken:` | `register()` resolves to the token. The token is a lowercase hexadecimal string, not `NSData` |
| The app delegate's `application:didFailToRegisterForRemoteNotificationsWithError:` | `register()` is rejected |
| `[[UIApplication sharedApplication] unregisterForRemoteNotifications]` | `push.unregister()` |
| `UIApplication.isRegisteredForRemoteNotifications` | `push.isRegistered` |
| The app delegate's `application:didReceiveRemoteNotification:fetchCompletionHandler:` | The `push` event. The `userInfo` argument is `event.data` |
| Calling `completionHandler(UIBackgroundFetchResultNewData)` in that method | `event.waitUntil(promise)`; the result is decided by the Promise, see [`PushEvent`](push-event.md#the-result-the-system-receives) |
| Setting the app delegate | Not needed; use `addEventListener` |

## See also

- [Remote notifications](../guides/push-notifications.md): signing, giving the token to your server, visible pushes, silent pushes
- [`PushEvent`](push-event.md): the event object of `push`
- [`UNUserNotificationCenter`](un-user-notification-center.md): visible pushes arriving and being tapped; requesting authorization to show notifications
- [Core and capability packages](capabilities.md): which capabilities are installed separately
- [Configuring the app](../guides/project-config.md#writing-entitlements): how to write `ios.entitlements`
