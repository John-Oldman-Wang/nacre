---
type: reference
native: CGAffineTransformIdentity
---

# `CGAffineTransform.identity` static property

The **`CGAffineTransform.identity`** static property is the identity matrix, meaning no transform at all.

## Value

A `CGAffineTransform` whose six numbers are `(1, 0, 0, 1, 0, 0)`.

- Read-only.
- Each read returns a new instance, so `CGAffineTransform.identity === CGAffineTransform.identity` is `false`. To test whether a transform is the identity, use [`isIdentity`](isidentity.md).
- A view's `transform` is the identity matrix by default.

## Examples

```js
const box = new UIView();
box.transform = CGAffineTransform.rotation(Math.PI / 6);
box.transform = CGAffineTransform.identity;
console.log(box.transform.isIdentity);
```

**Result**: the view returns to its original state, and the console logs `true`.

## Corresponding iOS API

`CGAffineTransformIdentity`.

## See also

- [`isIdentity`](isidentity.md)
- [`UIView.transform`](../ui-view/transform.md)
- [Structs](../structs.md): rules shared by all structs
