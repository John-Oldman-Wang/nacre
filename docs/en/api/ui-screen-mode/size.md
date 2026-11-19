---
type: reference
native: UIScreenMode.size
---

# `UIScreenMode`: `size` property

The **`size`** property is the size of this display mode, in pixels.

## Value

A [`CGSize`](../cg-size.md), in pixels.

- Read-only; assigning to it throws `TypeError`.
- In the iPhone Air simulator (iOS 27.2), the `size` of the screen's `currentMode` is `1260 × 2736`, the same as the screen's [`nativeBounds`](../ui-screen/nativebounds.md).
- The value doesn't change for a given display mode object.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  console.log(screen.currentMode !== null && screen.currentMode.size.height);
});
```

**Result**: In the iPhone Air simulator (iOS 27.2), prints `2736`.

## Corresponding iOS API

`UIScreenMode.size`.

## See also

- [`UIScreenMode`](../ui-screen-mode.md)
