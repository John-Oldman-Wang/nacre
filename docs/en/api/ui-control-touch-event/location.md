---
type: reference
native: UIControlTouchEvent.location
---

# `UIControlTouchEvent`: `location` property

The **`location`** property is the finger position, in the control's own coordinate system.

## Value

A [`CGPoint`](../cg-point.md) or `null`, in [pt](../units.md). `(0, 0)` is the control's top-left corner.

- Read-only. Assigning to it throws `TypeError`.
- An event fired by [`sendActionsForControlEvents()`](../ui-control/sendactionsforcontrolevents.md) has no real touch, so it is `null`. `null` differs from `(0, 0)`: `(0, 0)` is a real position.
- It is the position at the moment the event happened. By the time the callback runs, the touch may have ended, and the control doesn't keep the touch position.
- To convert it to another view's coordinate system, use `convertPoint()` of [`UIView`](../ui-view.md).
- When the event is created with [`new`](constructor.md) without it, it is `null`.

## Examples

```js
const card = new UIControl();
card.addEventListener('touchupinside', (e) => {
  if (e.location !== null) {
    console.log(e.location.x, e.location.y);
  }
});
```

**Effect**: when the finger lifts on `card`, prints the finger's x and y within `card`.

## Corresponding iOS API

`[touch locationInView:control]`: the position, within the control, of the `UITouch` in the action method's `UIEvent`.

## See also

- [`UIControlTouchEvent`](../ui-control-touch-event.md)
- [`tapCount`](tapcount.md)
