---
type: reference
native: UIView.autoresizingMask
---

# `UIView`: `autoresizingMask` property

The **`autoresizingMask`** property determines how this view, positioned by `frame`, follows when its superview's size changes: which distances and dimensions are allowed to stretch.

## Value

An array of strings, whose elements are the values below. An empty array means nothing stretches, and the view keeps its original position and size.

| Value | What can stretch |
| --- | --- |
| `'flexibleLeftMargin'` | Distance from the left edge to the superview's left edge |
| `'flexibleWidth'` | Width |
| `'flexibleRightMargin'` | Distance from the right edge to the superview's right edge |
| `'flexibleTopMargin'` | Distance from the top edge to the superview's top edge |
| `'flexibleHeight'` | Height |
| `'flexibleBottomMargin'` | Distance from the bottom edge to the superview's bottom edge |

- Readable and writable.
- The default is **not verified in the simulator**; according to Apple's documentation it is an empty array.
- Only takes effect on views whose [`translatesAutoresizingMaskIntoConstraints`](translatesautoresizingmaskintoconstraints.md) is `true` (positioned by `frame`), and the superview's [`autoresizesSubviews`](autoresizessubviews.md) must be `true`.
- Each read returns a new array.
- The type it reads back as, and that writing back the original value reads back unchanged, are checked in the acceptance tests. The effect is **not verified in the simulator**.

### Invalid values

If the array contains one unrecognized name, the whole assignment has no effect: it doesn't throw, the console prints a warning listing all valid values, and the property keeps its previous value.

## Examples

```js
const overlay = new UIView();
overlay.autoresizingMask = ['flexibleWidth', 'flexibleHeight'];
```

**Effect**: When the superview grows or shrinks, the width and height of `overlay` follow, and the distances from its four edges to the superview stay the same. **Not verified in the simulator.**

## Corresponding iOS API

`UIView.autoresizingMask`. The bitmask `UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight` is written as `['flexibleWidth', 'flexibleHeight']`.

## See also

- [`autoresizesSubviews`](autoresizessubviews.md)
- [Two ways to position views](../ui-view.md#two-ways-to-position-views)
- [Enums](../enums.md): bitmasks are written as arrays of strings
