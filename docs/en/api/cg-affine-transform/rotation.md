---
type: reference
native: CGAffineTransformMakeRotation
---

# `CGAffineTransform.rotation()` static method

The **`CGAffineTransform.rotation()`** static method creates a rotation transform.

## Syntax

```
CGAffineTransform.rotation(radians)
```

### Parameters

**`radians`**

The angle of rotation, in [radians](../units.md), not degrees. Positive values are clockwise on screen. To convert degrees to radians: `degrees * Math.PI / 180`.

### Return value

A new `CGAffineTransform`: `a` and `d` are `cos(radians)`, `b` is `sin(radians)`, `c` is `-sin(radians)`, and `tx` and `ty` are 0.

### Exceptions

**`TypeError`**

The argument cannot be converted to a finite number: `a struct field must be a finite number, got …`.

## Examples

```js
const box = new UIView();
box.frame = new CGRect(40, 100, 100, 100);
box.transform = CGAffineTransform.rotation(Math.PI / 6);
```

**Effect**: the view rotates 30° clockwise around its own center.

## Corresponding iOS API

`CGAffineTransformMakeRotation(radians)`.

## See also

- [`concat()`](concat.md): combining rotation with scaling
- [Structs](../structs.md): rules shared by all structs
