# Generating random numbers and unique IDs

This guide covers how to use [`crypto`](../api/crypto.md) to generate tokens, unique IDs, and random integers in a range, and when `Math.random()` is good enough. The details are on the [`Crypto`](../api/crypto.md) reference page.

## Recommended approach

| What you want to do | What to use | Why |
| --- | --- | --- |
| Values that must not be guessable, such as tokens, keys, verification codes, and order numbers | [`crypto.getRandomValues()`](../api/crypto/getrandomvalues.md) | The output of `Math.random()` can be predicted from its previous output |
| Generating unique identifiers for data, requests, or devices | [`crypto.randomUUID()`](../api/crypto/randomuuid.md) | One call gives a 36-character identifier; no need to assemble it yourself |
| Randomness unrelated to security, such as random offsets in animations or picking a random color | `Math.random()` | Gives a fraction between 0 and 1 directly; shorter to write |

## First example

The following code generates a 16-byte random token written as 32 hexadecimal characters. It needs no UI and runs directly at the top level of `main.js`.

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

**Result**: the console prints 32 hexadecimal characters, such as `9f3a61c05e7d2b48a1c6f0937be4d215`. It's different on every run.

`getRandomValues()` doesn't return a new array; it writes into the array you give it. You get as many random numbers as the array is long.

## Generating a unique ID

```js
const id = crypto.randomUUID();
console.log(id);
```

**Result**: prints a UUID such as `3f2b8c1e-9d47-4a6b-8e15-0c7f2a9d6b31`: 36 characters, with lowercase letters. It's different on every call.

## Generating a random integer in a range

```js
/**
 * @param {number} max exclusive
 * @returns {number} an integer from 0 to max - 1
 */
function randomInt(max) {
  const limit = Math.floor(0x100000000 / max) * max;
  const box = new Uint32Array(1);
  do {
    crypto.getRandomValues(box);
  } while (box[0] >= limit);
  return box[0] % max;
}

console.log(randomInt(6) + 1);
```

**Result**: prints an integer from 1 to 6. **This example is not verified in the simulator.**

Writing `box[0] % max` directly makes smaller numbers come up slightly more often. The loop above discards and redraws the readings that would cause that bias.

## Many random bytes at once

One call fills at most 65536 bytes; more throws `QuotaExceededError`. The limit is in bytes: each `Uint32Array` element is 4 bytes, so at most 16384 elements. For more, do it in several calls:

```js
const big = new Uint8Array(200000);
for (let offset = 0; offset < big.length; offset += 65536) {
  crypto.getRandomValues(big.subarray(offset, offset + 65536));
}
```

**Result**: all 200000 bytes of `big` are random. **This example is not verified in the simulator.**

`subarray()` gives a view onto a section of the original array without copying the data. `getRandomValues()` fills only the section the view covers and doesn't touch the rest (verified by testing).

## See also

- [`Crypto`](../api/crypto.md): the two methods and what they throw on error
- [Keychain](../api/keychain.md): where to store generated tokens and keys
