---
type: reference
native: UIBarButtonItem.width
---

# `UIBarButtonItem`: `width` property

The **`width`** property is the navigation bar button's width. Only meaningful for fixed-width spaces.

## Value

A number, in [pt](../units.md).

- Readable and writable.
- Defaults to `0`. Spaces created by [`fixedSpace()`](fixedspace.md) have the width given at creation.
- Writes are converted with `Number(v)`; values that can't be converted to a finite number throw `TypeError`.
- The effect of writing it on an ordinary button is **not verified in the simulator**.
- No event fires when it changes: it only changes through code.

## Examples

```js
const gap = UIBarButtonItem.fixedSpace(20);
gap.width = 32;
console.log(gap.width);
```

**Result**: the console prints `32`.

## Corresponding iOS API

`UIBarButtonItem.width`.

## See also

- [`UIBarButtonItem.fixedSpace()`](fixedspace.md)
