---
type: reference
native: CFBundleVersion
---

# `Application`: `build` property

The **`build`** property is the app's build number. One version can have multiple builds.

## Value

A string, such as `'1'`.

- Read-only. Assigning to it throws `TypeError`.
- Equal to `info.CFBundleVersion`; the value comes from the project's [`nacre.config.json`](../../guides/project-config.md).
- It doesn't change while the app runs, so there is no change event.

## Examples

```js
console.log(application.build);
```

**Result**: prints, for example, `1`.

## Corresponding iOS API

`CFBundleVersion` in Info.plist.

## See also

- [`version`](version.md)
