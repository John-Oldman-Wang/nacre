# Converting between text and bytes

This guide covers converting between strings and UTF-8 bytes with [`TextEncoder`](../api/text-encoder.md) and [`TextDecoder`](../api/text-decoder.md), encoding Base64 with [`btoa()`](../api/web-globals/btoa.md) and [`atob()`](../api/web-globals/atob.md), and deep-copying a value with [`structuredClone()`](../api/web-globals/structuredclone.md). For an overview of this group of APIs, see [Text, bytes, and deep copies](../api/web-globals.md).

None of the results in this guide have been run in the simulator yet; each one is marked "not verified in the simulator". The results come from the standards (WHATWG Encoding, HTML) and the expected values written in the acceptance tests.

## Recommended approach

- **When reading network content, use the reading methods built into `fetch()` first.** `response.text()` and `response.arrayBuffer()` already convert between bytes and text; you generally do not need to decode yourself. See [`fetch()`](../api/fetch.md).
- **To encode text as Base64, first convert it to bytes with `TextEncoder`.** `btoa()` only accepts strings in which "each character is one byte"; passing Chinese characters directly throws. See [Encoding text as Base64](#encoding-text-as-base64).
- **When data arrives in several chunks, pass `{ stream: true }` with each chunk.** Without it, characters that were split become `�`. See [Decoding data that arrives in several chunks](#decoding-data-that-arrives-in-several-chunks).
- **Deep-copy with `structuredClone()`, not `JSON.parse(JSON.stringify(value))`.** The latter throws on circular references and loses the types of `Date`, `Map`, and `Set`.

## First example

The following code converts a piece of text to bytes, encodes it as Base64, decodes it back the same way, and finally deep-copies an object. It needs no interface and runs when written directly at the top level of `main.js`.

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

The code in each section below creates its own variables and does not reuse these.

## Counting how many bytes a piece of text takes

```js
const size = new TextEncoder().encode('a你😀').length;
console.log(size);
```

**Result** (not verified in the simulator): Prints `8`. The letter takes 1 byte, the Chinese character 3, and the emoji 4. `'a你😀'.length` is 4, because the emoji takes two code units in the string; see [Code units, characters, and bytes](../api/text-encoder.md#code-units-characters-and-bytes).

## Reading the text in a range of bytes

`decode()` accepts an `ArrayBuffer` and any view. It reads the range the view covers, so you can pass a subview directly without copying it out first.

```js
const packet = new Uint8Array([0x00, 0x05, 0x68, 0x65, 0x6c, 0x6c, 0x6f, 0xff]);
// Bytes 2 through 6 are text
const text = new TextDecoder().decode(packet.subarray(2, 7));
console.log(text);
```

**Result** (not verified in the simulator): Prints `hello`. The first two bytes and the last byte are not read.

## Decoding data that arrives in several chunks

The bytes of one character may be split across two chunks. With `{ stream: true }` on every chunk, the decoder keeps incomplete bytes at the end for the next chunk. Once everything has arrived, call `decode()` once more with no arguments.

```js
const decoder = new TextDecoder();
// The three bytes e4 bd a0 of "你" are split into two chunks
const first = decoder.decode(new Uint8Array([0x41, 0xe4, 0xbd]), { stream: true });
const second = decoder.decode(new Uint8Array([0xa0, 0x42]), { stream: true });
const rest = decoder.decode();
console.log(JSON.stringify([first, second, rest]));
```

**Result** (not verified in the simulator): Prints `["A","你B",""]`. The first chunk decodes only `A`; `你` appears once the second chunk's bytes arrive.

Decoding the two chunks separately without `stream` gives `A�` and `�B`: the incomplete bytes in each chunk are each replaced with one `�`.

## Checking whether bytes are valid UTF-8

```js
/** @param {Uint8Array} input */
function isValidUTF8(input) {
  try {
    new TextDecoder('utf-8', { fatal: true }).decode(input);
    return true;
  } catch {
    return false;
  }
}

console.log(isValidUTF8(new Uint8Array([0xe4, 0xbd, 0xa0])));
console.log(isValidUTF8(new Uint8Array([0xe4, 0xbd])));
```

**Result** (not verified in the simulator): Prints `true`, then `false`. The sequence in the second array is missing its last byte.

## Encoding text as Base64

```js
/** @param {string} input */
function textToBase64(input) {
  const encoded = new TextEncoder().encode(input);
  let binary = '';
  for (const b of encoded) binary += String.fromCharCode(b);
  return btoa(binary);
}

/** @param {string} input */
function base64ToText(input) {
  const binary = atob(input);
  const decoded = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(decoded);
}

const greeting = textToBase64('你好，世界');
console.log(greeting);
console.log(base64ToText(greeting));
```

**Result** (not verified in the simulator): Prints `5L2g5aW977yM5LiW55WM`, then `你好，世界`.

Writing `btoa('你好，世界')` directly throws `InvalidCharacterError`. Here a loop joins the bytes into a string instead of `String.fromCharCode(...bytes)`: the latter passes each byte as a separate argument and is not suitable when there are many bytes (tens of thousands or more).

## Writing repeatedly into the same buffer

`encode()` returns a new array each time. To avoid repeated allocation, use [`encodeInto()`](../api/text-encoder/encodeinto.md), which writes the bytes into an existing array and returns how much it wrote.

```js
const buffer = new Uint8Array(8);
const result = new TextEncoder().encodeInto('你好吗', buffer);
console.log(result.read, result.written);
```

**Result** (not verified in the simulator): Prints `2 6`. The buffer has 8 bytes and each Chinese character takes 3, so the first two characters were written. The third does not fit, so none of its bytes are written, and the last 2 bytes of `buffer` are still 0.

`read` is the length of the string already processed (measured as `text.length` measures it), so the part not yet written is `text.slice(result.read)`.

## The original is unaffected after a deep copy

```js
const original = {
  name: 'draft',
  tags: new Set(['a', 'b']),
  history: new Map([['v1', { at: new Date(0) }]]),
  data: new Uint8Array([1, 2, 3]),
};
const cloned = structuredClone(original);

cloned.tags.add('c');
cloned.data[0] = 9;
console.log(original.tags.size, cloned.tags.size);
console.log(original.data[0], cloned.data[0]);
```

**Result** (not verified in the simulator): Prints `2 3`, then `1 9`. `Set`, `Map`, `Date`, and typed arrays keep their types in the copy, and their contents are independent.

## Copying an object with circular references

`JSON.parse(JSON.stringify(value))` throws on circular references; `structuredClone()` does not.

```js
/** @type {{ name: string, children: { name: string, parent: unknown }[] }} */
const parent = { name: 'parent', children: [] };
const child = { name: 'child', parent };
parent.children.push(child);

const tree = structuredClone(parent);
console.log(tree.children[0].parent === tree, tree !== parent);
```

**Result** (not verified in the simulator): Prints `true true`. The child in the copy points to the copied parent, not the original.

## Checking whether a value can be copied

```js
/** @param {unknown} value */
function tryClone(value) {
  try {
    return structuredClone(value);
  } catch (err) {
    if (err instanceof Error && err.name === 'DataCloneError') return null;
    throw err;
  }
}

console.log(tryClone({ a: 1 }));
console.log(tryClone({ onTap() {} }));
```

**Result** (not verified in the simulator): Prints `{"a":1}`, then `null`. The second object contains a function. For which values cannot be copied, see [Which values cannot be deep-copied](../api/web-globals.md#values-that-cant-be-deep-copied).

## See also

- [`TextEncoder`](../api/text-encoder.md), [`TextDecoder`](../api/text-decoder.md): converting between text and bytes
- [`btoa()`](../api/web-globals/btoa.md), [`atob()`](../api/web-globals/atob.md): Base64
- [`structuredClone()`](../api/web-globals/structuredclone.md): deep copies
- [Text, bytes, and deep copies](../api/web-globals.md): an overview of this group of APIs
