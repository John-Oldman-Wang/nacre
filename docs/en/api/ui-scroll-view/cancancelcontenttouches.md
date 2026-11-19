---
type: reference
native: UIScrollView.canCancelContentTouches
---

# `UIScrollView`: `canCancelContentTouches` property

The **`canCancelContentTouches`** property indicates whether a finger pressed on a button inside and then moved can turn into a scroll.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | Pressing on a button and then moving turns into a scroll |
| `false` | Once a finger is pressed on a button, it can no longer scroll |

- Readable and writable.
- Defaults to `true`.
- The effects of both values are **not verified in the simulator**.
- Values of other types are converted by JS truthiness.
- No change event: only the app's own code changes it.

## Examples

```js
const scroller = new UIScrollView();
scroller.canCancelContentTouches = false;
```

**Effect**: a drag that starts on a button does not scroll the scroll view. **Not verified in the simulator.**

## Corresponding iOS API

`UIScrollView.canCancelContentTouches`.

## See also

- [`delaysContentTouches`](delayscontenttouches.md)
