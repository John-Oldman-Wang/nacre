---
type: reference
native: CATransform3DConcat
---

# `CATransform3D`: `concat()` method

The **`concat()`** method combines two transforms into one: the receiver first, then `other`.

## Syntax

```
concat(other)
```

### Parameters

**`other`**

Another `CATransform3D`, or a plain object with all 16 fields from `m11` to `m44`, such as `{ ...CATransform3D.identity, m34: -1 / 500 }`.

### Return value

A new `CATransform3D`. Neither the receiver nor `other` changes.

### Exceptions

**`TypeError`**

- `other` is not an object: `concat needs an object with all of: m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44`.
- `other` is missing a field, or a field cannot be converted to a finite number: `concat is missing m12, or it is not a finite number`, with the missing field name in the middle.

## Description

The two orders give different results. Translating first and then scaling scales the translation as well; scaling first and then translating leaves the translation unaffected by the scaling.

## Examples

```js
const move = CATransform3D.translation(10, 0, 0);
const grow = CATransform3D.scale(2);

console.log(move.concat(grow).m41);
console.log(grow.concat(move).m41);
```

**Result**

- The first line logs `20`: translate first, then scale, so the translation is doubled too.
- The second line logs `10`: scale first, then translate.

```js
const card = new CALayer();
card.transform = CATransform3D.rotation(Math.PI / 4, 0, 1, 0)
  .concat({ ...CATransform3D.identity, m34: -1 / 500 });
```

**Effect**: the layer first rotates 45° around its vertical center line, then gets perspective, with one side near and the other far. **How it looks on screen is not verified in the simulator.**

## Corresponding iOS API

`CATransform3DConcat(a, b)` is written `a.concat(b)`.

## See also

- [Order of combination](../ca-transform-3d.md#order-of-combination)
- [`translate()`](translate.md), [`scale()`](scale.md), [`rotate()`](rotate.md): add a new step in front
- [`invert()`](invert.md)
- [Structs](../structs.md): rules shared by all structs
