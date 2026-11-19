---
type: reference
native: UISlider.currentThumbImage
---

# `UISlider`: `currentThumbImage` property

The **`currentThumbImage`** property is the thumb image the slider uses for its current [state](../ui-control.md#states).

## Value

[`UIImage`](../ui-image.md), or `null`.

- Read-only. Assigning to it throws `TypeError`.
- `null` when the image hasn't been replaced with [`setThumbImage()`](setthumbimage.md), meaning the system-drawn appearance is used.
- What it returns after a thumb image is set is **not verified in the simulator**: measured, a slider not placed in a window still reads `null`, though sometimes it reads the image that was set. To know which image was set, use [`thumbImageForState()`](thumbimageforstate.md).

It changes with the state and has no separate change notification.

## Examples

```js
const slider = new UISlider();
console.log(slider.currentThumbImage);
```

**Result**: Prints `null`. The thumb image hasn't been replaced.

## Corresponding iOS API

`UISlider.currentThumbImage`.

## See also

- [`setThumbImage()`](setthumbimage.md)
- [`thumbImageForState()`](thumbimageforstate.md)
