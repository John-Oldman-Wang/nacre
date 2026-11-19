---
type: reference
native: "NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, …)"
---

# `FileSystem`: `documents` property

The **`documents`** property is the absolute path of the directory for content the user creates (notes, exported files).

## Value

A string. It starts with `/`, does not end with `/`, and differs from the other three directories.

- Read-only. Assigning to it throws `TypeError`.
- It does not change while the app is running, so there is no change notification.
- Whether the system deletes files in it: no.
- Whether it is backed up: yes.

The two items "whether the system deletes" and "whether it is backed up" come from the iOS definition and are **not verified in the simulator**.

After the app process ends and the app starts again, the files in this directory are still there: in the acceptance tests, the first run writes a file and the second launch reads it back.

## Examples

```js
const fs = application.fileSystem;
console.log(fs.documents.startsWith('/'), fs.documents.endsWith('/'));
```

**Result**: Logs `true false`.

## Corresponding iOS API

`NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, …)`.

## See also

- [Choosing a directory](../../guides/files.md#which-directory-to-choose)
