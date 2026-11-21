---
type: reference
native: "-[UIApplicationDelegate application:didReceiveRemoteNotification:fetchCompletionHandler:]"
status: partial
---

# `PushEvent`

**`PushEvent`** represents a silent push that has arrived. It is the event object of the [`push`](remote-notifications/push-event.md) event on [`application.remoteNotifications`](remote-notifications.md). It carries the push content and lets the app tell the system when the work for this push is done and how it went.

When the system wakes the app to handle a silent push, the time it gives is limited. The app hands the work to [`waitUntil()`](push-event/waituntil.md), and the system waits for that work to finish, then uses the result to arrange for the app to return to the suspended state.

It belongs to the `@nacrejs/push` package; for installation, see [`RemoteNotifications`](remote-notifications.md#installation).

**Inheritance**: [`Event`](event.md) → `PushEvent`

## Constructor

When a silent push arrives, the runtime creates it and dispatches it to `push` listeners. You can also create one yourself with `new PushEvent('push', { data })` and dispatch it to try your listeners.

## Instance properties

It also inherits the properties of [`Event`](event.md). `cancelable` is `false` (measured).

| Property | Description |
| --- | --- |
| [`data`](push-event/data.md) <small>read-only</small> | The push content: the entire JSON object sent by the server, including `aps` |

## Instance methods

| Method | Description |
| --- | --- |
| [`waitUntil()`](push-event/waituntil.md) | Makes the system wait for a Promise to settle, and answers the system with its result |

## The result the system receives

After dispatch, the runtime waits for all the Promises that `waitUntil()` received during this dispatch to settle, then tells the system the result:

| What the listeners did | Result the system receives |
| --- | --- |
| Called `waitUntil()`, and all the Promises given were fulfilled | New data |
| Called `waitUntil()`, and one of the Promises given was rejected | Failed |
| Didn't call `waitUntil()` | No new data |
| There is no `push` listener | No new data |

All four cases in the table have been verified in the acceptance tests; in the tests, the step where the push arrives is simulated.

- When the value given to `waitUntil()` isn't a Promise, it is treated as an already fulfilled Promise (measured).
- **The time the system waits is limited.** Apple's documentation says about 30 seconds. Set a shorter timeout on network requests so the Promise settles before then. **Not verified on a device.**

## Examples

```js
const push = application.remoteNotifications;
push.addEventListener('push', (event) => {
  console.log(event instanceof PushEvent, event.cancelable);
  event.waitUntil(new Promise((resolve) => setTimeout(resolve, 1000)));
});
```

**Effect**: When a silent push arrives, it prints `true false`. One second later the system gets "new data". The push arriving and the background wake-up are **not verified on a device**.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| The `userInfo` argument of `application:didReceiveRemoteNotification:fetchCompletionHandler:` | `event.data` |
| `completionHandler(UIBackgroundFetchResultNewData)` | All the Promises given to `waitUntil()` are fulfilled |
| `completionHandler(UIBackgroundFetchResultFailed)` | One of them is rejected |
| `completionHandler(UIBackgroundFetchResultNoData)` | `waitUntil()` isn't called |

## See also

- [`push`](remote-notifications/push-event.md): when it fires
- [Remote notifications](../guides/push-notifications.md#silent-pushes): the configuration silent pushes need, and where to put the listener
