---
type: reference
native: CGRect.size.width
---

# `CGRect`: `width` property

The **`width`** property is the width of the rectangle.

## Value

A number, in [pt](../units.md).

- Read-only. Assigning to it throws `TypeError: width is read-only: structs are values, assign a whole new one instead`.
- The value is fixed at construction and doesn't change afterward.

## Examples

```js
const r = new CGRect(10, 20, 100, 50);
console.log(r.width);
```

**Result**: It prints `100`.

## Corresponding iOS API

`rect.size.width`. ObjC's `CGRect` has two levels, `origin` and `size`; here you read `rect.width` directly on the rectangle, and the nested form `rect.size.width` also works.

## See also

- [`CGRect()`](constructor.md): this field is given at construction
- [`size`](size.md): the nested form of the same numbers
- [Structs](../structs.md): rules shared by all structs: read-only fields, plain objects accepted on write, new objects on read
