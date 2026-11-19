---
type: reference
native: "NSSearchPathForDirectoriesInDomains(NSCachesDirectory, …)"
---

# `FileSystem`: `caches` property

The **`caches`** property is the absolute path of the directory for content that can be obtained again (downloaded images, cached API responses).

## Value

A string. It starts with `/`, does not end with `/`, and differs from the other three directories.

- Read-only. Assigning to it throws `TypeError`.
- It does not change while the app is running, so there is no change notification.
- Whether the system deletes files in it: yes, when the device runs low on storage.
- Whether it is backed up: no.

The two items "whether the system deletes" and "whether it is backed up" come from the iOS definition and are **not verified in the simulator**.

The system may already have deleted files here. Before reading a file here, check with [`exists()`](exists.md) whether it is still there, and download it again if not.

## Examples

```js
const fs = application.fileSystem;
const imagePath = fs.caches + '/images/avatar.png';
console.log(imagePath.startsWith(fs.caches));
```

**Result**: Logs `true`.

## Corresponding iOS API

`NSSearchPathForDirectoriesInDomains(NSCachesDirectory, …)`.

## See also

- [Choosing a directory](../../guides/files.md#which-directory-to-choose)
