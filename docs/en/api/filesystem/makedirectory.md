---
type: reference
native: "-[NSFileManager createDirectoryAtPath:withIntermediateDirectories:attributes:error:]"
---

# `FileSystem`: `makeDirectory()` method

The **`makeDirectory()`** method creates a directory, along with any intermediate directories.

## Syntax

```
makeDirectory(path)
```

### Parameters

**`path`**

The absolute path of the directory to create, a non-empty string. See [Paths](../filesystem.md#paths).

### Return value

A Promise that fulfills with `undefined`.

- Intermediate directories that don't exist are created too.
- No error if the directory already exists. So calling it before every file write is safe.
- For failure cases, see [What you get on failure](../filesystem.md#what-you-get-on-failure).

### Exceptions

**`TypeError`**

`path` is not a string, or is an empty string: `makeDirectory: path must be a non-empty string`. In this case it throws synchronously and does not return a Promise.

## Examples

```js
async function demo() {
  const fs = application.fileSystem;
  const dir = fs.documents + '/a/b/c';
  await fs.makeDirectory(dir);
  await fs.makeDirectory(dir);
  console.log((await fs.stat(dir)).isDirectory);
}
demo();
```

**Result**: Logs `true`. On the second call the directory already exists, and there is no error.

## Corresponding iOS API

`-[NSFileManager createDirectoryAtPath:withIntermediateDirectories:attributes:error:]` with `withIntermediateDirectories` set to `YES`.

## See also

- [`writeText()`](writetext.md): writing a file does not create directories automatically
- [`remove()`](remove.md): deleting a directory
