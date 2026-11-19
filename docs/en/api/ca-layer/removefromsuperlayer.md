---
type: reference
native: "-[CALayer removeFromSuperlayer]"
---

# `CALayer`: `removeFromSuperlayer()` method

The **`removeFromSuperlayer()`** method removes the layer from its superlayer.

## Syntax

```
removeFromSuperlayer()
```

### Parameters

None.

### Return value

None (`undefined`).

After removal, [`superlayer`](superlayer.md) is `null`. If your code doesn't keep a reference to the layer, it is reclaimed.

### Exceptions

None.

## Examples

```js
const host = new CALayer();
const c = new CALayer();
host.addSublayer(c);
c.removeFromSuperlayer();
console.log(host.sublayers.length, c.superlayer);
```

**Result**: The console prints `0 null`.

## Corresponding iOS API

`-[CALayer removeFromSuperlayer]`.

## See also

- [`addSublayer()`](addsublayer.md)
