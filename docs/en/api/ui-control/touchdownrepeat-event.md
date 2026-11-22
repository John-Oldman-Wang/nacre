---
type: reference
native: UIControlEventTouchDownRepeat
---

# `UIControl`: `touchdownrepeat` event

The **`touchdownrepeat`** event fires when the user taps the control repeatedly in quick succession: once per press, from the second press on.

## Syntax

```
addEventListener('touchdownrepeat', (event) => { })
```

## Event object

[`UIControlTouchEvent`](../ui-control-touch-event.md). Besides `type` and `target`, it carries two read-only fields:

| Field | Type | Meaning |
| --- | --- | --- |
| [`location`](../ui-control-touch-event/location.md) | [`CGPoint`](../structs.md) or `null` | The finger's position, in this control's own coordinate system, in [pt](../units.md). `null` when fired by [`sendActionsForControlEvents()`](sendactionsforcontrolevents.md) |
| [`tapCount`](../ui-control-touch-event/tapcount.md) | number | The number of consecutive taps, counted in taps. 0 when fired by `sendActionsForControlEvents()` |

It cannot be canceled: `cancelable` is `false`, and `preventDefault()` has no effect.

## When it fires

- Fires once for the second and each later press, and [`touchdown`](touchdown-event.md) fires as well. **Not verified in the simulator.**
- The system decides how short an interval counts as "in succession".
- Read which tap it is from the event object's `tapCount`. **Not verified in the simulator.**

## Examples

```js
const card = new UIControl();
card.addEventListener('touchdownrepeat', (e) => {
  const { tapCount } = e;
  console.log('Repeat tap', tapCount);
});
```

**Effect**: Tapping `card` twice quickly prints `Repeat tap 2` on the second press. **Not verified in the simulator.**

## Corresponding iOS API

`UIControlEventTouchDownRepeat`. Natively it is registered with `addTarget:action:forControlEvents:`; here, use [`addEventListener()`](addeventlistener.md).

## See also

- [`touchdown`](touchdown-event.md)
- [Touch location](../ui-control.md#touch-location)
- [When callbacks run](../ui-control.md#when-callbacks-run)
