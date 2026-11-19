---
type: reference
---

# `Crypto`: `getRandomValues()` method

The **`getRandomValues()`** method fills an integer typed array with random values and returns the same array.

## Syntax

```
crypto.getRandomValues(array)
```

### Parameters

**`array`**

An integer typed array, one of nine kinds: `Int8Array`, `Uint8Array`, `Uint8ClampedArray`, `Int16Array`, `Uint16Array`, `Int32Array`, `Uint32Array`, `BigInt64Array`, `BigUint64Array`.

- At most 65536 bytes. The limit is counted in bytes, not elements: each `Uint32Array` element is 4 bytes, so at most 16384 elements.
- It can be a view from `subarray()`. Only the range the view covers is filled; the rest is untouched (measured).

### Return value

The `array` passed in itself, not a copy. You get as many random numbers as the array is long. An array of length 0 is returned as is.

### Exceptions

The first three are checked before the array is filled, so the array's content is unchanged when they occur.

**`QuotaExceededError`**

More than 65536 bytes: `getRandomValues can fill at most 65536 bytes per call, got 65537`, ending with the actual byte count.

**`TypeMismatchError`**

A floating-point array (such as `Float32Array`) or a `DataView` is passed: `getRandomValues needs an integer typed array; Float arrays and DataView are not accepted`.

**`TypeError`**

What is passed isn't a typed array (such as an ordinary array): `getRandomValues needs an integer typed array`.

**`OperationError`**

The system's random source failed: `the system random source failed`. This error never occurred during acceptance testing.

`QuotaExceededError`, `TypeMismatchError`, and `OperationError` are `Error` objects whose `name` is set to these values; use `err.name` to tell them apart.

## Examples

### Generating a random token

```js
const bytes = new Uint8Array(16);
crypto.getRandomValues(bytes);
let token = '';
for (const b of bytes) {
  token += b.toString(16).padStart(2, '0');
}
console.log(token);
```

**Result**: It prints 32 hexadecimal characters, like `9f3a61c05e7d2b48a1c6f0937be4d215`. It differs on every run.

### Asking for too much at once

```js
try {
  crypto.getRandomValues(new Uint8Array(65537));
} catch (err) {
  console.log(/** @type {Error} */ (err).name);
}
```

**Result**: It prints `QuotaExceededError`.

## Differences from the web

- On error, an `Error` is thrown, not a `DOMException`. The `name` is the same, so code that checks `err.name` works as usual; there is no `DOMException` class here.
- Otherwise the same as on the web.

## See also

- [Getting many random bytes at once](../../guides/random.md#many-random-bytes-at-once)
- [`randomUUID()`](randomuuid.md)
