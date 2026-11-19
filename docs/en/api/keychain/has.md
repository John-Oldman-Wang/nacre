---
type: reference
native: SecItemCopyMatching
---

# `application.keychain`: `has()` function

The **`has()`** function determines whether a key exists.

## Syntax

```
has(key)
```

### Parameters

**`key`**

The key, a non-empty string.

### Return value

A Promise that fulfills with a boolean: `true` when the key exists, `false` when it doesn't. Rejects when the query fails; see [What you get on error](../keychain.md#what-you-get-on-error).

### Exceptions

**`TypeError`** (thrown immediately, without returning a Promise)

- `key` isn't a string, or is an empty string: `has: key must be a non-empty string`.

## Examples

```js
async function check() {
  await application.keychain.set('token', 'abc-123');
  console.log(await application.keychain.has('token'));
}
check();
```

**Result**: It prints `true`.

## Corresponding iOS API

`SecItemCopyMatching`, checking only whether the item exists.

## See also

- [`get()`](get.md)
- [Installing `@nacrejs/keychain`](../keychain.md#installation)
