---
type: reference
native: UIGestureRecognizer.numberOfTouches
---

# `UIGestureRecognizer`: `numberOfTouches` property

The **`numberOfTouches`** property is the number of fingers taking part in the gesture at this moment.

## Value

A number, counting fingers.

- Read-only; assigning to it throws `TypeError`.
- The default is `0`: no fingers are down.
- A callback reads the value as of the moment the callback runs. The number of fingers at the moment the event occurred is in the event object's `numberOfTouches`; see [Events](../ui-gesture-recognizer.md#events).

### Observing changes

No event fires when it changes. Changes in fingers during a gesture arrive with the [`changed`](changed-event.md) event.

## Examples

```js
const tap = new UITapGestureRecognizer();
console.log(tap.numberOfTouches);
```

**Result**: Prints `0`.

## Corresponding iOS API

`UIGestureRecognizer.numberOfTouches`.

## See also

- [`ended`](ended-event.md): `numberOfTouches` on the event object
