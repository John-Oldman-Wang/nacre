---
type: reference
native: AVCaptureMetadataOutputDetectEvent()
---

# `AVCaptureMetadataOutputDetectEvent()` constructor

The **`AVCaptureMetadataOutputDetectEvent()`** constructor creates a `AVCaptureMetadataOutputDetectEvent`.

## Syntax

```
new AVCaptureMetadataOutputDetectEvent(type)
new AVCaptureMetadataOutputDetectEvent(type, { objects, cancelable })
```

### Parameters

**`type`**

The event name, a string.

**`options.objects`**

Optional. Corresponds to the [`objects`](objects.md) property. Must be iterable (an array, a `Set`, …); it is copied into a new frozen array. Anything else throws `TypeError`. When omitted, it is a frozen empty array.

**`options.cancelable`**

A boolean. Optional; defaults to `false`.

### Return value

The new `AVCaptureMetadataOutputDetectEvent`.

### Exceptions

**`TypeError`**

- A field's value cannot be converted; see each parameter above.
- No event name is passed: `Failed to construct 'AVCaptureMetadataOutputDetectEvent': 1 argument required, but only 0 present.`
- It is called as a function, without `new`.

## Examples

```js
const event = new AVCaptureMetadataOutputDetectEvent('detect');
console.log(event.objects.length, Object.isFrozen(event.objects));
```

**Result**: the console prints `0 true`.

## Corresponding iOS API

There is no corresponding system API. When the system notification arrives, the runtime puts the values it carries into the event object.

## See also

- [`AVCaptureMetadataOutputDetectEvent`](../av-capture-metadata-output-detect-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md): fires an event you built
