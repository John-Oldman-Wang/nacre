---
type: reference
native: "-[UIScrollView scrollRectToVisible:animated:]"
---

# `UIScrollView`: `scrollRectToVisible()` method

The **`scrollRectToVisible()`** method scrolls the shortest distance needed to make the given rectangle fully visible in the visible area. Does nothing if the rectangle is already fully visible.

## Syntax

```
scrollRectToVisible(rect)
scrollRectToVisible(rect, { animated })
```

### Parameters

**`rect`**

The rectangle to bring into view, a [`CGRect`](../structs.md), in [pt](../units.md). Its position is relative to the top-left corner of the content area. For a direct subview of the scroll view you can pass its `frame` directly; for deeper subviews, convert with `convertRect()`.

**`options.animated`**

A boolean. Optional; defaults to `false`.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- `rect` is not an object: `scrollRectToVisible needs an object with all of: x, y, width, height`
- A field is missing or is not a finite number: `scrollRectToVisible is missing width, or it is not a finite number`

## Examples

```js
const scroller = new UIScrollView();
const column = new UIStackView();
column.axis = 'vertical';
scroller.addSubview(column);
const target = new UILabel();
column.addArrangedSubview(target);

const rect = target.convertRect(target.bounds, { toView: scroller });
scroller.scrollRectToVisible(rect, { animated: true });
```

**Effect**: scrolls the shortest distance so that `target` is fully visible in the visible area. **Not verified in the simulator.**

## Corresponding iOS API

`-[UIScrollView scrollRectToVisible:animated:]`.

## See also

- [`setContentOffset()`](setcontentoffset.md)
