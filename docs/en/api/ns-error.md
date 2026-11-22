---
type: reference
native: NSError
---

# `NSError`

**`NSError`** represents an error given by iOS. [`domain`](ns-error/domain.md) (the error domain) says which part of the system the error came from, such as the file system, location, or Face ID; [`code`](ns-error/code.md) is the number within that error domain; `message` is the system's description.

It appears in two places:

- **When the meaning of the failure is specific to iOS**, such as Face ID locked after too many failed attempts: what's thrown, or what a Promise rejects with, is an `NSError`. [`name`](ns-error/name.md) is a category name the runtime gives, such as `'BiometryLockoutError'`; when there's no category to give, it's `'NSError'`, and you look at `domain` and `code`.
- **When the meaning of the failure has a name in the web standards**, such as no permission: what's thrown is a [`DOMException`](dom-exception.md), and the system's `NSError` hangs on its `cause`. In that case the `NSError`'s `name` is `'NSError'`.

`NSError` is a global, so `err instanceof NSError` works. For which errors the runtime throws, see [Which error the runtime throws](dom-exception.md#which-error-the-runtime-throws).

**Inheritance**: `Error` → `NSError`

## Constructor

Can't be created with `new`; doing so throws `TypeError`: `NSError cannot be constructed; the runtime creates it from a system error`. An `NSError` is only given by the runtime when the system reports an error.

## Instance properties

Also inherits `message` (the system's description) and `stack` (the call stack) from `Error`. `message` is in the app's language; see [Configuring the app](../guides/project-config.md).

| Property | Description |
| --- | --- |
| [`name`](ns-error/name.md) <small>read-only</small> | The error's category, such as `'BiometryLockoutError'`; `'NSError'` when there's no category |
| [`domain`](ns-error/domain.md) <small>read-only</small> | The error domain, such as `'NSCocoaErrorDomain'` |
| [`code`](ns-error/code.md) <small>read-only</small> | The number within the error domain |

## Concepts

### APIs that give an NSError

These throw or reject with an `NSError` directly:

| API | `name` | `domain` |
| --- | --- | --- |
| [`LAContext`](la-context.md): `evaluatePolicy()` rejecting, and the return value of `canEvaluatePolicyError()` | One of eleven category names, or `'NSError'`; see [Reasons authentication failed](la-context.md#reasons-authentication-failed) | `'com.apple.LocalAuthentication'` |
| [`CLLocationManager`](cl-location-manager.md) location errors | `'LocationUnknownError'` or `'NSError'`; see [`CLLocationError`](cl-location-error.md) | `'kCLErrorDomain'` |
| [`PHPhotoLibrary`](ph-photo-library.md) failing to save an image, except for no permission and a missing usage description | `'NSError'` | The domain the system gives |
| [`UNUserNotificationCenter`](un-user-notification-center.md) errors, except for no permission | `'NSError'` | Usually `'UNErrorDomain'` |
| [`AVCaptureDevice`](av-capture-device.md): `lockForConfiguration()` failing to get the lock | `'NSError'` | The domain the system gives |
| `new` [`AVCaptureDeviceInput`](av-capture-device-input.md)`()` failing to open the camera | `'NSError'` | An empty string; `code` is 0 |
| [`UIWindowScene`](ui-window-scene.md): `requestGeometryUpdateWithPreferences()` refused by the system | `'NSError'` | The domain the system gives |
| `activityError` in the `complete` event of [`UIActivityViewController`](ui-activity-view-controller.md) | `'NSError'` | The domain the system gives |

On the `cause` of a [`DOMException`](dom-exception.md): the `DOMException`s given by file access, the keychain, location, saving images, notifications, and web page loading all carry one when the error comes from the system, with `name` `'NSError'`.

## Examples

### Read the system's error code

```js
/// <reference types="@nacrejs/types" />

async function main() {
  const fs = application.fileSystem;
  try {
    await fs.readText(fs.documents + '/missing.txt');
  } catch (err) {
    const cause = err instanceof Error ? err.cause : undefined;
    if (cause instanceof NSError) {
      console.log(cause.name, cause.domain, cause.code);
      console.log(cause.message);
    }
  }
}
main();
```

**Result** (measured):

- The first line prints `NSError NSCocoaErrorDomain 260`. Reading a file that doesn't exist rejects with a `DOMException` whose `name` is `'NotFoundError'`, and the system's error hangs on its `cause`.
- The second line prints the system's description saying the file doesn't exist.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `error.domain` | `err.domain` |
| `error.code` | `err.code` |
| `error.localizedDescription` | `err.message` |
| `error.userInfo` | Not provided in JS |
| A method's `NSError **` out-parameter, a callback's `NSError *` parameter | The error a method throws, or the value a Promise rejects with |

## See also

- [`DOMException`](dom-exception.md): errors whose meaning has a name in the web standards; the system's `NSError` hangs on its `cause`
- [`LAContext`](la-context.md): every reason Face ID authentication can fail
- [`CLLocationError`](cl-location-error.md): the errors location gives
