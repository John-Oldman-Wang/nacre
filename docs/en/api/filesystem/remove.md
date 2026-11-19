---
type: reference
native: "-[NSFileManager removeItemAtPath:error:]"
---

# `FileSystem`: `remove()` method

The **`remove()`** method deletes a file, or deletes a directory with all of its contents.

## Syntax

```
remove(path)
```

### Parameters

**`path`**

The absolute path of the file or directory to delete, a non-empty string. See [Paths](../filesystem.md#paths).

### Return value

A Promise that fulfills with `undefined`.

- When the path is a directory, the directory is deleted together with all of its contents.
- When the path does not exist, the Promise is rejected. The value of `name` is **not verified in the simulator**.
- For other failure cases, see [What you get on failure](../filesystem.md#what-you-get-on-failure).

### Exceptions

**`TypeError`**

`path` is not a string, or is an empty string: `remove: path must be a non-empty string`. In this case it throws synchronously and does not return a Promise.

## Examples

```js
async function demo() {
  const fs = application.fileSystem;
  const dir = fs.temporary + '/to-remove';
  await fs.makeDirectory(dir);
  await fs.writeText(dir + '/a.txt', 'a');

  await fs.remove(dir);
  console.log(await fs.exists(dir));
}
demo();
```

**Result**: Logs `false`. Both the directory and the `a.txt` in it are deleted.

## Corresponding iOS API

`-[NSFileManager removeItemAtPath:error:]`.

## See also

- [`exists()`](exists.md): check whether it exists before deleting, to avoid a rejection
