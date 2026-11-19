---
type: reference
native: "-[NSFileManager attributesOfItemAtPath:error:]"
---

# `FileSystem`: `stat()` method

The **`stat()`** method queries information about a file or directory: its size, whether it is a directory, and its last modification time.

## Syntax

```
stat(path)
```

### Parameters

**`path`**

An absolute path, a non-empty string. See [Paths](../filesystem.md#paths).

### Return value

A Promise that fulfills with an object (called `FileStat` in the type definitions):

| Property | Type | Meaning |
| --- | --- | --- |
| `size` | `number` | The file's size in bytes. What this value means when the path is a directory is **not verified in the simulator** |
| `isDirectory` | `boolean` | `true` for a directory, `false` for a file |
| `modified` | `number` | The last modification time, as a timestamp in milliseconds. Use `new Date(info.modified)` to get a date |

When the path does not exist, the Promise is rejected with `name` set to `'NotFoundError'`. For other failure cases, see [What you get on failure](../filesystem.md#what-you-get-on-failure).

### Exceptions

**`TypeError`**

`path` is not a string, or is an empty string: `stat: path must be a non-empty string`. In this case it throws synchronously and does not return a Promise.

## Examples

```js
async function demo() {
  const fs = application.fileSystem;
  const path = fs.temporary + '/first.txt';
  await fs.writeText(path, '你好 Nacre');
  const info = await fs.stat(path);
  console.log(info.size, info.isDirectory, new Date(info.modified).getFullYear() > 2000);
}
demo();
```

**Result**: Logs `12 false true`. The two Chinese characters take 3 bytes each, and the other 6 characters take 1 byte each.

## Corresponding iOS API

`-[NSFileManager attributesOfItemAtPath:error:]`. The three items `NSFileSize`, `NSFileType`, and `NSFileModificationDate` become `size`, `isDirectory`, and `modified`.

## See also

- [`exists()`](exists.md): only checking whether it exists
