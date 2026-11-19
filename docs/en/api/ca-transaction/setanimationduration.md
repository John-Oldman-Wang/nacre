---
type: reference
native: "+[CATransaction setAnimationDuration:]"
---

# `CATransaction.setAnimationDuration()` static method

The **`CATransaction.setAnimationDuration()`** static method sets the implicit animation duration of the current transaction. Animation objects whose `duration` is 0 also use this duration.

## Syntax

```
CATransaction.setAnimationDuration(value)
```

### Parameters

**`value`**

A number, in seconds. Converted with `Number()`.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

`value` doesn't convert to a finite number: `duration must be a finite number, got …`.

## Examples

```js
const shape = new CAShapeLayer();

CATransaction.begin();
CATransaction.setAnimationDuration(1.5);
shape.strokeEnd = 1;
CATransaction.commit();
```

**Effect**: when the layer has been shown, `strokeEnd` transitions to 1 over 1.5 seconds. **Not verified in the simulator.**

## Corresponding iOS API

`+[CATransaction setAnimationDuration:]`.

## See also

- [`animationDuration()`](animationduration.md)
- [`CAAnimation.duration`](../ca-animation/duration.md)
