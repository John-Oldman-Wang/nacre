---
type: reference
native: UISlider.currentMinimumTrackImage
---

# `UISlider`: `currentMinimumTrackImage` property

The **`currentMinimumTrackImage`** property is the image of the track to the left of the thumb that the slider uses for its current [state](../ui-control.md#states).

## Value

[`UIImage`](../ui-image.md), or `null`.

- Read-only. Assigning to it throws `TypeError`.
- `null` when the image hasn't been replaced with [`setMinimumTrackImage()`](setminimumtrackimage.md), meaning the system-drawn appearance is used.
- After an image is set, it reads the image for the current state (measured).

It changes with the state and has no separate change notification.

## Examples

```js
const slider = new UISlider();
const bar = UIImage.systemImageNamed('minus');
slider.setMinimumTrackImage(bar, { forState: ['normal'] });
console.log(slider.currentMinimumTrackImage === bar);
```

**Result**: Prints `true`.

## Corresponding iOS API

`UISlider.currentMinimumTrackImage`.

## See also

- [`setMinimumTrackImage()`](setminimumtrackimage.md)
- [`minimumTrackImageForState()`](minimumtrackimageforstate.md)
