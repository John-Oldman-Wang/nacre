---
type: reference
web: TextDecoder.decode()
---

# `TextDecoder`: `decode()` method

The **`decode()`** method decodes UTF-8 bytes into a string.

## Syntax

```
decode([input[, options]])
```

### Parameters

**`input`**

An `ArrayBuffer`, a `SharedArrayBuffer`, or any view (`Uint8Array`, `DataView`, other typed arrays, subviews). Optional; when omitted it is treated as 0 bytes. A view is read only over the range it covers, byte by byte, regardless of the size of the view's elements. `input` is not modified.

**`options.stream`**

A boolean; defaults to `false`.

- `true`: more data follows. Incomplete bytes at the end are held for the next call.
- `false`: this is the last piece. Incomplete bytes at the end become one `�` (or throw when [`fatal`](fatal.md)), and the decoder returns to its initial state.

### Return value

A string.

- Invalid bytes are replaced with `�`. A run of invalid bytes becomes some number of `�`, by the same rules as browsers: for example `e4 bd` (a CJK character missing a byte) becomes 1, `c0 af` becomes 2, and `ed a0 80` becomes 3.
- One leading BOM is removed by default; see [`ignoreBOM`](ignorebom.md).

### Exceptions

**`TypeError`**

- `input` is some other type (a string, number, plain array, or `null`): `TextDecoder.decode: the input must be an ArrayBuffer, a SharedArrayBuffer or a view on one (Uint8Array, DataView, ...)`
- [`fatal`](fatal.md) is `true` and the bytes are invalid: `TextDecoder.decode: the input is not valid UTF-8`. After throwing, the decoder returns to its initial state and can still be used.
- `options` is not an object: `TextDecoder.decode: the options must be an object`

## Description

A `TextDecoder` can be reused. Calls without `stream` do not affect each other.

## Examples

```js
const packet = new Uint8Array([0x00, 0x05, 0x68, 0x65, 0x6c, 0x6c, 0x6f, 0xff]);
console.log(new TextDecoder().decode(packet.subarray(2, 7)));

const decoder = new TextDecoder();
const first = decoder.decode(new Uint8Array([0x41, 0xe4, 0xbd]), { stream: true });
const second = decoder.decode(new Uint8Array([0xa0, 0x42]), { stream: true });
const rest = decoder.decode();
console.log(JSON.stringify([first, second, rest]));
```

**Result** **Not verified in the simulator.**

- Logs `hello`: only bytes 2 through 6, covered by the subview, are read.
- Logs `["A","你B",""]`: the three bytes of `你` are split across two pieces, and the character is decoded once the second piece arrives. Decoding the two pieces separately without `stream` gives `A�` and `�B`.

## Differences from the web

Same as the web.

## See also

- [Decoding data that arrives in pieces](../../guides/text-and-bytes.md#decoding-data-that-arrives-in-several-chunks)
- [`TextEncoder.encode()`](../text-encoder/encode.md): encoding in the other direction
