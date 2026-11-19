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

An array whose elements are strings, `ArrayBuffer`s, or typed arrays; optional. They're concatenated in order to form the contents. Strings are encoded as UTF-8. When omitted or `null`, the contents are empty.

**`options.type`**

The content type, a string, such as `'image/png'`. Defaults to an empty string.

### Return value

A new `Blob`.

### Exceptions

**`TypeError`**

- An element of `parts` is a `Blob`: `Blob parts cannot be Blobs yet`.
- The contents can't be built: `cannot construct Blob from these parts`. **Which elements trigger this is not verified in the simulator.**

## Examples

```js
const bytes = new Uint8Array([0, 255, 16, 128]);
const blob = new Blob([bytes], { type: 'application/octet-stream' });
console.log(blob.size, blob.type);
```

**Result**: prints `4 application/octet-stream`.

## Differences from the web

Elements of `parts` can't be `Blob`s. On the web they can.

## See also

- [`Blob`](../blob.md)
