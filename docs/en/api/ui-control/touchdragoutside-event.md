---
type: reference
native: UIControlEventTouchDragOutside
---

# `UIControl`: `touchdragoutside` event

The **`touchdragoutside`** event fires when a finger held down moves outside the control's bounds.

## Syntax

```
addEventListener('touchdragoutside', (event) => { })
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

- After the finger presses and moves outside the control, it fires once per movement, continuously while the finger moves (measured).
- Fired by all controls.

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
card.addEventListener('touchdragoutside', (e) => {
  const { location } = /** @type {UIControlTouchEvent} */ (e);
  if (location !== null) {
    console.log('Outside', location.x, location.y);
  }
});
```

**Effect**: When a finger presses on `card` and then moves outside it, the console keeps printing the finger's coordinates. The coordinates are in `card`'s coordinate system, so they exceed `card`'s width and height, or are negative.

## Corresponding iOS API

`UIControlEventTouchDragOutside`. Natively it is registered with `addTarget:action:forControlEvents:`; here, use [`addEventListener()`](addeventlistener.md).

## See also

- [`touchdraginside`](touchdraginside-event.md): moving within the control
- [Touch location](../ui-control.md#touch-location)
- [When callbacks run](../ui-control.md#when-callbacks-run)
