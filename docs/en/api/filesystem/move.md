---
type: reference
native: "-[NSFileManager moveItemAtPath:toPath:error:]"
---

# `FileSystem`: `move()` method

The **`move()`** method moves a file or directory to another location, or renames it.

## Syntax

```
move(from, to)
```

### Parameters

**`from`**

The absolute path of the source file or directory, a non-empty string. See [Paths](../filesystem.md#paths).

**`to`**

The full destination path including the file name, a non-empty string. Not the directory the destination is in.

### Return value

A Promise that fulfills with `undefined`. When it completes, there is no longer a file at the original location.

- The result when a file already exists at the destination is **not verified in the simulator**.
- For failure cases, see [What you get on failure](../filesystem.md#what-you-get-on-failure).

### Exceptions

**`TypeError`**

`from` or `to` is not a string, or is an empty string: `move: path must be a non-empty string`. In this case it throws synchronously and does not return a Promise.

## Examples

```js
async function demo() {
  const fs = application.fileSystem;
  const from = fs.documents + '/copy.txt';
  await fs.writeText(from, 'content');
  await fs.move(from, fs.documents + '/moved.txt');
  console.log(await fs.exists(from), await fs.readText(fs.documents + '/moved.txt'));
}
demo();
```

**Result**: Logs `false content`.

## Corresponding iOS API

`-[NSFileManager moveItemAtPath:toPath:error:]`.

## See also

- [`copy()`](copy.md): keeps the original file
