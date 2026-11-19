---
type: reference
native: NSTemporaryDirectory()
---

# `FileSystem`: `temporary` property

The **`temporary`** property is the absolute path of the directory for temporary files you no longer need once you're done with them.

## Value

A string. It starts with `/`, does not end with `/`, and differs from the other three directories.

- Read-only. Assigning to it throws `TypeError`.
- It does not change while the app is running, so there is no change notification.
- Whether the system deletes files in it: it may delete them at any time.
- Whether it is backed up: no.

The two items "whether the system deletes" and "whether it is backed up" come from the iOS definition and are **not verified in the simulator**.

## Examples

```js
const fs = application.fileSystem;
console.log(fs.temporary !== fs.caches);
```

**Result**: Logs `true`.

## Corresponding iOS API

`NSTemporaryDirectory()`.

## See also

- [Choosing a directory](../../guides/files.md#which-directory-to-choose)
