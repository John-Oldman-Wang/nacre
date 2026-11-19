---
type: reference
native: CGPoint.x
---

# `CGPoint`: `x` property

The **`x`** property is the point's x-coordinate.

## Value

A number, in [pt](../units.md). The origin is at the top left, and `x` increases to the right.

- Read-only. Assigning to it throws `TypeError: x is read-only: structs are values, assign a whole new one instead`.
- The value is fixed at construction and doesn't change afterward.

## Examples

```js
const p = new CGPoint(10, 20);
console.log(p.x);
```

**Result**: Prints `10`.

## Corresponding iOS API

The C struct field `CGPoint.x`.

## See also

- [`CGPoint()`](constructor.md): this field is given at construction
- [Structs](../structs.md): the rules shared by all structs: fields are read-only, plain objects are accepted on write, and reads return new objects
