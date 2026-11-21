---
type: reference
native: CATransform3DMakeTranslation
---

# `CATransform3D.translation()` static method

The **`CATransform3D.translation()`** static method creates a translation transform.

## Syntax

```
CATransform3D.translation(tx, ty[, tz])
```

### Parameters

**`tx`**

How far to move in the x direction, in [pt](../units.md); positive is to the right.

**`ty`**

How far to move in the y direction, in pt; positive is down.

**`tz`**

How far to move in the z direction, in pt; positive is toward the person looking at the screen. Defaults to 0 when omitted.

### Return value

A new `CATransform3D`: the identity matrix with `m41`, `m42`, and `m43` replaced by the given `tx`, `ty`, and `tz`.

### Exceptions

**`TypeError`**

An argument cannot be converted to a finite number: `a struct field must be a finite number, got …`, ending with the value received.

## Examples

```js
const move = CATransform3D.translation(10, 20, 30);
console.log(String(move));
console.log(CATransform3D.translation(10, 20).m43);
```

**Result**

- The first line logs `CATransform3D(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 10, 20, 30, 1)`.
- The second line logs `0`: `tz` is 0 when omitted.

## Corresponding iOS API

`CATransform3DMakeTranslation(tx, ty, tz)`. ObjC requires all three arguments; here `tz` can be omitted.

## See also

- [`translate()`](translate.md): adds a translation in front of an existing transform
- [`concat()`](concat.md): the order affects the translation
- [Structs](../structs.md): rules shared by all structs
