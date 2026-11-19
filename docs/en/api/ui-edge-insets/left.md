---
type: reference
native: UIEdgeInsets.left
---

# `UIEdgeInsets`: `left` property

The **`left`** property is the distance the left edge is inset.

## Value

A number, in [pt](../units.md). `left` is always the left side of the screen and does not change with text direction.

- Read-only; assigning to it throws `TypeError: left is read-only: structs are values, assign a whole new one instead`.
- The value is fixed at construction and does not change afterward.

## Examples

```js
const insets = new UIEdgeInsets(8, 16, 4, 12);
console.log(insets.left);
```

**Result**: Prints `16`.

## Corresponding iOS API

The C struct field `UIEdgeInsets.left`.

## See also

- [`UIEdgeInsets()`](constructor.md): this field is given at construction
- [Structs](../structs.md): the rules shared by all structs: fields are read-only, a plain object can be given when writing, and reads return a new object
