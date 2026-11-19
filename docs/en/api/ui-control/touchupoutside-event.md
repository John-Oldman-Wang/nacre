---
type: reference
native: UIControlEventTouchUpOutside
---

# `UIControl`: `touchupoutside` event

The **`touchupoutside`** event fires when a finger presses, slides outside the control's bounds, and is lifted outside. It means the user abandoned the tap.

## Syntax

```
addEventListener('touchupoutside', (event) => { })
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

- At most once per touch. **Not verified in the simulator.**
- A touch fires only one of `touchupinside` and `touchupoutside`.
- Fired by all controls.
- If you changed the appearance on press, restore it here.

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
card.addEventListener('touchupinside', () => {
  console.log('Confirmed');
});
card.addEventListener('touchupoutside', () => {
  console.log('Abandoned');
});
```

**Effect**: When the finger presses and is lifted inside `card`, it prints `Confirmed`; when it slides outside and is lifted, it prints `Abandoned`. **`Abandoned` is not verified in the simulator.**

## Corresponding iOS API

`UIControlEventTouchUpOutside`. Natively it is registered with `addTarget:action:forControlEvents:`; here, use [`addEventListener()`](addeventlistener.md).

## See also

- [`touchupinside`](touchupinside-event.md)
- [`touchcancel`](touchcancel-event.md)
- [Touch location](../ui-control.md#touch-location)
- [When callbacks run](../ui-control.md#when-callbacks-run)
