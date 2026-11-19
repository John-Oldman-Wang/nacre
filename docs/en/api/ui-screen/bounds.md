---
type: reference
native: UIScreen.bounds
---

# `UIScreen`: `bounds` property

The **`bounds`** property is the extent of the whole screen, in [pt](../units.md).

## Value

A [`CGRect`](../cg-rect.md), in pt.

- Read-only. Assigning to it throws `TypeError`.
- The origin is `(0, 0)`, and the width and height are the screen's size in points. On the iPhone Air simulator (iOS 27.2) it is `420 × 912`.
- Held upright, height is greater than width. Whether width and height swap in landscape is **not verified in the simulator**.
- No change notification. The screen's size changes only when rotating between portrait and landscape.

It is the whole screen, including the areas occupied by the status bar and the home indicator at the bottom. To place content clear of them, use the view's safe area ([`safeAreaLayoutGuide`](../ui-view/safearealayoutguide.md)), not calculations from the screen's size.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  console.log(screen.bounds.width, screen.bounds.height);
});
```

**Result**: on the iPhone Air simulator (iOS 27.2), logs `420 912`.

## Corresponding iOS API

`UIScreen.bounds`.

## See also

- [`nativeBounds`](nativebounds.md): the same screen's size in pixels
- [Units](../units.md)
