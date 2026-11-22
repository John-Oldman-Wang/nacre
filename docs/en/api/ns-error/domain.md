---
type: reference
native: NSError.domain
---

# `NSError`: `domain` property

The **`domain`** property is the error domain: which part of the system the error came from.

## Value

A string.

- Read-only. Assigning to it throws `TypeError`, and the value doesn't change.
- It's the system's original value.

The error domains each API gives:

| `domain` | From |
| --- | --- |
| `'NSCocoaErrorDomain'` | File access ([`application.fileSystem`](../filesystem.md)) |
| `'NSOSStatusErrorDomain'` | The keychain ([`application.keychain`](../keychain.md)) |
| `'kCLErrorDomain'` | Location ([`CLLocationManager`](../cl-location-manager.md)) |
| `'com.apple.LocalAuthentication'` | Face ID ([`LAContext`](../la-context.md)) |
| `'UNErrorDomain'` | Notifications ([`UNUserNotificationCenter`](../un-user-notification-center.md)) |
| `'NSURLErrorDomain'` | Web page loading ([`webContents`](../web-contents.md)) |
| An empty string | `new` [`AVCaptureDeviceInput`](../av-capture-device-input.md)`()` failing to open the camera |

The table shows the usual cases; the system can also give a domain not listed here. When checking an error code, compare `domain` first.

## Examples

```js
/// <reference types="@nacrejs/types" />

async function main() {
  const fs = application.fileSystem;
  try {
    await fs.readText(fs.documents + '/missing.txt');
  } catch (err) {
    const cause = err instanceof Error ? err.cause : undefined;
    if (cause instanceof NSError) {
      console.log(cause.domain);
    }
  }
}
main();
```

**Result**: Prints `NSCocoaErrorDomain` (measured).

## Corresponding iOS API

`NSError.domain`.

## See also

- [`code`](code.md): the number within the error domain
