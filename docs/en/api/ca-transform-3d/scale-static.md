---
type: reference
native: CATransform3DMakeScale
---

# `CATransform3D.scale()` static method

The **`CATransform3D.scale()`** static method creates a scaling transform.

The instance method of the same name, [`scale()`](scale.md), adds a scaling step in front of an existing transform.

## Syntax

```
CATransform3D.scale(sx[, sy[, sz]])
```

### Parameters

**`sx`**

The multiple in the x direction, a ratio; `1` means unchanged.

**`sy`**

The multiple in the y direction. Same as `sx` when omitted.

**`sz`**

The multiple in the z direction. `1` when omitted, so `CATransform3D.scale(2)` enlarges only in the x and y directions.

### Return value

A new `CATransform3D`: `m11`, `m22`, and `m33` are the multiples in the three directions, `m44` is 1, and the rest are 0.

### Exceptions

**`TypeError`**

An argument cannot be converted to a finite number: `a struct field must be a finite number, got …`, ending with the value received.

## Examples

```js
const grow = CATransform3D.scale(2);
console.log(grow.m11, grow.m22, grow.m33);

const all = CATransform3D.scale(2, 3, 4);
console.log(all.m11, all.m22, all.m33);
```

**Result**

- The first line logs `2 2 1`: with one argument, x and y are the same and z is unchanged.
- The second line logs `2 3 4`.

## Corresponding iOS API

`CATransform3DMakeScale(sx, sy, sz)`. ObjC requires all three arguments.

## See also

- [`scale()`](scale.md): the instance method of the same name
- [`concat()`](concat.md): combining with other transforms
- [Structs](../structs.md): rules shared by all structs
