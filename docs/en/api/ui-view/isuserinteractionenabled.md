---
type: reference
native: UIView.userInteractionEnabled
---

# `UIView`: `isUserInteractionEnabled` property

The **`isUserInteractionEnabled`** property determines whether the view receives touches.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | The view receives touches |
| `false` | Neither the view nor its subviews receive touches; touches go to the view behind it. The appearance doesn't change |

- Readable and writable.
- The default is `true`.
- Converted with `Boolean()` on write: `1`, non-empty strings, and objects are `true`; `0`, `''`, `null`, `undefined`, and `NaN` are `false`. So writing `'false'` gives `true`.
- The effect of setting it to `false` is **not verified in the simulator**.

## Examples

```js
const card = new UIView();
card.isUserInteractionEnabled = false;
```

**Effect**: Neither `card` nor its subviews receive touches. **Not verified in the simulator.**

## Corresponding iOS API

`UIView.userInteractionEnabled`. The ObjC getter name is `isUserInteractionEnabled`, and JS reads and writes it under that name.

## See also

- [`hitTest()`](hittest.md)
- [`UIGestureRecognizer`](../ui-gesture-recognizer.md)
