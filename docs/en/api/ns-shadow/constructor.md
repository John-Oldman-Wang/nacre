---
type: reference
native: "-[NSShadow init]"
---

# `NSShadow()` constructor

The **`NSShadow()`** constructor creates a text shadow.

## Syntax

```
new NSShadow()
```

### Parameters

None.

### Return value

The new `NSShadow`: [`shadowOffset`](shadowoffset.md) is `(0, 0)`, [`shadowBlurRadius`](shadowblurradius.md) is `0`, and [`shadowColor`](shadowcolor.md) is black at one-third opacity.

### Exceptions

It cannot be subclassed; `class X extends NSShadow {}` throws `TypeError` on `new X()`. See [Native classes](../native-classes.md).

## Examples

```js
const shadow = new NSShadow();
console.log(shadow.shadowOffset.width, shadow.shadowOffset.height, shadow.shadowBlurRadius);
```

**Result**: The console prints `0 0 0`.

## Corresponding iOS API

`[[NSShadow alloc] init]`.

## See also

- [`NSShadow`](../ns-shadow.md)
