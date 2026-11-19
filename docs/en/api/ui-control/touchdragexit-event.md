---
type: reference
native: UIControlEventTouchDragExit
---

# `UIControl`: `touchdragexit` event

The **`touchdragexit`** event fires the moment a finger held down moves from inside the control to outside it, crossing the boundary.

## Syntax

```
addEventListener('touchdragexit', (event) => { })
```

## Event object

The event object's type is [`UIControlTouchEvent`](../ui-control.md#touch-location). Besides `type` and `target`, it carries two read-only fields:

| Field | Type | Meaning |
| --- | --- | --- |
| `location` | [`CGPoint`](../structs.md) or `null` | The finger's position, in this control's own coordinate system, in [pt](../units.md). `null` when fired by [`sendActionsForControlEvents()`](sendactionsforcontrolevents.md) |
| `tapCount` | number | The number of consecutive taps, counted in taps. 0 when fired by `sendActionsForControlEvents()` |

The callback parameter is declared as `Event`; to read these two fields, cast it to `UIControlTouchEvent`, as shown in the example.

It cannot be canceled: `cancelable` is `false`, and `preventDefault()` has no effect.

## When it fires

- Fires once each time the boundary is crossed (measured).
- Fired by all controls.
- Afterward, moving the finger outside the control fires [`touchdragoutside`](touchdragoutside-event.md), and moving back inside fires [`touchdragenter`](touchdragenter-event.md).

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
card.addEventListener('touchdown', () => {
  card.alpha = 0.6;
});
card.addEventListener('touchdragexit', () => {
  card.alpha = 1;
});
card.addEventListener('touchdragenter', () => {
  card.alpha = 0.6;
});
```

**Effect**: `card` fades while held down. When the finger slides out of `card`, it returns to fully opaque; when the finger slides back in without lifting, it fades again. **`touchdragenter` and the opacity changes are not verified in the simulator.**

## Corresponding iOS API

`UIControlEventTouchDragExit`. Natively it is registered with `addTarget:action:forControlEvents:`; here, use [`addEventListener()`](addeventlistener.md).

## See also

- [`touchdragenter`](touchdragenter-event.md): moving back inside the control
- [Touch location](../ui-control.md#touch-location)
- [When callbacks run](../ui-control.md#when-callbacks-run)
