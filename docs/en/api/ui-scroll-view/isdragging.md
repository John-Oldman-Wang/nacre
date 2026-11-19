---
type: reference
native: UIScrollView.dragging
---

# `UIScrollView`: `isDragging` property

The **`isDragging`** property indicates that the user is dragging.

## Value

A boolean.

| Value | Meaning |
| --- | --- |
| `true` | The user is dragging |
| `false` | Otherwise |

- Read-only. Assigning to it throws `TypeError`.
- `false` for a new scroll view.
- [`dragbegin`](dragbegin-event.md) fires when it becomes `true`, and [`dragend`](dragend-event.md) when it becomes `false`.

## Examples

```js
const scroller = new UIScrollView();
scroller.addEventListener('scroll', () => {
  console.log(scroller.isDragging);
});
```

**Effect**: logs this state while scrolling. It is `true` while the user is dragging.

## Corresponding iOS API

`UIScrollView.dragging`.

## See also

- [Events](../ui-scroll-view.md#events)
