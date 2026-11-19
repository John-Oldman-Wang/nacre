---
type: reference
native: application.keychain
---

# `Application`: `keychain` property

The **`keychain`** property is encrypted storage for tokens and passwords. **It only exists in projects that install `@nacrejs/keychain`.**

## Value

`Keychain`. All of its methods return Promises; see [Keychain](../keychain.md) for usage.

- Read-only. Assigning to it throws `TypeError`.
- Without `@nacrejs/keychain` installed, the property doesn't exist: `'keychain' in application` is `false`, and the types don't include it either.
- After installing it, add the line `/// <reference types="@nacrejs/keychain" />` at the top of the entry file so the types include it.

## Examples

```js
/// <reference types="@nacrejs/keychain" />
console.log('keychain' in application);
```

**Result**: prints `true` in projects with `@nacrejs/keychain` installed, and `false` in projects without it.

## Corresponding iOS API

Keychain Services (the `SecItemAdd`, `SecItemCopyMatching` family of functions); see [Keychain](../keychain.md).

## See also

- [Keychain](../keychain.md)
- [Capability packages](../capabilities.md): available only when installed
