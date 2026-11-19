---
type: reference
native: "+[NSData dataWithContentsOfFile:options:error:]"
---

# `FileSystem`: `readBytes()` method

The **`readBytes()`** method reads the whole file's bytes.

## Syntax

```
readBytes(path)
```

### Parameters

**`path`**

The absolute path of the file, a non-empty string. See [Paths](../filesystem.md#paths).

### Return value

A Promise that fulfills with an `ArrayBuffer`.

- The whole file is read into memory at once; there is no chunked reading.
- When the file does not exist, the Promise is rejected with `name` set to `'NotFoundError'`. For other failure cases, see [What you get on failure](../filesystem.md#what-you-get-on-failure).

### Exceptions

**`TypeError`**

`path` is not a string, or is an empty string: `readBytes: path must be a non-empty string`. In this case it throws synchronously and does not return a Promise.

## Examples

```js
async function demo() {
  const fs = application.fileSystem;
  const binPath = fs.temporary + '/bytes.bin';
  await fs.writeBytes(binPath, new Blob([new Uint8Array([0, 1, 2, 253, 254, 255])]));

  const bytes = new Uint8Array(await fs.readBytes(binPath));
  console.log(bytes.length, bytes.join(','));
}
demo();
```

**Result**: Logs `6 0,1,2,253,254,255`.

## Corresponding iOS API

`+[NSData dataWithContentsOfFile:options:error:]`. `NSData` becomes `ArrayBuffer`, and `NSError` becomes a rejected Promise.

## See also

- [`writeBytes()`](writebytes.md)
- [`readText()`](readtext.md): reading text
