---
type: reference
native: AVCaptureSessionInterruptEvent
---

# `AVCaptureSessionInterruptEvent`

**`AVCaptureSessionInterruptEvent`** represents the system interrupting a capture session.

The [`interrupt`](av-capture-session/interrupt-event.md) event of [`AVCaptureSession`](av-capture-session.md) is this class, and [`reason`](av-capture-session-interrupt-event/reason.md) is why it was interrupted.

It belongs to the `@nacrejs/av-capture` package; for installation, see [`AVCaptureSession`](av-capture-session.md#installation).

**Inheritance**: [`Event`](event.md) → `AVCaptureSessionInterruptEvent`

## Constructor

[`AVCaptureSessionInterruptEvent()`](av-capture-session-interrupt-event/constructor.md)

Creates a `AVCaptureSessionInterruptEvent`. The runtime creates one itself when it fires the events below; app code can use it to build an event object and fire it with [`dispatchEvent()`](event-target/dispatchevent.md) to try out a listener.

## Instance properties

Also inherits the properties of [`Event`](event.md); the most commonly used are `type` and `target`. The properties below are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`reason`](av-capture-session-interrupt-event/reason.md) <small>read-only</small> | Why it was interrupted |

These properties live on the prototype, not on the event object itself: `Object.keys(event)` and `{ ...event }` don't include them, so read them one by one. See [Events with fields](event.md#events-with-fields).

## Events that use this class

| Object | Events |
| --- | --- |
| [`AVCaptureSession`](av-capture-session.md) | [`interrupt`](av-capture-session/interrupt-event.md) |

It can't be canceled: `cancelable` is `false`, and `preventDefault()` has no effect.

## Examples

```js
const session = new AVCaptureSession();
session.addEventListener('interrupt', (e) => {
  console.log(e instanceof AVCaptureSessionInterruptEvent, e.reason);
});
```

**Effect**: when the session is interrupted, prints `true` and the reason. **Not verified on a device.**

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `AVCaptureSessionWasInterruptedNotification` | The `interrupt` event |
| `userInfo[AVCaptureSessionInterruptionReasonKey]` | `event.reason` |
| `AVCaptureSessionInterruptionReasonVideoDeviceInUseByAnotherClient` | `'videoDeviceInUseByAnotherClient'`, and likewise for the rest |

## See also

- [`interrupt`](av-capture-session/interrupt-event.md): when it is fired
- [`AVCaptureSession`](av-capture-session.md)
