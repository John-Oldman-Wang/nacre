---
type: reference
native: +[CATransaction commit]
---

# `CATransaction.commit()` static method

The **`CATransaction.commit()`** static method ends the transaction started by the most recent [`begin()`](begin.md).

## Syntax

```
CATransaction.commit()
```

### Parameters

None.

### Return value

None (`undefined`).

### Exceptions

What happens when `commit()` is called without `begin()` is **not verified in the simulator**.

## Description

- After `commit()`, the settings of this transaction no longer apply and things return to how they were: [`disableActions()`](disableactions.md) goes back to `false`.

## Examples

```js
CATransaction.begin();
CATransaction.setDisableActions(true);
console.log(CATransaction.disableActions());
CATransaction.commit();
console.log(CATransaction.disableActions());
```

**Result**: logs `true` first, then `false`.

## Corresponding iOS API

`+[CATransaction commit]`.

## See also

- [`begin()`](begin.md)
