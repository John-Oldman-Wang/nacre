---
type: reference
native: "-[NacreRuntime startWithScriptsDirectory:] + /assets"
---

# `FileSystem`: `assets` property

The **`assets`** property is the absolute path of the project's `assets/` directory inside the app bundle. The project's `assets/config/rates.json` is `fs.assets + '/config/rates.json'` in the app.

## Value

A string. It starts with `/` and does not end with `/`.

- Read-only. Assigning to it throws `TypeError`.
- It does not change while the app is running, so there is no change notification.
- When the project has no `assets/` directory, the path is still provided but the directory does not exist; reading a file in it gives a rejected Promise. **Not verified in the simulator.**

The files in the directory are copied from the project's `assets/` into the app bundle at build time, with the same directory structure as in the project. Read them with [`readText()`](readtext.md), [`readBytes()`](readbytes.md), [`readDirectory()`](readdirectory.md), [`stat()`](stat.md), and [`exists()`](exists.md).

The app bundle is read-only. According to Apple, writes into the bundle are refused on a device: the bundle is signed at install time, and if it is modified the app no longer launches. **Not verified on a device.** In the simulator, writes succeed (measured); do not rely on this. Copy data you need to modify into [`applicationSupport`](applicationsupport.md) first, then modify it there.

## Examples

```js
const fs = application.fileSystem;
(async () => {
  const data = JSON.parse(await fs.readText(fs.assets + '/web/data.json'));
  console.log(data.ok);
})();
```

**Result**: When the project has `assets/web/data.json` with the content `{"ok": "yes"}`, logs `yes`.

## Corresponding iOS API

The path of the `JS/assets/` directory in the app bundle: `[NSBundle.mainBundle.bundlePath stringByAppendingPathComponent:@"JS/assets"]`.

## See also

- [Reading and writing files](../../guides/files.md)
- [`NSBundle`](../ns-bundle.md): finding resources in the bundle by name, reading things in the bundle outside `assets/`
