---
type: reference
native: CGAffineTransform.ty
---

# `CGAffineTransform`: `ty` property

The **`ty`** property is the vertical translation.

## Value

A number, in [pt](../units.md). Its position in the matrix:

```
| a  b  0 |
| c  d  0 |
| tx ty 1 |
```

- Read-only. Assigning to it throws `TypeError: ty is read-only: structs are values, assign a whole new one instead`.

## Examples

```js
const t = CGAffineTransform.scale(2, 3).concat(CGAffineTransform.translation(10, 20));
console.log(t.ty);
```

**Result**: logs `20`.

## Corresponding iOS API

The C struct field `CGAffineTransform.ty`.

## See also

- [`CGAffineTransform()`](constructor.md)
- [Structs](../structs.md): rules shared by all structs
