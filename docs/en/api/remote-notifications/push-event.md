---
type: reference
native: "-[UIApplicationDelegate application:didReceiveRemoteNotification:fetchCompletionHandler:]"
---

# `RemoteNotifications`: `push` event

The **`push`** event fires when a silent push arrives. A silent push is a remote notification whose content contains `"content-available": 1`: the system shows nothing and wakes the app to do one thing in the background, such as fetching new data.

## Syntax

```
application.remoteNotifications.addEventListener('push', (event) => { })
```

## Event object

A [`PushEvent`](../push-event.md), an `Event` with one extra field and one method:

**`data`**

The push content: the entire JSON object sent by the server, including `aps`. See [`data`](../push-event/data.md).

**`waitUntil(promise)`**

Makes the system wait for this work to finish, and tells the system the result. See [`waitUntil()`](../push-event/waituntil.md).

Not cancelable.

## When it fires

- It fires when a push containing `"content-available": 1` arrives. The app must write `"UIBackgroundModes": ["remote-notification"]` in `ios.infoPlist` of `nacre.config.json`; see [Silent pushes](../../guides/push-notifications.md#silent-pushes).
- When the app is in the background, the system wakes it and then this event fires. When the app isn't running, the system launches it in the background, and the event fires after the entry file has run. **Not verified on a device.**
- **Add the listener synchronously at the top level of the entry file.** When the app is launched by a silent push and the listener is added too late (inside `sceneconnect`, or after some `await`), that push is handled as "no new data", and listeners added later don't receive it. **Not verified on a device.**
- With no listener it doesn't fire, and the system gets "no new data" (measured).
- After the user swipes the app away in the app switcher, silent pushes no longer wake it until the user opens the app again. This comes from Apple's documentation and is **not verified on a device**.
- The system limits how many silent pushes it delivers and doesn't guarantee each one arrives. Apple's documentation suggests no more than two or three per hour. **Not verified on a device.**

For how calls to `waitUntil()` in listeners become the result the system receives, see [`PushEvent`](../push-event.md#the-result-the-system-receives).

## Examples

```js
const push = application.remoteNotifications;

async function refreshOrders() {
  const response = await fetch('https://api.example.com/orders', {
    signal: AbortSignal.timeout(20000),
  });
  application.storage.set('orders', await response.text());
}

push.addEventListener('push', (event) => {
  console.log('silent push', JSON.stringify(event.data));
  event.waitUntil(refreshOrders());
});
```

**Effect** (**not verified on a device**): When the server sends `{"aps":{"content-available":1}}`, the app is woken in the background, prints `silent push {"aps":{"content-available":1}}`, then fetches the orders once and stores them. If the request succeeds, the system gets "new data"; if the request fails or takes longer than 20 seconds, the system gets "failed".

The shape of the event object and the three results have been verified in the acceptance tests; in the tests, the step where the push arrives is simulated.

## Corresponding iOS API

The app delegate's `application:didReceiveRemoteNotification:fetchCompletionHandler:`. The `userInfo` argument is `event.data`; `completionHandler` isn't called by JS, and what it is passed is decided by the Promises given to `waitUntil()`.

## See also

- [`PushEvent`](../push-event.md)
- [Remote notifications](../../guides/push-notifications.md#silent-pushes): the configuration silent pushes need, and how the server sends them
- This class belongs to the `@nacrejs/push` package; see [Installation](../remote-notifications.md#installation)
