---
type: reference
native: application.fileSystem
---

# `Application`: `fileSystem` property

The **`fileSystem`** property is the entry point for reading and writing files.

## Value

`FileSystem`. All of its methods return Promises; see [File system](../filesystem.md) for usage.

- Read-only. Assigning to it throws `TypeError`.
- Each read returns the same object.

## Examples

```js
console.log(application.fileSystem === application.fileSystem);
```

**Result**: the console prints `true`.

## Corresponding iOS API

See [File system](../filesystem.md).

## See also

- [File system](../filesystem.md)
