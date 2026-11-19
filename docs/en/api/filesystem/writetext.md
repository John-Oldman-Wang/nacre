---
type: reference
native: "-[NSString writeToFile:atomically:encoding:error:]"
---

# `FileSystem`: `writeText()` method

The **`writeText()`** method writes text to a file as UTF-8, replacing the whole file.

## Syntax

```
writeText(path, text)
```

### Parameters

**`path`**

The absolute path of the file, a non-empty string. See [Paths](../filesystem.md#paths).

**`text`**

The text to write, a string.

### Return value

A Promise that fulfills with `undefined`. When the Promise completes, the file has been written, and a read immediately afterward gets the new content.

- The file is created when it doesn't exist and overwritten when it does. There is no appending: to add content to the end of a file, read it, concatenate, and write the whole thing back.
- The write first produces a complete new file alongside, then replaces the original file with it. If the app is terminated halfway through the write, the original file keeps its original content (per the iOS definition; **not verified in the simulator**).
- The containing directory is not created automatically. When the directory doesn't exist, the Promise is rejected; the value of `name` is **not verified in the simulator**. Create the directory with [`makeDirectory()`](makedirectory.md) before writing.
- If you start two writes to the same file in a row without waiting for the first to finish, which content remains in the end is undefined (derived from reading the code; **not verified in the simulator**). Perform operations on the same file one at a time with `await`.

For other failure cases, see [What you get on failure](../filesystem.md#what-you-get-on-failure).

### Exceptions

**`TypeError`**

In these cases it throws synchronously and does not return a Promise.

- `path` is not a string, or is an empty string: `writeText: path must be a non-empty string`.
- `text` is not a string: `writeText: the second argument must be a string`.

## Examples

```js
async function demo() {
  const fs = application.fileSystem;
  const path = fs.temporary + '/note.txt';
  await fs.writeText(path, 'first version');
  await fs.writeText(path, 'second version');
  console.log(await fs.readText(path));
}
demo();
```

**Result**: Logs `second version`. The second write replaced the whole file.

## Corresponding iOS API

`-[NSString writeToFile:atomically:encoding:error:]` with `atomically` set to `YES` and the encoding UTF-8.

## See also

- [`writeBytes()`](writebytes.md): writing binary content
- [`makeDirectory()`](makedirectory.md): create the directory first
