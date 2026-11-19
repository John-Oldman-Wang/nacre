---
type: reference
web: TextEncoder.encodeInto()
---

# `TextEncoder`: `encodeInto()` method

The **`encodeInto()`** method encodes a string as UTF-8 and writes it into an existing array, starting from the array's beginning. It doesn't allocate a new array.

## Syntax

```
encodeInto(source, destination)
```

### Parameters

**`source`**

A string. Other types are converted to strings first.

**`destination`**

A `Uint8Array`. When it is a subview, only the range the view covers is written.

### Return value

An object `{ read, written }`:

- `read`: how many code units were processed (counted the way `text.length` counts, with an emoji counting as two). The remaining unwritten part is `source.slice(read)`.
- `written`: how many bytes were written.

When the array can't hold everything, writing stops at the last complete character that fits; half a character is never written. Positions not written keep their previous values.

### Exceptions

**`TypeError`**

- `destination` isn't a `Uint8Array` (including `Uint8ClampedArray`, `ArrayBuffer`, `DataView`, and ordinary arrays): `TextEncoder.encodeInto: the destination must be a Uint8Array`
- An argument is missing: `TextEncoder.encodeInto: 2 arguments required, but only 1 present`

## Examples

```js
const buffer = new Uint8Array(8);
const result = new TextEncoder().encodeInto('你好吗', buffer);
console.log(result.read, result.written);
```

**Result**: It prints `2 6`. The buffer has 8 bytes and each Chinese character takes 3 bytes, so the first two characters are written. The third doesn't fit, so not a single byte of it is written, and the last 2 bytes of `buffer` are still 0. **Not verified in the simulator.**

## Differences from the web

Same as on the web.

## See also

- [`encode()`](encode.md): returns a new array each time
- [Code units, characters, and bytes](../text-encoder.md#code-units-characters-and-bytes)
