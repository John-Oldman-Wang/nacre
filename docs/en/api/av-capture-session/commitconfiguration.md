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

- The system refuses the group of changes for a reason that isn't one of the two below. Which changes get refused, and what happens when you call it without calling `beginConfiguration()` first, are **not verified on a device**.

**`RangeError`, [`DOMException`](../dom-exception.md)**

When the system refuses, the exception depends on the system's reason: `RangeError` when the system says a value is out of range, a `DOMException` whose `name` is `'InvalidStateError'` when it says the current state doesn't allow it, and `TypeError` otherwise. The message is `commitConfiguration: the system refused (…)`, with the reason the system gave in the parentheses. This comes from the code and is **not verified on a device**.

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
