---
type: reference
native: UILabel.shadowOffset
---

# `UILabel`: `shadowOffset` property

The **`shadowOffset`** property is the offset of the text shadow from the text.

## Value

A [`CGSize`](../structs.md), in [pt](../units.md).

- Readable and writable.
- `width` is the offset to the right and `height` is the offset downward. Negative numbers mean left and up.
- The default is `(0, -1)`, that is, 1 pt up (**not verified in the simulator**).
- Accepts a `CGSize` or `{ width, height }` on write.
- The `CGSize` read is read-only. To change the offset, assign a new value; see [Structs](../structs.md).
- The shadow is only visible when [`shadowColor`](shadowcolor.md) is not `null`.

### Invalid values

**`TypeError`**

- Not an object: `shadowOffset needs an object with all of: width, height`.
- A field is missing or is not a finite number: `shadowOffset is missing height, or it is not a finite number`.

## Examples

```js
const label = new UILabel();
label.shadowColor = 'rgba(0,0,0,.25)';
label.shadowOffset = { width: 1, height: 2 };
console.log(label.shadowOffset.width, label.shadowOffset.height);
```

**Effect**: The shadow is 1 pt to the right of and 2 pt below the text. The console prints `1 2`. What the shadow looks like on screen is **not verified in the simulator**.

## Corresponding iOS API

`UILabel.shadowOffset`. `CGSizeMake(0, -1)` is written `new CGSize(0, -1)`.

## See also

- [`shadowColor`](shadowcolor.md)
- [Structs](../structs.md)
