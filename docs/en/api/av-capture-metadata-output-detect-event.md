---
type: reference
native: AVCaptureMetadataOutputDetectEvent
---

# `AVCaptureMetadataOutputDetectEvent`

**`AVCaptureMetadataOutputDetectEvent`** represents one frame of the camera feed in which what you look for, such as a QR code, was recognized.

The [`detect`](av-capture-metadata-output/detect-event.md) event of [`AVCaptureMetadataOutput`](av-capture-metadata-output.md) is this class, and [`objects`](av-capture-metadata-output-detect-event/objects.md) is everything recognized in the frame.

It belongs to the `@nacrejs/av-capture` package; for installation, see [`AVCaptureSession`](av-capture-session.md#installation).

**Inheritance**: [`Event`](event.md) → `AVCaptureMetadataOutputDetectEvent`

## Constructor

[`AVCaptureMetadataOutputDetectEvent()`](av-capture-metadata-output-detect-event/constructor.md)

Creates a `AVCaptureMetadataOutputDetectEvent`. The runtime creates one itself when it fires the events below; app code can use it to build an event object and fire it with [`dispatchEvent()`](event-target/dispatchevent.md) to try out a listener.

## Instance properties

Also inherits the properties of [`Event`](event.md); the most commonly used are `type` and `target`. The properties below are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`objects`](av-capture-metadata-output-detect-event/objects.md) <small>read-only</small> | Everything recognized in this frame |

These properties live on the prototype, not on the event object itself: `Object.keys(event)` and `{ ...event }` don't include them, so read them one by one. See [Events with fields](event.md#events-with-fields).

## Events that use this class

| Object | Events |
| --- | --- |
| [`AVCaptureMetadataOutput`](av-capture-metadata-output.md) | [`detect`](av-capture-metadata-output/detect-event.md) |

It can't be canceled: `cancelable` is `false`, and `preventDefault()` has no effect.

## Examples

```js
const output = new AVCaptureMetadataOutput();
output.addEventListener('detect', (e) => {
  console.log(e instanceof AVCaptureMetadataOutputDetectEvent, e.objects.length);
}, { once: true });
```

**Effect**: the first time something is recognized, prints `true` and the number recognized in that frame.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `captureOutput:didOutputMetadataObjects:fromConnection:` | The `detect` event |
| The `metadataObjects` parameter | `event.objects` |

## See also

- [`AVCaptureMetadataOutput`](av-capture-metadata-output.md): the object that fires this event
- [Scanning codes](../guides/scanning.md)
