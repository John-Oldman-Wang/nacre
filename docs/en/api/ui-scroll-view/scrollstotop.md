---
type: reference
native: UIScrollView.scrollsToTop
---

# `UIScrollView`: `scrollsToTop` property

The **`scrollsToTop`** property indicates whether it scrolls back to the top when the user taps the status bar at the top of the screen.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | Scrolls back to the top when the user taps the status bar, then fires [`scrolltotop`](scrolltotop-event.md) |
| `false` | Tapping the status bar does nothing |

- Readable and writable.
- Defaults to `true`.
- Only one scroll view on a screen can have `scrollsToTop` set to `true`. If several do, tapping the status bar does nothing for any of them.
- Values of other types are converted by JS truthiness.
- No change event: only the app's own code changes it.

## Examples

```js
const scroller = new UIScrollView();
scroller.scrollsToTop = false;
```

**Effect**: tapping the status bar does not scroll this scroll view. **Not verified in the simulator.**

## Corresponding iOS API

`UIScrollView.scrollsToTop`.

## See also

- The [`scrolltotop`](scrolltotop-event.md) event
