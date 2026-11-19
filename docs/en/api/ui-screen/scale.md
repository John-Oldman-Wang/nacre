---
type: reference
native: UIScreen.scale
---

# `UIScreen`: `scale` property

The **`scale`** property is how many pixels one pt corresponds to on this screen.

## Value

A number with no unit: pixels per pt.

- Read-only. Assigning to it throws `TypeError`.
- On the iPhone Air simulator (iOS 27.2) it is `3`: 1 pt is 3 pixels wide.
- The same as [`traitCollection.displayScale`](../ui-trait-collection.md).
- No change notification: the `scale` of a given screen does not change.

To draw sharp bitmaps (for example a layer's [`contentsScale`](../ca-layer/contentsscale.md)), set them to this value.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  console.log(screen.scale);
});
```

**Result**: on the iPhone Air simulator (iOS 27.2), logs `3`.

## Corresponding iOS API

`UIScreen.scale`. Since iOS 26, Apple recommends reading `traitCollection.displayScale`; the two values are the same.

## See also

- [`UIScreen`](../ui-screen.md)
- [`nativeScale`](nativescale.md)
- [Units](../units.md)
