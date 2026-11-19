---
type: reference
native: "-[NSData writeToFile:options:error:]"
---

# `FileSystem`: `writeBytes()` method

The **`writeBytes()`** method writes the bytes in a `Blob` to a file, replacing the whole file.

## Syntax

```
writeBytes(path, blob)
```

### Parameters

**`path`**

The absolute path of the file, a non-empty string. See [Paths](../filesystem.md#paths).

**`blob`**

The content to write, a [`Blob`](../fetch.md). If you have a `Uint8Array` or `ArrayBuffer`, wrap it with `new Blob([...])` first. Content fetched with [`fetch`](../fetch.md) can be read as a `Blob` with `response.blob()` and passed in directly.

### Return value

A Promise that fulfills with `undefined`. When the Promise completes, the file has been written.

Creating the file when it doesn't exist, overwriting it when it does, not creating directories automatically, and what happens when the write is interrupted halfway are the same as for [`writeText()`](writetext.md#return-value).

Measured in the simulator: writing a 4 MB file takes 8.0 ms from the call until the Promise completes, and this time does not occupy the thread the UI runs on; the `new Blob([data])` step takes 1.2 ms, because it copies the data, and the time is proportional to the data size. See [File size](../filesystem.md#file-size).

### Exceptions

**`TypeError`**

In these cases it throws synchronously and does not return a Promise.

- `path` is not a string, or is an empty string: `writeBytes: path must be a non-empty string`.
- `blob` is not a `Blob`: `writeBytes: the second argument must be a Blob`.

## Examples

```js
async function demo() {
  const fs = application.fileSystem;
  const path = fs.temporary + '/bytes.bin';
  await fs.writeBytes(path, new Blob([new Uint8Array([1, 2, 3])]));
  const info = await fs.stat(path);
  console.log(info.size);
}
demo();
```

**Result**: Logs `3`.

## Corresponding iOS API

`-[NSData writeToFile:options:error:]` with `NSDataWritingAtomic`. `NSData` becomes `Blob`.

## See also

- [`readBytes()`](readbytes.md)
- [Saving downloaded images to the caches directory](../../guides/files.md#saving-downloaded-images-to-the-cache-directory)
