---
type: reference
native: CGAffineTransformConcat
---

# `CGAffineTransform`: `concat()` method

The **`concat()`** method combines two transforms into one: the receiver first, then `other`.

## Syntax

```
concat(other)
```

### Parameters

**`other`**

Another `CGAffineTransform`, or a plain object with the six fields `a`, `b`, `c`, `d`, `tx`, and `ty`.

### Return value

A new `CGAffineTransform`. Neither the receiver nor `other` changes.

### Exceptions

**`TypeError`**

- `other` is not an object: `concat needs an object with all of: a, b, c, d, tx, ty`.
- `other` is missing a field, or a field cannot be converted to a finite number: `concat is missing tx, or it is not a finite number`, with the missing field's name in the middle.

## Description

The two orders give different results. Scaling then translating leaves the translation unaffected by the scale; translating then scaling scales the translation too.

## Examples

```js
const scale = CGAffineTransform.scale(2);
const move = CGAffineTransform.translation(10, 20);

console.log(scale.concat(move).tx, scale.concat(move).ty);
console.log(move.concat(scale).tx, move.concat(scale).ty);
```

**Result**

- The first line logs `10 20`: scale first, then translate.
- The second line logs `20 40`: translate first, then scale, so the translation is also doubled.

```js
const box = new UIView();
box.frame = new CGRect(40, 100, 100, 100);
box.transform = CGAffineTransform.scale(1.2)
  .concat(CGAffineTransform.rotation(Math.PI / 6));
```

**Effect**: the view is scaled to 1.2 times and rotated 30° clockwise.

## Corresponding iOS API

`CGAffineTransformConcat(t1, t2)` is written `t1.concat(t2)`.

## See also

- [`invert()`](invert.md)
- [Structs](../structs.md): rules shared by all structs
