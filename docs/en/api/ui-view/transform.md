---
type: reference
native: UIView.transform
---

# `UIView`: `transform` property

The **`transform`** property is the view's 2D affine transform: translation, scaling, rotation, and combinations of them.

## Value

[`CGAffineTransform`](../cg-affine-transform.md).

- Readable and writable.
- The default is the identity matrix (`isIdentity` is `true`). Set it back to [`CGAffineTransform.identity`](../cg-affine-transform/identity.md) to restore the original.
- The transform uses the view's center as the origin. It only changes how the view is drawn, not [`bounds`](bounds.md) or [`center`](center.md).
- Each assignment replaces the previous transform; they don't accumulate.
- You can write a `CGAffineTransform` or a plain object with all six fields (`a`, `b`, `c`, `d`, `tx`, `ty`). The fields of the struct that reads back are read-only, and each read returns a new object. See [Structs](../structs.md).
- Fractional fields may differ in the last few digits when read back; allow a tolerance when comparing.
- Animatable. See [`UIView.animateWithDuration()`](animatewithduration.md).

> **Note:** When `transform` isn't the identity, [`frame`](frame.md) reads back the bounding rectangle of the transformed shape, not the view's original rectangle. In that case, use `center` to change the position and `bounds` to change the size; don't read or write `frame`. Once `transform` is set back to the identity, `frame` is restored.

### Invalid values

- Not an object: throws `TypeError: transform needs an object with all of: a, b, c, d, tx, ty`.
- A field is missing or can't be converted to a finite number: throws `TypeError: transform is missing …, or it is not a finite number`, where the middle part is the name of the missing field.
- On error, the property keeps its previous value. Field values are converted with `Number()`, so `'10'` works.

## Examples

```js
const box = new UIView();
box.frame = new CGRect(24, 304, 40, 40);
box.transform = CGAffineTransform.scale(1.2)
  .concat(CGAffineTransform.rotation(Math.PI / 6));

console.log(box.bounds.width);
console.log(box.center.x);
console.log(box.frame.width);

box.transform = CGAffineTransform.identity;
console.log(box.frame.width);
```

**Effect**

- The square scales up to 1.2 times its size around its own center and rotates 30° clockwise.
- Logs `40` (`bounds` is unchanged), `44` (`center` is unchanged), and about `65.57` (equal to 40 × (|a| + |c|), where a and c are fields of the transform matrix), in that order.
- After it is set back to the identity, logs `40`.

## Corresponding iOS API

`UIView.transform`. `CGAffineTransformMakeRotation(a)` is written `CGAffineTransform.rotation(a)`.

## See also

- [`CGAffineTransform`](../cg-affine-transform.md)
- [Transforms and `frame`](../ui-view.md#transforms-and-frame)
