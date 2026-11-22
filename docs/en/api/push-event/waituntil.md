---
type: reference
native: "fetchCompletionHandler"
---

# `PushEvent`: `waitUntil()` method

The **`waitUntil()`** method makes the system wait for a Promise to settle, then answers the system, based on its result, with how handling this silent push went.

## Syntax

```
waitUntil(promise)
```

### Parameters

**`promise`**

The Promise to wait for, usually the return value of an `async` function call. When the value given isn't a Promise, it is treated as an already fulfilled Promise (measured).

### Return value

None (`undefined`).

### Exceptions

**`InvalidStateError`**

A [`DOMException`](../dom-exception.md) whose `name` is `'InvalidStateError'` and whose `code` is 11 (measured to be a `DOMException`). Thrown when called after dispatch has ended:

```
waitUntil must be called while the push event is being dispatched
```

## Description

**Call it synchronously inside a listener.** Dispatch ends once all `push` listeners have run. If a listener is an `async` function and calls `waitUntil()` only after an `await`, dispatch has already ended, the call throws `InvalidStateError` (measured), and the system gets "no new data". Write the work as an `async` function, call it right away inside the listener, and pass the Promise it returns to `waitUntil()`.

**It can be called several times.** Calling it several times in one listener, or once in each of several listeners, both work. The system waits for all of them to settle: if all are fulfilled it gets "new data", and if one is rejected it gets "failed" (measured). If it is never called, the system gets "no new data".

**The time the system waits is limited.** Apple's documentation says about 30 seconds. The Promise must settle before then; set a shorter timeout on network requests. **Not verified on a device.**

## Examples

```js
const push = application.remoteNotifications;

async function sync() {
  const response = await fetch('https://api.example.com/inbox', {
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error('HTTP ' + response.status);
  application.storage.set('inbox', await response.text());
}

push.addEventListener('push', (event) => {
  event.waitUntil(sync());
});
```

**Effect** (**not verified on a device**): When a silent push arrives, it fetches the inbox once. If the request succeeds and the data is saved, the system gets "new data"; if the request fails, the server returns an error, or it takes longer than 20 seconds, the system gets "failed".

The following is the wrong way:

```js
const push = application.remoteNotifications;
push.addEventListener('push', async (event) => {
  const response = await fetch('https://api.example.com/inbox');
  event.waitUntil(response.text());
});
```

**Effect**: `waitUntil()` is called only after the `await`, so it throws `InvalidStateError`. The system didn't wait for this request and already got "no new data" when dispatch ended.

## Corresponding iOS API

The `completionHandler` of `application:didReceiveRemoteNotification:fetchCompletionHandler:`. In ObjC the app calls it itself when done, passing `UIBackgroundFetchResultNewData`, `UIBackgroundFetchResultFailed`, or `UIBackgroundFetchResultNoData`; here the Promises given to `waitUntil()` decide which one is passed.

## See also

- [`PushEvent`](../push-event.md#the-result-the-system-receives): how the result is computed
- [`push`](../remote-notifications/push-event.md)
