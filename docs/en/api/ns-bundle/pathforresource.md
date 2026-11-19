---
type: reference
native: "-[NSBundle pathForResource:ofType:inDirectory:forLocalization:]"
---

# `NSBundle`: `pathForResource()` method

The **`pathForResource()`** method finds the absolute path of a resource in the bundle by name.

## Syntax

```
pathForResource(name[, { ofType, inDirectory, forLocalization }])
```

## Parameters

**`name`**

The resource name, a string or `null`. Converted as a string; `null` and `undefined` mean not specified. The name can include an extension (`'data.json'`), in which case `ofType` is not needed.

**`options.ofType`**

The extension, without the dot, such as `'json'`.

**`options.inDirectory`**

Which directory in the bundle to look in, relative to the bundle root, such as `'JS/assets/web'`. When omitted, it looks in the bundle root and the per-language directories.

**`options.forLocalization`**

Which language's directory to look in, such as `'en'`.

## Return value

A string: the absolute path of the resource; `null` if not found.

## Exceptions

None.

## Description

The project's `assets/` is at `JS/assets` in the bundle. To read files there, building the path from [`application.fileSystem.assets`](../filesystem/assets.md) is simpler; `pathForResource()` suits cases where you do not know which directory a file is in, or need to look by language.

Which file `forLocalization` finds is **not verified in the simulator**: the acceptance app's bundle has no per-language resources.

## Examples

```js
const main = NSBundle.mainBundle;
console.log(main.pathForResource('data', { ofType: 'json', inDirectory: 'JS/assets/web' }) === application.fileSystem.assets + '/web/data.json');
console.log(main.pathForResource('no-such-file', { ofType: 'json' }));
```

**Result**: Prints `true`, then `null`.

## Corresponding iOS API

Depending on which options are given, calls `pathForResource:ofType:`, `pathForResource:ofType:inDirectory:`, or `pathForResource:ofType:inDirectory:forLocalization:`.

## See also

- [`NSBundle`](../ns-bundle.md)
- [`pathsForResourcesOfType()`](pathsforresourcesoftype.md)
