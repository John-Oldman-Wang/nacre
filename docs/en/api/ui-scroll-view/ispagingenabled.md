---
type: reference
native: UIScrollView.pagingEnabled
---

# `UIScrollView`: `isPagingEnabled` property

The **`isPagingEnabled`** property indicates whether it pages one page at a time: after release it stops at a whole multiple of the visible area's width (or height).

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | After release it stops at a whole multiple of the visible area's width (or height), never between two pages |
| `false` | It stops at any position |

- Readable and writable.
- Defaults to `false`.
- It can stop only at whole multiples of the visible area, not at any other width.
- Values of other types are converted by JS truthiness.
- No change event: only the app's own code changes it.

## Examples

```js
const scroller = new UIScrollView();
scroller.isPagingEnabled = true;
```

**Effect**: after each swipe and release, it stops where one page exactly fills the visible area. **Not verified in the simulator.**

## Corresponding iOS API

`UIScrollView.pagingEnabled` (the getter is `isPagingEnabled`).

## See also

- [Making a carousel](../../guides/scrolling.md#paging-one-at-a-time)
