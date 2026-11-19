---
type: reference
web: TextDecoder()
---

# `TextDecoder()` constructor

The **`TextDecoder()`** constructor creates a decoder that turns UTF-8 bytes into a string.

## Syntax

```
new TextDecoder([label[, options]])
```

### Parameters

**`label`**

Optional. The name of the encoding; defaults to `'utf-8'`. Only these spellings of UTF-8 are recognized: `utf-8`, `utf8`, `unicode-1-1-utf-8`, `unicode11utf8`, `unicode20utf8`, `x-unicode20utf8`. Case-insensitive; leading and trailing whitespace is removed.

**`options`**

Optional, an object. `null` and `undefined` are treated as not given.

**`options.fatal`**

A boolean; defaults to `false`. `true`: [`decode()`](decode.md) throws `TypeError` on invalid bytes. `false`: they are replaced with `�` (U+FFFD, the replacement character).

**`options.ignoreBOM`**

A boolean; defaults to `false`. `true`: keep a leading [BOM](../text-decoder.md#bom). `false`: remove it.

The values of both keys are converted to booleans: `{ fatal: 1 }` is `true`, and so is `{ fatal: 'false' }` (a non-empty string).

### Return value

A new `TextDecoder`.

### Exceptions

**`RangeError`**

Another encoding, or an unrecognized name: `TextDecoder: the encoding "gbk" is not supported. This runtime only decodes UTF-8; expected one of: utf-8, utf8, unicode-1-1-utf-8, unicode11utf8, unicode20utf8, x-unicode20utf8`

**`TypeError`**

`options` is not an object (a number, for example): `TextDecoder: the options must be an object`

## Examples

```js
const strict = new TextDecoder('UTF8', { fatal: true });
console.log(strict.encoding, strict.fatal, strict.ignoreBOM);
```

**Result**: logs `utf-8 true false`. **Not verified in the simulator.**

## Differences from the web

Browsers support dozens of encodings, including UTF-8, UTF-16, GBK, and Shift_JIS. Here only UTF-8 is supported; others throw `RangeError` at creation.

## See also

- [`decode()`](decode.md)
