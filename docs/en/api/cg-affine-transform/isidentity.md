---
type: reference
native: CGAffineTransformIsIdentity
---

# `CGAffineTransform`: `isIdentity` property

The **`isIdentity`** property indicates whether this transform is the identity matrix, that is, no transform at all.

## Value

A boolean.

- `true`: the six numbers are exactly `(1, 0, 0, 1, 0, 0)`.
- `false`: otherwise. Each number is compared for exact equality, with no tolerance.
- Read-only.

## Examples

```js
const view = new UIView();
console.log(view.transform.isIdentity);
view.transform = CGAffineTransform.scale(2);
console.log(view.transform.isIdentity);
```

**Result**: logs `true` and then `false`. A new view's `transform` is the identity matrix.

## Corresponding iOS API

`CGAffineTransformIsIdentity(t)`.

## See also

- [`CGAffineTransform.identity`](identity.md)
- [Structs](../structs.md): rules shared by all structs
