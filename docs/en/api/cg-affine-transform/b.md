---
type: reference
native: CGAffineTransform.b
---

# `CGAffineTransform`: `b` property

The **`b`** property is the number in the first row, second column of the matrix. When there is only scaling and translation, it is 0.

## Value

A number; a ratio with no unit. Its position in the matrix:

```
| a  b  0 |
| c  d  0 |
| tx ty 1 |
```

- Read-only. Assigning to it throws `TypeError: b is read-only: structs are values, assign a whole new one instead`.

## Examples

```js
const t = CGAffineTransform.scale(2, 3).concat(CGAffineTransform.translation(10, 20));
console.log(t.b);
```

**Result**: logs `0`.

## Corresponding iOS API

The C struct field `CGAffineTransform.b`.

## See also

- [`CGAffineTransform()`](constructor.md)
- [Structs](../structs.md): rules shared by all structs
