---
type: reference
native: AVCaptureSessionInterruptEvent()
---

# `AVCaptureSessionInterruptEvent()` constructor

The **`AVCaptureSessionInterruptEvent()`** constructor creates a `AVCaptureSessionInterruptEvent`.

## Syntax

```
new AVCaptureSessionInterruptEvent(type)
new AVCaptureSessionInterruptEvent(type, { reason, cancelable })
```

### Parameters

**`type`**

The event name, a string.

**`options.reason`**

Optional. Corresponds to the [`reason`](reason.md) property. Converted with `String()`; `null` stays `null`. When omitted, it is `null`.

**`options.cancelable`**

A boolean. Optional; defaults to `false`.

### Return value

The new `AVCaptureSessionInterruptEvent`.

### Exceptions

**`TypeError`**

- A field's value cannot be converted; see each parameter above.
- No event name is passed: `Failed to construct 'AVCaptureSessionInterruptEvent': 1 argument required, but only 0 present.`
- It is called as a function, without `new`.

## Examples

```js
const event = new AVCaptureSessionInterruptEvent('interrupt', { reason: 'videoDeviceNotAvailableInBackground' });
console.log(event.reason);
```

**Result**: the console prints `videoDeviceNotAvailableInBackground`.

## Corresponding iOS API

There is no corresponding system API. When the system notification arrives, the runtime puts the values it carries into the event object.

## See also

- [`AVCaptureSessionInterruptEvent`](../av-capture-session-interrupt-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md): fires an event you built
