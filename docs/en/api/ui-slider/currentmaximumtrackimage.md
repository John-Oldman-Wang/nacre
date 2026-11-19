---
type: reference
native: UISlider.currentMaximumTrackImage
---

# `UISlider`: `currentMaximumTrackImage` property

The **`currentMaximumTrackImage`** property is the image of the track to the right of the thumb that the slider uses for its current [state](../ui-control.md#states).

## Value

[`UIImage`](../ui-image.md), or `null`.

- Read-only. Assigning to it throws `TypeError`.
- `null` when the image hasn't been replaced with [`setMaximumTrackImage()`](setmaximumtrackimage.md), meaning the system-drawn appearance is used.
- After an image is set, it reads the image for the current state (measured).

It changes with the state and has no separate change notification.

## Examples

```js
const slider = new UISlider();
const bar = UIImage.systemImageNamed('minus');
slider.setMaximumTrackImage(bar, { forState: ['normal'] });
console.log(slider.currentMaximumTrackImage === bar);
```

**Result**: Prints `true`.

## Corresponding iOS API

`UISlider.currentMaximumTrackImage`.

## See also

- [`setMaximumTrackImage()`](setmaximumtrackimage.md)
- [`maximumTrackImageForState()`](maximumtrackimageforstate.md)
