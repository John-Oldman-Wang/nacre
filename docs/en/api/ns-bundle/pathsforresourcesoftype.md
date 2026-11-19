---
type: reference
native: "-[NSBundle pathsForResourcesOfType:inDirectory:forLocalization:]"
---

# `NSBundle`: `pathsForResourcesOfType()` method

The **`pathsForResourcesOfType()`** method lists the absolute paths of all resources in the bundle with a given extension.

## Syntax

```
pathsForResourcesOfType(ext[, { inDirectory, forLocalization }])
```

## Parameters

**`ext`**

The extension, without the dot, a string or `null`. Converted as a string; `null` and `undefined` mean not specified.

**`options.inDirectory`**

Which directory in the bundle to look in, relative to the bundle root. Subdirectories are not searched.

**`options.forLocalization`**

Which language's directory to look in.

## Return value

An array of strings; an empty array if there are none.

## Exceptions

None.

## Description

"Subdirectories are not searched" comes from Apple's documentation and is **not verified in the simulator**.

## Examples

```js
const pngs = NSBundle.mainBundle.pathsForResourcesOfType('png', { inDirectory: 'JS/assets' });
console.log(pngs.includes(application.fileSystem.assets + '/dot.png'));
```

**Result**: When the project's `assets/` contains `dot.png`, prints `true`.

## Corresponding iOS API

Depending on whether `forLocalization` is given, calls `pathsForResourcesOfType:inDirectory:` or `pathsForResourcesOfType:inDirectory:forLocalization:`.

## See also

- [`NSBundle`](../ns-bundle.md)
