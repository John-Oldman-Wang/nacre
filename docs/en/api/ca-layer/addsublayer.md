---
type: reference
native: "-[CALayer addSublayer:]"
---

# `CALayer`: `addSublayer()` method

The **`addSublayer()`** method adds a layer as a sublayer, on top of the others.

## Syntax

```
addSublayer(layer)
```

### Parameters

**`layer`**

A layer: `CALayer`, `CAGradientLayer`, or `CAShapeLayer`.

### Return value

None (`undefined`).

- After it is added, `layer` is at the end of [`sublayers`](sublayers.md) and is drawn above the other sublayers. To put it somewhere else, use [`insertSublayer()`](insertsublayer.md).
- A layer can have only one superlayer. If `layer` is already under another layer, it is first removed from its previous superlayer. **Not verified in the simulator.**
- Once added, the superlayer keeps it, and it stays on screen until it is removed, or the view its superlayer belongs to is removed.

### Exceptions

**`TypeError`**

`layer` isn't a layer: `addSublayer: expects a CALayer`.

## Examples

```js
const host = new CALayer();
const a = new CALayer();
const b = new CALayer();
host.addSublayer(a);
host.addSublayer(b);
console.log(host.sublayers.indexOf(b));
```

**Result**: The console prints `1`. `b` is above `a`.

## Corresponding iOS API

`-[CALayer addSublayer:]`.

## See also

- [`insertSublayer()`](insertsublayer.md), [`removeFromSuperlayer()`](removefromsuperlayer.md)
