---
type: reference
native: NSLayoutConstraint.secondAttribute
---

# `NSLayoutConstraint`: `secondAttribute` property

The **`secondAttribute`** property indicates which kind of anchor is on the right side of the constraint's equation.

## Value

A string, with the same values as [`firstAttribute`](firstattribute.md):

| Value | Meaning |
| --- | --- |
| `'leading'`, `'trailing'` | Leading edge, trailing edge |
| `'left'`, `'right'` | Left edge, right edge |
| `'top'`, `'bottom'` | Top edge, bottom edge |
| `'centerX'`, `'centerY'` | Horizontal center line, vertical center line |
| `'width'`, `'height'` | Width, height |
| `'firstBaseline'`, `'lastBaseline'` | Baseline of the first line of text, baseline of the last line of text |
| `'leftMargin'`, `'rightMargin'`, `'topMargin'`, `'bottomMargin'`, `'leadingMargin'`, `'trailingMargin'` | The corresponding edge, inset by the layout margins |
| `'centerXWithinMargins'`, `'centerYWithinMargins'` | The center line of the area inset by the layout margins |
| `'notAnAttribute'` | No anchor. For a constraint to a constant, the right side has this value |

The eight values with `Margin` only appear on constraints the system creates. Constraints created from anchors never produce them.

- Read-only; assigning to it throws `TypeError`.
- `'notAnAttribute'` for a constraint to a constant.

## Examples

```js
const parent = new UIView();
const box = new UIView();
box.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(box);

const c = box.widthAnchor.constraintEqualToConstant(120);
console.log(c.secondAttribute);
```

**Result**: Prints `notAnAttribute`.

## Corresponding iOS API

`NSLayoutConstraint.secondAttribute`. `NSLayoutAttributeNotAnAttribute` becomes `'notAnAttribute'`.

## See also

- [`firstAttribute`](firstattribute.md)
- [`secondAnchor`](secondanchor.md)
