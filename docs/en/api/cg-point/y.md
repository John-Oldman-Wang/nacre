---
type: reference
native: CGPoint.y
---

# `CGPoint`: `y` property

The **`y`** property is the point's y-coordinate.

## Value

A number, in [pt](../units.md). The origin is at the top left, and `y` increases downward.

- Read-only. Assigning to it throws `TypeError: y is read-only: structs are values, assign a whole new one instead`.
- The value is fixed at construction and doesn't change afterward.

## Examples

```js
const p = new CGPoint(10, 20);
console.log(p.y);
```

**Result**: Prints `20`.

## Corresponding iOS API

The C struct field `CGPoint.y`.

## See also

- [`CGPoint()`](constructor.md): this field is given at construction
- [Structs](../structs.md): the rules shared by all structs: fields are read-only, plain objects are accepted on write, and reads return new objects
