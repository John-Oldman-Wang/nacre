---
type: reference
native: CALayer.shadowRadius
---

# `CALayer`: `shadowRadius` property

The **`shadowRadius`** property is how far the shadow's edge is blurred. Larger is softer.

## Value

A number, in [pt](../units.md).

- Readable and writable.
- Defaults to `3`.

### Invalid values

The written value is converted to a number with `Number()`. Values that don't convert to a finite number throw `TypeError`.

## Examples

```js
const layer = new CALayer();
console.log(layer.shadowRadius);
layer.shadowRadius = 8;
```

**Result**: The console prints `3`.

## Corresponding iOS API

`CALayer.shadowRadius`.

## See also

- [`shadowOpacity`](shadowopacity.md)
