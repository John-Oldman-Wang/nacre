---
type: reference
native: UIScrollView.alwaysBounceVertical
---

# `UIScrollView`: `alwaysBounceVertical` property

The **`alwaysBounceVertical`** property indicates whether, when the content is less than a screen, it can still be pulled vertically and spring back.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | When the content is less than a screen, it can still be pulled vertically and springs back. Requires [`bounces`](bounces.md) to be `true` |
| `false` | When the content is less than a screen, it cannot be dragged vertically |

- Readable and writable.
- Defaults to `false`.
- Values of other types are converted by JS truthiness.
- No change event: only the app's own code changes it.

## Examples

```js
const scroller = new UIScrollView();
scroller.alwaysBounceVertical = true;
```

**Effect**: Even when the content is less than a screen, it can be pulled a little up and down and springs back on release. **Not verified in the simulator.**

## Corresponding iOS API

`UIScrollView.alwaysBounceVertical`.

## See also

- [`alwaysBounceHorizontal`](alwaysbouncehorizontal.md)
