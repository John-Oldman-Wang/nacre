---
type: reference
native: CAShapeLayer.miterLimit
---

# `CAShapeLayer`: `miterLimit` property

The **`miterLimit`** property is the length limit for sharp corners when `lineJoin` is `'miter'`.

## Value

A number: the ratio of the corner's length to the line width, with no unit.

- Readable and writable.
- Defaults to `10`.
- Corners beyond the limit are drawn as `'bevel'` instead, with the tip cut off flat.

### Invalid values

Written values are converted with `Number()`. Values that cannot be converted to a finite number throw `TypeError`.

## Examples

```js
const shape = new CAShapeLayer();
shape.lineJoin = 'miter';
shape.miterLimit = 4;
console.log(shape.miterLimit);
```

**Result**: the console logs `4`.

## Corresponding iOS API

`CAShapeLayer.miterLimit`.

## See also

- [`lineJoin`](linejoin.md)
