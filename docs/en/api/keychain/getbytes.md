---
type: reference
native: SecItemCopyMatching
---

# `application.keychain`: `getBytes()` function

The **`getBytes()`** function reads an item's value as raw bytes.

## Syntax

```
getBytes(key)
```

### Parameters

**`key`**

The key, a non-empty string.

### Return value

A Promise that fulfills with:

- An `ArrayBuffer`: the bytes of this key's value.
- `null`: the key doesn't exist. The Promise doesn't reject.

When reading fails, the Promise rejects; for the rejection value, see [What you get on error](../keychain.md#what-you-get-on-error).

### Exceptions

**`TypeError`** (thrown immediately, without returning a Promise)

- `key` isn't a string, or is an empty string: `getBytes: key must be a non-empty string`.

## Examples

```js
async function readSecret() {
  const buffer = await application.keychain.getBytes('secret');
  if (buffer !== null) {
    console.log(new Uint8Array(buffer).length);
  }
}
readSecret();
```

**Result**: When a 32-byte `secret` has been stored, it prints `32`. The bytes read back are the same as those written.

## Corresponding iOS API

`SecItemCopyMatching` with `kSecReturnData`; the resulting `NSData` is handed over as an `ArrayBuffer`.

## See also

- [`setBytes()`](setbytes.md)
- [Installing `@nacrejs/keychain`](../keychain.md#installation)
