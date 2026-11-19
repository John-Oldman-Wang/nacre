---
type: reference
native: NSBundle.localizedInfoDictionary
---

# `NSBundle`: `localizedInfoDictionary` property

The **`localizedInfoDictionary`** property is the entries of Info.plist translated into the language the app is using.

## Value

An object or `null`.

- Read-only; assigning to it throws `TypeError`.
- Only translated keys are in it, such as the app's name and usage descriptions. Content written per language in `nacre.config.json` becomes these translations when the project is generated.
- The acceptance app reads an object or `null`; the exact contents are **not recorded**.

## Examples

```js
console.log(NSBundle.mainBundle.localizedInfoDictionary);
```

**Result**: Prints an object or `null`.

## Corresponding iOS API

`NSBundle.localizedInfoDictionary`.

## See also

- [`NSBundle`](../ns-bundle.md)
