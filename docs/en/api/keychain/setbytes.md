---
type: reference
native: SecItemUpdate / SecItemAdd
---

# `application.keychain`: `setBytes()` function

The **`setBytes()`** function writes the bytes in a `Blob` into an item. When the key already exists, its value is overwritten.

## Syntax

```
setBytes(key, blob[, { accessible }])
```

### Parameters

**`key`**

The key, a non-empty string.

**`blob`**

The bytes to write, a [`Blob`](../fetch.md).

**`options.accessible`**

Optional. The access level, same as for [`set()`](set.md), defaulting to `'whenUnlockedThisDeviceOnly'`. See [Access levels](../keychain.md#access-levels).

### Return value

A Promise that fulfills with `undefined` once writing is done. Rejects with `name` `'TypeMismatchError'` when `accessible` isn't one of the five values. For other failures, see [What you get on error](../keychain.md#what-you-get-on-error).

### Exceptions

**`TypeError`** (thrown immediately, without returning a Promise)

- `key` isn't a string, or is an empty string: `setBytes: key must be a non-empty string`.
- The second argument isn't a `Blob`: `setBytes: the second argument must be a Blob`.
- `accessible` isn't a string: `setBytes: accessible must be a string`.

## Description

Items stored with `setBytes` should be read with [`getBytes()`](getbytes.md).

## Examples

```js
async function saveSecret() {
  const secret = crypto.getRandomValues(new Uint8Array(32));
  await application.keychain.setBytes('secret', new Blob([secret]));

  const buffer = await application.keychain.getBytes('secret');
  if (buffer !== null) {
    console.log(new Uint8Array(buffer).length);
  }
}
saveSecret();
```

**Result**: It prints `32`. The bytes read back are the same as those written.

## Corresponding iOS API

`SecItemUpdate`, or `SecItemAdd` when the item doesn't exist, with the value being an `NSData` made of the `Blob`'s bytes.

## See also

- [`getBytes()`](getbytes.md)
- [`crypto`](../crypto.md): generating random keys
- [Installing `@nacrejs/keychain`](../keychain.md#installation)
