---
type: reference
native: UIControlEventTouchCancel
---

# `UIControl`: `touchcancel` event

The **`touchcancel`** event fires when the system cancels a touch and the finger is not lifted normally.

## Syntax

```
addEventListener('touchcancel', (event) => { })
```

## Event object

[`UIControlTouchEvent`](../ui-control-touch-event.md). Besides `type` and `target`, it carries two read-only fields:

| Field | Type | Meaning |
| --- | --- | --- |
| [`location`](../ui-control-touch-event/location.md) | [`CGPoint`](../structs.md) or `null` | The finger's position, in this control's own coordinate system, in [pt](../units.md). `null` when fired by [`sendActionsForControlEvents()`](sendactionsforcontrolevents.md) |
| [`tapCount`](../ui-control-touch-event/tapcount.md) | number | The number of consecutive taps, counted in taps. 0 when fired by `sendActionsForControlEvents()` |

It cannot be canceled: `cancelable` is `false`, and `preventDefault()` has no effect.

## When it fires

- For example, when a gesture recognizer takes over the touch. Gesture recognizers are a separate iOS mechanism for recognizing actions such as swipes and long presses; once one succeeds, it can cancel touches in progress on a view. See [Gesture recognizers](../ui-gesture-recognizer.md). System interruptions such as an incoming call also cancel touches.
- At most once per touch. **Not verified in the simulator.**
- Fired by all controls.
- A touch ends with exactly one of `touchupinside`, `touchupoutside`, or `touchcancel`. If you changed the appearance on press, restore it in all three.

## Examples

```js
const card = new UIControl();
const restore = () => {
  card.alpha = 1;
};
card.addEventListener('touchdown', () => {
  card.alpha = 0.6;
});
card.addEventListener('touchupinside', restore);
card.addEventListener('touchupoutside', restore);
card.addEventListener('touchcancel', restore);
```

**Effect**: `card` fades while held down. Whether the finger is lifted normally, lifted after sliding out, or the touch is canceled by the system, `card` returns to fully opaque. **Firing of `touchcancel` is not verified in the simulator.**

## Corresponding iOS API

`UIControlEventTouchCancel`. Natively it is registered with `addTarget:action:forControlEvents:`; here, use [`addEventListener()`](addeventlistener.md).

## See also

- [`touchdown`](touchdown-event.md)
- [Touch location](../ui-control.md#touch-location)
- [When callbacks run](../ui-control.md#when-callbacks-run)
