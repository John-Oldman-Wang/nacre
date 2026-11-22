---
type: reference
native: AVCaptureSessionRuntimeErrorEvent
---

# `AVCaptureSessionRuntimeErrorEvent`

**`AVCaptureSessionRuntimeErrorEvent`** represents an error during capture.

The [`runtimeerror`](av-capture-session/runtimeerror-event.md) event of [`AVCaptureSession`](av-capture-session.md) is this class, and [`error`](av-capture-session-runtime-error-event/error.md) is the error the system gave.

It belongs to the `@nacrejs/av-capture` package; for installation, see [`AVCaptureSession`](av-capture-session.md#installation).

**Inheritance**: [`Event`](event.md) → `AVCaptureSessionRuntimeErrorEvent`

## Constructor

[`AVCaptureSessionRuntimeErrorEvent()`](av-capture-session-runtime-error-event/constructor.md)

Creates a `AVCaptureSessionRuntimeErrorEvent`. The runtime creates one itself when it fires the events below; app code can use it to build an event object and fire it with [`dispatchEvent()`](event-target/dispatchevent.md) to try out a listener.

## Instance properties

Also inherits the properties of [`Event`](event.md); the most commonly used are `type` and `target`. The properties below are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`error`](av-capture-session-runtime-error-event/error.md) <small>read-only</small> | The error the system gave |

These properties live on the prototype, not on the event object itself: `Object.keys(event)` and `{ ...event }` don't include them, so read them one by one. See [Events with fields](event.md#events-with-fields).

## Events that use this class

| Object | Events |
| --- | --- |
| [`AVCaptureSession`](av-capture-session.md) | [`runtimeerror`](av-capture-session/runtimeerror-event.md) |

It can't be canceled: `cancelable` is `false`, and `preventDefault()` has no effect.

## Examples

```js
const session = new AVCaptureSession();
session.addEventListener('runtimeerror', (e) => {
  console.log(e instanceof AVCaptureSessionRuntimeErrorEvent, e.error instanceof NSError);
});
```

**Effect**: when capture fails, prints `true true`. **Not verified on a device**: this event couldn't be triggered.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `AVCaptureSessionRuntimeErrorNotification` | The `runtimeerror` event |
| `userInfo[AVCaptureSessionErrorKey]` | `event.error` |

## See also

- [`runtimeerror`](av-capture-session/runtimeerror-event.md): when it is fired
- [`NSError`](ns-error.md)
