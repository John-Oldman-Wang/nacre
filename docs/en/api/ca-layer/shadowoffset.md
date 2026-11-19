---
type: reference
native: CALayer.shadowOffset
---

# `CALayer`: `shadowOffset` property

The **`shadowOffset`** property is the shadow's offset from the layer.

## Value

A [`CGSize`](../structs.md), in [pt](../units.md).

- Readable and writable.
- Defaults to `(0, -3)`, offset 3 pt upward.
- A positive `width` goes right; a positive `height` goes down.
- When writing, you can give a `CGSize` or `{ width, height }`.

### Invalid values

**`TypeError`**

The value isn't an object, or is missing fields, or a field isn't a finite number.

## Examples

```js
const layer = new CALayer();
layer.shadowOffset = new CGSize(0, 4);
console.log(layer.shadowOffset.height);
```

**Result**: The console prints `4`. The shadow is offset 4 pt downward.

## Corresponding iOS API

`CALayer.shadowOffset`. `CGSizeMake(0, 4)` is written `new CGSize(0, 4)`.

## See also

- [`shadowOpacity`](shadowopacity.md)
