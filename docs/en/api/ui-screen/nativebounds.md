---
type: reference
native: UIScreen.nativeBounds
---

# `UIScreen`: `nativeBounds` property

The **`nativeBounds`** property is the extent of the physical screen, in pixels.

## Value

A [`CGRect`](../cg-rect.md), in pixels.

- Read-only. Assigning to it throws `TypeError`.
- On the iPhone Air simulator (iOS 27.2) it is `1260 × 2736`, equal to [`bounds`](bounds.md) times [`nativeScale`](nativescale.md).
- By iOS's definition it is always given in portrait and does not change between portrait and landscape. **Not verified in the simulator.**
- No change notification.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  console.log(screen.nativeBounds.width, screen.nativeBounds.height);
});
```

**Result**: on the iPhone Air simulator (iOS 27.2), logs `1260 2736`.

## Corresponding iOS API

`UIScreen.nativeBounds`.

## See also

- [`bounds`](bounds.md)
- [`nativeScale`](nativescale.md)
