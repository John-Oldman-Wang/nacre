---
type: reference
native: CGAffineTransformMakeTranslation
---

# `CGAffineTransform.translation()` static method

The **`CGAffineTransform.translation()`** static method creates a translation transform.

## Syntax

```
CGAffineTransform.translation(tx, ty)
```

### Parameters

**`tx`**

How far to move horizontally, in [pt](../units.md); positive is to the right.

**`ty`**

How far to move vertically, in pt; positive is down.

Omitted arguments are 0.

### Return value

A new `CGAffineTransform`: `a` and `d` are 1, `tx` and `ty` are the given values, and the rest are 0.

### Exceptions

**`TypeError`**

An argument cannot be converted to a finite number: `a struct field must be a finite number, got …`.

## Examples

```js
const move = CGAffineTransform.translation(10, 20);
console.log(String(move));
```

**Result**: logs `CGAffineTransform(1, 0, 0, 1, 10, 20)`.

## Corresponding iOS API

`CGAffineTransformMakeTranslation(tx, ty)`.

## See also

- [`concat()`](concat.md): the order affects the translation
- [Structs](../structs.md): rules shared by all structs
