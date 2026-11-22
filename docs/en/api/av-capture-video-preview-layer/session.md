---
type: reference
native: AVCaptureVideoPreviewLayer.session
---

# `AVCaptureVideoPreviewLayer`: `session` property

The **`session`** property is the session whose picture the layer shows.

## Value

An [`AVCaptureSession`](../av-capture-session.md), or `null`.

- Readable and writable.
- The default is the session passed to the constructor, read back as the same object (verified by testing).
- Writing `null` clears it, and it reads back as `null`; writing a session again reads back as that session (verified by testing).
- What the layer shows after writing `null` is **not verified on a device**.
- Only your own code changes it, so there is no change notification.

### Invalid values

**`TypeError`**

- The value isn't a native object (for example, a string): `session needs a native object or null, got …` (verified by testing).
- The value is a different native object: `session needs an AVCaptureSession or null`.

## Examples

```js
const first = new AVCaptureSession();
const second = new AVCaptureSession();
const preview = new AVCaptureVideoPreviewLayer(first);
preview.session = second;
console.log(preview.session === second);
```

**Effect**: The console prints `true`. The layer now shows the picture of `second`.

## Corresponding iOS API

`AVCaptureVideoPreviewLayer.session`.

## See also

- [`AVCaptureVideoPreviewLayer()`](constructor.md)
