---
type: reference
native: UIScrollView.tracking
---

# `UIScrollView`: `isTracking` property

The **`isTracking`** property indicates that a finger is pressed on the scroll view, including before it starts moving.

## Value

A boolean.

| Value | Meaning |
| --- | --- |
| `true` | A finger is pressed on the scroll view, including before it starts moving |
| `false` | Otherwise |

- Read-only. Assigning to it throws `TypeError`.
- `false` for a new scroll view.
- No change event.

## Examples

```js
const scroller = new UIScrollView();
scroller.addEventListener('scroll', () => {
  console.log(scroller.isTracking);
});
```

**Effect**: logs this state while scrolling. It is `true` while a finger is pressed on the scroll view, including before it starts moving.

## Corresponding iOS API

`UIScrollView.tracking`.

## See also

- [Events](../ui-scroll-view.md#events)
