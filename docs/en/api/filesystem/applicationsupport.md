---
type: reference
native: "NSSearchPathForDirectoriesInDomains(NSApplicationSupportDirectory, …)"
---

# `FileSystem`: `applicationSupport` property

The **`applicationSupport`** property is the absolute path of the directory for the app's own data (databases, state files).

## Value

A string. It starts with `/`, does not end with `/`, and differs from the other three directories.

- Read-only. Assigning to it throws `TypeError`.
- It does not change while the app is running, so there is no change notification.
- Whether the system deletes files in it: no.
- Whether it is backed up: yes.

The two items "whether the system deletes" and "whether it is backed up" come from the iOS definition and are **not verified in the simulator**.

Whether this directory already exists the first time the app runs is **not verified in the simulator**. Before writing files into it, call [`makeDirectory(fs.applicationSupport)`](makedirectory.md) once; the call does not fail if the directory already exists.

## Examples

```js
async function save() {
  const fs = application.fileSystem;
  await fs.makeDirectory(fs.applicationSupport);
  await fs.writeText(fs.applicationSupport + '/state.json', '{}');
  console.log(await fs.exists(fs.applicationSupport + '/state.json'));
}
save();
```

**Result**: Logs `true`.

## Corresponding iOS API

`NSSearchPathForDirectoriesInDomains(NSApplicationSupportDirectory, …)`.

## See also

- [Choosing a directory](../../guides/files.md#which-directory-to-choose)
