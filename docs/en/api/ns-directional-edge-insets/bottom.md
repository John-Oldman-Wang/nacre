---
type: reference
native: NSDirectionalEdgeInsets.bottom
---

# `NSDirectionalEdgeInsets`: `bottom` property

The **`bottom`** property is the distance the bottom edge is inset.

## Value

A number, in [pt](../units.md).

- Read-only. Assigning to it throws `TypeError: bottom is read-only: structs are values, assign a whole new one instead`.
- The value is fixed at construction and doesn't change afterward.

## Examples

```js
const m = new NSDirectionalEdgeInsets(8, 16, 4, 12);
console.log(m.bottom);
```

**Result**: It prints `4`.

## Corresponding iOS API

The C struct field `NSDirectionalEdgeInsets.bottom`.

## See also

- [`NSDirectionalEdgeInsets()`](constructor.md): this field is given at construction
- [Structs](../structs.md): rules shared by all structs: read-only fields, plain objects accepted on write, new objects on read
