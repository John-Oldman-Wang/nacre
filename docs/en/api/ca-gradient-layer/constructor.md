---
type: reference
native: "-[CAGradientLayer init]"
---

# `CAGradientLayer()` constructor

The **`CAGradientLayer()`** constructor creates a gradient layer.

## Syntax

```
new CAGradientLayer()
```

### Parameters

None.

### Return value

A new `CAGradientLayer`: its `frame` is `(0, 0, 0, 0)`, [`colors`](colors.md) is an empty array, and it's a top-to-bottom linear gradient. It becomes visible only after you set the colors and `frame` and add it under a parent layer.

### Exceptions

**`TypeError`**

It can't be subclassed; see [Native classes](../native-classes.md).

## Examples

```js
const gradient = new CAGradientLayer();
console.log(gradient.colors.length, gradient.type);
```

**Result**: the console prints `0 axial`.

## Corresponding iOS API

`[CAGradientLayer layer]`.

## See also

- [`colors`](colors.md)
