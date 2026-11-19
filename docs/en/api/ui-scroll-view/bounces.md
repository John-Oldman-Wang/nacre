---
type: reference
native: UIScrollView.bounces
---

# `UIScrollView`: `bounces` property

The **`bounces`** property indicates whether, after scrolling to an end, it can be pulled a little further and spring back on release.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | After reaching an end it can be pulled a little further, springing back on release |
| `false` | It stops at the end |

- Readable and writable.
- Defaults to `true`.
- Values of other types are converted by JS truthiness.
- No change event: only the app's own code changes it.

## Examples

```js
const scroller = new UIScrollView();
scroller.bounces = false;
```

**Effect**: it stops at the very top or bottom and cannot be pulled further.

## Corresponding iOS API

`UIScrollView.bounces`.

## See also

- [`alwaysBounceVertical`](alwaysbouncevertical.md)
- [`bouncesVertically`](bouncesvertically.md)
