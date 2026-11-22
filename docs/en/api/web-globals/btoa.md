---
type: reference
web: btoa()
---

# `btoa()` global function

The **`btoa()`** global function encodes bytes as Base64 text. Its argument is a string in which "each character is one byte", not arbitrary text.

## Syntax

```
btoa(data)
```

### Parameters

**`data`**

A [string in which "each character is one byte"](../web-globals.md#strings-in-which-each-character-is-one-byte): each character's code is between 0 and 255. Values that aren't strings are converted to strings first: `btoa(null)` encodes the four letters `'null'`.

### Return value

A Base64 string. It contains only `A–Z`, `a–z`, `0–9`, `+`, and `/`, padded at the end with `=` to a length that is a multiple of 4.

### Exceptions

**[`DOMException`](../dom-exception.md)**, with `name` set to `InvalidCharacterError` and `code` set to 5

The string contains characters with codes above 255 (Chinese characters, emoji): `btoa: the string contains characters outside of the Latin1 range (code points above 0xFF). To encode arbitrary text, convert it to UTF-8 bytes with TextEncoder first`

**`TypeError`**

No argument: `btoa: 1 argument required, but only 0 present`

## Description

To encode arbitrary text as Base64, first convert it to bytes with [`TextEncoder`](../text-encoder.md); see [Encoding text as Base64](../../guides/text-and-bytes.md#encoding-text-as-base64). Writing `btoa('你好，世界')` directly throws `InvalidCharacterError`.

## Examples

```js
const bytes = new Uint8Array([72, 105, 255]);
const binary = String.fromCharCode(...bytes);
console.log(btoa(binary));
console.log(btoa('hello'));
```

**Result**: Prints `SGn/`, then `aGVsbG8=`. **Not verified in the simulator.**

## Differences from the web

Same as on the web.

## See also

- [`atob()`](atob.md): decode in the other direction
- [The two Base64 functions work on bytes, not text](../web-globals.md#the-two-base64-functions-work-on-bytes-not-text)
