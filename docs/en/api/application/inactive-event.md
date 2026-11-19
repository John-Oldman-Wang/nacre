---
type: reference
native: UIApplicationWillResignActiveNotification
---

# `Application`: `inactive` event

The **`inactive`** event fires when the app is about to leave the active state.

## Syntax

```
application.addEventListener('inactive', (event) => { })
```

## Event object

`Event`. `target` is `application`. Not cancelable.

## When it fires

- When the user goes to the Home Screen or switches to another app, followed by [`background`](background-event.md).
- It also fires for an incoming call or when Notification Center is pulled down; the app may then return directly to the active state without firing `background`. So use `background`, not this event, to save data.
- When the event arrives, [`state`](state.md) is still the old value `'active'` (verified by testing).
- The callback runs later; see [How the runtime works](../how-it-works.md#events).

## Examples

```js
application.addEventListener('inactive', (e) => {
  console.log(e.type, 'state is now', application.state);
});
```

**Result**: prints `inactive state is now active` when the user goes to the Home Screen.

## Corresponding iOS API

`UIApplicationWillResignActiveNotification`.

## See also

- [Foreground, background, and run state](../application.md#foreground-background-and-run-state)
- [`inactive` on `UIWindowScene`](../ui-window-scene/inactive-event.md): the event with the same name for a single scene
