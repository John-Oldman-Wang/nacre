---
type: reference
native: +[CATransaction flush]
---

# `CATransaction.flush()` static method

The **`CATransaction.flush()`** static method hands the layer changes made so far to the system immediately, without waiting for the current piece of code to finish.

You normally don't need to call it: once the current piece of code finishes, the changes are handed to the system automatically.

## Syntax

```
CATransaction.flush()
```

### Parameters

None.

### Return value

None (`undefined`).

### Exceptions

None.

## Examples

```js
const dot = new CALayer();
dot.opacity = 0.5;
CATransaction.flush();
```

**Effect**: the change to `opacity` is handed to the system immediately. **The effect is not verified in the simulator.**

## Corresponding iOS API

`+[CATransaction flush]`.

## See also

- [`commit()`](commit.md)
