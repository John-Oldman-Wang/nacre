---
type: reference
native: UISceneWillEnterForegroundNotification
---

# `UIWindowScene`: `foreground` event

The **`foreground`** event fires when this scene is about to return to the foreground.

## Syntax

```
scene.addEventListener('foreground', (event) => { })
```

## Event object

An `Event`, with only the two fields `type` and `target`; `target` is this scene.

Not cancelable.

## When it fires

- Fires when the user switches back to the App from the Home Screen, followed by [`active`](active-event.md). The order of the two is **not verified in the simulator**.
- Whether it also fires after the scene connects at App launch is **not verified in the simulator**.
- The callback runs a little later; see [How the runtime works](../how-it-works.md#events).

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  e.scene.addEventListener('foreground', () => {
    console.log('About to return to the foreground');
  });
});
```

**Effect**: when the user switches back to the App from the Home Screen, the console logs `About to return to the foreground`.

## Corresponding iOS API

`UISceneWillEnterForegroundNotification`, that is, `sceneWillEnterForeground:`.

## See also

- [`background`](background-event.md)
