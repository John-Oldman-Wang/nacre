---
type: reference
native: UIControl.touchInside
---

# `UIControl`: `isTouchInside` property

The **`isTouchInside`** property indicates whether the touch being tracked is currently within the control's bounds.

## Value

A boolean.

| Value | Meaning |
| --- | --- |
| `true` | A touch is in progress, and the finger is currently within the control's bounds |
| `false` | The finger is currently outside the control's bounds, or no touch is in progress |

- Read-only; assigning to it throws `TypeError`.
- Defaults to `false`. **The default value is not verified in the simulator.**

### Observing changes

No event fires when it changes. When the finger crosses the control's boundary, [`touchdragexit`](touchdragexit-event.md) and [`touchdragenter`](touchdragenter-event.md) fire.

## Examples

```js
const card = new UIControl();
card.addEventListener('touchdraginside', () => {
  console.log(card.isTouchInside);
});
```

**Effect**: While a finger held down moves within `card`, the console prints `true`. Callbacks run after the touch, so if the finger moves out quickly, the value read may already be `false`. **Not verified in the simulator.**

## Corresponding iOS API

`UIControl.touchInside`; its getter is `isTouchInside`.

## See also

- [`isTracking`](istracking.md)
- [Touch location](../ui-control.md#touch-location): the finger position carried by touch events
