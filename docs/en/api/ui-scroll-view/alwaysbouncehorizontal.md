---
type: reference
native: UIScrollView.alwaysBounceHorizontal
---

# `UIScrollView`: `alwaysBounceHorizontal` property

The **`alwaysBounceHorizontal`** property indicates whether, when the content is less than a screen, it can still be pulled horizontally and spring back.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | When the content is less than a screen, it can still be pulled horizontally and springs back. Requires [`bounces`](bounces.md) to be `true` |
| `false` | When the content is less than a screen, it cannot be dragged horizontally |

- Readable and writable.
- Defaults to `false`.
- Values of other types are converted by JS truthiness.
- No change event: only the app's own code changes it.

## Examples

```js
const scroller = new UIScrollView();
scroller.alwaysBounceHorizontal = true;
```

**Effect**: Even when the content is less than a screen wide, it can be pulled a little left and right and springs back on release. **Not verified in the simulator.**

## Corresponding iOS API

`UIScrollView.alwaysBounceHorizontal`.

## See also

- [`alwaysBounceVertical`](alwaysbouncevertical.md)
