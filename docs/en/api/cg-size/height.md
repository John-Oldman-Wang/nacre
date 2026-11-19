---
type: reference
native: CGSize.height
---

# `CGSize`: `height` property

The **`height`** property is the height.

## Value

A number, in [pt](../units.md).

- Read-only; assigning to it throws `TypeError: height is read-only: structs are values, assign a whole new one instead`.
- The value is fixed at construction and does not change afterward.

## Examples

```js
const s = new CGSize(100, 50);
console.log(s.height);
```

**Result**: Prints `50`.

## Corresponding iOS API

The C struct field `CGSize.height`.

## See also

- [`CGSize()`](constructor.md): this field is given at construction
- [Structs](../structs.md): the rules shared by all structs: fields are read-only, a plain object can be given when writing, and reads return a new object
