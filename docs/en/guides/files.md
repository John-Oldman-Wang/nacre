# Reading and writing files

This guide covers how to use [`application.fileSystem`](../api/filesystem.md) to save and read files: choosing a directory, storing JSON, caching downloaded content, and handling errors. The details of each function are on the [`application.fileSystem`](../api/filesystem.md) reference page.

## Choosing among the three kinds of storage

| Data to save | Which to use | Why |
| --- | --- | --- |
| User settings, toggles, where the user left off | [`application.storage`](../api/storage.md) | Synchronous reads and writes; values can directly be numbers, booleans, arrays, or objects |
| Sign-in tokens, passwords, keys | [`application.keychain`](../api/keychain.md) (install `@nacrejs/keychain` first) | Stored encrypted by the system |
| Downloaded files, image caches, large amounts of business data, binary content | [`application.fileSystem`](../api/filesystem.md) | Stored as files, and you can choose which directory they go in |

## Recommended approach

- **Choose the directory by "can it be obtained again if lost".** Put what can be downloaded or computed again in `caches`; the system can clear it when storage space runs low, so the space the app uses does not only grow. Put what cannot be obtained again in `documents` (created by the user) or `applicationSupport` (the app's own).
- **Before reading a file in `caches`, check whether it is still there.** The system may already have deleted it. Code that reads the cache needs a "download again if it is gone" path.
- **Store large amounts of structured data as a JSON file, not in [`application.storage`](../api/storage.md).** `application.storage` is for settings. Store hundreds or thousands of records as a file with `writeText(path, JSON.stringify(data))`, in `applicationSupport`.
- **`makeDirectory()` before writing a file.** Writing a file does not create the directory it is in. `makeDirectory()` creates all intermediate levels along with it, and does not throw when the directory already exists.
- **`await` operations on the same file one at a time.** When several operations run at once, the order in which they complete is not fixed. If you start two writes to the same file in a row without waiting for the first to finish, which one's content is left at the end is uncertain (from reading the code; **not verified in the simulator**).
- **Do not write tokens or passwords to files.** Use [`application.keychain`](../api/keychain.md).

## First example

The code below saves a note to the `documents` directory and reads it back. File reading and writing involves no UI, so this code runs when written directly at the top level of `main.js`.

```js
const fs = application.fileSystem;

async function main() {
  // 1. Build the paths of the directory and the file
  const dir = fs.documents + '/notes';
  const path = dir + '/first.txt';

  // 2. Create the directory first. No error if it already exists
  await fs.makeDirectory(dir);

  // 3. Write text
  await fs.writeText(path, '你好 Nacre');

  // 4. Read it back
  const text = await fs.readText(path);
  console.log('Content:', text);

  // 5. Query the file's information
  const info = await fs.stat(path);
  console.log('Size:', info.size, 'bytes');
}

main().catch((err) => {
  console.log('Error:', String(err));
});
```

**Result**

- The console prints `Content: 你好 Nacre`.
- Then it prints `Size: 12 bytes`. The two Chinese characters take 3 bytes each, and the other 6 characters take 1 byte each.
- After the app quits and launches again, `documents/notes/first.txt` is still there.

This code has not been run as a whole in the simulator. Every API it uses has been run in the acceptance tests.

The code in the following sections is all written inside an `async` function and reuses the `fs` from above.

## Which directory to choose

iOS gives each app its own storage space, containing several directories with fixed purposes. `application.fileSystem` gives their paths through four read-only properties:

| Property | What goes in it | Can the system delete it? | Included in backups? |
| --- | --- | --- | --- |
| [`documents`](../api/filesystem/documents.md) | Content created by the user: notes, exported files | No | Yes |
| [`applicationSupport`](../api/filesystem/applicationsupport.md) | The app's own data: databases, state files | No | Yes |
| [`caches`](../api/filesystem/caches.md) | Content that can be obtained again: downloaded images, cached API responses | Deleted when the device runs low on storage | No |
| [`temporary`](../api/filesystem/temporary.md) | Temporary files not needed after use | May be deleted at any time | No |

Files in the project's `assets/` directory are bundled into the app and read through a fifth property, [`assets`](../api/filesystem/assets.md): `assets/config/rates.json` in the project is `fs.assets + '/config/rates.json'` in the app. It is read-only. To change a file, copy it to `applicationSupport` first and change it there.

The "Can the system delete it?" and "Included in backups?" columns come from the iOS definition and are **not verified in the simulator**.

Whether the `applicationSupport` directory already exists the first time the app runs is **not verified in the simulator**. Call `makeDirectory(fs.applicationSupport)` once before writing files into it.

## Saving and reading JSON data

```js
async function saveOrders() {
  const dataPath = fs.applicationSupport + '/orders.json';
  await fs.makeDirectory(fs.applicationSupport);

  await fs.writeText(dataPath, JSON.stringify([{ id: 1, total: 99.5 }]));

  /** @type {{ id: number, total: number }[]} */
  const orders = JSON.parse(await fs.readText(dataPath));
  console.log(orders.length, orders[0]?.total);
}
```

**Result**: Prints `1 99.5`.

## Using default content when a file does not exist

```js
async function loadSettings() {
  const settingsPath = fs.documents + '/settings.json';

  let settingsText = '{}';
  if (await fs.exists(settingsPath)) {
    settingsText = await fs.readText(settingsPath);
  }
  console.log(settingsText);
}
```

**Result**: When the file exists, prints its content; when it does not, prints `{}`.

What each operation does when it encounters a file or directory that does not exist:

| Operation | Result |
| --- | --- |
| Reading a nonexistent file (`readText()`, `readBytes()`) | The Promise rejects, with `name` `'NotFoundError'` |
| Querying a nonexistent path (`stat()`) | The Promise rejects, with `name` `'NotFoundError'` |
| Listing a nonexistent directory (`readDirectory()`) | The Promise rejects, with `name` `'NotFoundError'` |
| Checking existence (`exists()`) | Gives `false`; does not reject |
| Deleting a nonexistent path (`remove()`) | The Promise rejects. The value of `name` is **not verified in the simulator** |
| Writing a file into a nonexistent directory (`writeText()`, `writeBytes()`) | The directory is not created automatically. The `name` the Promise rejects with is **not verified in the simulator** |

## Saving downloaded images to the cache directory

Read content fetched with [`fetch`](../api/fetch.md) into a `Blob` with `blob()`, and hand it directly to [`writeBytes()`](../api/filesystem/writebytes.md).

```js
async function cacheAvatar() {
  const cacheDir = fs.caches + '/images';
  const imagePath = cacheDir + '/avatar.png';

  if (!(await fs.exists(imagePath))) {
    const response = await fetch('https://httpbin.org/image/png');
    const blob = await response.blob();
    await fs.makeDirectory(cacheDir);
    await fs.writeBytes(imagePath, blob);
  }
  const imageInfo = await fs.stat(imagePath);
  console.log('Cached image:', imageInfo.size, 'bytes');
}
```

**Result**: The first run downloads and saves the image; later runs find the file already there and do not download it again. Both cases print the image's size in bytes. After the system clears the cache directory, the next run downloads it again.

This code is **not verified in the simulator**.

## Writing and reading binary data

The second argument of `writeBytes()` is a [`Blob`](../api/fetch.md). When you have a `Uint8Array` or an `ArrayBuffer`, wrap it first with `new Blob([...])`. `readBytes()` gives an `ArrayBuffer`.

```js
async function roundTripBytes() {
  const binPath = fs.temporary + '/bytes.bin';
  await fs.writeBytes(binPath, new Blob([new Uint8Array([0, 1, 2, 253, 254, 255])]));

  const bytes = new Uint8Array(await fs.readBytes(binPath));
  console.log(bytes.length, bytes.join(','));
}
```

**Result**: Prints `6 0,1,2,253,254,255`.

## Adding content to the end of a file

Writing replaces the whole file; there is no append. Read it first, join the new content, and write the whole thing back.

```js
async function appendLine() {
  const logPath = fs.documents + '/log.txt';
  const old = (await fs.exists(logPath)) ? await fs.readText(logPath) : '';
  await fs.writeText(logPath, old + 'A new line\n');
}
```

**Result**: Each call adds a line `A new line` to the end of `log.txt`. **Not verified in the simulator.**

## Listing the contents of a directory

```js
async function listDemo() {
  const listDir = fs.documents + '/list-demo';
  await fs.makeDirectory(listDir + '/sub');
  await fs.writeText(listDir + '/a.txt', 'a');

  const names = await fs.readDirectory(listDir);
  console.log(names.slice().sort().join(','));
}
```

**Result**: Prints `a.txt,sub`.

What you get are names, not full paths. Only this level is listed. The order of the names is **not verified in the simulator**; when you need a fixed order, sort them yourself.

## Copying, moving, and deleting

```js
async function copyMoveRemove() {
  const src = fs.documents + '/src.txt';
  await fs.writeText(src, 'content');

  await fs.copy(src, fs.documents + '/copy.txt');
  await fs.move(fs.documents + '/copy.txt', fs.documents + '/moved.txt');
  console.log(await fs.exists(fs.documents + '/copy.txt'));

  await fs.remove(src);
  await fs.remove(fs.documents + '/moved.txt');
}
```

**Result**: Prints `false`. After `copy.txt` is moved away, there is no longer a file at the original location. Finally both files are deleted.

When the argument of `remove()` is a directory, the directory is deleted along with everything in it.

## Handling errors by category

```js
async function readMaybe() {
  try {
    await fs.readText(fs.documents + '/maybe-missing.txt');
  } catch (err) {
    const e = /** @type {FileSystemError} */ (err);
    if (e.name === 'NotFoundError') {
      console.log('The file does not exist');
    } else {
      console.log('Other error:', e.name, e.code);
    }
  }
}
```

**Result**: When the file does not exist, prints `The file does not exist`.

For all values of `name`, see [What you get on error](../api/filesystem.md#what-you-get-on-failure). Do not use `message` for decisions; it changes with the system language.

## See also

- [`application.fileSystem`](../api/filesystem.md): all properties and functions
- [Saving user settings](save-settings.md): settings and small amounts of state go in `application.storage`
- [`fetch`](../api/fetch.md): `Blob` is described on that page
