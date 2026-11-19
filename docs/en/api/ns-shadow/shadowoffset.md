---
type: reference
native: NSShadow.shadowOffset
---

# `NSShadow`: `shadowOffset` property

The **`shadowOffset`** property is how far the shadow is offset from the text.

## Value

A [`CGSize`](../structs.md), in [pt](../units.md).

- Readable and writable.
- The default is `(0, 0)`.
- A positive `width` is to the right, and a positive `height` is downward. Negative numbers are to the left and upward.
- Accepts a `CGSize` or `{ width, height }` on write. The `CGSize` read back is read-only; to change it, assign a new value.

### Invalid values

**`TypeError`**

Not an object, or a field is missing or not a finite number; for example, `shadowOffset is missing height, or it is not a finite number`.

## Examples

```js
const shadow = new NSShadow();
shadow.shadowOffset = { width: 1, height: 2 };
console.log(shadow.shadowOffset.width, shadow.shadowOffset.height);
```

**Result**: The console prints `1 2`.

## Corresponding iOS API

`NSShadow.shadowOffset`.

## See also

- [Structs](../structs.md)
