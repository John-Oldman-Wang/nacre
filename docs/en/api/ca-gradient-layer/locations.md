---
type: reference
native: CAGradientLayer.locations
---

# `CAGradientLayer`: `locations` property

The **`locations`** property gives the position of each color along the gradient.

## Value

An array of numbers, or `null`. Each item is a fraction from 0 to 1: 0 is the start point and 1 is the end point.

- Readable and writable.
- Defaults to `null`, which distributes the colors evenly.
- Should have the same number of items as [`colors`](colors.md). The effect when the counts differ is **not verified in the simulator**.

### Invalid values

**`TypeError`**

- An item can't be converted to a finite number: `locations[0] must be a finite number, got …`.
- The value is neither an array nor `null`: `locations must be an array of numbers or null, got …`.

## Examples

```js
const gradient = new CAGradientLayer();
gradient.colors = ['#5856D6', '#FF2D55', '#FF9500'];
gradient.locations = [0, 0.3, 1];
```

**Effect**: starts purple, becomes pink at 30%, and becomes orange at the end point. **Not verified in the simulator.**

## Corresponding iOS API

`CAGradientLayer.locations`. `@[@0, @0.3, @1]` is written as `[0, 0.3, 1]`.

## See also

- [`colors`](colors.md)
