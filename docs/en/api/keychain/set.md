---
type: reference
native: SecItemUpdate / SecItemAdd
---

# `application.keychain`: `set()` function

The **`set()`** function writes a string value. When the key already exists, its value is overwritten without an error.

## Syntax

```
set(key, value[, { accessible }])
```

### Parameters

**`key`**

The key, a non-empty string.

**`value`**

The value, a string. Convert numbers, arrays, and objects to text first, for example with `JSON.stringify()`. For binary data, use [`setBytes()`](setbytes.md).

**`options.accessible`**

Optional. The item's access level, one of five strings, defaulting to `'whenUnlockedThisDeviceOnly'`. For the effect of each value, see [Access levels](../keychain.md#access-levels).

It takes effect only when the item is first written: writing again to an existing key with a different `accessible` updates the value but keeps the access level, without an error (derived from reading the code; **not verified in the simulator**). To change the access level, call [`remove()`](remove.md) first, then `set()`.

### Return value

A Promise that fulfills with `undefined` once writing is done.

Rejection cases:

- `accessible` is a string but not one of the five values: `name` is `'TypeMismatchError'`, and `message` is `accessible has no value "always"; expected one of: ` followed by the accepted values. The key isn't written.
- `accessible` is `'whenPasscodeSetThisDeviceOnly'` and the device has no passcode set: writing fails (**not verified in the simulator**).
- Other failures; see [What you get on error](../keychain.md#what-you-get-on-error).

### Exceptions

**`TypeError`** (thrown immediately, without returning a Promise)

- `key` isn't a string, or is an empty string: `set: key must be a non-empty string`.
- `value` isn't a string: `set: value must be a string; use setBytes for binary`.
- `accessible` isn't a string: `set: accessible must be a string`.

## Description

Calling `set` twice on the same key in a row without waiting leaves the value from the later call (derived from reading the code; **not verified in the simulator**).

## Examples

```js
async function saveRefreshToken() {
  await application.keychain.set('refreshToken', 'r-456', {
    accessible: 'afterFirstUnlockThisDeviceOnly',
  });
  console.log(await application.keychain.get('refreshToken'));
}
saveRefreshToken();
```

**Result**: It prints `r-456`. After the user unlocks once following a restart, it can be read even while the device is locked (**not verified in the simulator**).

## Corresponding iOS API

`SecItemUpdate`, or `SecItemAdd` when the item doesn't exist. `accessible` corresponds to `kSecAttrAccessible`; `kSecAttrAccessibleWhenUnlocked` is written `'whenUnlocked'`, and the rest likewise.

## See also

- [`get()`](get.md)
- [`setBytes()`](setbytes.md)
- [Installing `@nacrejs/keychain`](../keychain.md#installation)
