---
type: reference
native: "-[NSBundle objectForInfoDictionaryKey:]"
---

# `NSBundle`: `objectForInfoDictionaryKey()` method

The **`objectForInfoDictionaryKey()`** method reads the value of one key in Info.plist, preferring the version translated into the language the app is using.

## Syntax

```
objectForInfoDictionaryKey(key)
```

## Parameters

**`key`**

The key, a string. Converted as a string: numbers become strings, and `null` and `undefined` become an empty string.

## Return value

The key's value, converted to a JS value; `null` if the key does not exist.

## Exceptions

None.

## Examples

```js
const main = NSBundle.mainBundle;
console.log(main.objectForInfoDictionaryKey('CFBundleIdentifier') === main.bundleIdentifier);
console.log(main.objectForInfoDictionaryKey('NacreNoSuchKey'));
```

**Result**: Prints `true`, then `null`.

## Corresponding iOS API

`-[NSBundle objectForInfoDictionaryKey:]`.

## See also

- [`NSBundle`](../ns-bundle.md)
- [`infoDictionary`](infodictionary.md)
