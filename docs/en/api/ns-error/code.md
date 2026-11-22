---
type: reference
native: NSError.code
---

# `NSError`: `code` property

The **`code`** property is the error's number within its error domain.

## Value

A number.

- Read-only. Assigning to it throws `TypeError`, and the value doesn't change.
- It's the system's original value.
- The same number means different things in different error domains; check it together with [`domain`](domain.md).

Some common values:

| `domain` | `code` | Meaning |
| --- | --- | --- |
| `'NSCocoaErrorDomain'` | 260 | The file to read doesn't exist (measured) |
| `'NSURLErrorDomain'` | -999 | Loading was canceled, for example by calling [`stop()`](../web-contents/stop.md) (measured) |
| `'NSURLErrorDomain'` | -1100 | The local file to load doesn't exist (measured) |
| `'kCLErrorDomain'` | 1 | No location authorization |
| `'com.apple.LocalAuthentication'` | -8 | Biometrics locked after too many failed attempts |

For what each number means in an error domain, look up that domain's error code list in Apple's documentation.

## Examples

```js
/// <reference types="@nacrejs/types" />

async function main() {
  const fs = application.fileSystem;
  try {
    await fs.readText(fs.documents + '/missing.txt');
  } catch (err) {
    const cause = err instanceof Error ? err.cause : undefined;
    if (cause instanceof NSError && cause.domain === 'NSCocoaErrorDomain' && cause.code === 260) {
      console.log('File not found');
    }
  }
}
main();
```

**Result**: Prints `File not found` (the error code was measured).

## Corresponding iOS API

`NSError.code`.

## See also

- [`domain`](domain.md)
