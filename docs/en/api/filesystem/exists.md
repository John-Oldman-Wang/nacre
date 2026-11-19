---
type: reference
native: "-[NSFileManager fileExistsAtPath:]"
---

# `FileSystem`: `exists()` method

The **`exists()`** method determines whether a file or directory exists at a path.

## Syntax

```
exists(path)
```

### Parameters

**`path`**

An absolute path, a non-empty string. See [Paths](../filesystem.md#paths).

### Return value

A Promise that fulfills with a boolean: `true` when a file or directory exists at the path, `false` when not. A nonexistent path gives `false`, not a rejection.

### Exceptions

**`TypeError`**

`path` is not a string, or is an empty string: `exists: path must be a non-empty string`. In this case it throws synchronously and does not return a Promise.

## Examples

```js
async function demo() {
  const fs = application.fileSystem;
  const settingsPath = fs.documents + '/settings.json';

  let settingsText = '{}';
  if (await fs.exists(settingsPath)) {
    settingsText = await fs.readText(settingsPath);
  }
  console.log(settingsText);
}
demo();
```

**Result**: Logs the file's content when it exists, and `{}` when it doesn't.

## Corresponding iOS API

`-[NSFileManager fileExistsAtPath:]`.

## See also

- [`stat()`](stat.md): when you also need to know whether it is a directory and how big it is
