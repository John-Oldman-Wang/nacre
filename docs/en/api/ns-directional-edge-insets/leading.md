---
type: reference
native: NSDirectionalEdgeInsets.leading
---

# `NSDirectionalEdgeInsets`: `leading` property

The **`leading`** property is the distance the side where text starts is inset.

## Value

A number, in [pt](../units.md). It is the left side in left-to-right languages and the right side in right-to-left languages. The swap for right-to-left is **not verified in the simulator**.

- Read-only. Assigning to it throws `TypeError: leading is read-only: structs are values, assign a whole new one instead`.
- The value is fixed at construction and doesn't change afterward.

## Examples

```js
const m = new NSDirectionalEdgeInsets(8, 16, 4, 12);
console.log(m.leading);
```

**Result**: It prints `16`.

## Corresponding iOS API

The C struct field `NSDirectionalEdgeInsets.leading`.

## See also

- [`NSDirectionalEdgeInsets()`](constructor.md): this field is given at construction
- [Structs](../structs.md): rules shared by all structs: read-only fields, plain objects accepted on write, new objects on read
