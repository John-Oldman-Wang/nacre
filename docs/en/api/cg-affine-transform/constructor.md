---
type: reference
native: CGAffineTransformMake
---

# `CGAffineTransform()` constructor

The **`CGAffineTransform()`** constructor creates a transform from the six numbers of the matrix given directly.

In everyday use you do not need to fill in these six numbers directly: create basic transforms with [`scale()`](scale.md), [`translation()`](translation.md), and [`rotation()`](rotation.md), then combine them with [`concat()`](concat.md). Use the constructor only when those methods cannot produce the transform you need.

## Syntax

```
new CGAffineTransform([a[, b[, c[, d[, tx[, ty]]]]]])
```

### Parameters

**`a`**, **`b`**, **`c`**, **`d`**, **`tx`**, **`ty`**

The six numbers of the matrix, positioned as below. `tx` and `ty` are translations, in [pt](../units.md); the other four are ratios with no unit.

```
| a  b  0 |
| c  d  0 |
| tx ty 1 |
```

Each argument is converted to a number. Omitted arguments are 0, so `new CGAffineTransform()` gives six zeros, not the identity matrix; for the identity matrix use [`CGAffineTransform.identity`](identity.md).

### Return value

A new `CGAffineTransform`. Its fields are read-only.

### Exceptions

**`TypeError`**

An argument cannot be converted to a finite number: `a struct field must be a finite number, got NaN`, ending with the value received.

## Examples

```js
const skew = new CGAffineTransform(1, 0, 0.5, 1, 0, 0);
console.log(String(skew));
```

**Result**: logs `CGAffineTransform(1, 0, 0.5, 1, 0, 0)`. Assigned to a view's `transform`, it skews the view horizontally; **how it looks on screen is not verified in the simulator**.

## Corresponding iOS API

`CGAffineTransformMake(a, b, c, d, tx, ty)`.

## See also

- [`CGAffineTransform.identity`](identity.md): the identity matrix
- [Structs](../structs.md): rules shared by all structs
