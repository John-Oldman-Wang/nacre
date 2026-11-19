---
type: reference
native: "-[UISlider thumbRectForBounds:trackRect:value:]"
---

# `UISlider`: `thumbRectForBounds()` method

The **`thumbRectForBounds()`** method returns where the thumb is drawn within the slider for a given value.

Use it to line other views up with the thumb, for example a value bubble that follows the thumb during a drag.

## Syntax

```
thumbRectForBounds(bounds, { trackRect, value })
```

### Parameters

**`bounds`**

A rectangle: a [`CGRect`](../structs.md), or an object with the four numbers `x`, `y`, `width`, `height`. Usually `slider.bounds`. In [pt](../units.md).

**`options.trackRect`**

Required. The track's rectangle; pass the result of [`trackRectForBounds()`](trackrectforbounds.md).

**`options.value`**

Required. The value to ask about, a number, converted with `Number()`. Usually `slider.value`.

### Return value

A [`CGRect`](../structs.md) in the slider's own coordinate system, in pt.

Measured on a 300 × 34 pt slider with a range of 0 to 1 and no end images: at value 0 the thumb is `(0, 5, 37, 24)`; at value 1 it is `(263, 5, 37, 24)`. The larger the value, the farther right the thumb.

### Exceptions

**`TypeError`**

- `trackRect` not passed: `thumbRectForBounds needs { trackRect }`.
- `value` not passed: `thumbRectForBounds needs { value }`.
- `bounds` is not an object: `thumbRectForBounds needs an object with all of: x, y, width, height`.
- `trackRect` is not an object: `trackRect needs an object with all of: x, y, width, height`.
- `value` can't be converted to a finite number: `value must be a finite number, got …`.

## Examples

```js
const slider = new UISlider();
const bounds = { x: 0, y: 0, width: 300, height: 34 };
const track = slider.trackRectForBounds(bounds);
const thumb = slider.thumbRectForBounds(bounds, { trackRect: track, value: 1 });
console.log(thumb.x, thumb.width);
```

**Result**: Prints `263 37`.

## Corresponding iOS API

`-[UISlider thumbRectForBounds:trackRect:value:]`. The last two parts are written as options keys.

## See also

- [`trackRectForBounds()`](trackrectforbounds.md)
- [Making a bubble follow the thumb](../../guides/switches-sliders-steppers.md#make-a-bubble-follow-the-knob)
