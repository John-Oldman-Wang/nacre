---
type: reference
native: CGRect.size.height
---

# `CGRect`: `height` property

The **`height`** property is the height of the rectangle.

## Value

A number, in [pt](../units.md).

- Read-only. Assigning to it throws `TypeError: height is read-only: structs are values, assign a whole new one instead`.
- The value is fixed at construction and doesn't change afterward.

## Examples

```js
const r = new CGRect(10, 20, 100, 50);
console.log(r.height);
```

**Result**: It prints `50`.

## Corresponding iOS API

`rect.size.height`. ObjC's `CGRect` has two levels, `origin` and `size`; here you read `rect.height` directly on the rectangle, and the nested form `rect.size.height` also works.

## See also

- [`CGRect()`](constructor.md): this field is given at construction
- [`size`](size.md): the nested form of the same numbers
- [Structs](../structs.md): rules shared by all structs: read-only fields, plain objects accepted on write, new objects on read
