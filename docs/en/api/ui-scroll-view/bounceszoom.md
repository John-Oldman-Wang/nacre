---
type: reference
native: UIScrollView.bouncesZoom
---

# `UIScrollView`: `bouncesZoom` property

The **`bouncesZoom`** property indicates whether, after zooming beyond the minimum or maximum scale, it springs back into range on release.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | It can go slightly beyond, springing back on release |
| `false` | Zooming stops at the edge of the range |

- Readable and writable.
- This property was added from the iOS headers. The acceptance tests verify that it can be read, has the right type, and reads back unchanged after writing back the original value; its effect is **not verified in the simulator**, and the usage follows Apple's documentation.
- Values of other types are converted by JS truthiness.
- No change event: only the app's own code changes it.

## Examples

```js
const scroller = new UIScrollView();
scroller.bouncesZoom = false;
console.log(scroller.bouncesZoom);
```

**Effect**: the console logs `false`. Zooming stops at the edge of the range; **not verified in the simulator**.

## Corresponding iOS API

`UIScrollView.bouncesZoom`.

## See also

- [`minimumZoomScale`](minimumzoomscale.md)
