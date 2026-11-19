---
type: reference
---

# `TextDecoder`

**`TextDecoder`** represents a decoder that turns UTF-8 bytes into a string. It accepts an `ArrayBuffer`, any typed array, or a `DataView`.

It is the class of the same name from the web standards and exists as soon as the app starts. **Only UTF-8 is supported**; other encodings throw `RangeError` at creation. For the opposite conversion, use [`TextEncoder`](text-encoder.md). For an overview of this group of APIs, see [Text, bytes, and deep copies](web-globals.md).

**Inheritance**: `TextDecoder` does not inherit from any class.

For how to convert between text and bytes, see the guide [Converting between text and bytes](../guides/text-and-bytes.md).

## Constructor

[`TextDecoder()`](text-decoder/constructor.md)

Creates a decoder. You can specify whether invalid bytes throw and whether the BOM is kept.

## Instance properties

These three values never change after creation.

| Property | Description |
| --- | --- |
| [`encoding`](text-decoder/encoding.md) <small>read-only</small> | Always `'utf-8'` |
| [`fatal`](text-decoder/fatal.md) <small>read-only</small> | Whether invalid bytes throw |
| [`ignoreBOM`](text-decoder/ignorebom.md) <small>read-only</small> | Whether a leading BOM is kept |

## Instance methods

| Method | Description |
| --- | --- |
| [`decode()`](text-decoder/decode.md) | Decodes bytes into a string. When data arrives in pieces, it can decode piece by piece |

## When the bytes are not valid UTF-8

Decoding does not fail and does not drop what follows. The invalid bytes are replaced with `�` (U+FFFD, the replacement character), and the rest decodes normally.

To get an exception on invalid bytes, create the decoder with `new TextDecoder('utf-8', { fatal: true })`. [`decode()`](text-decoder/decode.md) then throws `TypeError`. Use this to validate whether data is valid UTF-8.

## BOM

The BOM is an invisible character (U+FEFF) at the start of a file; in UTF-8 it is the three bytes `ef bb bf`. Some software (Notepad on Windows, CSV exported from Excel) adds it to the start of files.

By default `decode()` removes this one leading BOM, so the decoded string can be used directly. To keep it, create the decoder with `{ ignoreBOM: true }`. A BOM that is not at the start is never removed.

## Examples

```js
const bytes = new Uint8Array([0xe4, 0xbd, 0xa0, 0xe5, 0xa5, 0xbd]);
console.log(new TextDecoder().decode(bytes));
```

**Result**: logs `你好`. **Not verified in the simulator.**

## Differences from the web

| Case | Browser | Here |
| --- | --- | --- |
| Supported encodings | Dozens, including UTF-8, UTF-16, GBK, and Shift_JIS | UTF-8 only. Others throw `RangeError` at creation |
| `TextDecoderStream` | Available | Not available |

## See also

- [`TextEncoder`](text-encoder.md): encoding strings into bytes
- [Converting between text and bytes](../guides/text-and-bytes.md): decoding in pieces, validating UTF-8, decoding text back from Base64
- [`fetch()`](fetch.md): `response.text()` already decodes, so reading network content usually needs no decoding of your own
