---
type: reference
native: NSDirectionalEdgeInsets.trailing
---

# `NSDirectionalEdgeInsets`: `trailing` property

The **`trailing`** property is the distance the side where text ends is inset.

## Value

A number, in [pt](../units.md). It is the right side in left-to-right languages and the left side in right-to-left languages. The swap for right-to-left is **not verified in the simulator**.

- Read-only. Assigning to it throws `TypeError: trailing is read-only: structs are values, assign a whole new one instead`.
- The value is fixed at construction and doesn't change afterward.

## Examples

```js
const m = new NSDirectionalEdgeInsets(8, 16, 4, 12);
console.log(m.trailing);
```

**Result**: It prints `12`.

## Corresponding iOS API

The C struct field `NSDirectionalEdgeInsets.trailing`.

## See also

- [`NSDirectionalEdgeInsets()`](constructor.md): this field is given at construction
- [Structs](../structs.md): rules shared by all structs: read-only fields, plain objects accepted on write, new objects on read
