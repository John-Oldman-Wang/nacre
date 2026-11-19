---
type: reference
native: CGAffineTransformInvert
---

# `CGAffineTransform`: `invert()` method

The **`invert()`** method returns the inverse transform: the one that cancels out the receiver's effect.

## Syntax

```
invert()
```

### Parameters

None.

### Return value

A new `CGAffineTransform`; `null` if the receiver is not invertible.

Not invertible means the determinant (`a * d - b * c`) is 0, as with `CGAffineTransform.scale(0)`. The return value can be `null`; check for null before using it.

### Exceptions

None.

## Examples

```js
const back = CGAffineTransform.scale(2).invert();
if (back !== null) {
  console.log(back.a);
}

console.log(CGAffineTransform.scale(0).invert());
```

**Result**: logs `0.5` and then `null`.

## Corresponding iOS API

`CGAffineTransformInvert(t)`. When not invertible, ObjC returns `t` itself; here it returns `null`.

## See also

- [`concat()`](concat.md)
- [Structs](../structs.md): rules shared by all structs
