---
type: reference
native: CGRect.origin.x
---

# `CGRect`: `x` property

The **`x`** property is the horizontal coordinate of the rectangle's top-left corner.

## Value

A number, in [pt](../units.md).

- Read-only. Assigning to it throws `TypeError: x is read-only: structs are values, assign a whole new one instead`.
- The value is fixed at construction and doesn't change afterward.

## Examples

```js
const r = new CGRect(10, 20, 100, 50);
console.log(r.x);
```

**Result**: It prints `10`.

## Corresponding iOS API

`rect.origin.x`. ObjC's `CGRect` has two levels, `origin` and `size`; here you read `rect.x` directly on the rectangle, and the nested form `rect.origin.x` also works.

## See also

- [`CGRect()`](constructor.md): this field is given at construction
- [`origin`](origin.md): the nested form of the same numbers
- [Structs](../structs.md): rules shared by all structs: read-only fields, plain objects accepted on write, new objects on read
