---
type: reference
native: UIApplicationDidBecomeActiveNotification
---

# `Application`: `active` event

The **`active`** event fires when the app has entered the active state and can receive user input.

## Syntax

```
application.addEventListener('active', (event) => { })
```

## Event object

`Event`. `target` is `application`. Not cancelable.

## When it fires

- After the app launches and its UI is displayed.
- When the user switches back to the app from the background, after [`foreground`](foreground-event.md).
- When a temporary interruption (an incoming call, pulling down Notification Center) ends.
- When the event arrives, [`state`](state.md) is `'active'` (verified by testing).
- The callback runs later; see [How the runtime works](../how-it-works.md#events).

## Examples

```js
for (const type of ['inactive', 'background', 'foreground', 'active']) {
  application.addEventListener(type, (e) => {
    console.log(e.type, 'state is now', application.state);
  });
}
```

**Effect**: when the user goes to the Home Screen and then taps the icon to return to the app, the console prints, in order:

- `inactive state is now active`
- `background state is now background`
- `foreground state is now background`
- `active state is now active`

## Corresponding iOS API

`UIApplicationDidBecomeActiveNotification`.

## See also

- [Foreground, background, and run state](../application.md#foreground-background-and-run-state)
