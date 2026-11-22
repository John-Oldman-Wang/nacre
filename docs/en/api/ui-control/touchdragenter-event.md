---
type: reference
native: UIControlEventTouchDragEnter
---

# `UIControl`: `touchdragenter` event

The **`touchdragenter`** event fires the moment a finger held down moves from outside the control back inside it, crossing the boundary.

## Syntax

```
addEventListener('touchdragenter', (event) => { })
```

## Event object

[`UIControlTouchEvent`](../ui-control-touch-event.md). Besides `type` and `target`, it carries two read-only fields:

| Field | Type | Meaning |
| --- | --- | --- |
| [`location`](../ui-control-touch-event/location.md) | [`CGPoint`](../structs.md) or `null` | The finger's position, in this control's own coordinate system, in [pt](../units.md). `null` when fired by [`sendActionsForControlEvents()`](sendactionsforcontrolevents.md) |
| [`tapCount`](../ui-control-touch-event/tapcount.md) | number | The number of consecutive taps, counted in taps. 0 when fired by `sendActionsForControlEvents()` |

It cannot be canceled: `cancelable` is `false`, and `preventDefault()` has no effect.

## When it fires

- Fires once each time the boundary is crossed. **Not verified in the simulator.**
- Fired by all controls.
- [`touchdragexit`](touchdragexit-event.md) has always fired before it: the finger has to move out before it can move back in.

### Event sequence of a touch

A plain tap (press, no movement, release), measured on a `UIControl` created directly:

```
touchdown → touchupinside
```

Pressing, sliding out, then releasing: the first four steps are measured; the last step, `touchupoutside`, is **not verified in the simulator**:

```
touchdown
→ touchdraginside (fires once per finger movement inside)
→ touchdragexit (once)
→ touchdragoutside (fires once per finger movement outside)
→ touchupoutside
```

Sliding out, sliding back in, then releasing: after `touchdragoutside` come `touchdragenter` and `touchdraginside`, and finally `touchupinside`. **Not verified in the simulator.**

## Examples

```js
const card = new UIControl();
card.addEventListener('touchdragexit', () => {
  card.alpha = 1;
});
card.addEventListener('touchdragenter', () => {
  card.alpha = 0.6;
});
```

**Effect**: When a finger held on `card` slides out, `card` returns to fully opaque; when it slides back in without lifting, `card` fades. **Not verified in the simulator.**

## Corresponding iOS API

`UIControlEventTouchDragEnter`. Natively it is registered with `addTarget:action:forControlEvents:`; here, use [`addEventListener()`](addeventlistener.md).

## See also

- [`touchdragexit`](touchdragexit-event.md): moving outside the control
- [Touch location](../ui-control.md#touch-location)
- [When callbacks run](../ui-control.md#when-callbacks-run)
