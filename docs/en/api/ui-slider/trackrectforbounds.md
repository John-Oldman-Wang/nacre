---
type: reference
native: "-[UISlider trackRectForBounds:]"
---

# `UISlider`: `trackRectForBounds()` method

The **`trackRectForBounds()`** method returns where the track is drawn when the slider occupies the given bounds.

Use it to align other views with a part of the slider.

## Syntax

```
trackRectForBounds(bounds)
```

### Parameters

**`bounds`**

A rectangle: a [`CGRect`](../structs.md), or an object with the four numbers `x`, `y`, `width`, `height`. Usually `slider.bounds`. In [pt](../units.md).

### Return value

A [`CGRect`](../structs.md) in the slider's own coordinate system, in pt. Measured on a 300 × 34 pt slider with no end images, the track is `(0, 14, 300, 6)`.

### Exceptions

**`TypeError`**

- `bounds` is not an object: `trackRectForBounds needs an object with all of: x, y, width, height`.
- A field is missing or not a finite number: `trackRectForBounds is missing width, or it is not a finite number` (with the name of the field actually missing).

## Examples

```js
const slider = new UISlider();
const rect = slider.trackRectForBounds({ x: 0, y: 0, width: 300, height: 34 });
console.log(rect.x, rect.y, rect.width, rect.height);
```

**Result**: Prints the position and size of this part.

## Corresponding iOS API

`-[UISlider trackRectForBounds:]`.

## See also

- [`thumbRectForBounds()`](thumbrectforbounds.md): the position of the thumb
- [Structs](../structs.md): `CGRect`
