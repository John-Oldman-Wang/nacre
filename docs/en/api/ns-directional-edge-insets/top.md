---
type: reference
native: NSDirectionalEdgeInsets.top
---

# `NSDirectionalEdgeInsets`: `top` property

The **`top`** property is the distance the top edge is inset.

## Value

A number, in [pt](../units.md).

- Read-only. Assigning to it throws `TypeError: top is read-only: structs are values, assign a whole new one instead`.
- The value is fixed at construction and doesn't change afterward.

## Examples

```js
const m = new NSDirectionalEdgeInsets(8, 16, 4, 12);
console.log(m.top);
```

**Result**: It prints `8`.

## Corresponding iOS API

The C struct field `NSDirectionalEdgeInsets.top`.

## See also

- [`NSDirectionalEdgeInsets()`](constructor.md): this field is given at construction
- [Structs](../structs.md): rules shared by all structs: read-only fields, plain objects accepted on write, new objects on read
