---
type: reference
native: "-[UIApplicationDelegate application:didReceiveRemoteNotification:fetchCompletionHandler:] userInfo"
---

# `PushEvent`: `data` property

The **`data`** property is the content of this silent push: the entire JSON object sent by the server, including `aps`.

## Value

A plain JS object.

- Read-only. Assigning to it throws `TypeError`.
- Every read returns the same object.
- The content is the JSON object the server sent, as is: `aps` is the part the system uses, and the other keys are the server's own data (measured, with the step where the push arrives simulated).

The server sends:

```json
{ "aps": { "content-available": 1 }, "orderId": 42 }
```

**Effect**: `event.data.orderId` is `42`, and `event.data.aps` is `{ 'content-available': 1 }`.

## Examples

```js
const push = application.remoteNotifications;
push.addEventListener('push', (event) => {
  const orderId = event.data.orderId;
  if (typeof orderId === 'number') {
    console.log('order changed', orderId);
  }
});
```

**Effect**: When the push above arrives, it prints `order changed 42`. The push arriving is **not verified on a device**.

## Corresponding iOS API

The `userInfo` argument of `application:didReceiveRemoteNotification:fetchCompletionHandler:`.

## See also

- [`PushEvent`](../push-event.md)
- [Remote notifications](../../guides/push-notifications.md#how-the-server-sends-a-push): how to write the push content
