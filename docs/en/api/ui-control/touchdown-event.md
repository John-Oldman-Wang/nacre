---
type: reference
native: UIControlEventTouchDown
---

# `UIControl`: `touchdown` event

The **`touchdown`** event fires when a finger presses down on the control. It is the first event of a touch.

## Syntax

```
addEventListener('touchdown', (event) => { })
```

## Event object

[`UIControlTouchEvent`](../ui-control-touch-event.md). Besides `type` and `target`, it carries two read-only fields:

| Field | Type | Meaning |
| --- | --- | --- |
| [`location`](../ui-control-touch-event/location.md) | [`CGPoint`](../structs.md) or `null` | The finger's position, in this control's own coordinate system, in [pt](../units.md). `null` when fired by [`sendActionsForControlEvents()`](sendactionsforcontrolevents.md) |
| [`tapCount`](../ui-control-touch-event/tapcount.md) | number | The number of consecutive taps, counted in taps. 0 when fired by `sendActionsForControlEvents()` |

It cannot be canceled: `cancelable` is `false`, and `preventDefault()` has no effect.

## When it fires

- Fires the moment the finger touches the control, before release. Once per touch.
- Fired by all controls.
- Two taps by the user are two touches, each firing it once (measured: two taps in a row received `touchdown` twice).
- Callbacks run after the touch, so [`isHighlighted`](ishighlighted.md) read in the callback may already be `false`; see [When callbacks run](../ui-control.md#when-callbacks-run). To change the appearance on press, change it directly in the callback, and restore it in [`touchupinside`](touchupinside-event.md), [`touchupoutside`](touchupoutside-event.md), and [`touchcancel`](touchcancel-event.md).
- A disabled control does not fire it. **Not verified in the simulator.**

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
card.backgroundColor = 'systemGreen';
card.addEventListener('touchdown', (e) => {
  const { location } = e;
  card.alpha = 0.6;
  if (location !== null) {
    console.log('Pressed at', location.x, location.y);
  }
});
card.addEventListener('touchupinside', () => {
  card.alpha = 1;
});
```

**Effect**: When a finger presses down, `card` fades and the console prints the finger's coordinates within `card`. When the finger is lifted inside `card`, it returns to fully opaque. **The opacity change is not verified in the simulator.**

## Corresponding iOS API

`UIControlEventTouchDown`. Natively it is registered with `addTarget:action:forControlEvents:`; here, use [`addEventListener()`](addeventlistener.md).

## See also

- [`touchupinside`](touchupinside-event.md), [`touchupoutside`](touchupoutside-event.md), [`touchcancel`](touchcancel-event.md): the three ways a touch ends
- [Touch location](../ui-control.md#touch-location)
- [When callbacks run](../ui-control.md#when-callbacks-run)
