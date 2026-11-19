---
type: reference
native: CFBundleShortVersionString
---

# `Application`: `version` property

The **`version`** property is the user-facing version number.

## Value

A string, such as `'0.1.0'`.

- Read-only. Assigning to it throws `TypeError`.
- Equal to `info.CFBundleShortVersionString`; the value comes from the project's [`nacre.config.json`](../../guides/project-config.md).
- It doesn't change while the app runs, so there is no change event.

One version can have multiple builds; for the build number see [`build`](build.md).

## Examples

```js
console.log(application.version, application.build);
```

**Result**: prints, for example, `0.1.0 1`.

## Corresponding iOS API

`CFBundleShortVersionString` in Info.plist.

## See also

- [`build`](build.md)
