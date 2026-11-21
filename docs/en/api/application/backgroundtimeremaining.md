---
type: reference
native: UIApplication.backgroundTimeRemaining
---

# `Application`: `backgroundTimeRemaining` property

The **`backgroundTimeRemaining`** property is how many more seconds the app can run in the background before the system suspends it.

## Value

A number, in seconds.

- Read-only. Assigning to it throws a `TypeError`.
- While the app is in the foreground it is `Infinity` (measured). While a task is running with [`runBackgroundTask()`](runbackgroundtask.md), it is also `Infinity` as long as the app is still in the foreground (measured).
- While the app is in the background it is the number of seconds left, decreasing over time. The extra time the system gives is usually around 30 seconds, decided by the system, with no guarantee. **Not verified on a device.**
- There is no change event: it changes continuously over time, so read it when you need it.

## Examples

```js
console.log(application.backgroundTimeRemaining);

application.addEventListener('background', () => {
  application.runBackgroundTask(async () => {
    console.log('Background time left: ' + Math.floor(application.backgroundTimeRemaining) + ' s');
  });
});
```

**Effect**: The first line runs in the foreground and the console prints `Infinity`. After the app enters the background, the console prints a line such as `Background time left: 29 s`; the number of seconds is up to the system. **The background line is not verified on a device.**

## Corresponding iOS API

`UIApplication.backgroundTimeRemaining`. In the foreground iOS gives a very large number (`DBL_MAX`); here it is replaced with `Infinity`.

## See also

- [`runBackgroundTask()`](runbackgroundtask.md): asking the system for extra background time
- [`state`](state.md): whether the app is in the foreground or the background
