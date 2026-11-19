---
type: reference
native: UIEdgeInsets.top
---

# `UIEdgeInsets`: `top` property

The **`top`** property is the distance the top edge is inset.

## Value

A number, in [pt](../units.md).

- Read-only; assigning to it throws `TypeError: top is read-only: structs are values, assign a whole new one instead`.
- The value is fixed at construction and does not change afterward.

## Examples

```js
const insets = new UIEdgeInsets(8, 16, 4, 12);
console.log(insets.top);
```

**Result**: Prints `8`.

## Corresponding iOS API

The C struct field `UIEdgeInsets.top`.

## See also

- [`UIEdgeInsets()`](constructor.md): this field is given at construction
- [Structs](../structs.md): the rules shared by all structs: fields are read-only, a plain object can be given when writing, and reads return a new object
