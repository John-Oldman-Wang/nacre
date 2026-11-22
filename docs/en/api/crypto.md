---
type: reference
status: partial
---

# `Crypto`

**`Crypto`** represents the system's source of random numbers. Its only instance is the global object `crypto`. It generates random numbers no one can predict, for tokens, keys, and IDs that can't be guessed.

`crypto` exists as soon as the app starts and can be used at any time, including at the top level of a script.

For how to generate tokens, random integers, and large amounts of random bytes, and how to choose between it and `Math.random()`, see the guide [Generating random numbers and unique IDs](../guides/random.md).

**Inheritance**: `Crypto`

## Constructor

It can't be created with `new`: `new Crypto()` throws `TypeError: Illegal constructor`. The `Crypto` class exists so that `crypto instanceof Crypto` holds. The only instance is the global `crypto`.

## Instance methods

| Method | Description |
| --- | --- |
| [`getRandomValues()`](crypto/getrandomvalues.md) | Fills an integer typed array with random values, up to 65536 bytes |
| [`randomUUID()`](crypto/randomuuid.md) | Returns a random version 4 UUID |

## Whether the random numbers are secure

`crypto`'s random numbers come from the random source iOS provides for cryptographic use, and can be used to generate keys and sign-in tokens.

- **No initialization and no seed.** It can't be made to reproduce the same sequence.
- **When the system's random source fails, it throws rather than switching to another source.** The thrown error's `name` is `OperationError` and its `message` is `the system random source failed`. So if you get a result, it came from the system's random source. This error never occurred during acceptance testing.
- **It is fast.** Filling 32 bytes takes about 0.67 microseconds (measured, average of 1000 runs).

## What is thrown on error

`QuotaExceededError`, `TypeMismatchError`, and `OperationError` are thrown as [`DOMException`](dom-exception.md) objects; use `err.name` to tell which. When the argument isn't a typed array, a `TypeError` is thrown.

## Examples

The code below generates a 16-byte random token written as 32 hexadecimal characters. It needs no interface and runs directly at the top level of `main.js`.

```js
// 1. Prepare a 16-byte array and let crypto fill it
const bytes = new Uint8Array(16);
crypto.getRandomValues(bytes);

// 2. Convert each byte to two hex digits and join them
let token = '';
for (const b of bytes) {
  token += b.toString(16).padStart(2, '0');
}
console.log(token);
```

**Result**: The console prints 32 hexadecimal characters, like `9f3a61c05e7d2b48a1c6f0937be4d215`. It differs on every run.

## Differences from the web

The names, parameters, and 65536-byte limit of `crypto.getRandomValues()` and `crypto.randomUUID()` are the same as in browsers. The differences are listed below.

| Case | Browsers | Here |
| --- | --- | --- |
| `crypto.subtle` | Available | Not available |

## See also

- [Generating random numbers and unique IDs](../guides/random.md): tokens, UUIDs, random integers, large amounts of random bytes
- [Keychain](keychain.md): where to store generated tokens and keys. Install `@nacrejs/keychain` first
- [How the runtime works](how-it-works.md): which global objects exist
