---
type: reference
native: SecItemCopyMatching
---

# `application.keychain`: `keys()` function

The **`keys()`** function lists all keys this app has stored.

## Syntax

```
keys()
```

### Parameters

None.

### Return value

A Promise that fulfills with an array of strings. An empty array when there are no keys. The order is **not verified in the simulator**.

Only this app's own items are included. Rejects when the query fails; see [What you get on error](../keychain.md#what-you-get-on-error).

### Exceptions

None.

## Examples

```js
async function listKeys() {
  const keys = await application.keychain.keys();
  console.log(keys.join(','));
}
listKeys();
```

**Result**: It prints all keys the app has stored, separated by commas.

## Corresponding iOS API

`SecItemCopyMatching` with `kSecMatchLimitAll` and `kSecReturnAttributes`, taking each item's `kSecAttrAccount`.

## See also

- [`clear()`](clear.md)
- [Installing `@nacrejs/keychain`](../keychain.md#installation)
