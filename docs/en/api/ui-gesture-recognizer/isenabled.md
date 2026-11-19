---
type: reference
native: UIGestureRecognizer.enabled
---

# `UIGestureRecognizer`: `isEnabled` property

The **`isEnabled`** property indicates whether the recognizer receives touches.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | Recognizes gestures normally |
| `false` | Receives no touches and fires no events. A continuous gesture in progress is canceled and fires [`cancelled`](cancelled-event.md) |

- Readable and writable.
- The default is `true`.
- Written values are converted by JS truthiness.
- That it stops responding after being set to `false` is **not verified in the simulator**; that setting it to `false` during a long press fires `cancelled` is **not verified in the simulator**.

### Observing changes

No event fires when it changes. Only the app's code changes it, so no notification is needed.

## Examples

```js
const tap = new UITapGestureRecognizer();
tap.isEnabled = false;
console.log(tap.isEnabled);
```

**Effect**: Prints `false`. Once attached to a view, tapping the view has no effect; setting it back to `true` restores it. **Not verified in the simulator.**

## Corresponding iOS API

`UIGestureRecognizer.enabled`; the getter is `isEnabled`.

## See also

- [`cancelled`](cancelled-event.md)
