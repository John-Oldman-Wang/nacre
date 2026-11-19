---
type: reference
native: "-[UIView effectiveRadiusForCorner:]"
---

# `UIView`: `effectiveRadiusForCorner()` method

The **`effectiveRadiusForCorner()`** method returns the actual corner radius of one of the view's corners.

## Syntax

```
effectiveRadiusForCorner(corner)
```

### Parameters

**`corner`**

An array of corner names: `'topLeft'`, `'topRight'`, `'bottomLeft'`, `'bottomRight'`.

### Return value

A number, in [pt](../units.md).

### Exceptions

The behavior when an unrecognized corner name is given is **not verified in the simulator**.

## Description

This method was added later and hasn't been called in the simulator; its effect is **not verified in the simulator**.

## Examples

```js
const card = new UIView();
card.layer.cornerRadius = 12;
console.log(card.effectiveRadiusForCorner(['topLeft']));
```

**Result**: Prints `12`. **Not verified in the simulator.**

## Corresponding iOS API

`-[UIView effectiveRadiusForCorner:]`. `UIRectCornerTopLeft` is written as `['topLeft']`.

## See also

- [`layer`](layer.md): `cornerRadius`
