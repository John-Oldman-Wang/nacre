---
type: reference
native: +[CATransaction animationDuration]
---

# `CATransaction.animationDuration()` static method

The **`CATransaction.animationDuration()`** static method returns the implicit animation duration of the current transaction.

## Syntax

```
CATransaction.animationDuration()
```

### Parameters

None.

### Return value

A number, in seconds.

### Exceptions

None.

## Examples

```js
CATransaction.begin();
CATransaction.setAnimationDuration(1.5);
console.log(CATransaction.animationDuration());
CATransaction.commit();
```

**Result**: logs `1.5` to the console.

## Corresponding iOS API

`+[CATransaction animationDuration]`.

## See also

- [`setAnimationDuration()`](setanimationduration.md)
