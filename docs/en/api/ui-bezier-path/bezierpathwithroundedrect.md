---
type: reference
native: "+[UIBezierPath bezierPathWithRoundedRect:cornerRadius:]"
---

# `UIBezierPath.bezierPathWithRoundedRect()` static method

The **`UIBezierPath.bezierPathWithRoundedRect()`** static method creates a rounded rectangle. All four corners can be rounded, or only the ones you list.

If you just want rounded corners on a view, you don't need a path; use `view.layer.cornerRadius`. See [`CALayer`](../ca-layer.md).

## Syntax

```
UIBezierPath.bezierPathWithRoundedRect(rect, { cornerRadius })
UIBezierPath.bezierPathWithRoundedRect(rect, { byRoundingCorners, cornerRadii })
```

### Parameters

**`rect`**

The position and size of the rectangle, a `CGRect`, in [pt](../units.md). Can also be a plain object `{ x, y, width, height }`.

**`options`**

One of the two groups of options below. If both are given, the `byRoundingCorners` group is used.

**`options.cornerRadius`**

A number, in pt. All four corners are rounded with this radius.

**`options.byRoundingCorners`**

An array of corner names; only the listed corners are rounded. To round all four, list all four names:

| Corner name | Which corner |
| --- | --- |
| `'topLeft'` | Top left |
| `'topRight'` | Top right |
| `'bottomLeft'` | Bottom left |
| `'bottomRight'` | Bottom right |

**`options.cornerRadii`**

A `CGSize`, given together with `byRoundingCorners`. `width` is the horizontal radius of the rounded corners and `height` is the vertical radius, in pt. When the two differ, the corner is an elliptical arc; **this shape is not verified in the simulator**.

### Return value

A new `UIBezierPath`. Its [`bounds`](bounds.md) is `rect`.

### Exceptions

**`TypeError`**

- Neither group of options is given: `bezierPathWithRoundedRect needs { cornerRadius } or { byRoundingCorners, cornerRadii }`.
- `byRoundingCorners` contains an unknown corner name: the message lists the four corner names.
- `cornerRadii` isn't an object: `cornerRadii needs an object with all of: width, height`.
- `cornerRadius` can't be converted to a finite number.
- `rect` is invalid; the error is worded the same way as for [`bezierPathWithRect()`](bezierpathwithrect.md#exceptions), starting with `bezierPathWithRoundedRect`.

## Examples

### All four corners equally rounded

```js
const rounded = UIBezierPath.bezierPathWithRoundedRect(
  new CGRect(0, 0, 120, 60), { cornerRadius: 8 });
```

**Result**: A 120 × 60 pt rectangle whose four corners are rounded with a radius of 8 pt.

### Only the top two corners rounded

```js
const tab = UIBezierPath.bezierPathWithRoundedRect(new CGRect(0, 0, 120, 60), {
  byRoundingCorners: ['topLeft', 'topRight'],
  cornerRadii: new CGSize(12, 12),
});
```

**Result**: The top two corners are rounded with a radius of 12 pt, and the bottom two are square. **Not verified in the simulator.**

## Corresponding iOS API

`+[UIBezierPath bezierPathWithRoundedRect:cornerRadius:]` and `+[UIBezierPath bezierPathWithRoundedRect:byRoundingCorners:cornerRadii:]`. The `UIRectCorner` bitmask is written as an array of corner names: `UIRectCornerTopLeft` is written `'topLeft'`, and `UIRectCornerAllCorners` is written as an array of all four corner names.

## See also

- [`bezierPathWithRect()`](bezierpathwithrect.md): a square-cornered rectangle
- [Enums](../enums.md): why bitmasks are written as arrays
