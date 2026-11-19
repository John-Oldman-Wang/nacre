---
type: reference
native: NSBundle.localizations
---

# `NSBundle`: `localizations` property

The **`localizations`** property is all the languages the bundle supports.

## Value

An array of strings, such as `['en', 'zh-Hans']`.

- Read-only; assigning to it throws `TypeError`.
- These are exactly the languages written in `ios.languages` in `nacre.config.json`. When running the acceptance app on the iPhone Air simulator (iOS 27.2) (no `ios.languages` written), it is `['en']`.

## Examples

```js
console.log(JSON.stringify(NSBundle.mainBundle.localizations));
```

**Result**: Prints `["en"]` when running the acceptance app on the iPhone Air simulator (iOS 27.2).

## Corresponding iOS API

`NSBundle.localizations`.

## See also

- [`NSBundle`](../ns-bundle.md)
- [`preferredLocalizations`](preferredlocalizations.md)
- [Configuring the app: name, languages, usage descriptions](../../guides/project-config.md)
