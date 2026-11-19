---
type: reference
native: "-[UIScrollView setContentOffset:animated:]"
---

# `UIScrollView`: `setContentOffset()` method

The **`setContentOffset()`** method scrolls to the given position, optionally animated.

## Syntax

```
setContentOffset(offset)
setContentOffset(offset, { animated })
```

### Parameters

**`offset`**

The target position, a [`CGPoint`](../structs.md), in [pt](../units.md). At run time a plain object `{ x: 0, y: 500 }` is also accepted, but the type definitions currently accept only `CGPoint`, so type checking reports an error for a plain object.

**`options.animated`**

A boolean. Optional. With `true` it scrolls there smoothly; omitted or `false`, it jumps there immediately, the same as writing [`contentOffset`](contentoffset.md) directly.

### Return value

None (`undefined`).

When animated, [`scrollanimationend`](scrollanimationend-event.md) fires when the animation ends. During the animation, [`isScrollAnimating`](isscrollanimating.md) is `true`.

### Exceptions

**`TypeError`**

- `offset` is not an object: `setContentOffset needs an object with all of: x, y`
- `x` or `y` is missing, or is not a finite number: `setContentOffset is missing x, or it is not a finite number`

## Examples

```js
const scroller = new UIScrollView();
scroller.setContentOffset(new CGPoint(0, 500), { animated: true });
scroller.addEventListener('scrollanimationend', () => console.log('Arrived'));
```

**Effect**: the content scrolls smoothly to 500 pt down. When the animation ends, the console logs `Arrived`.

## Corresponding iOS API

`-[UIScrollView setContentOffset:animated:]`. `animated:` becomes `animated` in the options object.

## See also

- [`contentOffset`](contentoffset.md)
- [`scrollRectToVisible()`](scrollrecttovisible.md)
