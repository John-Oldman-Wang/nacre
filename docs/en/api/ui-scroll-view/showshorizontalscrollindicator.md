---
type: reference
native: UIScrollView.showsHorizontalScrollIndicator
---

# `UIScrollView`: `showsHorizontalScrollIndicator` property

The **`showsHorizontalScrollIndicator`** property indicates whether an indicator is shown when scrolling horizontally.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | An indicator appears at the bottom when scrolling horizontally |
| `false` | Not shown |

- Readable and writable.
- Defaults to `true`.
- Values of other types are converted by JS truthiness.
- No change event: only the app's own code changes it.

## Examples

```js
const scroller = new UIScrollView();
scroller.showsHorizontalScrollIndicator = false;
```

**Effect**: no indicator appears at the bottom when scrolling horizontally.

## Corresponding iOS API

`UIScrollView.showsHorizontalScrollIndicator`.

## See also

- [`showsVerticalScrollIndicator`](showsverticalscrollindicator.md)
