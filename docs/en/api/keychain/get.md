---
type: reference
native: SecItemCopyMatching
---

# `application.keychain`: `get()` function

The **`get()`** function reads an item's string value.

## Syntax

```
get(key)
```

### Parameters

**`key`**

The key, a non-empty string.

### Return value

A Promise that fulfills with:

- A string: this key's value.
- `null`: the key doesn't exist. "The key doesn't exist" isn't an error; the Promise doesn't reject.

Items stored with [`setBytes()`](setbytes.md) should be read with [`getBytes()`](getbytes.md). Reading one with `get` gives `null` when the bytes aren't valid UTF-8 text, indistinguishable from "the key doesn't exist" (derived from reading the code; **not verified in the simulator**).

When reading fails, the Promise rejects; for the rejection value, see [What you get on error](../keychain.md#what-you-get-on-error). For example, reading an item that requires unlocking while the device is locked gives `name` `'NotAllowedError'` (**not verified in the simulator**).

### Exceptions

**`TypeError`** (thrown immediately, without returning a Promise)

- `key` isn't a string, or is an empty string: `get: key must be a non-empty string`.

## Examples

```js
async function readToken() {
  const token = await application.keychain.get('token');
  if (token === null) {
    console.log('Not signed in');
  } else {
    console.log('Signed in, token:', token);
  }
}
readToken();
```

**Result**: When `token` has been stored, it prints `Signed in, token: …`; otherwise it prints `Not signed in`.

## Corresponding iOS API

`SecItemCopyMatching` with `kSecReturnData`, with item class `kSecClassGenericPassword` and `kSecAttrAccount` set to `key`. `errSecItemNotFound` fulfills as `null`.

## See also

- [`set()`](set.md)
- [Installing `@nacrejs/keychain`](../keychain.md#installation)
