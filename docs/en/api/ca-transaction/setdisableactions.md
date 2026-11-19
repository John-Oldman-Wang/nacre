---
type: reference
native: "+[CATransaction setDisableActions:]"
---

# `CATransaction.setDisableActions()` static method

The **`CATransaction.setDisableActions()`** static method turns implicit animations off or on for the current transaction.

## Syntax

```
CATransaction.setDisableActions(value)
```

### Parameters

**`value`**

A boolean, converted with `Boolean()`. `true` turns off implicit animations for the current transaction, so changes take effect immediately; `false` turns them on.

### Return value

None (`undefined`).

### Exceptions

None.

## Description

- Applies only to changes in the current transaction; restored after `commit()`.
- Affects only implicit animations. Animations added with `addAnimation()` play as usual.

## Examples

```js
const shape = new CAShapeLayer();

CATransaction.begin();
CATransaction.setDisableActions(true);
shape.strokeEnd = 1;
CATransaction.commit();
```

**Effect**: `strokeEnd` becomes 1 immediately, and no new animation is added to the layer.

## Corresponding iOS API

`+[CATransaction setDisableActions:]`.

## See also

- [`disableActions()`](disableactions.md)
- [Turning off implicit animations](../../guides/animation.md#turning-off-implicit-animation)
