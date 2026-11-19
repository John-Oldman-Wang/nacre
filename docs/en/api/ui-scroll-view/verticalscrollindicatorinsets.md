---
type: reference
native: UIScrollView.verticalScrollIndicatorInsets
---

# `UIScrollView`: `verticalScrollIndicatorInsets` property

The **`verticalScrollIndicatorInsets`** property is the vertical indicator's distance from the edges of the scroll view.

## Value

A [`UIEdgeInsets`](../structs.md), in [pt](../units.md).

- Readable and writable.
- Defaults to `0` on all four sides.
- When [`automaticallyAdjustsScrollIndicatorInsets`](automaticallyadjustsscrollindicatorinsets.md) is `true`, the system adjusts further for the safe area on top of this value.
- Each read returns a new object with read-only fields. To change it, assign a whole new value; see [Structs](../structs.md).
- No change event: only the app's own code changes it.

### Invalid values

- Not an object: `TypeError: verticalScrollIndicatorInsets needs an object with all of: top, left, bottom, right`
- A missing field, or a field that is not a finite number: `TypeError: verticalScrollIndicatorInsets is missing bottom, or it is not a finite number`

After throwing, the property keeps its previous value.

## Examples

```js
const scroller = new UIScrollView();
scroller.verticalScrollIndicatorInsets = new UIEdgeInsets(0, 0, 80, 0);
```

**Effect**: the vertical indicator stays out of the bottom 80 pt. **Not verified in the simulator.**

## Corresponding iOS API

`UIScrollView.verticalScrollIndicatorInsets`.

## See also

- [`automaticallyAdjustsScrollIndicatorInsets`](automaticallyadjustsscrollindicatorinsets.md)
