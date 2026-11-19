---
type: reference
---

# `TextEncoder`

**`TextEncoder`** represents an encoder that encodes strings into UTF-8 bytes. The bytes are a `Uint8Array`, which can be a network request body, written to a file, or passed to a crypto function.

It is the class of the same name from the web standards and exists as soon as the app starts. An encoder has no state, so one can be reused. For the opposite conversion, use [`TextDecoder`](text-decoder.md). For an overview of this group of APIs, see [Text, bytes, and deep copies](web-globals.md).

**Inheritance**: `TextEncoder` doesn't inherit from any class.

For how to convert between text and bytes, see the guide [Converting between text and bytes](../guides/text-and-bytes.md).

## Constructor

[`TextEncoder()`](text-encoder/constructor.md)

Creates an encoder. Takes no arguments.

## Instance properties

| Property | Description |
| --- | --- |
| [`encoding`](text-encoder/encoding.md) <small>read-only</small> | Always `'utf-8'` |

## Instance methods

| Method | Description |
| --- | --- |
| [`encode()`](text-encoder/encode.md) | Encodes a string into a new `Uint8Array` |
| [`encodeInto()`](text-encoder/encodeinto.md) | Encodes a string into an existing `Uint8Array` and returns how much was read and written |

## Code units, characters, and bytes

The `length` of a JS string counts code units, each 16 bits. Common characters (letters, Chinese characters) take one code unit. Emoji and some rare characters take two code units; together the two are called a surrogate pair.

The UTF-8 byte count is a different number:

| Character | Code units (`length`) | UTF-8 bytes |
| --- | --- | --- |
| `a` | 1 | 1 |
| `é` | 1 | 2 |
| `你` | 1 | 3 |
| `😀` | 2 | 4 |

The `read` returned by [`encodeInto()`](text-encoder/encodeinto.md) counts code units; `written` counts bytes.

When only half of a surrogate pair remains (for example, when an emoji is cut in the middle), that half isn't a valid character. `encode()` encodes it as the three bytes of `�`, `ef bf bd`, without throwing.

## Examples

```js
const encoder = new TextEncoder();
const bytes = encoder.encode('你好');
console.log(bytes.length, Array.from(bytes));
```

**Result**: It prints `6 [228,189,160,229,165,189]`: the two Chinese characters take 3 bytes each. **Not verified in the simulator.**

## Differences from the web

Same as on the web. Browsers also have `TextEncoderStream`, which isn't available here.

## See also

- [`TextDecoder`](text-decoder.md): decoding bytes into strings
- [Converting between text and bytes](../guides/text-and-bytes.md): counting bytes, writing to the same buffer repeatedly, encoding to Base64
- [Text, bytes, and deep copies](web-globals.md): an overview of this group of APIs
