---
type: reference
native: UIActivityIndicatorView.hidesWhenStopped
---

# `UIActivityIndicatorView`: `hidesWhenStopped` property

The **`hidesWhenStopped`** property determines whether the activity indicator hides when it isn't spinning.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | Hidden when not spinning. The indicator writes `isHidden` itself when it starts and stops |
| `false` | Still shown after stopping, as a ring of motionless short lines |

- Readable and writable.
- The default is `true`.
- A change takes effect immediately, without waiting for the next start or stop: on an indicator that isn't spinning, writing `false` shows it right away, and writing `true` again hides it right away.
- The written value is converted to a boolean by JS truthiness; it never throws.
- There's no change event. Only the app's own code changes it.

## Examples

```js
const spinner = new UIActivityIndicatorView();
spinner.startAnimating();
spinner.hidesWhenStopped = false;
spinner.stopAnimating();
console.log(spinner.isHidden);
```

**Result**: Prints `false`. The indicator stops rotating and stays shown in place. What it looks like on screen is **not verified in the simulator**.

## Corresponding iOS API

`UIActivityIndicatorView.hidesWhenStopped`.

## See also

- [Who controls showing and hiding](../ui-activity-indicator-view.md#who-controls-showing-and-hiding)
- [`stopAnimating()`](stopanimating.md)
