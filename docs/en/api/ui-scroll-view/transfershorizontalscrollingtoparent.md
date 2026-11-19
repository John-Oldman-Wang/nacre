---
type: reference
native: UIScrollView.transfersHorizontalScrollingToParent
---

# `UIScrollView`: `transfersHorizontalScrollingToParent` property

The **`transfersHorizontalScrollingToParent`** property indicates whether, after scrolling to the end horizontally, continued dragging is handed to the outer scroll view.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | Handed to the outer scroll view |
| `false` | Not handed over |

- Readable and writable.
- This property was added from the iOS headers. The acceptance tests verify that it can be read, has the right type, and reads back unchanged after writing back the original value; its effect is **not verified in the simulator**, and the usage follows Apple's documentation.
- Values of other types are converted by JS truthiness.
- No change event: only the app's own code changes it.

## Examples

```js
const scroller = new UIScrollView();
scroller.transfersHorizontalScrollingToParent = false;
console.log(scroller.transfersHorizontalScrollingToParent);
```

**Effect**: the console logs `false`. Dragging is not handed over; **not verified in the simulator**.

## Corresponding iOS API

`UIScrollView.transfersHorizontalScrollingToParent`.
