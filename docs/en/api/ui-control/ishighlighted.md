---
type: reference
native: UIControl.highlighted
---

# `UIControl`: `isHighlighted` property

The **`isHighlighted`** property indicates whether the control is in the `highlighted` [state](../ui-control.md#states), that is, whether a finger is pressed on the control.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | The control enters the `highlighted` state. [`state`](state.md) contains `'highlighted'`. A button switches to its pressed appearance |
| `false` | The control leaves the `highlighted` state |

- Readable and writable.
- Defaults to `false`.
- The system sets it to `true` automatically when a finger presses down, and back to `false` when the finger is lifted or the touch is canceled. The app's code can also write it.
- Writes are converted by JS truthiness.

### Observing changes

No event fires when it changes. Use [`touchdown`](touchdown-event.md) and the three ending events [`touchupinside`](touchupinside-event.md), [`touchupoutside`](touchupoutside-event.md), and [`touchcancel`](touchcancel-event.md) to learn when a touch starts and ends.

> **Note:** Do not read it in an event callback to decide whether a finger is held down. Callbacks run after the touch; when a finger is lifted quickly after pressing, reading it in the `touchdown` callback may already give `false` (measured); see [When callbacks run](../ui-control.md#when-callbacks-run). To change the appearance on press, change it directly in the `touchdown` callback.

## Examples

```js
const card = new UIControl();
card.isHighlighted = true;
console.log(card.state.includes('highlighted'));
```

**Result**: prints `true`.

## Corresponding iOS API

`UIControl.highlighted`; its getter is `isHighlighted`.

## See also

- [`isTracking`](istracking.md): whether the control is tracking a touch
- [States](../ui-control.md#states)
