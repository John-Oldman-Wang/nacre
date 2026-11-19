---
type: reference
native: "-[UIPanGestureRecognizer setTranslation:inView:]"
---

# `UIPanGestureRecognizer`: `setTranslation()` method

The **`setTranslation()`** method sets the recognizer's accumulated translation to a given value. Later movement keeps accumulating from that value.

## Syntax

```
setTranslation(translation, { inView })
```

### Parameters

**`translation`**

The new translation, a [`CGPoint`](../structs.md) or `{ x, y }`, in the coordinate system of `inView`, in [points (pt)](../units.md).

**`options.inView`**

Required. A [`UIView`](../ui-view.md) or `null`; `null` means the window's coordinate system.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- `inView` is missing: `setTranslation needs { inView }`
- `translation` is missing a field, or a field isn't a number: `setTranslation is missing y, or it is not a finite number`
- `inView` is neither a view nor `null`.

## Description

- Calling it while no gesture is in progress has no effect; it still reads back as `(0, 0)`.
- The recommended way to drag doesn't need it: record the view's starting position in `began`, and in `changed` compute the new position as "starting position + the event's `translation`". See [Dragging a view](../../guides/gestures.md#dragging-a-view).

## Examples

```js
const card = new UIView();
const drag = new UIPanGestureRecognizer();
drag.addEventListener('changed', () => {
  const moved = drag.translationInView(card.superview);
  card.center = new CGPoint(card.center.x + moved.x, card.center.y + moved.y);
  drag.setTranslation(new CGPoint(0, 0), { inView: card.superview });
});
card.addGestureRecognizer(drag);
```

**Effect**: The translation is reset to zero after each move, so the next read gives the translation of just that small step, and `card` follows the finger. **Not verified in the simulator.**

## Corresponding iOS API

`-[UIPanGestureRecognizer setTranslation:inView:]`. `[pan setTranslation:CGPointZero inView:view]` is written as `pan.setTranslation(new CGPoint(0, 0), { inView: view })`.

## See also

- [`translationInView()`](translationinview.md)
