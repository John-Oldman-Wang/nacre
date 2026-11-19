---
type: reference
native: "-[CALayer insertSublayer:atIndex:]"
---

# `CALayer`: `insertSublayer()` method

The **`insertSublayer()`** method inserts a layer at a given position among the sublayers.

## Syntax

```
insertSublayer(layer, { atIndex })
insertSublayer(layer, { above })
insertSublayer(layer, { below })
```

### Parameters

**`layer`**

The layer to insert.

**`options.atIndex`**

The position in [`sublayers`](sublayers.md) to insert at, an integer. 0 is the bottom.

**`options.above`**

An existing sublayer. Inserts directly above it.

**`options.below`**

An existing sublayer. Inserts directly below it.

Give one of the three options.

### Return value

None (`undefined`).

Calling `insertSublayer()` again on a layer already in `sublayers` moves it to the new position; it doesn't add a second copy.

### Exceptions

**`TypeError`**

- None of the three is given: `insertSublayer needs one of { atIndex } / { above } / { below }`.
- `layer` isn't a layer: `insertSublayer: expects a CALayer`.
- `above` or `below` isn't a layer: `insertSublayer: expects two CALayers`.
- `atIndex` is negative: `insertSublayer:atIndex: index must not be negative`.
- `atIndex` doesn't convert to a finite number: `atIndex must be a finite number, got …`.

## Examples

```js
const host = new CALayer();
const a = new CALayer();
const b = new CALayer();
const c = new CALayer();

host.addSublayer(a);                    // [a]
host.addSublayer(b);                    // [a, b], b above a
host.insertSublayer(c, { atIndex: 0 }); // [c, a, b], c at the bottom
host.insertSublayer(c, { above: b });   // [a, b, c], c moves above b
host.insertSublayer(c, { below: a });   // [c, a, b], c moves below a
```

**Result**: The comment on each line shows `host.sublayers` after that line runs. Layers later in the array are drawn on top.

## Corresponding iOS API

`-[CALayer insertSublayer:atIndex:]`, `-insertSublayer:above:`, `-insertSublayer:below:`. The second part goes into the options object.

## See also

- [`addSublayer()`](addsublayer.md)
- [`zPosition`](zposition.md): changes the stacking order without changing the array order
