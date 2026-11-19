---
type: reference
native: CGAffineTransform.tx
---

# `CGAffineTransform`: `tx` property

The **`tx`** property is the horizontal translation.

## Value

A number, in [pt](../units.md). Its position in the matrix:

```
| a  b  0 |
| c  d  0 |
| tx ty 1 |
```

- Read-only. Assigning to it throws `TypeError: tx is read-only: structs are values, assign a whole new one instead`.

## Examples

```js
const t = CGAffineTransform.scale(2, 3).concat(CGAffineTransform.translation(10, 20));
console.log(t.tx);
```

**Result**: logs `10`.

## Corresponding iOS API

The C struct field `CGAffineTransform.tx`.

## See also

- [`CGAffineTransform()`](constructor.md)
- [Structs](../structs.md): rules shared by all structs
