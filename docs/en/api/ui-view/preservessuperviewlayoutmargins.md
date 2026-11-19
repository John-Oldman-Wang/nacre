---
type: reference
native: UIView.preservesSuperviewLayoutMargins
---

# `UIView`: `preservesSuperviewLayoutMargins` property

The **`preservesSuperviewLayoutMargins`** property determines whether the view uses its superview's layout margins when they are larger than its own.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | Uses the superview's margins when they are larger than its own |
| `false` | Uses only its own |

- Readable and writable.
- The default is `false`.
- The effect of setting it to `true` is **not verified in the simulator**.
- Written values are converted with `Boolean()`: `1`, non-empty strings, and objects are `true`; `0`, `''`, `null`, `undefined`, and `NaN` are `false`. So writing `'false'` gives `true`.

## Examples

```js
const child = new UIView();
child.preservesSuperviewLayoutMargins = true;
console.log(child.preservesSuperviewLayoutMargins);
```

**Result**: Logs `true`.

## Corresponding iOS API

`UIView.preservesSuperviewLayoutMargins`.

## See also

- [`directionalLayoutMargins`](directionallayoutmargins.md)
