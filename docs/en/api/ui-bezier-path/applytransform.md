---
type: reference
native: "-[UIBezierPath applyTransform:]"
---

# `UIBezierPath`: `applyTransform()` method

The **`applyTransform()`** method applies an affine transform to every point in the path: moving, scaling, or rotating it. It changes this path directly and doesn't return a new one.

## Syntax

```
applyTransform(transform)
```

### Parameters

**`transform`**

A `CGAffineTransform`, created with `CGAffineTransform.translation()`, `CGAffineTransform.scale()`, or `CGAffineTransform.rotation()`; see [structs](../structs.md). Can also be a plain object with the same fields, `{ a, b, c, d, tx, ty }`.

Scaling and rotation are about the coordinate origin (0, 0), not the center of the path.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- `transform` isn't an object: `applyTransform needs an object with all of: a, b, c, d, tx, ty`.
- A field is missing or can't be converted to a finite number: `applyTransform is missing tx, or it is not a finite number` (`tx` replaced by whichever field is actually missing).

## Examples

```js
const box = UIBezierPath.bezierPathWithRect(new CGRect(0, 0, 100, 100));
box.applyTransform(CGAffineTransform.translation(10, 0));
console.log(box.bounds.x);
```

**Result**: The console prints `10`. The whole rectangle moved 10 pt to the right.

## Corresponding iOS API

`-[UIBezierPath applyTransform:]`.

## See also

- [Structs](../structs.md): `CGAffineTransform`
