---
type: reference
native: CATransform3DInvert
---

# `CATransform3D`: `invert()` method

The **`invert()`** method returns the inverse transform: the one that cancels out the receiver's effect.

## Syntax

```
invert()
```

### Parameters

None.

### Return value

A new `CATransform3D`; `null` if the receiver is not invertible.

Not invertible means the determinant of the matrix is 0, as with `CATransform3D.scale(0)`, where the multiples in the x and y directions are 0. A matrix that is numerically very close to not invertible may also return `null`. The return value can be `null`; check for null before using it.

### Exceptions

None.

## Examples

```js
const back = CATransform3D.scale(2).invert();
if (back !== null) {
  console.log(back.m11);
}

console.log(CATransform3D.scale(0).invert());
```

**Result**: logs `0.5` and then `null`.

```js
const turn = CATransform3D.rotation(0.7, 1, 2, 3);
const undo = turn.invert();
if (undo !== null) {
  const result = turn.concat(undo);
  console.log(Math.abs(result.m11 - 1) < 1e-9);
}
```

**Result**: logs `true`. A transform combined with its inverse gives the identity matrix; results with fractional values may differ in the last few digits, so allow a tolerance when comparing.

## Corresponding iOS API

`CATransform3DInvert(t)`. When not invertible, ObjC returns `t` itself; here it returns `null`.

## See also

- [`concat()`](concat.md)
- [Structs](../structs.md): rules shared by all structs
