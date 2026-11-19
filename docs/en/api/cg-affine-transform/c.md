---
type: reference
native: CGAffineTransform.c
---

# `CGAffineTransform`: `c` property

The **`c`** property is the number in the second row, first column of the matrix. When there is only scaling and translation, it is 0.

## Value

A number; a ratio with no unit. Its position in the matrix:

```
| a  b  0 |
| c  d  0 |
| tx ty 1 |
```

- Read-only. Assigning to it throws `TypeError: c is read-only: structs are values, assign a whole new one instead`.

## Examples

```js
const t = CGAffineTransform.scale(2, 3).concat(CGAffineTransform.translation(10, 20));
console.log(t.c);
```

**Result**: logs `0`.

## Corresponding iOS API

The C struct field `CGAffineTransform.c`.

## See also

- [`CGAffineTransform()`](constructor.md)
- [Structs](../structs.md): rules shared by all structs
