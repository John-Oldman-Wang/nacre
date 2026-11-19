---
type: reference
native: UIEdgeInsets.right
---

# `UIEdgeInsets`: `right` property

The **`right`** property is the distance the right edge is inset.

## Value

A number, in [pt](../units.md). `right` is always the right side of the screen and does not change with text direction.

- Read-only; assigning to it throws `TypeError: right is read-only: structs are values, assign a whole new one instead`.
- The value is fixed at construction and does not change afterward.

## Examples

```js
const insets = new UIEdgeInsets(8, 16, 4, 12);
console.log(insets.right);
```

**Result**: Prints `12`.

## Corresponding iOS API

The C struct field `UIEdgeInsets.right`.

## See also

- [`UIEdgeInsets()`](constructor.md): this field is given at construction
- [Structs](../structs.md): the rules shared by all structs: fields are read-only, a plain object can be given when writing, and reads return a new object
