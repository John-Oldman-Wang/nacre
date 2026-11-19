---
type: reference
native: UISceneDidEnterBackgroundNotification
---

# `UIWindowScene`: `background` event

The **`background`** event fires when this scene has entered the background. At this point the UI is no longer shown, and the system may then suspend the App's code.

## Syntax

```
scene.addEventListener('background', (event) => { })
```

## Event object

An `Event`, with only the two fields `type` and `target`; `target` is this scene.

Not cancelable.

## When it fires

- When the user presses Home to go to the Home Screen or switches to another App, it fires after [`inactive`](inactive-event.md). The order of the two is **not verified in the simulator** on the scene; it was measured on the events of the same names on `application`.
- The value of [`activationState`](activationstate.md) read in the callback is **not verified in the simulator**.
- The callback runs a little later; see [How the runtime works](../how-it-works.md#events).

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  e.scene.addEventListener('background', () => {
    console.log('In the background now');
  });
});
```

**Effect**: when the user presses Home, the console logs `In the background now`.

## Corresponding iOS API

`UISceneDidEnterBackgroundNotification`, that is, `sceneDidEnterBackground:`.

## See also

- [`foreground`](foreground-event.md)
