---
type: reference
native: CGAffineTransformMakeScale
---

# `CGAffineTransform.scale()` static method

The **`CGAffineTransform.scale()`** static method creates a scaling transform.

## Syntax

```
CGAffineTransform.scale(sx[, sy])
```

### Parameters

**`sx`**

The horizontal multiple, a ratio; `1` means unchanged.

**`sy`**

The vertical multiple. Defaults to `sx`.

### Return value

A new `CGAffineTransform`: `a` is `sx`, `d` is `sy`, and the rest are 0.

### Exceptions

**`TypeError`**

An argument cannot be converted to a finite number: `a struct field must be a finite number, got …`, ending with the value received.

## Examples

```js
const box = new UIView();
box.frame = new CGRect(40, 100, 100, 100);
box.transform = CGAffineTransform.scale(1.2);
```

**Effect**: the view scales to 1.2 times its size around its center. Each assignment to `transform` replaces the previous transform rather than adding to it.

## Corresponding iOS API

`CGAffineTransformMakeScale(sx, sy)`. In ObjC both arguments are required; here, with one argument both directions are the same.

## See also

- [`concat()`](concat.md): combining with other transforms
- [Structs](../structs.md): rules shared by all structs
