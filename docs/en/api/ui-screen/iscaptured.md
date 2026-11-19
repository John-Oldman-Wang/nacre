---
type: reference
native: UIScreen.isCaptured
---

# `UIScreen`: `isCaptured` property

The **`isCaptured`** property indicates whether the screen is being recorded, cast, or mirrored to another screen right now.

## Value

A boolean.

- Read-only. Assigning to it throws `TypeError`.
- `true`: the screen's contents are being recorded, sent over AirPlay, or mirrored.
- `false`: they are not. In the simulator, it reads `false` when not recording.
- The [`capturedchange`](capturedchange-event.md) event fires when it changes.

It does not cover screenshots: taking a screenshot does not make it `true`.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  console.log(screen.isCaptured);
});
```

**Result**: when not recording, logs `false`.

## Corresponding iOS API

`UIScreen.isCaptured` (in ObjC the property name is `captured` and the getter is `isCaptured`).

## See also

- [`capturedchange`](capturedchange-event.md): an example that covers sensitive content when recording starts and stops
