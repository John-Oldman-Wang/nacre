---
type: reference
native: "-[NSFileManager contentsOfDirectoryAtPath:error:]"
---

# `FileSystem`: `readDirectory()` method

The **`readDirectory()`** method lists the names of the entries in a directory.

## Syntax

```
readDirectory(path)
```

### Parameters

**`path`**

The absolute path of the directory, a non-empty string. See [Paths](../filesystem.md#paths).

### Return value

A Promise that fulfills with an array of strings.

- You get names, not full paths.
- Only this level is listed; the contents of subdirectories are not included. The names of the subdirectories themselves are included.
- The order of the names is **not verified in the simulator**; sort them yourself when you need a fixed order.
- When the directory does not exist, the Promise is rejected with `name` set to `'NotFoundError'`. For other failure cases, see [What you get on failure](../filesystem.md#what-you-get-on-failure).

### Exceptions

**`TypeError`**

`path` is not a string, or is an empty string: `readDirectory: path must be a non-empty string`. In this case it throws synchronously and does not return a Promise.

## Examples

```js
async function demo() {
  const fs = application.fileSystem;
  const listDir = fs.documents + '/list-demo';
  await fs.makeDirectory(listDir + '/sub');
  await fs.writeText(listDir + '/a.txt', 'a');

  const names = await fs.readDirectory(listDir);
  console.log(names.slice().sort().join(','));
}
demo();
```

**Result**: Logs `a.txt,sub`.

## Corresponding iOS API

`-[NSFileManager contentsOfDirectoryAtPath:error:]`.

## See also

- [`stat()`](stat.md): determining whether an entry is a directory
