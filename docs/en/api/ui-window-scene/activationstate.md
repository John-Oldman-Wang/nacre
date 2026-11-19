---
type: reference
native: UIScene.activationState
---

# `UIWindowScene`: `activationState` property

The **`activationState`** property indicates whether this scene is shown and interactive right now.

## Value

A string:

| Value | Meaning |
| --- | --- |
| `'foregroundActive'` | In the foreground, shown, and the user can interact. This is the value during normal use of the App |
| `'foregroundInactive'` | In the foreground and shown, but temporarily not receiving user input. This is the value during the brief transition before going to the background and after returning to the foreground, and while the UI is temporarily covered by something from the system (such as pulling down Notification Center) |
| `'background'` | In the background, not shown |
| `'unattached'` | The scene is not connected to the App. An old scene that the system has destroyed reads this value |
| `'unknown'` | The system returned a state the runtime doesn't recognize. Current iOS versions don't produce it |

- Read-only. Assigning to it throws `TypeError`.
- There is no corresponding "value changed" event name. When it changes, the four events [`active`](active-event.md), [`inactive`](inactive-event.md), [`foreground`](foreground-event.md), and [`background`](background-event.md) fire; read it in their callbacks.
- In the callbacks of these four events it already holds the new value (measured: `'foregroundInactive'` in the `inactive` callback). The App-level `application.state` still holds the old value at that moment, so read this property to determine the state in an event callback.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const state = e.scene.activationState;
  if (state === 'foregroundActive') {
    console.log('In the foreground, interactive');
  } else if (state === 'foregroundInactive') {
    console.log('In the foreground, temporarily not interactive');
  } else if (state === 'background') {
    console.log('In the background');
  } else {
    console.log('Other state:', state);
  }
});
```

**Effect**: logs one of the lines depending on the scene's current state.

## Corresponding iOS API

`UIScene.activationState`. `UISceneActivationStateForegroundActive` is written `'foregroundActive'`, and likewise for the rest.

## See also

- [Scene state and App state](../ui-window-scene.md#scene-state-and-app-state)
