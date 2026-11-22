---
type: reference
native: AVCaptureSessionRuntimeErrorEvent()
---

# `AVCaptureSessionRuntimeErrorEvent()` constructor

The **`AVCaptureSessionRuntimeErrorEvent()`** constructor creates a `AVCaptureSessionRuntimeErrorEvent`.

## Syntax

```
new AVCaptureSessionRuntimeErrorEvent(type)
new AVCaptureSessionRuntimeErrorEvent(type, { error, cancelable })
```

### Parameters

**`type`**

The event name, a string.

**`options.error`**

Optional. Corresponds to the [`error`](error.md) property. Must be a `NSError` or `null`; it is not converted. Anything else throws `TypeError`. When omitted, it is `null`.

**`options.cancelable`**

A boolean. Optional; defaults to `false`.

### Return value

The new `AVCaptureSessionRuntimeErrorEvent`.

### Exceptions

**`TypeError`**

- A field's value cannot be converted; see each parameter above.
- No event name is passed: `Failed to construct 'AVCaptureSessionRuntimeErrorEvent': 1 argument required, but only 0 present.`
- It is called as a function, without `new`.

## Examples

```js
const event = new AVCaptureSessionRuntimeErrorEvent('runtimeerror');
console.log(event.type, event.error);
```

**Result**: the console prints `runtimeerror null`.

## Corresponding iOS API

There is no corresponding system API. When the system notification arrives, the runtime puts the values it carries into the event object.

## See also

- [`AVCaptureSessionRuntimeErrorEvent`](../av-capture-session-runtime-error-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md): fires an event you built
