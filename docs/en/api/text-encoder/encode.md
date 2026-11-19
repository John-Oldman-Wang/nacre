---
type: reference
web: TextEncoder.encode()
---

# `TextEncoder`: `encode()` method

The **`encode()`** method encodes a string into UTF-8 bytes.

## Syntax

```
encode([input])
```

### Parameters

**`input`**

A string, optional. When omitted or `undefined`, it is treated as an empty string. Other types are converted to strings first: `encode(null)` encodes the four letters `'null'`, and `encode(12.5)` encodes `'12.5'`.

### Return value

A new `Uint8Array` whose length is the byte count.

The bytes per character vary: an English letter takes 1 byte, an accented letter 2, a Chinese character 3, and an emoji 4; see [Code units, characters, and bytes](../text-encoder.md#code-units-characters-and-bytes). A lone surrogate (half an emoji) is encoded as the three bytes of `�`, `ef bf bd`, without throwing.

### Exceptions

**`TypeError`**

The argument is a `Symbol`.

## Description

Each call returns a new array. To write into the same buffer repeatedly, use [`encodeInto()`](encodeinto.md).

## Examples

```js
const bytes = new TextEncoder().encode('你好');
console.log(bytes.length, Array.from(bytes));
console.log(new TextEncoder().encode('a你😀').length);
```

**Result**: It prints `6 [228,189,160,229,165,189]`, then `8`. **Not verified in the simulator.**

## Differences from the web

Same as on the web.

## See also

- [`encodeInto()`](encodeinto.md): writing into an existing array
- [`TextDecoder.decode()`](../text-decoder/decode.md): decoding the other way
