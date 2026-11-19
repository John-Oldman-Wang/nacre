---
type: reference
native: SecItemDelete
---

# `application.keychain`: `clear()` function

The **`clear()`** function deletes all of this app's items in the keychain.

## Syntax

```
clear()
```

### Parameters

None.

### Return value

A Promise that fulfills with `undefined` once deletion is done. Rejects when deletion fails; see [What you get on error](../keychain.md#what-you-get-on-error).

Only this app's own items are deleted.

### Exceptions

None.

## Examples

```js
async function logoutAll() {
  await application.keychain.clear();
  console.log((await application.keychain.keys()).length);
}
logoutAll();
```

**Result**: It prints `0`.

## Corresponding iOS API

`SecItemDelete`, matching only on the item class and `kSecAttrService` (the app's bundle identifier), without specifying `kSecAttrAccount`.

## See also

- [`remove()`](remove.md): deleting one key
- [Installing `@nacrejs/keychain`](../keychain.md#installation)
