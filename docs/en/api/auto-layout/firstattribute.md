---
type: reference
native: NSLayoutConstraint.firstAttribute
---

# `NSLayoutConstraint`: `firstAttribute` property

The **`firstAttribute`** property indicates which kind of anchor is on the left side of the constraint's equation.

## Value

A string, one of:

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

## Examples

```js
const parent = new UIView();
const box = new UIView();
box.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(box);

const c = box.leadingAnchor.constraintEqualToAnchor(parent.leadingAnchor, { constant: 16 });
console.log(c.firstAttribute, c.secondAttribute);
```

**Result**: Prints `leading leading`.

## Corresponding iOS API

`NSLayoutConstraint.firstAttribute`. `NSLayoutAttributeLeading` becomes `'leading'`, and so on for the rest.

## See also

- [`secondAttribute`](secondattribute.md)
- [`firstAnchor`](firstanchor.md)
