---
type: reference
native: CGAffineTransform.a
---

# `CGAffineTransform`: `a` property

The **`a`** property is the number in the first row, first column of the matrix. When there is only scaling, it is the horizontal multiple.

## Value

A number; a ratio with no unit. Its position in the matrix:

```
| a  b  0 |
| c  d  0 |
| tx ty 1 |
```

- Read-only. Assigning to it throws `TypeError: a is read-only: structs are values, assign a whole new one instead`.

## Examples

```js
const t = CGAffineTransform.scale(2, 3).concat(CGAffineTransform.translation(10, 20));
console.log(t.a);
```

**Result**: logs `2`.

## Corresponding iOS API

The C struct field `CGAffineTransform.a`.

## See also

- [`CGAffineTransform()`](constructor.md)
- [Structs](../structs.md): rules shared by all structs
