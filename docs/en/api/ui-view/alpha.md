---
type: reference
native: UIView.alpha
---

# `UIView`: `alpha` property

The **`alpha`** property is the view's opacity. It applies to subviews as well.

## Value

A number, a ratio from 0 to 1.

| Value | Effect |
| --- | --- |
| `0` | Fully transparent |
| `1` | Fully opaque |
| In between | Semi-transparent; content behind shows through. Subviews become semi-transparent too |

- Readable and writable.
- The default is `1`.
- The value that reads back can differ slightly from the value written: write `0.6` and it reads back `0.6000000238418579`. Allow a tolerance when comparing.
- The result of writing a number outside 0 to 1 is **not verified in the simulator**.
- By iOS rules, a view with `alpha` below 0.01 doesn't receive touches; touches go to the view behind it. So you can't use `alpha = 0` to make an "invisible but tappable" area. To do that, keep `alpha` at 1 and set `backgroundColor` to `null`. **These two points are not verified in the simulator.**
- To make only the background color semi-transparent without affecting subviews, put the transparency in the color: `backgroundColor = 'rgba(88, 86, 214, 0.5)'`.
- Animatable. See [`UIView.animateWithDuration()`](animatewithduration.md).

### Invalid values

Converted with `Number()`: `'0.5'` becomes `0.5`, `true` becomes `1`, `null` becomes `0`. If it doesn't convert to a finite number (`undefined`, `'abc'`, `NaN`, `Infinity`, objects), throws `TypeError: alpha must be a finite number, got undefined` (after `got` is the value received), and the value stays unchanged.

## Examples

```js
const card = new UIView();
card.alpha = 0.5;
console.log(Math.abs(card.alpha - 0.5) < 1e-6);
```

**Effect**: The view and its subviews become semi-transparent. The console prints `true`.

## Corresponding iOS API

`UIView.alpha`.

## See also

- [`isHidden`](ishidden.md)
- [Making a view semi-transparent](../../guides/views.md#making-it-semi-transparent)
