---
type: reference
native: "-[UIApplication beginBackgroundTaskWithName:expirationHandler:]"
---

# `Application`: `runBackgroundTask()` method

The **`runBackgroundTask()`** method runs a function and asks the system for extra time while it runs: if the app moves to the background meanwhile, the system doesn't suspend it right away, but waits until the function finishes or the time it gave runs out.

After the app enters the background, the system suspends it after a short while: JS stops running and timers stop firing; see the [`background`](background-event.md) event. Wrap work that has already started and needs a few seconds to finish, such as uploading a file or finishing writing data, in this method so it can finish even if the app moves to the background.

## Syntax

```
runBackgroundTask(work)
runBackgroundTask(work, { name })
```

### Parameters

**`work`**

A function. The runtime calls it once, right away, passing it an [`AbortSignal`](../abort-signal.md). It can return a value directly, or return a Promise (for example, by being an `async` function). The task ends when the Promise it returns settles.

**`options.name`**

Optional. The task's name, visible in the system log while debugging. Non-string values are converted with `String()`. Without it, the task has no name.

If `options` as a whole is `null` or `undefined`, it is the same as leaving it out.

### Return value

A `Promise` that fulfills with `work`'s return value (when `work` returns a Promise, with the value that Promise fulfills with).

- If the Promise returned by `work` is rejected, the returned Promise is rejected with the same error (measured).
- If `work` throws synchronously, the method itself doesn't throw; the returned Promise is rejected with that exception (measured).
- When the time the system gave runs out, the returned Promise is not rejected because of it; it still waits for `work` to settle.

### Exceptions

Nothing is thrown synchronously. When the arguments are wrong, the returned Promise is rejected with a **`TypeError`** (measured):

`work` is not a function, or was not passed:

```
TypeError: runBackgroundTask needs a function, got "upload"
```

`options` is not an object, nor `null` or `undefined`:

```
TypeError: runBackgroundTask options must be an object, got 5
```

## Description

- **The system decides how much extra time to give**, usually around 30 seconds, with no guarantee. Read how many seconds are left from [`backgroundTimeRemaining`](backgroundtimeremaining.md).
- **When the time is about to run out, the `signal` passed to `work` is aborted**, and `signal.reason` is a [`DOMException`](../dom-exception.md) whose `name` is `'TimeoutError'` and whose `code` is 23. The runtime then ends the task right away, without waiting for `work`. After that the system may suspend the app at any moment, and whatever part of `work` hasn't run yet continues only when the app returns to the foreground. `work` should listen to `signal` and stop what it is doing when it is aborted, or pass `signal` straight to [`fetch()`](../fetch.md) so the request is canceled. **Not verified on a device.**
- **If the system gives no time at all from the start** (the app is already about to be suspended), `work` still runs, and `signal` is aborted from the start, with a `reason` that is also `'TimeoutError'`. **Not verified on a device.**
- When it finishes in the foreground, `signal` is not aborted (measured). If the app stays in the foreground, the task ends when `work` finishes, and nothing else is needed.
- Several can run at the same time, and each ends on its own (measured).
- The whole sequence of the app moving to the background, continuing to run, and ending normally when done is **not verified on a device**.

## Examples

### Finishing a draft upload when entering the background

```js
/** @type {string} */
let draft = '';

application.addEventListener('background', () => {
  application.runBackgroundTask(async (signal) => {
    await fetch('https://example.com/api/drafts', {
      method: 'POST',
      body: draft,
      signal,
    });
  }, { name: 'upload-draft' }).catch((err) => {
    console.log('Draft upload did not finish: ' + (err instanceof Error ? err.name : String(err)));
  });
});
```

**Effect**: After the user goes to the Home Screen, the app keeps running until the request completes, and then the system suspends it. If time runs out before the upload finishes, the request is canceled and the console prints `Draft upload did not finish: AbortError`: when a request is canceled while in progress, `fetch()` throws an `AbortError`, not `signal.reason`. **Not verified on a device.**

### Getting `work`'s return value

```js
application.runBackgroundTask(async (signal) => {
  console.log(signal.aborted);
  return 42;
}).then((value) => {
  console.log(value);
});
```

**Result**: When run in the foreground, the console prints `false`, then `42`.

## Corresponding iOS API

`-[UIApplication beginBackgroundTaskWithName:expirationHandler:]` and `-[UIApplication endBackgroundTask:]`. The two calls are combined into one method: the runtime calls the former at the start and the latter when `work` settles, so you don't keep the task identifier or remember to hand it back. `expirationHandler` is replaced by the abort of `signal`.

## See also

- [`backgroundTimeRemaining`](backgroundtimeremaining.md): how many seconds are left
- [`background`](background-event.md): the app enters the background
- [`AbortSignal`](../abort-signal.md): the `signal` passed to `work`
- [Handling the app lifecycle](../../guides/app-lifecycle.md)
