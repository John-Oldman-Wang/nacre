---
type: reference
native: UIView.clipsToBounds
---

# `UIView`: `clipsToBounds` property

The **`clipsToBounds`** property determines whether the parts of subviews that extend outside this view are shown.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | Parts of subviews outside this view aren't shown |
| `false` | Parts outside are shown as usual |

- Readable and writable.
- The default is `false`.
- Converted with `Boolean()` on write: `1`, non-empty strings, and objects are `true`; `0`, `''`, `null`, `undefined`, and `NaN` are `false`. So writing `'false'` gives `true`.
- After setting a corner radius (`layer.cornerRadius`), you also need to set this to `true` for subviews to be clipped to the rounded corners.
- Whether the part outside the superview receives touches is **not verified in the simulator**.

## Examples

```js
const card = new UIView();
card.frame = new CGRect(40, 120, 200, 120);
const dot = new UIView();
dot.frame = new CGRect(180, 100, 40, 40);
card.addSubview(dot);
card.clipsToBounds = true;
```

**Effect**: `dot` is half outside `card`, and only the part inside `card` is shown. **Not verified in the simulator.**

## Corresponding iOS API

`UIView.clipsToBounds`.

## See also

- [`layer`](layer.md): corner radius
