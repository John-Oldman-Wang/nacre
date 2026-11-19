---
type: reference
native: "+[NSString stringWithContentsOfFile:encoding:error:]"
---

# `FileSystem`: `readText()` method

The **`readText()`** method reads the whole file as UTF-8 text.

## Syntax

```
readText(path)
```

### Parameters

**`path`**

The absolute path of the file, a non-empty string. See [Paths](../filesystem.md#paths).

### Return value

A Promise that fulfills with the file's entire text (a string).

- The whole file is read into memory at once; there is no chunked reading.
- The result when the file content is not valid UTF-8 is **not verified in the simulator**.
- When the file does not exist, the Promise is rejected with `name` set to `'NotFoundError'`. For other failure cases, see [What you get on failure](../filesystem.md#what-you-get-on-failure).

### Exceptions

**`TypeError`**

`path` is not a string, or is an empty string: `readText: path must be a non-empty string`. In this case it throws synchronously and does not return a Promise.

## Examples

```js
async function demo() {
  const fs = application.fileSystem;
  await fs.writeText(fs.temporary + '/hello.txt', 'Hello, Nacre');
  console.log(await fs.readText(fs.temporary + '/hello.txt'));
}
demo();
```

**Result**: Logs `Hello, Nacre`.

## Corresponding iOS API

`+[NSString stringWithContentsOfFile:encoding:error:]` with the encoding fixed to UTF-8. `NSError` becomes a rejected Promise.

## See also

- [`readBytes()`](readbytes.md): reading binary content
- [`writeText()`](writetext.md)
