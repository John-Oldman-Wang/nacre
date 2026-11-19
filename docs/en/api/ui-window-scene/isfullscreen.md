---
type: reference
native: UIWindowScene.fullScreen
---

# `UIWindowScene`: `isFullScreen` property

The **`isFullScreen`** property indicates whether the scene fills the whole screen.

## Value

A boolean.

| Value | Meaning |
| --- | --- |
| `true` | The scene fills the whole screen |
| `false` | It doesn't |

- Read-only. Assigning to it throws `TypeError`.
- Determined by the system. The value read on iPhone is **not verified in the simulator**.
- No change notification: the corresponding native event isn't provided yet.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  console.log(e.scene.isFullScreen);
});
```

**Result**: logs whether this scene fills the screen. **Not verified in the simulator.**

## Corresponding iOS API

`UIWindowScene.fullScreen`. In JS it is called `isFullScreen`.

## See also

- [`UIWindowScene`](../ui-window-scene.md)
