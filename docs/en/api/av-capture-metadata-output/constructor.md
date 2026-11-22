---
type: reference
native: "-[AVCaptureMetadataOutput init]"
---

# `AVCaptureMetadataOutput()` constructor

The **`AVCaptureMetadataOutput()`** constructor creates an output that recognizes things such as codes and faces in the picture.

## Syntax

```
new AVCaptureMetadataOutput()
```

### Parameters

None.

### Return value

A new `AVCaptureMetadataOutput`. Right after creation:

- [`metadataObjectTypes`](metadataobjecttypes.md) is an empty array, so nothing is recognized.
- [`availableMetadataObjectTypes`](availablemetadataobjecttypes.md) is an empty array (verified by testing). It only has content after the output is added to a session that has a camera connected.
- [`rectOfInterest`](rectofinterest.md) is the whole picture, `(0, 0, 1, 1)` (verified by testing).

### Exceptions

**`TypeError`**

- Subclassing it: `class Mine extends AVCaptureMetadataOutput {}` throws on `new Mine()`, with a message starting with `Illegal constructor`.

## Description

The order of use is fixed: first add a camera input to the session, then add this output with [`addOutput()`](../av-capture-session/addoutput.md), and only then write `metadataObjectTypes`. In the reverse order, writing `metadataObjectTypes` throws `TypeError`.

## Examples

```js
const output = new AVCaptureMetadataOutput();
console.log(output.metadataObjectTypes.length, output.availableMetadataObjectTypes.length);
```

**Effect**: The console prints `0 0`.

## Corresponding iOS API

`[[AVCaptureMetadataOutput alloc] init]`.

## See also

- [`metadataObjectTypes`](metadataobjecttypes.md): what to recognize
- [`detect`](detect-event.md): something was recognized
- [`addOutput()`](../av-capture-session/addoutput.md): add the output to a session
- [Installing `@nacrejs/av-capture`](../av-capture-session.md#installation)
