---
type: reference
native: "-[CAShapeLayer init]"
---

# `CAShapeLayer()` constructor

The **`CAShapeLayer()`** constructor creates a shape layer.

## Syntax

```
new CAShapeLayer()
```

### Parameters

None.

### Return value

A new `CAShapeLayer`: `frame` is `(0, 0, 0, 0)`, [`path`](path.md) is `null`, [`fillColor`](fillcolor.md) is opaque black, and [`strokeColor`](strokecolor.md) is `null`.

### Exceptions

**`TypeError`**

It cannot be subclassed; see [Native classes](../native-classes.md).

## Examples

```js
const shape = new CAShapeLayer();
console.log(shape.path, shape.fillColor, shape.strokeColor);
```

**Result**: the console logs `null #000000 null`.

## Corresponding iOS API

`[CAShapeLayer layer]`.

## See also

- [`path`](path.md)
