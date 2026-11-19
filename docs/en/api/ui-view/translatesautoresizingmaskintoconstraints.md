---
type: reference
native: UIView.translatesAutoresizingMaskIntoConstraints
---

# `UIView`: `translatesAutoresizingMaskIntoConstraints` property

The **`translatesAutoresizingMaskIntoConstraints`** property determines whether the view is positioned by `frame` or by constraints.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | The system positions this view by `frame`: it automatically generates a set of constraints that pin the view at the position `frame` specifies |
| `false` | The view's position and size are determined entirely by constraints |

- Readable and writable.
- The default is `true`.
- Written values are converted with `Boolean()`: `1`, non-empty strings, and objects are `true`; `0`, `''`, `null`, `undefined`, and `NaN` are `false`. So writing `'false'` gives `true`.

A view positioned with constraints must first be set to `false`. If you forget, the automatically generated constraints have the highest priority and conflict with the ones you wrote. The symptom: all the constraints are correct, but the view's position and size don't change, and nothing is logged to the console. A new view's `frame` is 0 × 0, so the usual result is that the view isn't visible.

Three cases don't need it:

- The view controller's root view `page.view`, and windows. The system positions them; don't change this property on them, and don't set their `frame`.
- Views added to the arrangement of a [`UIStackView`](../ui-stack-view.md). The system sets it to `false` automatically (verified by testing).
- [`UILayoutGuide`](../ui-layout-guide.md). It has no `frame` and no such property.

## Examples

```js
const box = new UIView();
box.translatesAutoresizingMaskIntoConstraints = false;
```

**Effect**: `box` is no longer positioned by `frame`; its position and size are determined entirely by constraints.

## Corresponding iOS API

`UIView.translatesAutoresizingMaskIntoConstraints`.

## See also

- [Two ways to position views](../ui-view.md#two-ways-to-position-views)
- [Turning off `translatesAutoresizingMaskIntoConstraints`](../auto-layout.md#turning-off-translatesautoresizingmaskintoconstraints)
