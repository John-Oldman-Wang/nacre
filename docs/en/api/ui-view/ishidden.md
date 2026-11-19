---
type: reference
native: UIView.hidden
---

# `UIView`: `isHidden` property

The **`isHidden`** property determines whether the view is hidden.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | The view and its subviews aren't shown and don't receive touches |
| `false` | Shown normally |

- Readable and writable.
- The default is `false`.
- Converted with `Boolean()` on write: `1`, non-empty strings, and objects are `true`; `0`, `''`, `null`, `undefined`, and `NaN` are `false`. So writing `'false'` gives `true`.
- A hidden view is still in the view hierarchy and still occupies its `frame`. Only views inside a [`UIStackView`](../ui-stack-view.md) give up their space when hidden.
- Use `isHidden` for a view you will show again later; its properties, subviews, and event listeners are kept. Use [`removeFromSuperview()`](removefromsuperview.md) for a view you no longer need.

## Examples

```js
const card = new UIView();
card.isHidden = true;
// @ts-expect-error The type only accepts booleans; this demonstrates the runtime Boolean() conversion
card.isHidden = 'false';
console.log(card.isHidden);
```

**Effect**: The view is hidden. The second write, `'false'`, is a non-empty string and converts to `true` with `Boolean()`, so the view stays hidden and the console prints `true`. That a hidden view doesn't receive touches is **not verified in the simulator**.

## Corresponding iOS API

`UIView.hidden`. The ObjC getter name is `isHidden`, and JS reads and writes it under that name.

## See also

- [`alpha`](alpha.md)
- [Hiding a view](../../guides/views.md#hiding-a-view)
