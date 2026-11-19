---
type: reference
native: NSBundle.bundlePath
---

# `NSBundle`: `bundlePath` property

The **`bundlePath`** property is the absolute path of the bundle.

## Value

A string. The app's bundle ends in `.app`.

- Read-only; assigning to it throws `TypeError`.

## Examples

```js
console.log(NSBundle.mainBundle.bundlePath.endsWith('.app'));
```

**Result**: Prints `true`.

## Corresponding iOS API

`NSBundle.bundlePath`.

## See also

- [`NSBundle`](../ns-bundle.md)
- [`application.fileSystem.assets`](../filesystem/assets.md)
