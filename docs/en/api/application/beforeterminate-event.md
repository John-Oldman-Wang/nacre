---
type: reference
native: UIApplicationWillTerminateNotification
---

# `Application`: `beforeterminate` event

The **`beforeterminate`** event fires when the system is about to terminate the app.

## Syntax

```
application.addEventListener('beforeterminate', (event) => { })
```

## Event object

`Event`. `target` is `application`. Not cancelable.

## When it fires

- When the system is about to terminate the app.
- When the system terminates the app while it's in the background, this event doesn't necessarily fire. So don't rely on it to save data; use [`background`](background-event.md) for that.
- Firing of this event is **not verified in the simulator**.

## Examples

```js
application.addEventListener('beforeterminate', () => {
  console.log('App about to terminate');
});
```

**Effect**: prints one line before the system terminates the app. **Not verified in the simulator.**

## Corresponding iOS API

`UIApplicationWillTerminateNotification`.

## See also

- [`background`](background-event.md)
