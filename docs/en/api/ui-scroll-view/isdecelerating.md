---
type: reference
native: UIScrollView.decelerating
---

# `UIScrollView`: `isDecelerating` property

The **`isDecelerating`** property indicates that the user has lifted their finger and the content is still sliding.

## Value

A boolean.

| Value | Meaning |
| --- | --- |
| `true` | The user has lifted their finger and the content is still sliding |
| `false` | Otherwise |

- Read-only. Assigning to it throws `TypeError`.
- `false` for a new scroll view.
- [`deceleratebegin`](deceleratebegin-event.md) fires when it becomes `true`, and [`decelerateend`](decelerateend-event.md) when it becomes `false`.

## Examples

```js
const scroller = new UIScrollView();
scroller.addEventListener('dragend', () => {
  if (!scroller.isDecelerating) console.log('Already stopped at release');
});
```

**Effect**: when the finger lifts with no velocity and the content stops sliding, the console logs `Already stopped at release`. **Not verified in the simulator.**

## Corresponding iOS API

`UIScrollView.decelerating`.

## See also

- [Events](../ui-scroll-view.md#events)
