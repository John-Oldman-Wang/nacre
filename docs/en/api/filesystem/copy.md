---
type: reference
native: "-[NSFileManager copyItemAtPath:toPath:error:]"
---

# `FileSystem`: `copy()` method

The **`copy()`** method copies a file or directory to another location.

## Syntax

```
copy(from, to)
```

### Parameters

**`from`**

The absolute path of the source file or directory, a non-empty string. See [Paths](../filesystem.md#paths).

**`to`**

The full destination path including the file name, a non-empty string. Not the directory the destination is in.

### Return value

A Promise that fulfills with `undefined`. When it completes, the file at the original location is still there.

- The result when a file already exists at the destination is **not verified in the simulator**.
- For failure cases, see [What you get on failure](../filesystem.md#what-you-get-on-failure).

### Exceptions

**`TypeError`**

`from` or `to` is not a string, or is an empty string: `copy: path must be a non-empty string`. In this case it throws synchronously and does not return a Promise.

## Examples

```js
async function demo() {
  const fs = application.fileSystem;
  const src = fs.documents + '/src.txt';
  await fs.writeText(src, 'content');
  await fs.copy(src, fs.documents + '/copy.txt');
  console.log(await fs.exists(src), await fs.readText(fs.documents + '/copy.txt'));
}
demo();
```

**Result**: Logs `true content`.

## Corresponding iOS API

`-[NSFileManager copyItemAtPath:toPath:error:]`.

## See also

- [`move()`](move.md): does not keep the original file
