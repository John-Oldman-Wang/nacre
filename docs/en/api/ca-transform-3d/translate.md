---
type: reference
native: CATransform3DTranslate
---

# `CATransform3D`: `translate()` method

The **`translate()`** method adds a translation in front of the receiver: translate first, then apply the receiver's transform.

## Syntax

```
translate(tx, ty[, tz])
```

### Parameters

**`tx`**, **`ty`**, **`tz`**

The translation in the three directions, in [pt](../units.md), the same as the arguments of [`CATransform3D.translation()`](translation.md). `tz` is 0 when omitted.

### Return value

A new `CATransform3D`, equal to `CATransform3D.translation(tx, ty, tz).concat(receiver)`. The receiver does not change.

### Exceptions

**`TypeError`**

An argument cannot be converted to a finite number: `a struct field must be a finite number, got …`, ending with the value received.

## Description

The translation comes first, so any scaling and rotation in the receiver also act on the translation. To keep the translation unaffected, put it after: `t.concat(CATransform3D.translation(tx, ty, tz))`.

## Examples

```js
const grow = CATransform3D.scale(2);
console.log(grow.translate(10, 0, 0).m41);
console.log(grow.concat(CATransform3D.translation(10, 0, 0)).m41);
```

**Result**

- The first line logs `20`: translate 10 pt first, then scale by 2, so the translation becomes 20 pt too.
- The second line logs `10`: with the translation after, it is not affected by the scaling.

## Corresponding iOS API

`CATransform3DTranslate(t, tx, ty, tz)` is written `t.translate(tx, ty, tz)`, with the same order.

## See also

- [`CATransform3D.translation()`](translation.md)
- [Order of combination](../ca-transform-3d.md#order-of-combination)
- [Structs](../structs.md): rules shared by all structs
