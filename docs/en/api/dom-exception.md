---
type: reference
web: DOMException
---

# `DOMException`

**`DOMException`** represents an error classified by name. [`name`](dom-exception/name.md) says which kind of error it is, using names from the web standards, such as `'AbortError'` (canceled), `'NotFoundError'` (not found), and `'NotAllowedError'` (no permission); [`message`](dom-exception/message.md) is a one-sentence description; [`code`](dom-exception/code.md) is the legacy numeric code the web standards give that name.

When a runtime API fails and the meaning of the failure has a name in the web standards, what's thrown, or what a Promise rejects with, is a `DOMException`. When the error comes from iOS, the system's original error hangs on `cause` as an [`NSError`](ns-error.md); see [The original system error](#the-original-system-error).

It's in the core, so it needs no package. App code can also create a `DOMException` itself or subclass it.

**Inheritance**: `Error` → `DOMException`

## Constructor

[`DOMException()`](dom-exception/constructor.md)

Creates an error with a description and a name.

## Static properties

[Error code constants](dom-exception/constants.md)

`DOMException.ABORT_ERR` and 24 other constants, each a legacy numeric code. Instances have the same 25 constants.

## Instance properties

Also inherits `stack` (the call stack) and `cause` from `Error`. When an error the runtime gives comes from iOS, `cause` is the system's [`NSError`](ns-error.md).

| Property | Description |
| --- | --- |
| [`name`](dom-exception/name.md) <small>read-only</small> | The error's category, such as `'AbortError'` |
| [`message`](dom-exception/message.md) <small>read-only</small> | A one-sentence description |
| [`code`](dom-exception/code.md) <small>read-only</small> | The legacy numeric code for the name; 0 for names without one |

## Concepts

### Which error the runtime throws

When a runtime API fails, what's thrown, or what a Promise rejects with, is one of these four:

| Situation | Thrown | Examples |
| --- | --- | --- |
| An argument has the wrong type | `TypeError` | A value other than an `AVCaptureDevice` where one is required; a network request that couldn't complete (`fetch()` rejects with `TypeError`, as the web standard says) |
| An argument has the right type but is out of the allowed range | `RangeError` | A camera zoom factor beyond what the camera can do |
| The meaning of the failure has a name in the web standards | `DOMException` | A canceled request, a missing file, no permission |
| The meaning of the failure is specific to iOS | [`NSError`](ns-error.md) | Face ID locked after too many failed attempts; no location available at this moment |

To tell what went wrong, check `name`. All four are instances of `Error`, and `name` is always a string: for `TypeError` and `RangeError` it's the class name, and for `DOMException` and `NSError` it's the category name. To tell the classes apart, use `instanceof DOMException` and `instanceof NSError`.

### Names the runtime gives

The `DOMException`s the runtime gives use only these names:

| `name` | `code` | When it occurs |
| --- | --- | --- |
| `'AbortError'` | 20 | A request canceled by an [`AbortController`](abort-controller.md); the default abort reason of an [`AbortSignal`](abort-signal.md); a one-time location request on [`CLLocationManager`](cl-location-manager.md) canceled; a [`webContents`](web-contents.md) load stopped |
| `'TimeoutError'` | 23 | The abort reason when [`AbortSignal.timeout()`](abort-signal/timeout.md) expires; [`runBackgroundTask()`](application/runbackgroundtask.md) running out of time |
| `'NotFoundError'` | 8 | [`application.fileSystem`](filesystem.md) can't find a file or directory |
| `'NotAllowedError'` | 0 | No permission: file access, the [keychain](keychain.md), location, [saving images](ph-photo-library.md), [notifications](un-user-notification-center.md) |
| `'InvalidStateError'` | 11 | Can't be done in the current state: sending on a [`WebSocket`](websocket.md) that isn't connected, calling `waitUntil()` after a [`PushEvent`](push-event.md) has been dispatched, changing an [`AVCaptureDevice`](av-capture-device.md) setting without the lock, and a few cases in location and saving images |
| `'NetworkError'` | 19 | A network problem while locating; a web page failing to load; a network error during a `WebSocket` send or `ping()` |
| `'InvalidModificationError'` | 13 | File access: a file already exists at the destination; keychain: an item conflict |
| `'QuotaExceededError'` | 22 | Device storage is full; [`crypto.getRandomValues()`](crypto/getrandomvalues.md) asked for more than 65536 bytes at once |
| `'NoModificationAllowedError'` | 7 | File access: the storage is read-only |
| `'TypeMismatchError'` | 17 | File access: an invalid file name; keychain: an invalid argument; `crypto.getRandomValues()` given a float array or a `DataView` |
| `'SecurityError'` | 18 | Keychain: the app lacks the entitlement needed to access the keychain |
| `'OperationError'` | 0 | File access and keychain failures with no more specific name; the system random source failing |
| `'InvalidCharacterError'` | 5 | [`atob()` and `btoa()`](web-globals.md) meeting a character they can't handle |
| `'DataCloneError'` | 25 | [`structuredClone()`](web-globals/structuredclone.md) meeting a value it can't copy |

Exactly when each name occurs, and the text of each `message`, is on each API's page.

### The original system error

When the error comes from iOS, the `DOMException`'s `cause` is the error the system gave, an [`NSError`](ns-error.md). Its [`domain`](ns-error/domain.md) is the error domain, its [`code`](ns-error/code.md) is the number within that domain, its `message` is the system's description, and its `name` is `'NSError'`.

`name` tells you what category of error occurred, and in most cases it's all you need. To tell apart different causes under the same name, or to log the system's error code, read `cause`.

Errors the runtime determines on its own have no `cause`, such as a request canceled by an `AbortController` or a send on a `WebSocket` that isn't connected. Check that `cause` is an `NSError` before reading it.

## Examples

### Tell apart errors when reading a file

```js
/// <reference types="@nacrejs/types" />

async function main() {
  const fs = application.fileSystem;
  try {
    await fs.readText(fs.documents + '/missing.txt');
  } catch (err) {
    if (err instanceof DOMException && err.name === 'NotFoundError') {
      console.log('File not found', err.code);
      if (err.cause instanceof NSError) {
        console.log(err.cause.domain, err.cause.code);
      }
    } else {
      throw err;
    }
  }
}
main();
```

**Result** (measured):

- The first line prints `File not found 8`.
- The second line prints `NSCocoaErrorDomain 260`: the system's error domain and error code.

### Give your own abort reason

```js
const controller = new AbortController();
controller.abort(new DOMException('The user left the page', 'AbortError'));
const reason = controller.signal.reason;
console.log(String(reason), reason instanceof DOMException);
```

**Result**: Prints `AbortError: The user left the page true`.

## Differences from the web

- Passing `null` as the constructor's `message` or `name` gives an empty string. On the web it gives the string `'null'`.
- Errors the runtime gives carry `cause` when they come from iOS.

## See also

- [`NSError`](ns-error.md): the system error on `cause`, and errors whose meaning is specific to iOS
- [`AbortSignal`](abort-signal.md): the abort reason is `'AbortError'` by default and `'TimeoutError'` on timeout
- [`application.fileSystem`](filesystem.md): every error file access can give
