---
type: reference
native: "+[NSBundle bundleWithPath:]"
---

# `NSBundle.bundleWithPath()` static method

The **`bundleWithPath()`** static method gets a bundle by its directory path.

## Syntax

```
NSBundle.bundleWithPath(path)
```

## Parameters

**`path`**

The absolute path of the bundle, a string. Converted as a string: numbers become strings, and `null` and `undefined` become an empty string.

## Return value

An [`NSBundle`](../ns-bundle.md), or `null` if the path is not a bundle.

## Exceptions

None.

## Description

Passing the path of the app's own bundle gives a bundle with the same contents as [`mainBundle`](mainbundle.md) (the same `bundleIdentifier`); whether it is the same object has not been verified.

## Examples

```js
console.log(NSBundle.bundleWithPath('/no/such/bundle'));
```

**Result**: Prints `null`.

## Corresponding iOS API

`+[NSBundle bundleWithPath:]`.

## See also

- [`NSBundle`](../ns-bundle.md)
