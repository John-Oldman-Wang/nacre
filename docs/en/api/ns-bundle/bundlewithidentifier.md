---
type: reference
native: "+[NSBundle bundleWithIdentifier:]"
---

# `NSBundle.bundleWithIdentifier()` static method

The **`bundleWithIdentifier()`** static method gets an already loaded bundle by its bundle identifier.

## Syntax

```
NSBundle.bundleWithIdentifier(identifier)
```

## Parameters

**`identifier`**

The bundle identifier, a string, such as `com.example.shop`. Converted as a string: numbers become strings, and `null` and `undefined` become an empty string.

## Return value

An [`NSBundle`](../ns-bundle.md), or `null` if there is no bundle with that identifier.

## Exceptions

None.

## Examples

```js
const main = NSBundle.mainBundle;
const found = NSBundle.bundleWithIdentifier(String(main.bundleIdentifier));
console.log(found !== null && found.bundlePath === main.bundlePath);
```

**Result**: Prints `true`.

## Corresponding iOS API

`+[NSBundle bundleWithIdentifier:]`.

## See also

- [`NSBundle`](../ns-bundle.md)
