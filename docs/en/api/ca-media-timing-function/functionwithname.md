---
type: reference
native: "+[CAMediaTimingFunction functionWithName:]"
---

# `CAMediaTimingFunction.functionWithName()` static method

The **`CAMediaTimingFunction.functionWithName()`** static method gets a built-in timing function by name.

## Syntax

```
CAMediaTimingFunction.functionWithName(name)
```

### Parameters

**`name`**

One of these five strings:

| Name | Effect |
| --- | --- |
| `'linear'` | Constant speed |
| `'easeIn'` | Starts slow, then speeds up |
| `'easeOut'` | Starts fast, slows down before the end |
| `'easeInEaseOut'` | Slow at the start and end, fast in the middle. Control points (0.42, 0) and (0.58, 1) |
| `'default'` | Starts fairly fast and slows down noticeably before the end. Control points (0.25, 0.1) and (0.25, 1) |

`'default'` and `'easeInEaseOut'` are two different curves. The on-screen differences among the five curves are **not verified in the simulator**; the two sets of control point values are measured.

### Return value

A `CAMediaTimingFunction`.

### Exceptions

**`TypeError`**

An unknown name; the message lists all the names: `functionWithName has no value "bounce"; expected one of: …`.

## Examples

```js
const move = CABasicAnimation.animationWithKeyPath('position');
move.fromValue = new CGPoint(30, 80);
move.toValue = new CGPoint(270, 80);
move.duration = 0.6;
move.timingFunction = CAMediaTimingFunction.functionWithName('easeOut');
```

**Effect**: Once added to a layer, the layer moves quickly at first and slows down near the end. **Not verified in the simulator.**

## Corresponding iOS API

`+[CAMediaTimingFunction functionWithName:]`. `kCAMediaTimingFunctionEaseIn` is written `'easeIn'`, `kCAMediaTimingFunctionDefault` is written `'default'`, and likewise for the rest.

## See also

- [`functionWithControlPoints()`](functionwithcontrolpoints.md): custom timing functions
