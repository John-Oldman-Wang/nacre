---
type: reference
native: UIControlTouchEvent.tapCount
---

# `UIControlTouchEvent`: `tapCount` property

The **`tapCount`** property is the tap count: how many times the finger tapped quickly in the same spot.

## Value

A number of taps. The first tap is 1, and a second one right after it is 2.

- Read-only. Assigning to it throws `TypeError`.
- An event fired by [`sendActionsForControlEvents()`](../ui-control/sendactionsforcontrolevents.md) has no real touch, so it is `0`.
- When the event is created with [`new`](constructor.md) without it, it is `0`.

## Examples

```js
const card = new UIControl();
card.addEventListener('touchdownrepeat', (e) => {
  if (e.tapCount === 2) {
    console.log('双击');
  }
});
```

**Effect**: tapping `card` twice quickly prints `双击`.

## Corresponding iOS API

`tapCount` of `UITouch`.

## See also

- [`UIControlTouchEvent`](../ui-control-touch-event.md)
- [`touchdownrepeat`](../ui-control/touchdownrepeat-event.md)
