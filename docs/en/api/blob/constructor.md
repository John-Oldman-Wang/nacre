---
type: reference
web: Blob()
---

# `Blob()` constructor

The **`Blob()`** constructor concatenates a list of strings and bytes, in order, into a new `Blob`.

## Syntax

```
new Blob()
new Blob(parts)
new Blob(parts, { type })
```

### Parameters

**`parts`**

An array whose elements are strings, `ArrayBuffer`s, or typed arrays; optional. They're concatenated in order to form the contents. Strings are encoded as UTF-8, and every character is written to the contents as is, including a leading `'\uFEFF'` (the byte order mark, or BOM); unpaired surrogates are written as U+FFFD. Other values are first converted to strings with `String()`: the contents of `new Blob([1, true, null])` are `1truenull`. When omitted or `null`, the contents are empty.

**`options.type`**

The content type, a string, such as `'image/png'`. Defaults to an empty string.

### Return value

A new `Blob`.

### Exceptions

**`TypeError`**

- An element of `parts` is a `Blob`: `Blob parts cannot be Blobs yet`.
- An element of `parts` is a `Symbol`, which can't be converted to a string: `Cannot convert a Symbol value to a string`.
- The contents can't be built: `cannot construct Blob from these parts`. **Which elements trigger this is not verified in the simulator.**

## Examples

```js
const bytes = new Uint8Array([0, 255, 16, 128]);
const blob = new Blob([bytes], { type: 'application/octet-stream' });
console.log(blob.size, blob.type);
```

**Result**: prints `4 application/octet-stream`.

For a CSV that will be opened in Excel, put a `'\uFEFF'` at the start. Excel uses it to recognize the contents as UTF-8; without it, Chinese text shows up garbled:

```js
const csv = '日期,金额\n2026-11-28,100\n';
const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv' });
console.log(blob.size);
```

**Result**: prints `32`. The leading `'\uFEFF'` takes 3 bytes, and the CSV itself takes 29.

## Differences from the web

Elements of `parts` can't be `Blob`s. On the web they can.

## See also

- [`Blob`](../blob.md)
