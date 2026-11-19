---
type: reference
native: NSShadow.shadowBlurRadius
---

# `NSShadow`: `shadowBlurRadius` property

The **`shadowBlurRadius`** property is the shadow's blur radius.

## Value

A number, in [pt](../units.md).

- Readable and writable.
- The default is `0`: a shadow with sharp edges.
- The larger it is, the blurrier.

### Invalid values

**`TypeError`**

- The value written is converted with `Number()`; values that cannot be converted to a finite number throw.
- A negative number: `shadowBlurRadius must be a non-negative number`.

## Examples

```js
const shadow = new NSShadow();
shadow.shadowBlurRadius = 2;
console.log(shadow.shadowBlurRadius);
```

**Result**: The console prints `2`.

## Corresponding iOS API

`NSShadow.shadowBlurRadius`.

## See also

- [`shadowOffset`](shadowoffset.md)
