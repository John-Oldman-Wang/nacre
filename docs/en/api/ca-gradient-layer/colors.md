---
type: reference
native: CAGradientLayer.colors
---

# `CAGradientLayer`: `colors` property

The **`colors`** property is the colors the gradient passes through in order.

## Value

When writing, an array of [colors](../ui-color.md), each a color string or a `UIColor` object; when reading, an array of color strings.

- Readable and writable.
- Defaults to an empty array `[]`.
- At least two colors are needed. With only one, or none, no gradient is drawn. **Not verified in the simulator.**
- Without [`locations`](locations.md), the colors are evenly distributed.
- Reads return strings, but not necessarily the strings that were written: a color that changes with light and dark mode is resolved, at the moment of writing, into a fixed color according to the mode of the view that owns the layer; reading it back gives the resolved value, which doesn't change when the mode switches later. See [Colors on layers](../ca-layer.md#colors-on-layers).

### Invalid values

If even one color in the array is invalid, the whole array isn't written, the existing gradient stays unchanged, and the console prints a warning.

## Examples

```js
const gradient = new CAGradientLayer();
gradient.colors = ['#5856D6', '#FF2D55'];
console.log(gradient.colors.length);
```

**Result**: the console prints `2`. When displayed, it shades evenly from purple at the top to pink at the bottom.

## Corresponding iOS API

`CAGradientLayer.colors`. In ObjC it's an array of `CGColor`; here you write color strings.

## See also

- [`locations`](locations.md)
- [`UIColor`](../ui-color.md)
