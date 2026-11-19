---
type: reference
native: CGRect.origin.y
---

# `CGRect`: `y` property

The **`y`** property is the vertical coordinate of the rectangle's top-left corner.

## Value

A number, in [pt](../units.md).

- Read-only. Assigning to it throws `TypeError: y is read-only: structs are values, assign a whole new one instead`.
- The value is fixed at construction and doesn't change afterward.

## Examples

```js
const r = new CGRect(10, 20, 100, 50);
console.log(r.y);
```

**Result**: It prints `20`.

## Corresponding iOS API

`rect.origin.y`. ObjC's `CGRect` has two levels, `origin` and `size`; here you read `rect.y` directly on the rectangle, and the nested form `rect.origin.y` also works.

## See also

- [`CGRect()`](constructor.md): this field is given at construction
- [`origin`](origin.md): the nested form of the same numbers
- [Structs](../structs.md): rules shared by all structs: read-only fields, plain objects accepted on write, new objects on read
