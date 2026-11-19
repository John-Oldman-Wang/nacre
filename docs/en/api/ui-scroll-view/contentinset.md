---
type: reference
native: UIScrollView.contentInset
---

# `UIScrollView`: `contentInset` property

The **`contentInset`** property is extra space around the content. This space scrolls together with the content.

## Value

A [`UIEdgeInsets`](../structs.md) with four fields, `top`, `left`, `bottom`, and `right`, in [pt](../units.md).

- Readable and writable.
- Defaults to `0` on all four sides.
- All four fields are required; you can also write a plain object `{ top: 20, left: 0, bottom: 80, right: 0 }`. A missing field throws `TypeError`.
- The space is not counted in `contentSize`.
- The space actually in effect is [`adjustedContentInset`](adjustedcontentinset.md), which adds the system's safe area space on top of this value.
- Each read returns a new object with read-only fields. To change it, assign a whole new value; see [Structs](../structs.md).
- No change event: only the app's own code changes it.

### Invalid values

- Not an object: `TypeError: contentInset needs an object with all of: top, left, bottom, right`
- A missing field, or a field that is not a finite number: `TypeError: contentInset is missing bottom, or it is not a finite number`

After throwing, the property keeps its previous value.

## Examples

```js
const scroller = new UIScrollView();
scroller.contentInset = new UIEdgeInsets(20, 0, 80, 0);
```

**Effect**: 20 pt of extra space at the top of the content and 80 pt at the bottom. When there is a floating button at the bottom, use this to keep the last row from being covered. **Not verified in the simulator.**

## Corresponding iOS API

`UIScrollView.contentInset`. `UIEdgeInsetsMake(20, 0, 80, 0)` is written `new UIEdgeInsets(20, 0, 80, 0)`.

## See also

- [`adjustedContentInset`](adjustedcontentinset.md)
- [Padding of `UIStackView`](../ui-stack-view.md): another kind of space, counted in `contentSize`
