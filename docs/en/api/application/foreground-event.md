---
type: reference
native: UIApplicationWillEnterForegroundNotification
---

# `Application`: `foreground` event

The **`foreground`** event fires when the app is about to return to the foreground.

## Syntax

```
application.addEventListener('foreground', (event) => { })
```

## Event object

`Event`. `target` is `application`. Not cancelable.

## When it fires

- When the user switches back to the app from the background, followed by [`active`](active-event.md).
- When the app launches, `foreground` and `active` also fire in order.
- When the event arrives, [`state`](state.md) is still the old value `'background'` (verified by testing).
- The callback runs later; see [How the runtime works](../how-it-works.md#events).

## Examples

```js
application.addEventListener('foreground', (e) => {
  console.log(e.type, 'state is now', application.state);
});
```

**Result**: prints `foreground state is now background` when the user switches back to the app.

## Corresponding iOS API

`UIApplicationWillEnterForegroundNotification`.

## See also

- [`background`](background-event.md)
