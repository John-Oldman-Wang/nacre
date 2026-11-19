---
type: reference
---

# `Crypto`: `randomUUID()` method

The **`randomUUID()`** method returns a randomly generated version 4 UUID.

## Syntax

```
crypto.randomUUID()
```

### Parameters

None.

### Return value

A string of 36 characters: 32 lowercase hexadecimal characters and 4 hyphens, like `3f2b8c1e-9d47-4a6b-8e15-0c7f2a9d6b31`. 122 bits of it are random. Every call gives a different one.

### Exceptions

**`OperationError`**

The system's random source failed: `the system random source failed`. This is an `Error` object whose `name` is set to `OperationError`.

## Examples

```js
const id = crypto.randomUUID();
console.log(id, id.length);
```

**Result**: It prints a UUID and `36`.

## Differences from the web

Same as on the web.

## See also

- [`getRandomValues()`](getrandomvalues.md)
