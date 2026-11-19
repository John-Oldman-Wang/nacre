---
type: reference
native: UIControl.tracking
---

# `UIControl`: `isTracking` property

The **`isTracking`** property indicates whether the control is tracking a touch: from the moment a finger presses down until it is lifted or the touch is canceled.

## Value

A boolean.

| Value | Meaning |
| --- | --- |
| `true` | A touch is in progress |
| `false` | No touch is in progress |

- Read-only; assigning to it throws `TypeError`.
- Defaults to `false`.

### Observing changes

No event fires when it changes. A touch starts with [`touchdown`](touchdown-event.md) and ends with one of [`touchupinside`](touchupinside-event.md), [`touchupoutside`](touchupoutside-event.md), or [`touchcancel`](touchcancel-event.md). Callbacks run after the touch, and a callback reads the value at the moment it runs; see [When callbacks run](../ui-control.md#when-callbacks-run).

## Examples

```js
const card = new UIControl();
console.log(card.isTracking);
```

**Result**: prints `false`.

## Corresponding iOS API

`UIControl.tracking`; its getter is `isTracking`.

## See also

- [`isTouchInside`](istouchinside.md): whether the touch is currently within the control's bounds
