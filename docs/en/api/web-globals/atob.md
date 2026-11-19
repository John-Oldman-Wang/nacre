---
type: reference
web: atob()
---

# `atob()` global function

The **`atob()`** global function decodes Base64 text into bytes. It returns a string in which "each character is one byte".

## Syntax

```
atob(data)
```

### Parameters

**`data`**

A Base64 string. Values that aren't strings are converted to strings first.

- Spaces, tabs, line feeds, form feeds, and carriage returns in it are removed first and can appear anywhere.
- The trailing `=` can be omitted: `atob('YQ')` and `atob('YQ==')` give the same result.

### Return value

A [string in which "each character is one byte"](../web-globals.md#strings-in-which-each-character-is-one-byte). When the original was text, decode it once more with [`TextDecoder`](../text-decoder.md).

### Exceptions

**`Error`**, with `name` set to `InvalidCharacterError`

Thrown in the following cases, all with the message `atob: the string is not correctly encoded Base64`:

- There are characters outside the Base64 alphabet. `-` and `_` (the Base64 variant used in URLs) aren't accepted either.
- After removing whitespace, the length divided by 4 leaves a remainder of 1, for example `'Y'`.
- The position or number of `=` is wrong, for example `'YQ='`, `'YQ==='`, `'Y=Q='`.

**`TypeError`**

No argument: `atob: 1 argument required, but only 0 present`

## Examples

```js
const binary = atob('SGn/');
const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
console.log(binary.length, Array.from(bytes));
console.log(atob('aGVs bG8'));
```

**Result**: Prints `3 [72,105,255]`, then `hello`: the space is removed, and the trailing `=` can be omitted. **Not verified in the simulator.**

## Differences from the web

Browsers throw a `DOMException`; here it is an `Error` with the same `name` (`InvalidCharacterError`). Code that checks `err.name` works as usual; code that checks `instanceof DOMException` doesn't, because there is no `DOMException` class here.

## See also

- [`btoa()`](btoa.md): encode in the other direction
- [Encoding text as Base64](../../guides/text-and-bytes.md#encoding-text-as-base64): converting to and from text
