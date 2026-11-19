---
type: reference
native: SecItemDelete
---

# `application.keychain`: `remove()` function

The **`remove()`** function deletes an item. When the key doesn't exist, it completes as usual without an error.

## Syntax

```
remove(key)
```

### Parameters

**`key`**

The key, a non-empty string.

### Return value

A Promise that fulfills with `undefined` once deletion is done. Rejects when deletion fails; see [What you get on error](../keychain.md#what-you-get-on-error).

### Exceptions

**`TypeError`** (thrown immediately, without returning a Promise)

- `key` isn't a string, or is an empty string: `remove: key must be a non-empty string`.

## Examples

```js
async function logout() {
  await application.keychain.remove('token');
  console.log(await application.keychain.has('token'));
}
logout();
```

**Result**: It prints `false`.

## Corresponding iOS API

`SecItemDelete`. `errSecItemNotFound` is treated as success.

## See also

- [`clear()`](clear.md): deleting all items
- [Installing `@nacrejs/keychain`](../keychain.md#installation)
