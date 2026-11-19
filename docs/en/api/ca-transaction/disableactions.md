---
type: reference
native: +[CATransaction disableActions]
---

# `CATransaction.disableActions()` static method

The **`CATransaction.disableActions()`** static method returns whether the current transaction has implicit animations turned off.

## Syntax

```
CATransaction.disableActions()
```

### Parameters

None.

### Return value

A boolean. `true` means the current transaction has implicit animations turned off; `false` means it doesn't. Outside any transaction, or after `commit()`, it is `false`.

### Exceptions

None.

## Examples

```js
CATransaction.begin();
CATransaction.setDisableActions(true);
console.log(CATransaction.disableActions());
CATransaction.commit();
```

**Result**: logs `true` to the console.

## Corresponding iOS API

`+[CATransaction disableActions]`.

## See also

- [`setDisableActions()`](setdisableactions.md)
