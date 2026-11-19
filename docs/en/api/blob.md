---
type: reference
web: Blob
---

# `Blob`

**`Blob`** represents an immutable chunk of binary data. Its contents aren't held in JS memory; the JS side has only [`size`](blob/size.md) and [`type`](blob/type.md). Call its methods when you need to read the contents.

A `Blob` comes from one of two places: [`res.blob()`](response/blob.md) gives downloaded content, and [`new Blob(parts)`](blob/constructor.md) creates one from strings or bytes you have.

A `Blob` can be passed to these APIs: [`fetch()`](fetch.md) to send as a request body, [`UIImage.imageWithData()`](ui-image.md) to create an image, `writeBytes()` of [`application.fileSystem`](filesystem.md) to write to a file, and `setBytes()` of [`application.keychain`](keychain.md) to store in the keychain (requires installing `@nacrejs/keychain` first).

**Inheritance**: `Blob` doesn't inherit from any other class.

## Constructor

[`Blob()`](blob/constructor.md)

Concatenates strings and bytes into a `Blob`.

## Instance properties

| Property | Description |
| --- | --- |
| [`size`](blob/size.md) <small>read-only</small> | The number of bytes |
| [`type`](blob/type.md) <small>read-only</small> | The content type, such as `'image/png'` |

## Instance methods

Both methods can be called any number of times; there's no "read only once" restriction.

| Method | Description |
| --- | --- |
| [`arrayBuffer()`](blob/arraybuffer.md) | Gets a copy of the contents as an `ArrayBuffer` |
| [`text()`](blob/text.md) | Decodes the contents as UTF-8 into a string |

## Examples

```js
async function main() {
  const blob = new Blob(['前缀-', '后缀'], { type: 'text/plain' });
  console.log(blob.size, blob.type);
  console.log(await blob.text());
}
main();
```

**Result**: prints `13 text/plain` and `前缀-后缀`. `size` is the number of bytes after UTF-8 encoding; each Chinese character takes 3 bytes.

## Differences from the web

- Elements of `parts` can't be `Blob`s; `new Blob([blob])` throws `TypeError`.
- There's no `slice()`, `stream()`, or `bytes()`. There's no `File`.

## See also

- [`blob()` of `Response`](response/blob.md): reading downloaded content as a `Blob`
- [`UIImage`](ui-image.md): turning a `Blob` into an image
- [File system](filesystem.md): writing a `Blob` to a file
