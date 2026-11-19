---
type: reference
native: NSBundle.infoDictionary
---

# `NSBundle`: `infoDictionary` property

The **`infoDictionary`** property is the bundle's Info.plist, converted to a JS object.

## Value

An object or `null`.

- Read-only; assigning to it throws `TypeError`.
- Each read gives a new object; changing it does not affect the bundle.
- Values a JS object cannot represent, such as dates and binary data, are converted first.
- For the app's bundle, [`application.info`](../application/info.md) is more common; its contents are the same.

## Examples

```js
const info = NSBundle.mainBundle.infoDictionary;
console.log(info !== null && info.CFBundleIdentifier);
```

**Result**: Prints the app's bundle identifier.

## Corresponding iOS API

`NSBundle.infoDictionary`.

## See also

- [`NSBundle`](../ns-bundle.md)
- [`objectForInfoDictionaryKey()`](objectforinfodictionarykey.md)
