---
type: reference
native: UIScrollView.showsVerticalScrollIndicator
---

# `UIScrollView`: `showsVerticalScrollIndicator` property

The **`showsVerticalScrollIndicator`** property indicates whether an indicator is shown when scrolling vertically. The indicator is the thin bar that appears at the edge while scrolling, showing the current position.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | An indicator appears on the right when scrolling vertically |
| `false` | Not shown |

- Readable and writable.
- Defaults to `true`.
- Values of other types are converted by JS truthiness.
- No change event: only the app's own code changes it.

## Examples

```js
const scroller = new UIScrollView();
scroller.showsVerticalScrollIndicator = false;
```

**Effect**: no indicator appears on the right when scrolling.

## Corresponding iOS API

`UIScrollView.showsVerticalScrollIndicator`.

## See also

- [`showsHorizontalScrollIndicator`](showshorizontalscrollindicator.md)
- [`flashScrollIndicators()`](flashscrollindicators.md)
