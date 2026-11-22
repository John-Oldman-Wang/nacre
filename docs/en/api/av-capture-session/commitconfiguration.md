---
type: reference
native: "-[AVCaptureSession commitConfiguration]"
---

# `AVCaptureSession`: `commitConfiguration()` method

The **`commitConfiguration()`** method makes the changes since [`beginConfiguration()`](beginconfiguration.md) take effect at once.

## Syntax

```
commitConfiguration()
```

### Parameters

None.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- The system refuses the group of changes: the message includes the reason the system gave. Which changes get refused, and what happens when you call it without calling `beginConfiguration()` first, are **not verified on a device**.

Calling `beginConfiguration()` and then `commitConfiguration()` doesn't throw (verified by testing).

## Examples

```js
const session = new AVCaptureSession();
session.beginConfiguration();
session.sessionPreset = 'medium';
session.commitConfiguration();
console.log(session.sessionPreset);
```

**Result**: prints `medium`.

## Corresponding iOS API

`-[AVCaptureSession commitConfiguration]`.

## See also

- [`beginConfiguration()`](beginconfiguration.md): start a group of changes
