---
type: reference
native: UISceneWillDeactivateNotification
---

# `UIWindowScene`: `inactive` event

The **`inactive`** event fires when this scene is about to stop being active: about to go to the background, or temporarily interrupted.

## Syntax

```
scene.addEventListener('inactive', (event) => { })
```

## Event object

An `Event`, with only the two fields `type` and `target`; `target` is this scene.

Not cancelable; `preventDefault()` has no effect.

## When it fires

- Fires when the user presses Home to go to the Home Screen or switches to another App, followed by [`background`](background-event.md).
- Temporary interruptions such as pulling down Notification Center or an incoming call also fire it; in that case there is only `inactive`, with no `background`. **The temporary-interruption case is not verified in the simulator.**
- [`activationState`](activationstate.md) read in the callback is already `'foregroundInactive'` (measured).
- The callback runs a little later; see [How the runtime works](../how-it-works.md#events).

Put code that saves data before going to the background here.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  e.scene.addEventListener('inactive', () => {
    console.log('About to leave the foreground, saving data');
  });
});
```

**Effect**: when the user presses Home, the console logs `About to leave the foreground, saving data`.

## Corresponding iOS API

`UISceneWillDeactivateNotification`, that is, `sceneWillResignActive:`.

## See also

- [`active`](active-event.md)
