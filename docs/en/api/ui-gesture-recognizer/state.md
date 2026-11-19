---
type: reference
native: UIGestureRecognizer.state
---

# `UIGestureRecognizer`: `state` property

The **`state`** property is the recognizer's current state.

## Value

A string, one of the following:

| Value | Meaning |
| --- | --- |
| `'possible'` | The gesture has not been recognized yet. Also the value when there are no touches |
| `'began'` | A continuous gesture has just been recognized |
| `'changed'` | A continuous gesture is in progress |
| `'ended'` | The gesture has ended. Also the value when a discrete gesture is recognized |
| `'cancelled'` | A continuous gesture was interrupted |
| `'failed'` | This touch is not this gesture |

- Read-only; assigning to it throws `TypeError`.
- The default is `'possible'`.

> **Note:** A callback reads the state as of the moment the callback runs, not as of the moment the event occurred. Measured: a tap's `ended` callback reads `'possible'`, because the recognizer returns to its initial state right after the gesture ends; a long press's `began` callback reads `'began'` while the finger is still down, and may read `'changed'` if the finger has already moved. To know the phase, look at the event name.

### Observing changes

`'began'`, `'changed'`, `'ended'`, and `'cancelled'` each have an event of the same name: [`began`](began-event.md), [`changed`](changed-event.md), [`ended`](ended-event.md), [`cancelled`](cancelled-event.md). `'possible'` and `'failed'` have no corresponding event.

## Examples

```js
const tap = new UITapGestureRecognizer();
console.log(tap.state);
```

**Result**: Prints `possible`.

## Corresponding iOS API

`UIGestureRecognizer.state`. `UIGestureRecognizerStateBegan` is written `'began'`, and likewise for the rest. `UIGestureRecognizerStateRecognized` and `UIGestureRecognizerStateEnded` are the same value; here there is only `'ended'`.

## See also

- [Callbacks cannot read the state as it was](../ui-gesture-recognizer.md#callbacks-cannot-read-the-state-as-it-was)
- [Discrete and continuous gestures](../ui-gesture-recognizer.md#discrete-and-continuous-gestures)
