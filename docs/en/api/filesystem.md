---
type: reference
status: partial
---

# `application.fileSystem`

**`application.fileSystem`** represents the app's own file storage. It provides the paths of five directories (four read-write ones, plus one read-only: the location of the project's `assets/` inside the app bundle), and functions to read files, write files, create directories, list directories, delete, move, copy, and query file information.

There is exactly one `application.fileSystem` in the app, and it is available at any time, including at the top level of a script. Its class is `FileSystem`.

All read and write functions return a Promise. Reading and writing happen in the background; meanwhile the UI stays responsive and timers keep running. On failure the Promise is rejected; the functions never return `false` or `null`. For the rejection value, see [What you get on failure](#what-you-get-on-failure).

User settings belong in [`application.storage`](storage.md), and tokens and passwords belong in [`application.keychain`](keychain.md). For how to choose a directory and how to read and write, see the guide [Reading and writing files](../guides/files.md).

**Inheritance**: `FileSystem` does not inherit from any class.

## Constructor

It cannot be created with `new`: `new FileSystem()` throws `TypeError` with the message `Illegal constructor: FileSystem is created by the runtime, not by new`. Get the only instance from the `fileSystem` property of [`application`](application.md).

## Properties

The absolute paths of five directories. None of the five values changes while the app is running.

| Property | Description |
| --- | --- |
| [`documents`](filesystem/documents.md) <small>read-only</small> | Content the user creates. The system does not delete it; it is backed up |
| [`applicationSupport`](filesystem/applicationsupport.md) <small>read-only</small> | The app's own data. The system does not delete it; it is backed up |
| [`caches`](filesystem/caches.md) <small>read-only</small> | Content that can be obtained again. The system deletes it when storage runs low |
| [`temporary`](filesystem/temporary.md) <small>read-only</small> | Temporary files you no longer need once you're done. The system may delete them at any time |
| [`assets`](filesystem/assets.md) <small>read-only</small> | The location of the project's `assets/` inside the app bundle. Read-only; it cannot be written to |

## Functions

The path arguments of all functions must be non-empty strings. When given another type or an empty string, a function **throws synchronously** a `TypeError` instead of returning a Promise, with the message `<function name>: path must be a non-empty string`, for example `readText: path must be a non-empty string`.

Reading and writing:

| Function | Description |
| --- | --- |
| [`readText()`](filesystem/readtext.md) | Reads the whole file as UTF-8 text |
| [`readBytes()`](filesystem/readbytes.md) | Reads the whole file's bytes |
| [`writeText()`](filesystem/writetext.md) | Writes text as UTF-8, replacing the whole file |
| [`writeBytes()`](filesystem/writebytes.md) | Writes the bytes in a `Blob`, replacing the whole file |

Managing directories and files:

| Function | Description |
| --- | --- |
| [`exists()`](filesystem/exists.md) | Whether a file or directory exists at a path |
| [`stat()`](filesystem/stat.md) | A file's size, whether it is a directory, and its last modification time |
| [`makeDirectory()`](filesystem/makedirectory.md) | Creates a directory, along with any intermediate directories |
| [`readDirectory()`](filesystem/readdirectory.md) | The names of the entries in a directory |
| [`remove()`](filesystem/remove.md) | Deletes a file, or a directory with all of its contents |
| [`move()`](filesystem/move.md) | Moves or renames |
| [`copy()`](filesystem/copy.md) | Copies |

## Paths

A path is an absolute path string. Build it from a directory property plus `/` and the file name:

```js
const fs = application.fileSystem;
const path = fs.documents + '/notes/今天.txt';
console.log(path.startsWith('/'));
```

**Result**: Logs `true`. `path` is the absolute path of `今天.txt` in the `notes` subdirectory of the `documents` directory. File and directory names can contain Chinese characters.

Directory properties do not end with `/`; add it yourself when building a path.

The following cases are **not verified in the simulator**:

- Where reads and writes go when given a relative path (one not starting with `/`).
- What happens when reading or writing paths outside these directories.
- Whether the absolute paths of these directories change after the app is updated or reinstalled. When saving a file location, save only the part after the directory property (such as `'/notes/今天.txt'`) and join it with the directory property each time you use it; that way a changed path has no effect.

When the user uninstalls the app, all files in the first four directories are deleted with it (per the iOS definition; **not verified in the simulator**). After the app process ends and the app starts again, the files in `documents` are still there: in the acceptance tests, the first run writes a file and the second launch reads it back.

## What you get on failure

When an operation fails, the Promise is rejected. The rejection value is an `Error` object (called `FileSystemError` in the type definitions) with two extra properties:

| Property | Type | Meaning |
| --- | --- | --- |
| `name` | `string` | The category of the error; see the table below for values. Use it to determine what went wrong |
| `message` | `string` | Explanatory text from the system. The text changes with the system language; do not base decisions on it |
| `code` | `number` | The system's raw error code |
| `domain` | `string` | The system's error domain, usually `'NSCocoaErrorDomain'` |

Values of `name`:

| `name` | When |
| --- | --- |
| `'NotFoundError'` | The file or directory does not exist |
| `'NotAllowedError'` | No permission to read or write |
| `'InvalidModificationError'` | A file already exists at the destination |
| `'QuotaExceededError'` | The device's storage is full |
| `'NoModificationAllowedError'` | The storage it is on is read-only |
| `'TypeMismatchError'` | The file name is invalid |
| `'FileError'` | None of the above. Use `code` and `domain` to tell cases apart |

Of this table, only `'NotFoundError'` has been verified in the simulator. The other rows come from the mapping in the code and are **not verified in the simulator**.

```js
async function readMissing() {
  const fs = application.fileSystem;
  try {
    await fs.readText(fs.documents + '/missing.txt');
  } catch (err) {
    const e = /** @type {FileSystemError} */ (err);
    console.log(e.name, e.code, e.domain);
  }
}
readMissing();
```

**Result**: Logs `NotFoundError 260 NSCocoaErrorDomain`.

## File size

Both reading and writing handle the whole file at once: the read functions load the entire file into memory, and the content to write must also be entirely in memory first. So the file size you can handle is limited by available memory.

Writing itself does not occupy the thread the UI runs on. What does is the `new Blob([data])` step: it copies the data, and the time it takes is proportional to the data size. **Not verified** on a device.

## Examples

The code below saves a note to the `documents` directory and reads it back. File I/O does not involve the UI, so this code runs as-is at the top level of `main.js`.

```js
const fs = application.fileSystem;

async function main() {
  // 1. Build the directory and file paths
  const dir = fs.documents + '/notes';
  const path = dir + '/first.txt';

  // 2. Create the directory first. No error if it already exists
  await fs.makeDirectory(dir);

  // 3. Write text
  await fs.writeText(path, '你好 Nacre');

  // 4. Read it back
  const text = await fs.readText(path);
  console.log('Content:', text);

  // 5. Query file information
  const info = await fs.stat(path);
  console.log('Size:', info.size, 'bytes');
}

main().catch((err) => {
  console.log('Error:', String(err));
});
```

**Result**

- The console logs `Content: 你好 Nacre`.
- Then it logs `Size: 12 bytes`. The two Chinese characters take 3 bytes each, and the other 6 characters take 1 byte each.
- After the app quits and starts again, `documents/notes/first.txt` is still there.

This code has not been run as a whole in the simulator. Every API it uses has been run in the acceptance tests.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, …)` | `fs.documents` |
| `NSSearchPathForDirectoriesInDomains(NSApplicationSupportDirectory, …)` | `fs.applicationSupport` |
| `NSSearchPathForDirectoriesInDomains(NSCachesDirectory, …)` | `fs.caches` |
| `NSTemporaryDirectory()` | `fs.temporary` |
| `[NSString stringWithContentsOfFile:encoding:error:]` | `await fs.readText(path)` |
| `[NSData dataWithContentsOfFile:options:error:]` | `await fs.readBytes(path)` |
| `[text writeToFile:atomically:encoding:error:]` | `await fs.writeText(path, text)` |
| `[data writeToFile:options:error:]` | `await fs.writeBytes(path, blob)` |
| `[fm fileExistsAtPath:]` | `await fs.exists(path)` |
| `[fm createDirectoryAtPath:withIntermediateDirectories:YES …]` | `await fs.makeDirectory(path)` |
| `[fm contentsOfDirectoryAtPath:error:]` | `await fs.readDirectory(path)` |
| `[fm attributesOfItemAtPath:error:]` | `await fs.stat(path)` |
| `[fm removeItemAtPath:error:]` | `await fs.remove(path)` |
| `[fm moveItemAtPath:toPath:error:]` | `await fs.move(from, to)` |
| `[fm copyItemAtPath:toPath:error:]` | `await fs.copy(from, to)` |
| `NSError **` | The Promise is rejected; `err.code` and `err.domain` are the raw values |

## See also

- [Reading and writing files](../guides/files.md): choosing a directory, storing JSON, caching downloaded images, handling errors by category
- [`application`](application.md): `fileSystem` is one of its properties
- [`fetch`](fetch.md): `Blob` is described on that page; downloaded content can be written straight to a file
- [Local storage](storage.md): settings and small amounts of state go there
- [Keychain](keychain.md): tokens and passwords go there
