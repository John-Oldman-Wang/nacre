---
type: reference
native: UIActivityIndicatorView.isAnimating
---

# `UIActivityIndicatorView`: `isAnimating` property

The **`isAnimating`** property indicates whether the activity indicator is spinning.

## Value

A boolean.

| Value | Meaning |
| --- | --- |
| `true` | Spinning. [`startAnimating()`](startanimating.md) was called, and [`stopAnimating()`](stopanimating.md) hasn't been called since |
| `false` | Not spinning |

- Read-only; assigning to it throws `TypeError`, and the value stays unchanged.
- It's `false` on a new indicator.
- It changes only through `startAnimating()` and `stopAnimating()`. There's no change event: what changes it is the app's own code.
- Writing `true` to the inherited `isHidden` doesn't affect it: the indicator is hidden, and `isAnimating` stays `true`.

## Examples

```js
const spinner = new UIActivityIndicatorView();
console.log(spinner.isAnimating);
spinner.startAnimating();
console.log(spinner.isAnimating);
spinner.stopAnimating();
console.log(spinner.isAnimating);
```

**Result**: Prints `false`, `true`, `false` in order.

## Corresponding iOS API

`UIActivityIndicatorView.isAnimating` (the ObjC getter is `isAnimating`).

## See also

- [Who controls showing and hiding](../ui-activity-indicator-view.md#who-controls-showing-and-hiding)
