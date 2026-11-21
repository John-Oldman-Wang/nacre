---
type: reference
native: CATransform3DScale
---

# `CATransform3D`: `scale()` method

The **`scale()`** method adds a scaling step in front of the receiver: scale first, then apply the receiver's transform.

The static method of the same name, [`CATransform3D.scale()`](scale-static.md), creates a transform with only scaling.

## Syntax

```
scale(sx[, sy[, sz]])
```

### Parameters

**`sx`**, **`sy`**, **`sz`**

The multiples in the three directions, ratios, the same as the arguments of [`CATransform3D.scale()`](scale-static.md): `sy` is the same as `sx` when omitted, and `sz` is 1 when omitted.

### Return value

A new `CATransform3D`, equal to `CATransform3D.scale(sx, sy, sz).concat(receiver)`. The receiver does not change.

### Exceptions

**`TypeError`**

An argument cannot be converted to a finite number: `a struct field must be a finite number, got …`, ending with the value received.

## Description

The scaling comes first, so the translation in the receiver is not affected by this scaling.

## Examples

```js
const move = CATransform3D.translation(10, 0, 0);
const t = move.scale(2);
console.log(t.m11, t.m41);
```

**Result**: logs `2 10`. It is scaled by 2, and the translation is still 10 pt.

## Corresponding iOS API

`CATransform3DScale(t, sx, sy, sz)` is written `t.scale(sx, sy, sz)`, with the same order. ObjC requires all three arguments.

## See also

- [`CATransform3D.scale()`](scale-static.md): the static method of the same name
- [Order of combination](../ca-transform-3d.md#order-of-combination)
- [Structs](../structs.md): rules shared by all structs
