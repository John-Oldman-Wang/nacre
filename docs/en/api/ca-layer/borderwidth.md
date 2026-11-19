---
type: reference
native: CALayer.borderWidth
---

# `CALayer`: `borderWidth` property

The **`borderWidth`** property is the width of the border.

## Value

A number, in [pt](../units.md).

- Readable and writable.
- Defaults to `0`: no border.
- The border is drawn inside the layer's bounds, doesn't make the layer bigger, and follows the rounded corners.
- The border is drawn above the background color, subviews, and sublayers, and covers content at the edges. **The stacking of the border and content is not verified in the simulator.**
- Setting only `borderWidth` without a color gives a black border: [`borderColor`](bordercolor.md) defaults to opaque black.

### Invalid values

The written value is converted to a number with `Number()`. Values that don't convert to a finite number throw `TypeError`.

## Examples

```js
const card = new UIView();
card.layer.borderWidth = 2;
card.layer.borderColor = '#5856D6';
```

**Effect**: A 2 pt purple border appears around the card.

## Corresponding iOS API

`CALayer.borderWidth`.

## See also

- [`borderColor`](bordercolor.md)
