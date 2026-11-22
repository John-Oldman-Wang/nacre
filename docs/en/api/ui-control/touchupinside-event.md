---
type: reference
native: UIControlEventTouchUpInside
---

# `UIControl`: `touchupinside` event

The **`touchupinside`** event fires when a finger is lifted within the control's bounds. A [`UIControl`](../ui-control.md) created directly uses it to respond to taps.

## Syntax

```
addEventListener('touchupinside', (event) => { })
```

## Event object

[`UIControlTouchEvent`](../ui-control-touch-event.md). Besides `type` and `target`, it carries two read-only fields:

| Field | Type | Meaning |
| --- | --- | --- |
| [`location`](../ui-control-touch-event/location.md) | [`CGPoint`](../structs.md) or `null` | The finger's position, in this control's own coordinate system, in [pt](../units.md). `null` when fired by [`sendActionsForControlEvents()`](sendactionsforcontrolevents.md) |
| [`tapCount`](../ui-control-touch-event/tapcount.md) | number | The number of consecutive taps, counted in taps. 0 when fired by `sendActionsForControlEvents()` |

It cannot be canceled: `cancelable` is `false`, and `preventDefault()` has no effect.

## When it fires

- Fires when the finger is lifted within the control's bounds, at most once per touch (measured).
- When the finger presses, slides outside the control, and is then lifted, [`touchupoutside`](touchupoutside-event.md) fires instead of this event. **Not verified in the simulator.**
- Fired by all controls.

### Choosing between this and `click`

| Control | Which event to use |
| --- | --- |
| [`UIButton`](../ui-button.md) | [`click`](click-event.md). It means "the user triggered this button", regardless of how |
| A `UIControl` created directly | `touchupinside`. It does not fire `click` (measured) |

When a button is tapped, both events fire; **their order is not verified in the simulator**. On a button, listen for only one of the two; listening for both runs your code twice for one tap. When you need the touch location on a button, listen for `touchupinside`; the `click` event object has no `location`.

Calling `sendActionsForControlEvents(['touchupinside'])` on a button also fires the button's `click` (measured).

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
card.addEventListener('touchupinside', (e) => {
  const { location, tapCount } = e;
  if (location !== null) {
    console.log(location.x, location.y, tapCount);
  }
});
```

**Effect**: When a finger is lifted on `card`, the console prints the finger's x coordinate and y coordinate within `card`, and the tap count.

## Corresponding iOS API

`UIControlEventTouchUpInside`. Natively it is registered with `addTarget:action:forControlEvents:`; here, use [`addEventListener()`](addeventlistener.md).

## See also

- [`click`](click-event.md): a button tap
- [`touchupoutside`](touchupoutside-event.md): released outside the control
- [Touch location](../ui-control.md#touch-location)
- [When callbacks run](../ui-control.md#when-callbacks-run)
