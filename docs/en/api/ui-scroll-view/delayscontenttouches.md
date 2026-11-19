---
type: reference
native: UIScrollView.delaysContentTouches
---

# `UIScrollView`: `delaysContentTouches` property

The **`delaysContentTouches`** property indicates whether, after a finger presses down, it waits a moment to determine whether this is a scroll before handing the touch to buttons inside.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | Waits a moment to determine whether it is a scroll, then hands the touch to buttons inside. Buttons' pressed feedback is slightly delayed |
| `false` | Hands the touch to buttons inside immediately |

- Readable and writable.
- Defaults to `true`.
- The effects of both values are **not verified in the simulator**.
- Values of other types are converted by JS truthiness.
- No change event: only the app's own code changes it.

## Examples

```js
const scroller = new UIScrollView();
scroller.delaysContentTouches = false;
```

**Effect**: pressing a button inside shows its pressed appearance immediately. **Not verified in the simulator.**

## Corresponding iOS API

`UIScrollView.delaysContentTouches`.

## See also

- [`canCancelContentTouches`](cancancelcontenttouches.md)
