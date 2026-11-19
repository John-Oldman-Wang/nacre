---
type: reference
status: partial
---

# Text, bytes, and deep copies

**Text, bytes, and deep copies**: this group of global APIs converts between strings and bytes, and deep-copies values. They are the web-standard APIs of the same names, present as soon as the app launches, with nothing to import.

| Global | What it does |
| --- | --- |
| [`TextEncoder`](text-encoder.md) | A class. Encodes strings into UTF-8 bytes |
| [`TextDecoder`](text-decoder.md) | A class. Decodes UTF-8 bytes into strings |
| [`btoa()`](web-globals/btoa.md) | A function. Encodes bytes as Base64 text |
| [`atob()`](web-globals/atob.md) | A function. Decodes Base64 text into bytes |
| [`structuredClone()`](web-globals/structuredclone.md) | A function. Deep-copies a value |

The two classes each have their own pages. This page is for the three functions.

For converting among text, bytes, and Base64, and for deep copies, see the guide [Converting between text and bytes](../guides/text-and-bytes.md).

> **Note:** Results in this group marked "not verified in the simulator" come from the standards (WHATWG Encoding, HTML) and the expected values written in the acceptance tests.

## Functions

[`btoa()`](web-globals/btoa.md)

Encodes a string in which "each character is one byte" as Base64.

[`atob()`](web-globals/atob.md)

Decodes Base64 into a string in which "each character is one byte".

[`structuredClone()`](web-globals/structuredclone.md)

Deep-copies a value: objects, arrays, `Map`, `Set`, `Date`, binary data, all copied level by level.

## Strings and bytes are two different things

The content of network requests, files, and the input to cryptographic functions are bytes (`Uint8Array`). A JS string isn't bytes; it is a sequence of 16-bit code units. The two must be converted:

- String to bytes: [`new TextEncoder().encode(text)`](text-encoder/encode.md).
- Bytes to string: [`new TextDecoder().decode(bytes)`](text-decoder/decode.md).

The conversion uses UTF-8. The number of bytes a character takes isn't fixed, so the byte count generally doesn't equal `text.length`; see [Code units, characters, and bytes](text-encoder.md#code-units-characters-and-bytes). **Only UTF-8 is supported.**

## The two Base64 functions work on bytes, not text

`btoa()` takes a string, but it treats each character as one byte (0–255). When the string contains Chinese characters or emoji, `btoa()` throws, with `name` set to `InvalidCharacterError`.

To encode arbitrary text as Base64, first convert it to bytes with `TextEncoder`; see [Encoding text as Base64](../guides/text-and-bytes.md#encoding-text-as-base64).

`atob()` goes the other way: each character in the string it returns is one byte. When the original was text, decode it once more with `TextDecoder`.

## Strings in which "each character is one byte"

The argument of `btoa()` and the return value of `atob()` are both this kind of string: each character's code is between 0 and 255 and represents one byte. It isn't text for people to read; it is just another container for bytes.

Converting between it and `Uint8Array`:

```js
const bytes = new Uint8Array([72, 105, 255]);
const binary = String.fromCharCode(...bytes);
const again = Uint8Array.from(binary, (c) => c.charCodeAt(0));
console.log(binary.length, again[2]);
```

**Result**: Prints `3 255`. **Not verified in the simulator.**

> **Note:** `String.fromCharCode(...bytes)` passes each byte as a separate argument. When there are many bytes (tens of thousands or more), build the string with a loop instead; see the approach in [Encoding text as Base64](../guides/text-and-bytes.md#encoding-text-as-base64).

## Values that can't be deep-copied

`structuredClone()` copies data. The following aren't data; passing them throws, with `name` set to `DataCloneError`:

- Functions and `Symbol`s.
- Native objects: `UIView`, `UIColor`, `UIImage`, `Blob`, and instances of every other native class.
- Structs: `CGRect`, `CGPoint`, and so on.
- Events and event targets: `Event`, `EventTarget`, `application`.
- Instances of the runtime's own classes such as `URL`, `Headers`, `Request`, and `Response`.
- `WeakMap`, `WeakSet`, `WeakRef`, `Promise`.

If the object being copied contains any one of these anywhere, the whole call throws; it never returns a half-copied result.

Instances of your own classes can be copied, but you get plain objects: the fields are there, but the methods and prototype are gone.

## Examples

The code below converts a piece of text to bytes, encodes it as Base64, decodes it back the same way, and finally deep-copies an object. It needs no interface and runs when written directly at the top level of `main.js`.

```js
// 1. Text → UTF-8 bytes
const encoder = new TextEncoder();
const bytes = encoder.encode('你好');
console.log(bytes.length, Array.from(bytes));

// 2. Bytes → Base64 text. btoa wants a string with "one byte per character"
const base64 = btoa(String.fromCharCode(...bytes));
console.log(base64);

// 3. Base64 text → bytes → text
const back = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
console.log(new TextDecoder().decode(back));

// 4. Deep copy: changing the copy leaves the original unchanged
const settings = { theme: 'dark', recent: [1, 2, 3], savedAt: new Date() };
const copy = structuredClone(settings);
copy.recent.push(4);
console.log(settings.recent.length, copy.recent.length, copy.savedAt instanceof Date);
```

**Result** (not verified in the simulator): The console prints, in order:

- `6 [228,189,160,229,165,189]`: each of the two Chinese characters takes 3 bytes.
- `5L2g5aW9`
- `你好`
- `3 4 true`: the array in the copy is a different array, and the `Date` is still a `Date`.

## Differences from the web

The names, parameters, and return values of the three functions are the same as in the browser. The differences:

| Situation | Browser | Here |
| --- | --- | --- |
| The object thrown on error by `btoa`, `atob`, and `structuredClone` | `DOMException` | `Error`, with the same `name` (`InvalidCharacterError`, `DataCloneError`). Code that checks `err.name` works as usual; code that checks `instanceof DOMException` doesn't, because there is no `DOMException` class here |
| `structuredClone(value, { transfer: [buffer] })` | Transfers `buffer` to the copy; the original can't be used anymore | Throws `DataCloneError`. Without `transfer`, `buffer` is copied |
| `structuredClone(new SharedArrayBuffer(8))` | The copy and the original share the same memory | Throws `DataCloneError` |
| `structuredClone(new Blob(['x']))` | Works | Throws `DataCloneError` |

For the differences in the two classes, see [`TextEncoder`](text-encoder.md#differences-from-the-web) and [`TextDecoder`](text-decoder.md#differences-from-the-web).

## See also

- [Converting between text and bytes](../guides/text-and-bytes.md): counting bytes, decoding in chunks, Base64, deep copies
- [`TextEncoder`](text-encoder.md), [`TextDecoder`](text-decoder.md): the two classes for converting between text and bytes
- [`fetch()`](fetch.md): `response.text()` and `response.arrayBuffer()` already convert between bytes and text, so you generally don't need to decode network content yourself
- [File reading and writing](filesystem.md): reading and writing files as text and bytes
- [`crypto`](crypto.md): generate random bytes; combined with `btoa()`, you get a random text token
- [How the runtime works](how-it-works.md): what global objects there are
